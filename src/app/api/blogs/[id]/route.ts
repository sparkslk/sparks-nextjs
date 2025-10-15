import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to view blogs" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const blog = await prisma.blogs.findUnique({
      where: { id: blogId },
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
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check access permissions: 
    // - Own blogs (any status) can be viewed
    // - Other therapists' blogs can only be viewed if published
    const isOwnBlog = blog.therapist_id === session.user.id;
    const isPublished = blog.status === 'published';

    if (!isOwnBlog && !isPublished) {
      return NextResponse.json(
        { error: "You can only view published blogs from other therapists" },
        { status: 403 }
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
      ...blog,
      imageUrl,
      image_data: undefined, // Remove binary data from response
      User: blog.User, // Map to match the expected structure
      user: undefined, // Remove the original user field
      isOwnBlog: blog.therapist_id === session.user.id,
      authorName: blog.User?.name || "Unknown Author",
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to update a blog" },
        { status: 401 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const blog = await prisma.blogs.findUnique({
      where: { id },
      select: { therapist_id: true, status: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check if user is authorized to update this blog
    if (blog.therapist_id !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to update this blog" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Handle status change to published
    const updates: Record<string, unknown> = {
      title: data.title,
      summary: data.summary,
      content: data.content,
      category: data.category,
      tags: data.tags || [],
      status: data.status,
    };

    // Handle image data if provided
    if (data.image_data && data.image_type) {
      updates.image_data = Buffer.from(data.image_data, "base64");
      updates.image_type = data.image_type;
      updates.image_name = data.image_name;
    }

    // Set published_at if status is changing to published
    if (data.status === "published" && blog.status !== "published") {
      updates.published_at = new Date();
    }

    // Update the blog
    const updatedBlog = await prisma.blogs.update({
      where: { id },
      data: updates,
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Convert image data to base64 for response
    let imageUrl = null;
    if (updatedBlog.image_data && updatedBlog.image_type) {
      const base64Data = Buffer.from(updatedBlog.image_data).toString("base64");
      imageUrl = `data:${updatedBlog.image_type};base64,${base64Data}`;
    }

    return NextResponse.json({
      ...updatedBlog,
      imageUrl,
      image_data: undefined, // Remove binary data from response
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete a blog" },
        { status: 401 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const blog = await prisma.blogs.findUnique({
      where: { id },
      select: { therapist_id: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check if user is authorized to delete this blog
    if (blog.therapist_id !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this blog" },
        { status: 403 }
      );
    }

    // Delete the blog
    await prisma.blogs.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
