import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get patient profile
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                primaryTherapist: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!patient) {
            return NextResponse.json({ profile: null });
        }

        return NextResponse.json({
            profile: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                phone: patient.phone,
                email: patient.email,
                address: patient.address,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                emergencyContact: patient.emergencyContact,
                medicalHistory: patient.medicalHistory,
                therapist: patient.primaryTherapist ? {
                    id: patient.primaryTherapist.id,
                    name: patient.primaryTherapist.user.name
                } : null
            }
        });
    } catch (error) {
        console.error("Error fetching patient profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        console.log("Profile creation data received:", data);

        const {
            firstName,
            lastName,
            phone,
            email,
            address,
            dateOfBirth,
            gender,
            emergencyContact,
            medicalHistory
        } = data;

        // Check if patient profile already exists
        const existingPatient = await prisma.patient.findUnique({
            where: { userId: session.user.id }
        });

        if (existingPatient) {
            return NextResponse.json(
                { error: "Profile already exists" },
                { status: 400 }
            );
        }

        // Create patient profile
        const patient = await prisma.patient.create({
            data: {
                userId: session.user.id,
                firstName,
                lastName,
                phone,
                email,
                address,
                dateOfBirth: new Date(dateOfBirth),
                gender: gender || "OTHER",
                emergencyContact: emergencyContact || undefined,
                medicalHistory
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json({
            message: "Profile created successfully",
            profile: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                phone: patient.phone,
                email: patient.email,
                address: patient.address,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                emergencyContact: patient.emergencyContact,
                medicalHistory: patient.medicalHistory
            }
        });
    } catch (error) {
        console.error("Error creating patient profile:", error);
        return NextResponse.json(
            { error: "Failed to create profile" },
            { status: 500 }
        );
    }
}
