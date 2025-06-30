"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Eye, BarChart3 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

interface Blog {
  id: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  status: "published" | "draft" | "archived";
  views: number;
  image: string;
  slug: string;
  category: string;
  tags: string[];
  authorName: string;
}

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated") {
      fetchBlog();
    }
  }, [authStatus, router, params.id]);

  const fetchBlog = async () => {
    setLoading(true);
    setError(null);

    try {
      // This would be an API call in a real app
      // For now, we'll simulate fetching with mock data

      // Add a small delay to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (params.id === "1") {
        setBlog({
          id: "1",
          title: "Understanding ADHD in Adults: A Comprehensive Guide",
          summary:
            "Adult ADHD often goes undiagnosed, leading to challenges in work, relationships, and daily life.",
          content: `
# Understanding ADHD in Adults: A Comprehensive Guide

Adult ADHD often goes undiagnosed, leading to challenges in work, relationships, and daily life. This comprehensive guide explores the symptoms, causes, and treatment options for adults with ADHD.

## Common Symptoms in Adults

ADHD symptoms in adults can differ from those in children. While hyperactivity may decrease in adulthood, other symptoms can persist and cause significant impairment.

### Attention Difficulties
- Trouble focusing on tasks
- Easy distraction by unrelated thoughts or stimuli
- Difficulty completing projects
- Poor attention to details, making careless mistakes
- Problems following conversations

### Executive Function Challenges
- Difficulty with organization and prioritization
- Poor time management and frequent tardiness
- Trouble starting and finishing tasks
- Forgetting appointments, deadlines, or commitments

### Emotional Regulation
- Mood swings and emotional reactivity
- Low frustration tolerance
- Difficulty managing stress
- Motivation issues

## Diagnosis Process

Getting diagnosed as an adult can be challenging but is an important step toward treatment. The process typically involves:

1. **Clinical interview** - Discussion of current symptoms, childhood history, and impact on life
2. **Rating scales** - Standardized questionnaires that measure ADHD symptoms
3. **Medical history review** - To rule out other conditions with similar symptoms
4. **Collateral information** - Input from partners, family members, or close friends

## Treatment Approaches

Effective ADHD management usually involves a multimodal approach:

### Medication
- Stimulants (methylphenidate, amphetamines)
- Non-stimulants (atomoxetine, guanfacine)
- Antidepressants (in some cases)

### Therapy Options
- Cognitive-behavioral therapy
- ADHD coaching
- Mindfulness training
- Group therapy

### Lifestyle Strategies
- Exercise and physical activity
- Sleep hygiene practices
- Nutrition considerations
- Environmental modifications

## Living Successfully with ADHD

Many adults with ADHD lead successful, fulfilling lives. Strategies include:

- Leveraging ADHD strengths like creativity and problem-solving
- Using technology tools for organization
- Creating structured environments
- Developing consistent routines
- Building a supportive network
          `,
          createdAt: "2024-03-15",
          updatedAt: "2024-06-15",
          publishedAt: "2024-06-15",
          status: "published",
          views: 243,
          image: "/images/blogs/adhd-guide.jpg",
          slug: "understanding-adhd-in-adults",
          category: "adhd",
          tags: ["ADHD", "Adults", "Mental Health", "Treatment"],
          authorName: "Dr. Kanchana Weerasinghe",
        });
      } else if (params.id === "2") {
        setBlog({
          id: "2",
          title: "Focus Techniques That Actually Work for ADHD",
          summary:
            "Discover evidence-based focus techniques specifically designed for ADHD minds.",
          content: "This is the full content for the focus techniques blog...",
          createdAt: "2024-05-10",
          updatedAt: "2024-06-10",
          publishedAt: "2024-06-10",
          status: "published",
          views: 189,
          image: "/images/blogs/focus-techniques.jpg",
          slug: "focus-techniques-for-adhd",
          category: "adhd",
          tags: ["ADHD", "Focus", "Productivity", "Techniques"],
          authorName: "Dr. Sarah Johnson",
        });
      } else if (params.id === "3") {
        setBlog({
          id: "3",
          title: "Supporting Your ADHD Child: A Parent's Guide",
          summary:
            "Practical strategies for parents navigating ADHD with their children.",
          content: "This is the full content for the parent's guide blog...",
          createdAt: "2024-06-06",
          updatedAt: "2024-06-06",
          publishedAt: null,
          status: "draft",
          views: 0,
          image: "/images/blogs/parenting-guide.jpg",
          slug: "supporting-your-adhd-child",
          category: "parenting",
          tags: ["ADHD", "Parenting", "Children", "Support"],
          authorName: "Dr. Sarah Johnson",
        });
      } else {
        // If ID doesn't match any mock data
        throw new Error("Blog not found");
      }
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to load blog. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    setLoading(true);
    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setBlog((blog) =>
        blog
          ? {
              ...blog,
              status: "published",
              publishedAt: new Date().toISOString(),
            }
          : null
      );
    } catch (err) {
      console.error("Error publishing blog:", err);
      setError("Failed to publish blog. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewOnPublicSite = () => {
    // Open blog in a new tab on the public-facing site
    window.open(`/blogs/${blog?.slug}`, "_blank");
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
              The blog you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/therapist/blogs")}>
              Return to Blog Management
            </Button>
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
                  ? `Published on ${new Date(
                      blog.publishedAt!
                    ).toLocaleDateString()}`
                  : `Last updated on ${new Date(
                      blog.updatedAt
                    ).toLocaleDateString()}`}
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
              <div
                className={`relative w-full ${
                  blog.status === "draft" ? "bg-amber-100" : "bg-white"
                }`}
                style={{ height: "300px" }}
              >
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 75vw"
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/blogs/blog-placeholder.jpg";
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
              <CardContent className="p-6">
                <div className="prose prose-purple max-w-none">
                  <div className="whitespace-pre-line">
                    {blog.content.split("\n").map((line, i) => {
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
                    })}
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
                    {new Date(blog.createdAt).toLocaleDateString()}
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
                <div>
                  <div className="text-gray-600 mb-2">Category</div>
                  <Badge className="bg-[#8159A8]/10 text-[#8159A8] hover:bg-[#8159A8]/20 transition-colors duration-300">
                    {blog.category.charAt(0).toUpperCase() +
                      blog.category.slice(1)}
                  </Badge>
                </div>
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
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-[#8159A8]">Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8159A8] text-white flex items-center justify-center font-bold">
                    {blog.authorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-medium">{blog.authorName}</div>
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
