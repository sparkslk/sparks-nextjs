"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gamepad2,
  Trophy,
  Clock,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Brain,
  Target,
  Zap,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  embedUrl: string;
  thumbnailUrl: string | null;
  targetSkills: string[];
  ageRange: string;
  estimatedTime: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GameStats {
  totalGames: number;
  activeGames: number;
  inactiveGames: number;
}

interface GameFormData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  embedUrl: string;
  thumbnailUrl: string;
  targetSkills: string;
  ageRange: string;
  estimatedTime: string;
}

const CATEGORIES = [
  { value: "ATTENTION_TRAINING", label: "Attention Training", icon: Target },
  { value: "MEMORY_EXERCISES", label: "Memory Exercises", icon: Brain },
  { value: "IMPULSE_CONTROL", label: "Impulse Control", icon: Zap },
  { value: "EXECUTIVE_FUNCTION", label: "Executive Function", icon: Settings },
  { value: "SOCIAL_SKILLS", label: "Social Skills", icon: Gamepad2 },
  { value: "EMOTIONAL_REGULATION", label: "Emotional Regulation", icon: Brain },
  { value: "EDUCATIONAL", label: "Educational", icon: Brain },
  { value: "RELAXATION", label: "Relaxation", icon: Clock },
  { value: "OTHER", label: "Other", icon: Gamepad2 },
];

const DIFFICULTIES = [
  { value: "EASY", label: "Easy", color: "text-green-600 bg-green-100" },
  { value: "MEDIUM", label: "Medium", color: "text-yellow-600 bg-yellow-100" },
  { value: "HARD", label: "Hard", color: "text-red-600 bg-red-100" },
  { value: "ADAPTIVE", label: "Adaptive", color: "text-blue-600 bg-blue-100" },
];

