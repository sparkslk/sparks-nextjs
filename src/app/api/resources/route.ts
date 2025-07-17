import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const resources = await prisma.blogs.findMany({
      select: {
        id: true,
        image_data: true,
        views: true,
        created_at: true,
        updated_at: true,
        published_at: true,
        category: true,
        tags: true,
        image_name: true,
        image_type: true,
        title: true,
        summary: true,
        content: true,
        therapist_id: true,
        status: true,
      },
    });
    return NextResponse.json(resources);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}