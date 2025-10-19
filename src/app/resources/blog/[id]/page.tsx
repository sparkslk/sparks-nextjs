"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Calendar, Eye } from "lucide-react";
import { Header, Footer } from "@/components/landingpage";

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

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
      
      // Only allow access to published blogs
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
    if (id) {
      fetchBlog();
    }
  }, [id, fetchBlog]);

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

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F3FB" }}>
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article...</p>
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
          <Card className="w-full max-w-md mx-auto text-center bg-white border border-gray-100">
            <CardContent className="pt-6 pb-6">
              <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push("/resources")} className="bg-[#8159A8] hover:bg-[#6d4a8c]">
                Back to Resources
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F3FB" }}>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/resources")}
          className="mb-6 hover:bg-white/50 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resources
        </Button>

        {/* Blog Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Published
            </Badge>
            <span className="text-sm text-gray-500">
              Published on {formatDate(blog.published_at!)}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span
              style={{
                background: `linear-gradient(135deg, #8159A8 0%, #9d7bb8 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {blog.title}
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-4">{blog.summary}</p>
          {/* Author information */}
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#8159A8] text-white text-sm flex items-center justify-center font-medium">
              {blog.authorName?.charAt(0)?.toUpperCase() || "T"}
            </div>
            <span className="ml-3 text-gray-700">
              By <span className="font-semibold">{blog.authorName}</span> • Therapist
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
              {blog.imageUrl && (
                <div className="relative w-full" style={{ height: "400px" }}>
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
              <CardContent className="p-8">
                <div className="prose prose-lg prose-purple max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {formatContent(blog.content)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Blog Stats */}
            <Card className="bg-white border border-gray-100 shadow-sm">
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
              <Card className="bg-white border border-gray-100 shadow-sm">
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
              <Card className="bg-white border border-gray-100 shadow-sm">
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
      </main>
      <Footer />
    </div>
  );
}