export default function AdminGameManagement() {
  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<GameStats>({ totalGames: 0, activeGames: 0, inactiveGames: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<GameFormData>({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    embedUrl: "",
    thumbnailUrl: "",
    targetSkills: "",
    ageRange: "",
    estimatedTime: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/games");

      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }

      const data = await response.json();
      setGames(data.games || []);

      // Calculate stats
      const active = data.games.filter((g: Game) => g.isActive).length;
      setStats({
        totalGames: data.games.length,
        activeGames: active,
        inactiveGames: data.games.length - active,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching games:", error);
      alert("Failed to fetch games. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    try {
      setSubmitting(true);
      const targetSkillsArray = formData.targetSkills.split(",").map((s) => s.trim()).filter(Boolean);

      const response = await fetch("/api/admin/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          targetSkills: targetSkillsArray,
          estimatedTime: parseInt(formData.estimatedTime),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create game");
      }

      alert("Game created successfully!");

      setShowCreateDialog(false);
      resetForm();
      fetchGames();
    } catch (error: unknown) {
      console.error("Error creating game:", error);
      alert(error instanceof Error ? error.message : "Failed to create game");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGame = async () => {
    if (!selectedGame) return;

    try {
      setSubmitting(true);
      const targetSkillsArray = formData.targetSkills.split(",").map((s) => s.trim()).filter(Boolean);

      const response = await fetch(`/api/admin/games/${selectedGame.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          targetSkills: targetSkillsArray,
          estimatedTime: parseInt(formData.estimatedTime),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update game");
      }

      alert("Game updated successfully!");

      setShowEditDialog(false);
      resetForm();
      fetchGames();
    } catch (error: unknown) {
      console.error("Error updating game:", error);
      alert(error instanceof Error ? error.message : "Failed to update game");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!selectedGame) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/games/${selectedGame.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete game");
      }

      alert("Game deleted successfully!");

      setShowDeleteDialog(false);
      setSelectedGame(null);
      fetchGames();
    } catch (error: unknown) {
      console.error("Error deleting game:", error);
      alert(error instanceof Error ? error.message : "Failed to delete game");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGameStatus = async (game: Game) => {
    try {
      const response = await fetch(`/api/admin/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !game.isActive }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update game status");
      }

      alert(`Game ${game.isActive ? "deactivated" : "activated"} successfully!`);

      fetchGames();
    } catch (error: unknown) {
      console.error("Error toggling game status:", error);
      alert(error instanceof Error ? error.message : "Failed to update game status");
    }
  };

  const openEditDialog = (game: Game) => {
    setSelectedGame(game);
    setFormData({
      title: game.title,
      description: game.description,
      category: game.category,
      difficulty: game.difficulty,
      embedUrl: game.embedUrl,
      thumbnailUrl: game.thumbnailUrl || "",
      targetSkills: game.targetSkills.join(", "),
      ageRange: game.ageRange,
      estimatedTime: game.estimatedTime.toString(),
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (game: Game) => {
    setSelectedGame(game);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      difficulty: "",
      embedUrl: "",
      thumbnailUrl: "",
      targetSkills: "",
      ageRange: "",
      estimatedTime: "",
    });
    setSelectedGame(null);
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    const Icon = cat?.icon || Gamepad2;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTIES.find((d) => d.value === difficulty)?.color || "text-gray-600 bg-gray-100";
  };

  const filteredGames =
    selectedCategory === "all"
      ? games
      : games.filter((game) => game.category === selectedCategory);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F3FB" }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4">
        {/* Header Section */}
        <div className="mb-8 mt-0">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent tracking-tight mb-2">
            ADHD Game Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage therapeutic games and monitor patient engagement across all ADHD training modules.
          </p>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Game Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              <Gamepad2 className="h-12 w-12" style={{ color: "#8159A8" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGames}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeGames} active, {stats.inactiveGames} inactive
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Games</CardTitle>
              <Play className="h-12 w-12" style={{ color: "#8159A8" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeGames}</div>
              <p className="text-xs text-muted-foreground">Currently available</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Trophy className="h-12 w-12" style={{ color: "#8159A8" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{CATEGORIES.length}</div>
              <p className="text-xs text-muted-foreground">Different game types</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter and Create Button */}
        <div className="mb-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="text-sm"
            >
              All Games
            </Button>
            {CATEGORIES.slice(0, 4).map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.value)}
                  className="text-sm flex items-center gap-1"
                >
                  <Icon className="h-3 w-3" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
          <Button
            variant="default"
            className="bg-[#8159A8] hover:bg-[#6B429B] text-white font-semibold"
            onClick={() => {
              resetForm();
              setShowCreateDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Game
          </Button>
        </div>

        {/* Games List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredGames.length === 0 ? (
          <Card className="p-8 text-center">
            <Gamepad2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No games found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first therapeutic game.
            </p>
            <Button
              onClick={() => {
                resetForm();
                setShowCreateDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Game
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {filteredGames.map((game) => (
              <Card key={game.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(game.category)}
                      <CardTitle className="text-lg">{game.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                          game.difficulty
                        )}`}
                      >
                        {game.difficulty}
                      </span>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          game.isActive ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                  </div>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-semibold text-blue-600">
                          {getCategoryLabel(game.category)}
                        </div>
                        <div className="text-xs text-muted-foreground">Category</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-semibold text-green-600">
                          {game.estimatedTime} min
                        </div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Age: {game.ageRange}</span>
                      <span>Skills: {game.targetSkills.length}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => toggleGameStatus(game)}
                        className={`flex items-center gap-1 ${
                          game.isActive
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        } text-white`}
                      >
                        {game.isActive ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                        {game.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => openEditDialog(game)}
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        onClick={() => openDeleteDialog(game)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog
          open={showCreateDialog || showEditDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{showEditDialog ? "Edit Game" : "Create New Game"}</DialogTitle>
              <DialogDescription>
                {showEditDialog
                  ? "Update the game details below."
                  : "Fill in the details to create a new therapeutic game."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Focus Flow"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the game and its therapeutic benefits"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((diff) => (
                        <SelectItem key={diff.value} value={diff.value}>
                          {diff.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="embedUrl">Game URL (iframe source) *</Label>
                <Input
                  id="embedUrl"
                  value={formData.embedUrl}
                  onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                  placeholder="https://example.com/game"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="targetSkills">Target Skills (comma-separated) *</Label>
                <Input
                  id="targetSkills"
                  value={formData.targetSkills}
                  onChange={(e) => setFormData({ ...formData, targetSkills: e.target.value })}
                  placeholder="attention, memory, focus"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ageRange">Age Range *</Label>
                  <Input
                    id="ageRange"
                    value={formData.ageRange}
                    onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                    placeholder="e.g., 6-12"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="estimatedTime">Est. Time (minutes) *</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                    placeholder="15"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setShowEditDialog(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={showEditDialog ? handleUpdateGame : handleCreateGame}
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {showEditDialog ? "Update Game" : "Create Game"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Game</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedGame?.title}&quot;? This action cannot be
                undone and will remove all associated data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedGame(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteGame}
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Game
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
