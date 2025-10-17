"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Calendar, Eye } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Blog {
  id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  status: "published" | "draft" | "archived";
  views: number;
  imageUrl: string | null;
  category: string | null;
  tags: string[] | null;
  isOwnBlog: boolean;
  authorName: string;
  User: {
    name: string;
    email: string;
  };
}

export default function ParentBlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract id from params
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // Fetch blog data
  const fetchBlog = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blogs/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Article not found");
        }
        throw new Error("Failed to fetch article");
      }

      const blogData = await response.json();
      
      // Only allow access to published blogs for parents
      if (blogData.status !== 'published') {
        throw new Error("Article not available");
      }
      
      setBlog(blogData);
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load article. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated" && id) {
      fetchBlog();
    }
  }, [authStatus, router, fetchBlog, id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph}
      </p>
    ));
  };

  if (authStatus === "loading" || loading) {
    return <LoadingSpinner message="Loading article..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/parent/blogs")}>
              Back to Articles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/parent/blogs")}
          className="mb-4 hover:bg-[#F5F3FB] transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Button>

        {/* Blog Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-100 text-green-800">
                Published
              </Badge>
              <span className="text-sm text-gray-500">
                Published on {formatDate(blog.published_at!)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#8159A8]">{blog.title}</h1>
            <p className="text-gray-600 mt-2">{blog.summary}</p>
            {/* Author information */}
            <div className="flex items-center mt-3">
              <div className="w-8 h-8 rounded-full bg-[#8159A8] text-white text-sm flex items-center justify-center font-medium">
                {blog.authorName?.charAt(0)?.toUpperCase() || "T"}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                By {blog.authorName} • Therapist
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Column - Blog Content */}
          <div className="col-span-3 space-y-6">
            <Card className="shadow-sm overflow-hidden">
              {blog.imageUrl && (
                <div className="relative w-full" style={{ height: "300px" }}>
                  <Image
                    src={blog.imageUrl}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 75vw"
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/images/blogs/blog-placeholder.jpg";
                    }}
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="prose prose-purple max-w-none">
                  <div className="whitespace-pre-line">
                    {formatContent(blog.content)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Blog Info */}
          <div className="col-span-1 space-y-6">
            {/* Blog Stats */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Article Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {blog.views.toLocaleString()} views
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {formatDate(blog.created_at)}
                  </span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {blog.authorName}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            {blog.category && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="capitalize">
                    {blog.category.replace('_', ' ')}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}