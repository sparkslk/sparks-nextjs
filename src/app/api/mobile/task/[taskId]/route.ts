import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    context: { params: { taskId: string } }
) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const payload = await verifyMobileToken(token);

        if (!payload || payload.role !== "NORMAL_USER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find the patient record for the logged-in user
        const patient = await prisma.patient.findUnique({
            where: { userId: payload.userId },
        });
        if (!patient) {
            return NextResponse.json({ error: "Patient profile not found." }, { status: 404 });
        }

        const params = await context.params;
        const task = await prisma.task.findUnique({
            where: { id: params.taskId, patientId: patient.id },
        });

        if (!task) {
            return NextResponse.json({ error: "Task not found." }, { status: 404 });
        }

        // Map recurringPattern to category in response
        const responseTask = { ...task, category: task.recurringPattern };
        return NextResponse.json({ task: responseTask }, { status: 200 });
    } catch (error) {
        console.error("Error fetching task:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}