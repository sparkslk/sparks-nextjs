import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const blog = await prisma.blogs.findUnique({
      where: { id },
      select: {
        image_data: true,
        image_type: true,
      },
    });

    if (!blog || !blog.image_data || !blog.image_type) {
      // Return a placeholder image or 404
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Convert Buffer to Uint8Array if needed
    const imageBuffer =
      blog.image_data instanceof Buffer
        ? blog.image_data
        : Buffer.from(blog.image_data);

    // Return the image with the correct content type
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": blog.image_type,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching blog image:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
