"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Calendar, User, Eye, Tag } from "lucide-react";

interface Blog {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  imageUrl: string | null;
  views: number;
  created_at: string;
  published_at: string | null;
  user: {
    name: string;
    email: string;
  };
}

export default function BlogDetails() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${params.id}`);
        if (!response.ok) {
          throw new Error("Blog not found");
        }
        const blogData = await response.json();
        setBlog(blogData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBlog();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Blog Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The blog you are looking for does not exist."}
          </p>
          <button
            onClick={() => router.push("/blogs")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Blogs
          </button>
        </div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/blogs")}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Blogs
        </button>

        {/* Blog Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {blog.imageUrl && (
            <div className="relative h-64 md:h-96">
              <Image
                src={blog.imageUrl}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="mb-4">
              {blog.category && (
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-4">
                  {blog.category}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {blog.title}
              </h1>
              <p className="text-xl text-gray-600 mb-6">{blog.summary}</p>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>By {blog.user.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(blog.published_at || blog.created_at)}</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                <span>{blog.views} views</span>
              </div>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 mb-6">
                <Tag className="w-4 h-4 text-gray-400" />
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </div>
    </div>
  );
}
