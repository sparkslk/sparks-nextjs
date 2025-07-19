import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Eye } from "lucide-react";

interface BlogCardProps {
  id: number;
  title: string;
  summary: string;
  category: string | null;
  authorName: string;
  publishedAt: string;
  views: number;
  imageUrl?: string | null;
}

export default function BlogCard({
  id,
  title,
  summary,
  category,
  authorName,
  publishedAt,
  views,
  imageUrl,
}: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {imageUrl && (
        <div className="relative h-48 w-full">
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        </div>
      )}

      <div className="p-6">
        {category && (
          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-3">
            {category}
          </span>
        )}

        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-3">{summary}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(publishedAt)}</span>
            </div>
          </div>
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            <span>{views}</span>
          </div>
        </div>

        <Link
          href={`/blogs/${id}`}
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Read More
        </Link>
      </div>
    </div>
  );
}
