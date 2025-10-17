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
  status: "draft" | "published" | "archived";
}

interface Blog {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  status: "draft" | "published" | "archived";
  imageUrl: string | null;
}

export default function ManagerEditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { status: authStatus, data: session } = useSession();
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract id from params
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: "",
    summary: "",
    content: "",
    category: "",
    tags: "",
    image: null,
    imagePreview: null,
    status: "draft",
  });

  // Fetch the blog data
  const fetchBlog = useCallback(async () => {
    setFetchLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/manager/resources/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Resource not found");
        }
        throw new Error("Failed to fetch resource");
      }

      const blogData: Blog = await response.json();

      // Update the form with the fetched data
      setFormData({
        title: blogData.title,
        summary: blogData.summary,
        content: blogData.content,
        category: blogData.category || "",
        tags: blogData.tags ? blogData.tags.join(", ") : "",
        image: null,
        imagePreview: blogData.imageUrl,
        status: blogData.status,
      });
    } catch (err) {
      console.error("Error fetching resource:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load resource data. Please try again later."
      );
    } finally {
      setFetchLoading(false);
    }
  }, [id]);

  // Fetch the blog data when the component mounts
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated" && session) {
      const userRole = (session.user as { role?: string }).role;
      if (userRole !== "MANAGER") {
        router.push("/dashboard");
        return;
      }

      if (id) {
        fetchBlog();
      }
    }
  }, [authStatus, router, session, fetchBlog, id]);

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
    setError(null);

    try {
      // Prepare the data for submission
      const submitData: Record<string, unknown> = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category || null,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        status: formData.status,
      };

      // Handle image upload if there's a new image
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
      console.error("Error updating resource:", error);
      setError("Failed to update resource. Please try again.");
      setLoading(false);
    }
  };

  const submitBlog = async (data: Record<string, unknown>) => {
    const response = await fetch(`/api/manager/resources/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update resource");
    }

    // Redirect to the resource detail page
    router.push(`/manager/resources/${id}`);
  };

  const handleStatusChange = (status: string) => {
    if (status === "published" || status === "draft" || status === "archived") {
      setFormData((prev) => ({
        ...prev,
        status: status as "published" | "draft" | "archived",
      }));
    }
  };

  const handlePreview = () => {
    router.push(`/manager/resources/${id}`);
  };

  if (authStatus === "loading" || fetchLoading) {
    return <LoadingSpinner message="Loading resource editor..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FB] via-white to-[#F5F3FB] p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/manager/resources")}>
              Return to Resource Management
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
              <h1 className="text-3xl font-bold text-[#8159A8]">Edit Resource</h1>
              <p className="text-gray-600">Update resource content</p>
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
              form="resource-form"
              disabled={loading}
              className="bg-[#8159A8] hover:bg-[#6D4C93] text-white transition-all duration-300"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Updating..." : "Update Resource"}
            </Button>
          </div>
        </div>

        <form id="resource-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-[#8159A8]">
                    Resource Content
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
                      placeholder="Enter resource title"
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
                      placeholder="Brief description of the resource"
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
                      placeholder="Write the resource content here..."
                      rows={15}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing Options */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-[#8159A8]">
                    Publishing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

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
                        <SelectValue placeholder="Select category" />
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
                        alt="Resource preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="image">Upload New Image</Label>
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
                        Choose Image
                      </Button>
                    </div>
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
