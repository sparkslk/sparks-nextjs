"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Save, Eye, Upload } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface FormData {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string;
  image: File | null;
  imagePreview: string | null;
}

export default function NewBlogPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(true);
  const [formData, setFormData] = useState<FormData>({
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
  }, [authStatus, router]);

  // Handle file input changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: e.target?.result as string,
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  // Handle text input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
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
      // Validate required fields
      if (
        !formData.title.trim() ||
        !formData.summary.trim() ||
        !formData.content.trim()
      ) {
        alert(
          "Please fill in all required fields (title, summary, and content)."
        );
        setLoading(false);
        return;
      }

      // Prepare the data for submission
      const submitData: Record<string, unknown> = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        category: formData.category || null,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        status: saveAsDraft ? "draft" : "published",
      };

      // Handle image upload if there's an image
      if (formData.image) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result as string;
          const [, data] = base64Data.split(",");

          submitData.image_data = data;
          submitData.image_type = formData.image!.type;
          submitData.image_name = formData.image!.name;

          await submitBlog(submitData);
        };
        reader.readAsDataURL(formData.image);
      } else {
        await submitBlog(submitData);
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Failed to create blog. Please try again.");
      setLoading(false);
    }
  };

  const submitBlog = async (data: Record<string, unknown>) => {
    const response = await fetch("/api/blogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create blog");
    }

    const result = await response.json();

    // Redirect to the new blog
    router.push(`/therapist/blogs/${result.id}`);
  };

  const handlePreview = () => {
    // For preview, we could open a modal or navigate to a preview page
    // For now, let's just show an alert
    alert("Preview functionality will be implemented soon!");
  };

  if (authStatus === "loading") {
    return <LoadingSpinner message="Loading..." />;
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="transition-all duration-300 hover:bg-[#F5F3FB]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#8159A8]">
                Create New Blog
              </h1>
              <p className="text-gray-600">Share your therapeutic insights</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              className="transition-all duration-300 hover:bg-[#F5F3FB]"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              type="submit"
              form="blog-form"
              disabled={loading}
              onClick={() => setSaveAsDraft(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              type="submit"
              form="blog-form"
              disabled={loading}
              onClick={() => setSaveAsDraft(false)}
              className="bg-[#8159A8] hover:bg-[#6D4C93] text-white transition-all duration-300"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Publishing..." : "Publish Now"}
            </Button>
          </div>
        </div>

        <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-[#8159A8]">
                    Blog Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter an engaging blog title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="summary">Summary *</Label>
                    <Textarea
                      id="summary"
                      value={formData.summary}
                      onChange={(e) =>
                        handleInputChange("summary", e.target.value)
                      }
                      placeholder="Brief description of your blog (this will appear in blog previews)"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        handleInputChange("content", e.target.value)
                      }
                      placeholder="Write your blog content here. You can use simple formatting:

# Main Heading
## Subheading
### Small Heading

- List item 1
- List item 2

Regular paragraphs..."
                      rows={15}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Categories and Tags */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-[#8159A8]">
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger>
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
                        <SelectItem value="wellness">
                          Mental Wellness
                        </SelectItem>
                        <SelectItem value="therapy">
                          Therapy Approaches
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        handleInputChange("tags", e.target.value)
                      }
                      placeholder="mental health, therapy, wellness"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate tags with commas
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-[#8159A8]">
                    Featured Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.imagePreview && (
                    <div className="relative aspect-video">
                      <Image
                        src={formData.imagePreview}
                        alt="Blog preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="image">Upload Image</Label>
                    <div className="mt-1">
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("image")?.click()
                        }
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {formData.imagePreview
                          ? "Change Image"
                          : "Choose Image"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-[#8159A8]">
                    Writing Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Write a compelling title that grabs attention</p>
                    <p>• Keep your summary concise but informative</p>
                    <p>• Use headings to structure your content</p>
                    <p>• Add relevant tags to help readers find your blog</p>
                    <p>• Include an image to make your blog more engaging</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
