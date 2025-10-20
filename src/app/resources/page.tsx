"use client";

import { useState, useEffect } from "react";
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
  Search,
  Eye,
  Calendar,
  FileText,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { Header, Footer } from "@/components/landingpage";

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

export default function ResourcesPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parents can only view all published blogs from all therapists
      const response = await fetch('/api/blogs?filter=all');

      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }

      const blogData = await response.json();
      setBlogs(blogData);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blogs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewBlog = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    router.push(`/resources/blog/${id}`);
  };

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
    .filter((blog) => blog.status === "published")
    .reduce((sum, blog) => sum + blog.views, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F3FB" }}>
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading resources...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F3FB" }}>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="w-full max-w-md mx-auto text-center">
            <CardContent className="pt-6 pb-6">
              <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchBlogs()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F3FB" }}>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span
              style={{
                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Therapy Resources
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore helpful articles and resources from our expert therapists
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto rounded-full mt-6"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-between">
            <div className="text-left">
              <div className="text-3xl font-bold text-[#8159A8]">
                {blogs.length}
              </div>
              <div className="text-gray-600 text-sm mt-1">Available Articles</div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(129, 89, 168, 0.1)" }}>
                <BookOpen className="w-7 h-7 text-[#8159A8]" />
              </div>
            </div>
          </Card>

          <Card className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-between">
            <div className="text-left">
              <div className="text-3xl font-bold text-[#8159A8]">
                {new Set(blogs.filter(blog => blog.category).map(blog => blog.category)).size}
              </div>
              <div className="text-gray-600 text-sm mt-1">Categories</div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(129, 89, 168, 0.1)" }}>
                <FileText className="w-7 h-7 text-[#8159A8]" />
              </div>
            </div>
          </Card>

          <Card className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-between">
            <div className="text-left">
              <div className="text-3xl font-bold text-[#8159A8]">
                {totalViews.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm mt-1">Total Views</div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(129, 89, 168, 0.1)" }}>
                <TrendingUp className="w-7 h-7 text-[#8159A8]" />
              </div>
            </div>
          </Card>
        </div>
        {/* Filters and Search */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48 border-gray-200">
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



        {/* Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(129, 89, 168, 0.1)" }}>
                <FileText className="h-8 w-8 text-[#8159A8]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 mb-4">
                {blogs.length === 0
                  ? "No therapy articles are currently available."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <Card
                key={blog.id}
                className="cursor-pointer bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                      <div className="w-6 h-6 rounded-full bg-[#8159A8] text-white text-xs flex items-center justify-center font-medium">
                        {blog.authorName?.charAt(0)?.toUpperCase() || "T"}
                      </div>
                      <div className="ml-2">
                        <span className="text-sm text-gray-600">
                          {blog.authorName}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          Therapist
                        </span>
                      </div>
                    </div>

                    {/* Parents cannot edit or delete blogs */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
