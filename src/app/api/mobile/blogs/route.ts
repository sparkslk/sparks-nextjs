import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Get published blogs for mobile app
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyMobileToken(token);

    if (!payload || payload.role !== "NORMAL_USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const category = searchParams.get("category");

    // Build where clause - only published blogs
    const where: Record<string, unknown> = {
      status: "published",
    };

    if (category) {
      where.category = category;
    }

    // Fetch blogs
    const limit = limitParam ? parseInt(limitParam) : undefined;

    const blogs = await prisma.blogs.findMany({
      where,
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        published_at: "desc",
      },
      take: limit,
    });

    // Process blogs to include image URLs
    const processedBlogs = blogs.map((blog) => {
      let imageUrl = null;
      if (blog.image_data && blog.image_type) {
        const base64Data = Buffer.from(blog.image_data).toString("base64");
        imageUrl = `data:${blog.image_type};base64,${base64Data}`;
      }

      return {
        id: blog.id,
        title: blog.title,
        summary: blog.summary,
        content: blog.content,
        category: blog.category,
        tags: blog.tags,
        imageUrl,
        authorName: blog.User?.name || "Unknown Author",
        views: blog.views,
        published_at: blog.published_at,
        created_at: blog.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      blogs: processedBlogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
