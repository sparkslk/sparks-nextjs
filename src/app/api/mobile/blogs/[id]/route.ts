import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Get single blog by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    // Fetch blog - only published blogs for mobile users
    const blog = await prisma.blogs.findFirst({
      where: {
        id: blogId,
        status: "published",
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found or not published" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.blogs.update({
      where: { id: blogId },
      data: { views: { increment: 1 } },
    });

    // Convert image data to base64 if it exists
    let imageUrl = null;
    if (blog.image_data && blog.image_type) {
      const base64Data = Buffer.from(blog.image_data).toString("base64");
      imageUrl = `data:${blog.image_type};base64,${base64Data}`;
    }

    return NextResponse.json({
      success: true,
      blog: {
        id: blog.id,
        title: blog.title,
        summary: blog.summary,
        content: blog.content,
        category: blog.category,
        tags: blog.tags,
        imageUrl,
        authorName: blog.User?.name || "Unknown Author",
        authorEmail: blog.User?.email,
        views: blog.views + 1, // Return updated view count
        published_at: blog.published_at,
        created_at: blog.created_at,
        updated_at: blog.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
