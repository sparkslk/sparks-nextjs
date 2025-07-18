import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ["PARENT_GUARDIAN"]);
        // Get parent user (no phone field)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                id: true
            }
        });
        // Get relationship from parentGuardian (first found)
        const parentGuardian = await prisma.parentGuardian.findFirst({
            where: { userId: session.user.id },
            select: { relationship: true }
        });
        return NextResponse.json({
            name: user?.name || "",
            phone: "", // No phone field available
            relationship: parentGuardian?.relationship || ""
        });
    } catch {
        return NextResponse.json({ error: "Unable to fetch parent details" }, { status: 500 });
    }
}
