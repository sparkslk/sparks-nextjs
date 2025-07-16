"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Save, ImagePlus, Loader2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface BlogForm {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string;
  image: File | null;
  imagePreview: string | null;
  status: "published" | "draft" | "archived";
}

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default form state
  const [formData, setFormData] = useState<BlogForm>({
    title: "",
    summary: "",
    content: "",
    category: "",
    tags: "",
    image: null,
    imagePreview: null,
    status: "draft",
  });

  // Fetch the blog data - wrapped in useCallback to avoid dependency issues
  const fetchBlog = useCallback(async () => {
    setFetchLoading(true);
    setError(null);

    try {
      // In a real implementation, you'd fetch from an API
      // For now we'll simulate fetching with mock data
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock data based on the ID
      let blogData;

      if (params.id === "1") {
        blogData = {
          id: "1",
          title: "Understanding ADHD in Adults: A Comprehensive Guide",
          summary:
            "Adult ADHD often goes undiagnosed, leading to challenges in work, relationships, and daily life.",
          content: `# Understanding ADHD in Adults: A Comprehensive Guide

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
- Motivation issues`,
          category: "adhd",
          tags: ["ADHD", "Adults", "Mental Health", "Treatment"],
          status: "published",
          image: "/images/blogs/adhd-guide.jpg",
        };
      } else if (params.id === "2") {
        blogData = {
          id: "2",
          title: "Focus Techniques That Actually Work for ADHD",
          summary:
            "Discover evidence-based focus techniques specifically designed for ADHD minds.",
          content: "This is the full content for the focus techniques blog...",
          category: "adhd",
          tags: ["ADHD", "Focus", "Productivity", "Techniques"],
          status: "published",
          image: "/images/blogs/focus-techniques.jpg",
        };
      } else if (params.id === "3") {
        blogData = {
          id: "3",
          title: "Supporting Your ADHD Child: A Parent's Guide",
          summary:
            "Practical strategies for parents navigating ADHD with their children.",
          content: "This is the full content for the parent's guide blog...",
          category: "parenting",
          tags: ["ADHD", "Parenting", "Children", "Support"],
          status: "draft",
          image: "/images/blogs/parenting-guide.jpg",
        };
      } else {
        throw new Error("Blog not found");
      }

      // Update the form with the fetched data
      setFormData({
        title: blogData.title,
        summary: blogData.summary,
        content: blogData.content,
        category: blogData.category,
        tags: blogData.tags.join(", "),
        image: null, // We don't have the actual file, just the URL
        imagePreview: blogData.image, // Use the image URL as preview
        status: blogData.status as "published" | "draft" | "archived",
      });
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to load blog data. Please try again later.");
    } finally {
      setFetchLoading(false);
    }
  }, [params.id]); // Add params.id as dependency

  // Fetch the blog data when the component mounts
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated") {
      // Check if the user has permission to edit this blog
      // This is where you would use the session data to verify permissions
      if (session && session.user) {
        // Example permission check (uncomment and adapt as needed)
        // const isAuthor = blog.authorId === session.user.id;
        // const isAdmin = session.user.role === 'admin';
        // if (!isAuthor && !isAdmin) {
        //   router.push('/unauthorized');
        //   return;
        // }
      }

      fetchBlog();
    }
  }, [authStatus, router, fetchBlog, session]); // Add fetchBlog and session to dependency array

  // Handle file input changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (limit to ~5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 5MB.");
        return;
      }

      // Validate file type
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        alert("Please select a JPEG, PNG or WEBP image.");
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setFormData({
            ...formData,
            image: file,
            imagePreview: event.target.result,
          });
        }
      };

      reader.readAsDataURL(file);
    }
  };

  // Handle text input changes
  const handleInputChange = (field: keyof BlogForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real implementation, you'd make an API call to update the blog
      // For now we'll simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect back to the blog detail page
      router.push(`/therapist/blogs/${params.id}`);
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Failed to update blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: string) => {
    if (status === "published" || status === "draft" || status === "archived") {
      setFormData((prev) => ({
        ...prev,
        status: status as "published" | "draft" | "archived",
      }));
    }
  };

  if (authStatus === "loading" || fetchLoading) {
    return <LoadingSpinner message="Loading blog content..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-6">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/therapist/blogs")}>
            Return to Blog Management
          </Button>
        </Card>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="transition-all duration-300 hover:bg-[#F5F3FB]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#8159A8]">Edit Blog</h1>
            <p className="text-gray-600">
              Update your blog content and details
            </p>
          </div>
        </div>

        {/* Blog Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-[#8159A8]">Blog Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a compelling title for your blog"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="focus-visible:ring-[#8159A8]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary *</Label>
                <Textarea
                  id="summary"
                  placeholder="Write a brief summary to appear in blog listings (100-150 words recommended)"
                  required
                  rows={3}
                  value={formData.summary}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("summary", e.target.value)
                  }
                  className="focus-visible:ring-[#8159A8]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Blog Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your full blog content here..."
                  required
                  rows={16}
                  value={formData.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("content", e.target.value)
                  }
                  className="focus-visible:ring-[#8159A8]/20"
                />
                <p className="text-xs text-gray-500">
                  You can use Markdown formatting for headings, lists, links and
                  emphasis.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-[#8159A8]">
                Blog Details & Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger
                      id="category"
                      className="focus-visible:ring-[#8159A8]/20"
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adhd">ADHD Resources</SelectItem>
                      <SelectItem value="anxiety">
                        Anxiety & Depression
                      </SelectItem>
                      <SelectItem value="parenting">
                        Parenting Support
                      </SelectItem>
                      <SelectItem value="wellness">Mental Wellness</SelectItem>
                      <SelectItem value="therapy">
                        Therapy Approaches
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Enter tags separated by commas"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    className="focus-visible:ring-[#8159A8]/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Featured Image</Label>
                <div className="flex items-center space-x-4">
                  <div
                    className={`
                      relative border-2 border-dashed rounded-lg overflow-hidden w-full 
                      ${
                        formData.imagePreview
                          ? "border-[#8159A8]"
                          : "border-gray-300"
                      }
                      hover:border-[#8159A8] transition-colors duration-300
                    `}
                    style={{ height: "220px" }}
                  >
                    {formData.imagePreview ? (
                      <>
                        <Image
                          src={formData.imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              image: null,
                              imagePreview: null,
                            })
                          }
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <label
                        htmlFor="image"
                        className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                      >
                        <ImagePlus className="h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click or drag to upload a new image
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          JPEG, PNG or WEBP (max 5MB)
                        </p>
                      </label>
                    )}
                    <input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  High-quality featured image will make your blog more engaging.
                  Recommended size: 1200 x 630 pixels.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Options */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-[#8159A8]">
                Publishing Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="statusDraft"
                    checked={formData.status === "draft"}
                    onChange={() => handleStatusChange("draft")}
                    className="rounded text-[#8159A8] focus:ring-[#8159A8]"
                  />
                  <Label htmlFor="statusDraft" className="cursor-pointer">
                    Draft (not visible to users)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="statusPublished"
                    checked={formData.status === "published"}
                    onChange={() => handleStatusChange("published")}
                    className="rounded text-[#8159A8] focus:ring-[#8159A8]"
                  />
                  <Label htmlFor="statusPublished" className="cursor-pointer">
                    Published (visible to all users)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="statusArchived"
                    checked={formData.status === "archived"}
                    onChange={() => handleStatusChange("archived")}
                    className="rounded text-[#8159A8] focus:ring-[#8159A8]"
                  />
                  <Label htmlFor="statusArchived" className="cursor-pointer">
                    Archived (hidden from listings)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="transition-all duration-300 hover:bg-[#F5F3FB]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#8159A8] hover:bg-[#6D4C93] text-white transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
