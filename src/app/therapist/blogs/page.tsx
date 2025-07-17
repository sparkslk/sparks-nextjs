"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PlusIcon, AlertTriangle } from "lucide-react";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

// Update Blog interface to match database schema
interface Blog {
  id: number;
  title: string;
  summary: string; // Changed from description
  content: string; // Added from schema
  therapist_id: string; // Added from schema
  status: "published" | "draft" | "archived";
  category?: string; // Added from schema
  tags: string[]; // Added from schema
  image_data?: Uint8Array; // Binary data
  image_type?: string; // MIME type
  image_name?: string; // Original filename
  views: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export default function BlogManagementPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated") {
      // Check if user has permission to manage blogs
      if (session && session.user) {
        // Example permission check (commented out)
        // const userRole = session.user.role;
        // if (userRole !== 'therapist' && userRole !== 'admin') {
        //   router.push('/unauthorized');
        //   return;
        // }
        fetchBlogs();
      }
    }
  }, [authStatus, router, session]);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch blogs from API
      const response = await fetch("/api/blogs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`);
      }

      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blogs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to get image URL for a blog
  const getBlogImageUrl = (blog: Blog) => {
    // If we have binary image data, convert it to a data URL
    if (blog.image_data && blog.image_type) {
      return `/api/blogs/${blog.id}/image`;
    }
    // Otherwise return a placeholder image
    return "/images/blogs/blog-placeholder.jpg";
  };

  const handleViewBlog = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent the card click event from triggering
    router.push(`/therapist/blogs/${id}`);
  };

  const handleEditBlog = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent the card click event from triggering
    router.push(`/therapist/blogs/${id}/edit`);
  };

  const handleArchiveBlog = (e: React.MouseEvent, blog: Blog) => {
    e.stopPropagation(); // Prevent the card click event from triggering
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
      // Archive blog via API call
      const response = await fetch(`/api/blogs/${blogToDelete.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "archived" }),
      });

      if (!response.ok) {
        throw new Error(`Failed to archive blog: ${response.status}`);
      }

      // Refresh blogs after archiving
      fetchBlogs();

      // Close the dialog
      setShowDeleteModal(false);
      setBlogToDelete(null);
    } catch (error) {
      console.error("Error archiving blog:", error);
      alert("Failed to archive blog. Please try again.");
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    if (activeTab === "all") return true;
    if (activeTab === "published") return blog.status === "published";
    if (activeTab === "drafts") return blog.status === "draft";
    if (activeTab === "archived") return blog.status === "archived";
    return true;
  });

  const publishedCount = blogs.filter(
    (blog) => blog.status === "published"
  ).length;
  const draftCount = blogs.filter((blog) => blog.status === "draft").length;
  const totalViews = blogs
    .filter((blog) => blog.status === "published")
    .reduce((sum, blog) => sum + blog.views, 0);
  const avgEngagement =
    publishedCount > 0 ? Math.round(totalViews / publishedCount) : 0;

  const handleNewBlog = () => {
    router.push("/therapist/blogs/new");
  };

  if (authStatus === "loading" || loading) {
    return <LoadingSpinner message="Loading blog management..." />;
  }

  // Display error message if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6 flex items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchBlogs}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
      {/* Delete confirmation modal - updated to Archive */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onDelete={handleConfirmDelete}
        title="Archive Blog Post?"
        description="Are you sure you want to archive"
        itemName={blogToDelete?.title}
        buttonLabel="Archive Blog" // Updated label
        buttonVariant="outline" // Use outline variant for less destructive action
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#8159A8] mb-2">
              Blog Management
            </h1>
            <p className="text-gray-600">
              Create and manage your blog content for patients and community.
            </p>
          </div>

          <Button
            onClick={handleNewBlog}
            className="bg-[#8159A8] hover:bg-[#6D4C93] text-white transition-all duration-300 mt-4 md:mt-0"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Add New Blog
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="text-3xl font-bold text-[#8159A8]">
              {publishedCount}
            </div>
            <div className="text-gray-500 text-sm">Published Blogs</div>
          </Card>

          <Card className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="text-3xl font-bold text-[#8159A8]">
              {draftCount}
            </div>
            <div className="text-gray-500 text-sm">Draft Blogs</div>
          </Card>

          <Card className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="text-3xl font-bold text-[#8159A8]">
              {totalViews.toLocaleString()}
            </div>
            <div className="text-gray-500 text-sm">Total Views</div>
          </Card>

          <Card className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="text-3xl font-bold text-[#8159A8]">
              {avgEngagement}
            </div>
            <div className="text-gray-500 text-sm">Avg. Engagement</div>
          </Card>
        </div>

        {/* Tabs */}
        <div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-white rounded-md p-1 shadow-sm mb-6">
              <TabsTrigger
                value="all"
                className="text-sm data-[state=active]:text-[#8159A8] data-[state=active]:bg-[#F5F3FB] rounded transition-all duration-200"
              >
                All Blogs
              </TabsTrigger>
              <TabsTrigger
                value="published"
                className="text-sm data-[state=active]:text-[#8159A8] data-[state=active]:bg-[#F5F3FB] rounded transition-all duration-200"
              >
                Published
              </TabsTrigger>
              <TabsTrigger
                value="drafts"
                className="text-sm data-[state=active]:text-[#8159A8] data-[state=active]:bg-[#F5F3FB] rounded transition-all duration-200"
              >
                Drafts
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="text-sm data-[state=active]:text-[#8159A8] data-[state=active]:bg-[#F5F3FB] rounded transition-all duration-200"
              >
                Archived
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="overflow-hidden border rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => router.push(`/therapist/blogs/${blog.id}`)}
                >
                  <div
                    className={`relative w-full ${
                      blog.status === "draft" ? "bg-amber-100" : "bg-white"
                    }`}
                    style={{ height: "180px" }}
                  >
                    <Image
                      src={getBlogImageUrl(blog)}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      onError={(e) => {
                        // Fallback image if the real one fails to load
                        e.currentTarget.src =
                          "/images/blogs/blog-placeholder.jpg";
                      }}
                    />
                    {blog.status === "draft" && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <Badge className="bg-amber-100 text-amber-800 text-sm px-3 py-1">
                          Draft
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
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
                        {blog.status.charAt(0).toUpperCase() +
                          blog.status.slice(1)}
                      </Badge>

                      {blog.status === "published" && (
                        <div className="text-gray-500 text-sm">
                          {blog.views} views
                        </div>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg line-clamp-2 text-gray-800">
                      {blog.title}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {blog.summary}
                    </p>

                    <div className="pt-2 text-sm text-gray-500">
                      {blog.status === "published"
                        ? `Published: ${new Date(
                            blog.published_at!
                          ).toLocaleDateString()}`
                        : `Last edited: ${new Date(
                            blog.updated_at
                          ).toLocaleDateString()}`}
                    </div>

                    <div className="flex justify-between pt-4 border-t mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-[#8159A8]"
                        onClick={(e) => handleEditBlog(e, blog.id)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-[#8159A8]"
                        onClick={(e) => handleViewBlog(e, blog.id)}
                      >
                        View
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-[#8159A8]"
                        onClick={(e) => handleArchiveBlog(e, blog)}
                      >
                        Archive
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                <div className="text-3xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No blogs found
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === "all"
                    ? "You haven't created any blogs yet."
                    : `You don't have any ${activeTab} blogs.`}
                </p>
                <Button
                  onClick={handleNewBlog}
                  className="bg-[#8159A8] hover:bg-[#6D4C93] text-white"
                >
                  Create Your First Blog
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
