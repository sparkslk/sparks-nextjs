"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft, Save, ImagePlus } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface BlogForm {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string;
  image: File | null;
  imagePreview: string | null;
}

export default function NewBlogPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(true);
  const [formData, setFormData] = useState<BlogForm>({
    title: "",
    summary: "",
    content: "",
    category: "",
    tags: "",
    image: null,
    imagePreview: null,
  });

  // Use session for authorization check
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated" && session) {
      // Here you can use session data for authorization
      // For example, check if user has permission to create blogs
      // Example permission check:
      // const userRole = session.user?.role;
      // if (userRole !== 'therapist' && userRole !== 'admin') {
      //   router.push('/unauthorized');
      //   return;
      // }
      // You could also set author information from session
      // setFormData(prev => ({
      //   ...prev,
      //   authorId: session.user?.id,
      //   authorName: session.user?.name
      // }));
    }
  }, [authStatus, router]);

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
      // In a real implementation, you'd include session data here
      // const payload = {
      //   ...formData,
      //   authorId: session?.user?.id,
      //   authorName: session?.user?.name,
      //   status: saveAsDraft ? 'draft' : 'published'
      // };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to blog list
      router.push("/therapist/blogs");
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Failed to create blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === "loading") {
    return <LoadingSpinner message="Loading..." />;
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
            <h1 className="text-2xl font-bold text-[#8159A8]">
              Create New Blog
            </h1>
            <p className="text-gray-600">
              Share your knowledge and expertise with the community
            </p>
          </div>
        </div>

        {/* Blog Creation Form */}
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
                  rows={12}
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
                <Label htmlFor="image">Featured Image (Required)</Label>
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
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
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
                          Click or drag to upload an image
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
                      required
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
                Publishing Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="saveAsDraft"
                  checked={saveAsDraft}
                  onChange={() => setSaveAsDraft(!saveAsDraft)}
                  className="rounded text-[#8159A8] focus:ring-[#8159A8]"
                />
                <Label htmlFor="saveAsDraft" className="cursor-pointer">
                  Save as draft (unpublished)
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {saveAsDraft
                  ? "The blog will be saved but not visible to users until you publish it."
                  : "The blog will be immediately visible to all users."}
              </p>
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {saveAsDraft ? "Saving..." : "Publishing..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {saveAsDraft ? "Save as Draft" : "Publish Blog"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
