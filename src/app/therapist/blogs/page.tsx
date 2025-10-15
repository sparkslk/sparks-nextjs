"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Eye,
  Edit,
  MoreVertical,
  Calendar,
  FileText,
  Target,
  TrendingUp,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

// Update Blog interface to match database schema
interface Blog {
  id: number;
  title: string;
  summary: string;
  content: string;
  therapist_id: string;
  status: "published" | "draft" | "archived";
  category?: string;
  tags: string[];
  imageUrl?: string | null; // Base64 image URL
  views: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  authorName: string;
  isOwnBlog: boolean; // Flag to identify if this is user's own blog
  User?: {
    name: string;
    email: string;
  };
}

export default function BlogManagementPage() {
  const { status: authStatus, data: session } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mine");
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    mine: 0,
    published: 0,
    draft: 0,
  });



  const fetchTabCounts = useCallback(async () => {
    try {
      // Fetch counts for all tabs
      const [allResponse, mineResponse, publishedResponse, draftResponse] = await Promise.all([
        fetch('/api/blogs?filter=all'),
        fetch('/api/blogs?filter=mine'),
        fetch('/api/blogs?filter=published'),
        fetch('/api/blogs?filter=draft')
      ]);

      const [allData, mineData, publishedData, draftData] = await Promise.all([
        allResponse.json(),
        mineResponse.json(),
        publishedResponse.json(),
        draftResponse.json()
      ]);

      setTabCounts({
        all: allData.length,
        mine: mineData.length,
        published: publishedData.length,
        draft: draftData.length,
      });
    } catch (err) {
      console.error("Error fetching tab counts:", err);
    }
  }, []);

    const fetchBlogs = useCallback(async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/blogs?filter=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      } else {
        setError("Failed to fetch blogs");
      }
    } catch (err) {
      setError("Error fetching blogs");
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  }, [session, activeTab]);

  const handleViewBlog = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    router.push(`/therapist/blogs/${id}`);
  };

  const handleEditBlog = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    router.push(`/therapist/blogs/${id}/edit`);
  };

  const handleArchiveBlog = async (e: React.MouseEvent, blog: Blog) => {
    e.stopPropagation();
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setBlogToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      const response = await fetch(`/api/blogs/${blogToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog");
      }

      // Remove blog from the list
      setBlogs(blogs.filter((blog) => blog.id !== blogToDelete.id));
      setShowDeleteModal(false);
      setBlogToDelete(null);
    } catch (error) {
      console.error("Error deleting blog:", error);
      setError("Failed to delete blog. Please try again later.");
    }
  };

  // Authentication and initial data loading
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated" && session) {
      fetchBlogs();
      fetchTabCounts();
    }
  }, [authStatus, router, session, fetchBlogs, fetchTabCounts]);

  // Refetch blogs when active tab changes
  useEffect(() => {
    if (authStatus === "authenticated" && session) {
      fetchBlogs();
      fetchTabCounts();
    }
  }, [activeTab, authStatus, session, fetchBlogs, fetchTabCounts]);

  // Filter blogs based on search and category (status filtering is now handled by API)
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || blog.category === filterCategory;

    return matchesSearch && matchesCategory;
  });


  const totalViews = blogs
    .filter((blog) => blog.status === "published" && (activeTab === 'all' || blog.isOwnBlog))
    .reduce((sum, blog) => sum + blog.views, 0);

  const handleNewBlog = () => {
    router.push("/therapist/blogs/new");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (authStatus === "loading" || loading) {
    return <LoadingSpinner message="Loading blog management..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchBlogs()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onDelete={handleConfirmDelete}
        title="Delete Blog Post?"
        description="Are you sure you want to delete"
        itemName={blogToDelete?.title}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#8159A8]">
              Blog Management
            </h1>
            <p className="text-gray-600">
              Create and manage your therapeutic content
            </p>
          </div>
          <Button
            onClick={handleNewBlog}
            className="bg-[#8159A8] hover:bg-[#6D4C93] text-white transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Blog
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    My Blogs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tabCounts.mine}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Published</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tabCounts.published}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Edit className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tabCounts.draft}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Views
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalViews.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="adhd">ADHD Resources</SelectItem>
                  <SelectItem value="anxiety">Anxiety & Depression</SelectItem>
                  <SelectItem value="parenting">Parenting Support</SelectItem>
                  <SelectItem value="wellness">Mental Wellness</SelectItem>
                  <SelectItem value="therapy">Therapy Approaches</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: "all", label: "All Published", count: tabCounts.all },
            { key: "mine", label: "My Blogs", count: tabCounts.mine },
            { key: "published", label: "My Published", count: tabCounts.published },
            { key: "draft", label: "My Drafts", count: tabCounts.draft },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-white text-[#8159A8] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No blogs found
              </h3>
              <p className="text-gray-600 mb-4">
                {blogs.length === 0
                  ? "Get started by creating your first blog post."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {blogs.length === 0 && (
                <Button
                  onClick={handleNewBlog}
                  className="bg-[#8159A8] hover:bg-[#6D4C93] text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Blog
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <Card
                key={blog.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                onClick={(e) => handleViewBlog(e, blog.id)}
              >
                <div className="relative">
                  {blog.imageUrl ? (
                    <div className="relative h-48 w-full">
                      <Image
                        src={blog.imageUrl}
                        alt={blog.title}
                        fill
                        className="object-cover rounded-t-lg"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/images/blogs/blog-placeholder.jpg";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-[#8159A8]/10 to-[#6D4C93]/10 rounded-t-lg flex items-center justify-center">
                      <FileText className="h-12 w-12 text-[#8159A8]/40" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <Badge
                      className={`${
                        blog.status === "published"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : blog.status === "draft"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      {blog.status.charAt(0).toUpperCase() +
                        blog.status.slice(1)}
                    </Badge>
                  </div>

                  {blog.category && (
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="outline"
                        className="bg-white/90 backdrop-blur-sm"
                      >
                        {blog.category}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {blog.summary}
                  </p>

                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <div className="flex items-center mr-4">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(blog.updated_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>{blog.views.toLocaleString()} views</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-medium ${
                        blog.isOwnBlog ? 'bg-[#8159A8]' : 'bg-gray-500'
                      }`}>
                        {blog.authorName?.charAt(0)?.toUpperCase() || "T"}
                      </div>
                      <div className="ml-2">
                        <span className={`text-sm ${blog.isOwnBlog ? 'text-[#8159A8] font-medium' : 'text-gray-600'}`}>
                          {blog.isOwnBlog ? 'You' : blog.authorName}
                        </span>
                        {!blog.isOwnBlog && (
                          <span className="text-xs text-gray-500 block">
                            by {blog.authorName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      {/* Only show edit/delete buttons for own blogs */}
                      {blog.isOwnBlog && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditBlog(e, blog.id)}
                            className="h-8 w-8 p-0 hover:bg-[#8159A8]/10"
                          >
                            <Edit className="h-4 w-4 text-[#8159A8]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleArchiveBlog(e, blog)}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
