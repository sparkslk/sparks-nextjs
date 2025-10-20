import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 10);
    const skip = (page - 1) * pageSize;

    try {
        const [items, total] = await Promise.all([
            prisma.donation.findMany({
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
                select: {
                    id: true,
                    donorName: true,
                    donorEmail: true,
                    isAnonymous: true,
                    amount: true,
                    currency: true,
                    paymentStatus: true,
                    createdAt: true,
                },
            }),
            prisma.donation.count(),
        ]);

        return NextResponse.json({ success: true, data: { items, total, page, pageSize } });
    } catch (error) {
        console.error("Error fetching donations list:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


