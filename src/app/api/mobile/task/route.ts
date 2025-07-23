// Allowed task status values (should match your Prisma schema)
type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Create a new task for the logged-in patient
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        // Required: title. Optional: description, instructions, dueDate, status, priority, isRecurring, category, sessionid
        const {
            title,
            description,
            instructions,
            dueDate,
            status,
            priority,
            isRecurring,
            category, // user provides category
            sessionid
        } = body;

        if (!title || typeof title !== "string") {
            return NextResponse.json({ error: "Title is required." }, { status: 400 });
        }

        // Save category in recurringPattern field
        const newTask = await prisma.task.create({
            data: {
                patientId: patient.id,
                title,
                description: description ?? null,
                instructions: instructions ?? null,
                dueDate: dueDate ? new Date(dueDate) : null,
                status: status ?? undefined, // let Prisma default if not provided
                priority: typeof priority === 'number' ? priority : 1,
                isRecurring: typeof isRecurring === 'boolean' ? isRecurring : false,
                recurringPattern: category ?? null,
                sessionid: sessionid ?? null,
            },
        });

        // Return category as a top-level field for client convenience
        const responseTask = { ...newTask, category: newTask.recurringPattern };
        return NextResponse.json({ success: true, task: responseTask }, { status: 201 });
    } catch (error) {
        console.error("Error creating task:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
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


        // Map status string to TaskStatus enum values
        const STATUS_MAP: Record<string, string> = {
            pending: "PENDING",
            in_progress: "IN_PROGRESS",
            completed: "COMPLETED",
            overdue: "OVERDUE",
        };

        // Optional: filter by status query param
        const url = new URL(request.url);
        const statusParam = url.searchParams.get("status");
        // Only allow valid TaskStatus values
        let statusFilter: { in: TaskStatus[] } | undefined = undefined;
        if (statusParam) {
            const allowed: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE"];
            const statuses = statusParam
                .split(",")
                .map(s => STATUS_MAP[s.trim().toLowerCase()])
                .filter((v): v is TaskStatus => allowed.includes(v as TaskStatus));
            if (statuses.length > 0) {
                statusFilter = { in: statuses };
            }
        }

        const tasks = await prisma.task.findMany({
            where: {
                patientId: patient.id,
                ...(statusFilter ? { status: statusFilter } : {}),
            },
            orderBy: { dueDate: "asc" },
        });

        // Map recurringPattern to category in response
        const tasksWithCategory = tasks.map(t => ({ ...t, category: t.recurringPattern }));
        return NextResponse.json({ tasks: tasksWithCategory }, { status: 200 });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
