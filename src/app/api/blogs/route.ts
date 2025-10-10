import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient, Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Get the current session to identify the user
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to access blogs" },
        { status: 401 }
      );
    }

    // Parse URL to get filter parameter
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter') || 'mine';
    
    // Get user role from session
    const userRole = (session.user as any).role;

    // Build query based on filter and user role
    let whereClause = {};
    
    if (filter === 'all') {
      // Get all published blogs from any therapist
      whereClause = {
        status: 'published'
      };
    } else if (filter === 'mine') {
      // Only therapists can access their own blogs
      if (userRole !== 'THERAPIST') {
        // Non-therapists get all published blogs instead
        whereClause = {
          status: 'published'
        };
      } else {
        // Get all blogs (published and draft) from the current therapist
        whereClause = {
          therapist_id: session.user.id
        };
      }
    } else if (filter === 'published') {
      // Only therapists can filter their own published blogs
      if (userRole !== 'THERAPIST') {
        // Non-therapists get all published blogs
        whereClause = {
          status: 'published'
        };
      } else {
        // Get only published blogs from the current therapist
        whereClause = {
          therapist_id: session.user.id,
          status: 'published'
        };
      }
    } else if (filter === 'draft') {
      // Only therapists can see drafts - non-therapists get published blogs
      if (userRole !== 'THERAPIST') {
        whereClause = {
          status: 'published'
        };
      } else {
        // Get only draft blogs from the current therapist
        whereClause = {
          therapist_id: session.user.id,
          status: 'draft'
        };
      }
    } else {
      // Default behavior based on user role
      if (userRole === 'THERAPIST') {
        whereClause = {
          therapist_id: session.user.id
        };
      } else {
        // Parents and other users get all published blogs
        whereClause = {
          status: 'published'
        };
      }
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
        isOwnBlog: blog.therapist_id === session.user.id, // Flag to identify if this is user's own blog
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

    // Validate required fields
    if (!data.title?.trim() || !data.summary?.trim() || !data.content?.trim()) {
      return NextResponse.json(
        { error: "Title, summary, and content are required" },
        { status: 400 }
      );
    }

    // Prepare the blog data
    const blogData: Prisma.blogsCreateInput = {
      title: data.title.trim(),
      summary: data.summary.trim(),
      content: data.content.trim(),
      User: { connect: { id: session.user.id } },
      status: data.status || "draft",
      category: data.category || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      views: 0,
    };

    // Handle image data if provided
    if (data.image_data && data.image_type) {
      blogData.image_data = Buffer.from(data.image_data, "base64");
      blogData.image_type = data.image_type;
      blogData.image_name = data.image_name;
    }

    // Set published_at if status is published
    if (data.status === "published") {
      blogData.published_at = new Date();
    }

    // Create the blog
    const newBlog = await prisma.blogs.create({
      data: blogData,
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
    if (newBlog.image_data && newBlog.image_type) {
      const base64Data = Buffer.from(newBlog.image_data).toString("base64");
      imageUrl = `data:${newBlog.image_type};base64,${base64Data}`;
    }

    return NextResponse.json(
      {
        ...newBlog,
        imageUrl,
        image_data: undefined, // Remove binary data from response
        authorName: newBlog.User?.name || "Unknown Author",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blog:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Invalid user ID. Please try logging out and back in." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create blog. Please try again." },
      { status: 500 }
    );
  }
}
