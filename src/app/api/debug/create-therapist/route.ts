import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Simple API to create a test therapist
export async function POST() {
    try {
        // Check if therapist already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: "sarah.johnson@sparks.com" }
        });

        if (existingUser) {
            return NextResponse.json({
                message: "Therapist already exists",
                therapist: existingUser
            });
        }

        // Create user account for therapist
        const hashedPassword = await bcrypt.hash("password123", 10);

        const user = await prisma.user.create({
            data: {
                name: "Dr. Sarah Johnson",
                email: "sarah.johnson@sparks.com",
                password: hashedPassword,
                role: "THERAPIST",
                emailVerified: new Date()
            }
        });

        // Create therapist profile
        const therapist = await prisma.therapist.create({
            data: {
                userId: user.id,
                licenseNumber: "LIC-12345",
                specialization: ["Cognitive Behavioral Therapy", "Family Therapy", "Trauma Therapy"],
                experience: 8,
                bio: "Dr. Sarah Johnson is a licensed therapist with 8 years of experience specializing in cognitive behavioral therapy, family therapy, and trauma therapy. She has helped hundreds of patients overcome various mental health challenges."
            }
        });

        return NextResponse.json({
            message: "Therapist created successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            therapist: {
                id: therapist.id,
                licenseNumber: therapist.licenseNumber,
                specialization: therapist.specialization,
                experience: therapist.experience
            }
        });

    } catch (error) {
        console.error("Error creating therapist:", error);
        return NextResponse.json(
            { error: "Failed to create therapist", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
