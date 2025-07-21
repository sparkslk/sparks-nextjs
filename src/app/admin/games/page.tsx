"use client";

import React from 'react';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Gamepad2,
    //Users,
    Trophy,
    Clock,
    RefreshCw,
    Play,
    Pause,
    Settings,
    BarChart3,
    //Star,
    Brain,
    Target,
    Zap
} from "lucide-react";

interface GameData {
    id: string;
    title: string;
    category: "attention" | "memory" | "focus" | "impulse-control";
    description: string;
    difficulty: "easy" | "medium" | "hard";
    duration: number; // in minutes
    totalPlays: number;
    averageScore: number;
    isActive: boolean;
    createdAt: string;
    lastPlayed: string;
}

interface GameStats {
    totalGames: number;
    activeGames: number;
    totalPlaySessions: number;
    averageSessionTime: number;
    mostPopularGame: string;
    weeklyPlays: number;
}

const mockGameData: GameData[] = [
    {
        id: "1",
        title: "Focus Flow",
        category: "attention",
        description: "A visual attention training game where patients track moving objects",
        difficulty: "medium",
        duration: 10,
        totalPlays: 2847,
        averageScore: 78.5,
        isActive: true,
        createdAt: "2024-01-15",
        lastPlayed: "2 hours ago"
    },
    {
        id: "2",
        title: "Memory Palace",
        category: "memory",
        description: "Sequential memory exercises using visual and audio cues",
        difficulty: "hard",
        duration: 15,
        totalPlays: 1923,
        averageScore: 65.2,
        isActive: true,
        createdAt: "2024-02-03",
        lastPlayed: "4 hours ago"
    },
    {
        id: "3",
        title: "Impulse Guardian",
        category: "impulse-control",
        description: "Response inhibition training through go/no-go tasks",
        difficulty: "easy",
        duration: 8,
        totalPlays: 3412,
        averageScore: 82.1,
        isActive: true,
        createdAt: "2024-01-28",
        lastPlayed: "1 hour ago"
    },
    {
        id: "4",
        title: "Zen Focus",
        category: "focus",
        description: "Mindfulness-based attention regulation exercises",
        difficulty: "medium",
        duration: 12,
        totalPlays: 1654,
        averageScore: 71.8,
        isActive: false,
        createdAt: "2024-03-10",
        lastPlayed: "2 days ago"
    }
];

const mockGameStats: GameStats = {
    totalGames: 12,
    activeGames: 9,
    totalPlaySessions: 15840,
    averageSessionTime: 11.3,
    mostPopularGame: "Focus Flow",
    weeklyPlays: 1247
};

export default function GameManagementDashboard() {
    const [gameData, setGameData] = useState<GameData[]>(mockGameData);
    const [gameStats, setGameStats] = useState<GameStats>(mockGameStats);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    useEffect(() => {
        // Set the initial timestamp after component mounts to avoid hydration mismatch
        setLastUpdated(new Date());
    }, []);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "attention": return <Target className="h-4 w-4" />;
            case "memory": return <Brain className="h-4 w-4" />;
            case "focus": return <Zap className="h-4 w-4" />;
            case "impulse-control": return <Settings className="h-4 w-4" />;
            default: return <Gamepad2 className="h-4 w-4" />;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy": return "text-green-600 bg-green-100";
            case "medium": return "text-yellow-600 bg-yellow-100";
            case "hard": return "text-red-600 bg-red-100";
            default: return "text-gray-600 bg-gray-100";
        }
    };

    const toggleGameStatus = (gameId: string) => {
        setGameData(prevData =>
            prevData.map(game =>
                game.id === gameId ? { ...game, isActive: !game.isActive } : game
            )
        );
    };

    const filteredGames = selectedCategory === "all" 
        ? gameData 
        : gameData.filter(game => game.category === selectedCategory);

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F5F3FB' }}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
                            <Gamepad2 className="h-12 w-12" style={{ color: '#8159A8' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{gameStats.totalGames}</div>
                            <p className="text-xs text-muted-foreground">{gameStats.activeGames} currently active</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Session Time</CardTitle>
                            <Clock className="h-12 w-12" style={{ color: '#8159A8' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{gameStats.averageSessionTime} min</div>
                            <p className="text-xs text-muted-foreground">Optimal engagement range</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
                            <Trophy className="h-12 w-12" style={{ color: '#8159A8' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-sm">{gameStats.mostPopularGame}</div>
                            <p className="text-xs text-muted-foreground">Top performing game</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        <Button 
                            variant={selectedCategory === "all" ? "default" : "outline"}
                            onClick={() => setSelectedCategory("all")}
                            className="text-sm"
                        >
                            All Games
                        </Button>
                        <Button 
                            variant={selectedCategory === "attention" ? "default" : "outline"}
                            onClick={() => setSelectedCategory("attention")}
                            className="text-sm flex items-center gap-1"
                        >
                            <Target className="h-3 w-3" />
                            Attention
                        </Button>
                        <Button 
                            variant={selectedCategory === "memory" ? "default" : "outline"}
                            onClick={() => setSelectedCategory("memory")}
                            className="text-sm flex items-center gap-1"
                        >
                            <Brain className="h-3 w-3" />
                            Memory
                        </Button>
                        <Button 
                            variant={selectedCategory === "focus" ? "default" : "outline"}
                            onClick={() => setSelectedCategory("focus")}
                            className="text-sm flex items-center gap-1"
                        >
                            <Zap className="h-3 w-3" />
                            Focus
                        </Button>
                    </div>
                </div>

                {/* Games List */}
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
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                                            {game.difficulty}
                                        </span>
                                        <div className={`w-3 h-3 rounded-full ${game.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    </div>
                                </div>
                                <CardDescription>{game.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">{game.totalPlays.toLocaleString()}</div>
                                            <div className="text-xs text-muted-foreground">Total Plays</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">{game.averageScore}%</div>
                                            <div className="text-xs text-muted-foreground">Avg Score</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Duration: {game.duration} min</span>
                                        <span>Last played: {game.lastPlayed}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => toggleGameStatus(game.id)}
                                            className={`flex items-center gap-1 ${game.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                                        >
                                            {game.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                            {game.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                                            <Settings className="h-3 w-3" />
                                            Configure
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Gamepad2 className="mr-2 h-5 w-5" />
                                Add New Game
                            </CardTitle>
                            <CardDescription>
                                Create and deploy new therapeutic games for ADHD patients
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full hover:opacity-90" style={{ backgroundColor: '#8159A8', color: 'white' }}>
                                Create Game
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="mr-2 h-5 w-5" />
                                Game Analytics
                            </CardTitle>
                            <CardDescription>
                                View detailed analytics and patient progress reports
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full hover:opacity-90" style={{ backgroundColor: '#8159A8', color: 'white' }}>
                                View Analytics
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}