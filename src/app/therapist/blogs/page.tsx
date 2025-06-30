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
import { PlusIcon } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  status: "published" | "draft" | "archived";
  views: number;
  image: string;
  slug: string;
}

export default function BlogManagementPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated") {
      fetchBlogs();
    }
  }, [authStatus, router]);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, you'd fetch from an API
      // For now we'll use sample data that matches the image
      const mockBlogs: Blog[] = [
        {
          id: "1",
          title: "Understanding ADHD in Adults: A Comprehensive Guide",
          description:
            "Adult ADHD often goes undiagnosed, leading to challenges in work, relationships, and daily life. This comprehensive guide explores the symptoms, causes, and treatment options for adults with ADHD.",
          createdAt: "2024-03-15",
          updatedAt: "2024-06-15",
          publishedAt: "2024-06-15",
          status: "published",
          views: 243,
          image: "/images/blogs/adhd-guide.jpg",
          slug: "understanding-adhd-in-adults",
        },
        {
          id: "2",
          title: "Focus Techniques That Actually Work for ADHD",
          description:
            "Discover evidence-based focus techniques specifically designed for ADHD minds. From the Pomodoro Technique to mindfulness practices, learn what actually works for improving concentration with ADHD.",
          createdAt: "2024-05-10",
          updatedAt: "2024-06-10",
          publishedAt: "2024-06-10",
          status: "published",
          views: 189,
          image: "/images/blogs/focus-techniques.jpg",
          slug: "focus-techniques-for-adhd",
        },
        {
          id: "3",
          title: "Supporting Your ADHD Child: A Parent's Guide",
          description:
            "Practical strategies for parents navigating ADHD with their children. From school accommodations to building executive function skills, this guide helps parents support their ADHD children effectively.",
          createdAt: "2024-06-06",
          updatedAt: "2024-06-06",
          publishedAt: null,
          status: "draft",
          views: 0,
          image: "/images/blogs/parenting-guide.jpg",
          slug: "supporting-your-adhd-child",
        },
        {
          id: "4",
          title: "ADHD Medication: What You Need to Know",
          description:
            "A balanced overview of ADHD medications, their benefits, side effects, and how to work with your healthcare provider to find the right treatment approach.",
          createdAt: "2024-05-05",
          updatedAt: "2024-06-05",
          publishedAt: "2024-06-05",
          status: "published",
          views: 212,
          image: "/images/blogs/medication-guide.jpg",
          slug: "adhd-medication-guide",
        },
        {
          id: "5",
          title: "ADHD in the Workplace: Accommodation Strategies",
          description:
            "Navigate workplace challenges with ADHD. Learn about your rights, effective accommodations, and strategies to maximize productivity and career success with ADHD.",
          createdAt: "2024-04-28",
          updatedAt: "2024-05-28",
          publishedAt: "2024-05-28",
          status: "published",
          views: 166,
          image: "/images/blogs/workplace-adhd.jpg",
          slug: "adhd-workplace-strategies",
        },
      ];

      setBlogs(mockBlogs);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blogs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewBlog = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent the card click event from triggering
    router.push(`/therapist/blogs/${id}`);
  };

  const handleEditBlog = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent the card click event from triggering
    router.push(`/therapist/blogs/${id}/edit`);
  };

  const handleArchiveBlog = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent the card click event from triggering
    // Archive logic would go here
    console.log(`Archiving blog ${id}`);
    // For now we'll just show an alert
    alert(`Blog ${id} would be archived. This is a placeholder.`);
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
    blogs.length > 0 ? Math.round(totalViews / publishedCount) : 0;

  const handleNewBlog = () => {
    router.push("/therapist/blogs/new");
  };

  if (authStatus === "loading" || loading) {
    return <LoadingSpinner message="Loading blog management..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
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
                      src={blog.image}
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
                      {blog.description}
                    </p>

                    <div className="pt-2 text-sm text-gray-500">
                      {blog.status === "published"
                        ? `Published: ${new Date(
                            blog.publishedAt!
                          ).toLocaleDateString()}`
                        : `Last edited: ${new Date(
                            blog.updatedAt
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
                        onClick={(e) => handleArchiveBlog(e, blog.id)}
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
