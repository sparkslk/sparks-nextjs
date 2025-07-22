"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

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
  User: {
    name: string;
    email: string;
  };
}

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract id from params
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch blog data
  const fetchBlog = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blogs/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Blog not found");
        }
        throw new Error("Failed to fetch blog");
      }

      const blogData = await response.json();
      setBlog(blogData);
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load blog. Please try again later."
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

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!blog) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/blogs/${blog.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog");
      }

      setShowDeleteModal(false);
      router.push("/therapist/blogs");
    } catch (err) {
      console.error("Error deleting blog:", err);
      setError("Failed to delete blog. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!blog) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/blogs/${blog.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "published" }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish blog");
      }

      const updatedBlog = await response.json();
      setBlog(updatedBlog);
    } catch (err) {
      console.error("Error publishing blog:", err);
      setError("Failed to publish blog. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return <LoadingSpinner message="Loading blog details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/therapist/blogs")}>
              Return to Blog Management
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Blog Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The blog you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button onClick={() => router.push("/therapist/blogs")}>
              Return to Blog Management
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={i} className="text-2xl font-bold mt-6 mb-4">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-bold mt-5 mb-3">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-lg font-bold mt-4 mb-2">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        return (
          <li key={i} className="ml-6 my-1">
            {line.substring(2)}
          </li>
        );
      } else if (line.trim() === "") {
        return <br key={i} />;
      } else {
        return (
          <p key={i} className="my-2">
            {line}
          </p>
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onDelete={handleConfirmDelete}
        title="Delete Blog Post?"
        description="Are you sure you want to delete"
        itemName={blog?.title}
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="transition-all duration-300 hover:bg-[#F5F3FB]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>

        {/* Blog Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className={`
                ${
                  blog.status === "published"
                    ? "bg-green-100 text-green-800"
                    : blog.status === "draft"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-gray-100 text-gray-800"
                }
              `}
              >
                {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
              </Badge>
              <span className="text-sm text-gray-500">
                {blog.status === "published"
                  ? `Published on ${formatDate(blog.published_at!)}`
                  : `Last updated on ${formatDate(blog.updated_at)}`}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#8159A8]">{blog.title}</h1>
            <p className="text-gray-600 mt-2">{blog.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {blog.status === "draft" && (
              <Button
                onClick={handlePublish}
                className="bg-[#8159A8] hover:bg-[#6D4C93] text-white transition-all duration-300"
              >
                Publish Now
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push(`/therapist/blogs/${blog.id}/edit`)}
              className="transition-all duration-300 hover:bg-[#F5F3FB]"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteClick}
              className="text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Column - Blog Content */}
          <div className="col-span-3 space-y-6">
            <Card className="shadow-sm overflow-hidden">
              {blog.imageUrl && (
                <div
                  className={`relative w-full ${
                    blog.status === "draft" ? "bg-amber-100" : "bg-white"
                  }`}
                  style={{ height: "300px" }}
                >
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
                  {blog.status === "draft" && (
                    <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                      <Badge className="bg-amber-100 text-amber-800 text-sm px-4 py-1.5 text-lg">
                        Draft
                      </Badge>
                    </div>
                  )}
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

          {/* Right Column - Blog Stats & Metadata */}
          <div className="space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-[#8159A8]">
                  Blog Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">
                    {blog.views.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold">
                    {formatDate(blog.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-[#8159A8]">
                  Categories & Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {blog.category && (
                  <div>
                    <div className="text-gray-600 mb-2">Category</div>
                    <Badge className="bg-[#8159A8]/10 text-[#8159A8] hover:bg-[#8159A8]/20 transition-colors duration-300">
                      {blog.category.charAt(0).toUpperCase() +
                        blog.category.slice(1)}
                    </Badge>
                  </div>
                )}
                {blog.tags && blog.tags.length > 0 && (
                  <div>
                    <div className="text-gray-600 mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="hover:bg-gray-100 transition-colors duration-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-[#8159A8]">Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8159A8] text-white flex items-center justify-center font-bold">
                    {blog.User.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-medium">{blog.User.name}</div>
                    <div className="text-sm text-gray-600">Therapist</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
