import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { patientId } = await req.json();
    if (!patientId) {
      return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
    }
    // Remove the ParentGuardian record for this parent and patient
    await prisma.parentGuardian.deleteMany({
      where: {
        userId: session.user.id,
        patientId,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to remove child" }, { status: 500 });
  }
}
