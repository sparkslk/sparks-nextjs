import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Get the current session to identify the user
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to access blogs" },
        { status: 401 }
      );
    }

    // For now, fetch all blogs (you might want to add pagination later)
    const blogs = await prisma.blogs.findMany({
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        therapist_id: true,
        status: true,
        category: true,
        tags: true,
        // Don't include image_data in the initial fetch to reduce payload size
        image_type: true,
        image_name: true,
        views: true,
        created_at: true,
        updated_at: true,
        published_at: true,
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a blog" },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Create a new blog
    const newBlog = await prisma.blogs.create({
      data: {
        title: data.title,
        summary: data.summary,
        content: data.content,
        therapist_id: session.user.id,
        status: data.status || "draft",
        category: data.category,
        tags: data.tags || [],
        // Handle image data separately if provided
        image_type: data.image_type,
        image_name: data.image_name,
      },
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
