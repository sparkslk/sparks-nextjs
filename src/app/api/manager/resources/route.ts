import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Get the current session to identify the user
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to access resources" },
        { status: 401 }
      );
    }

    // Check if user is a manager
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "MANAGER") {
      return NextResponse.json(
        { error: "Only managers can access this resource" },
        { status: 403 }
      );
    }

    // Parse URL to get filter parameter
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter') || 'all';

    // Build query based on filter
    let whereClause = {};
    
    if (filter === 'all') {
      // Get all blogs (published and draft) from all therapists
      whereClause = {};
    } else if (filter === 'published') {
      // Get only published blogs
      whereClause = {
        status: 'published'
      };
    } else if (filter === 'draft') {
      // Get only draft blogs
      whereClause = {
        status: 'draft'
      };
    }

    // Fetch blogs based on filter
    const blogs = await prisma.blogs.findMany({
      where: whereClause,
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
        isOwnBlog: false, // Managers don't own any blogs
      };
    });

    return NextResponse.json(processedBlogs);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
