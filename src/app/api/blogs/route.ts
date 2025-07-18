import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

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

    // For therapist users, fetch only their blogs
    const blogs = await prisma.blogs.findMany({
      where: {
        therapist_id: session.user.id, // Only fetch blogs for the logged-in therapist
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    // Process blogs to include image URLs and proper structure
    const processedBlogs = blogs.map((blog) => {
      let imageUrl = null;
      if (blog.image_data && blog.image_type) {
        const base64Data = Buffer.from(blog.image_data).toString("base64");
        imageUrl = `data:${blog.image_type};base64,${base64Data}`;
      }

      return {
        ...blog,
        imageUrl,
        image_data: undefined, // Remove binary data from response
        authorName: blog.User?.name || "Unknown Author",
      };
    });

    return NextResponse.json(processedBlogs);
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
