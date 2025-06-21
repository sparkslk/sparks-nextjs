import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req);

        // Get patient profile with sessions and treatment plans
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
                },
                therapySessions: {
                    include: {
                        therapist: {
                            include: {
                                user: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        scheduledAt: 'desc'
                    }
                },
                treatmentPlans: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!patient) {
            return NextResponse.json({ profile: null });
        }

        // Process sessions data
        const now = new Date();
        const upcomingSessions = patient.therapySessions
            .filter(session => new Date(session.scheduledAt) >= now && session.status === 'SCHEDULED')
            .map(session => ({
                id: session.id,
                scheduledAt: session.scheduledAt.toISOString(),
                duration: session.duration,
                type: session.type,
                status: session.status,
                therapistName: session.therapist.user.name || 'Unknown Therapist',
                notes: session.notes
            }));

        const recentSessions = patient.therapySessions
            .filter(session => new Date(session.scheduledAt) < now || session.status !== 'SCHEDULED')
            .slice(0, 10) // Limit to 10 most recent
            .map(session => ({
                id: session.id,
                scheduledAt: session.scheduledAt.toISOString(),
                duration: session.duration,
                type: session.type,
                status: session.status,
                therapistName: session.therapist.user.name || 'Unknown Therapist',
                notes: session.notes
            }));

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
                    name: patient.primaryTherapist.user.name,
                    specialization: patient.primaryTherapist.specialization
                } : null,
                upcomingSessions,
                recentSessions,
                treatmentPlans: patient.treatmentPlans.map(plan => ({
                    id: plan.id,
                    title: plan.title,
                    goals: plan.goals,
                    startDate: plan.startDate.toISOString(),
                    isActive: plan.isActive
                }))
            }
        });
    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching patient profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireApiAuth(request);

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
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error creating patient profile:", error);
        return NextResponse.json(
            { error: "Failed to create profile" },
            { status: 500 }
        );
    }
}
