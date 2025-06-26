import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";

/* export async function POST(request: NextRequest) {
    try {
        const session = await requireApiAuth(request, ['THERAPIST']);

        // Get therapist profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { therapistProfile: true }
        });

        if (!user?.therapistProfile) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        const {
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phone,
            email,
            address,
            emergencyContactName,
            emergencyContactPhone,
            emergencyContactRelation,
            medicalHistory
        } = await request.json();

        // Validate required fields
        if (!firstName || !lastName || !dateOfBirth || !gender) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create emergency contact object
        const emergencyContact = emergencyContactName ? {
            name: emergencyContactName,
            phone: emergencyContactPhone,
            relationship: emergencyContactRelation
        } : null;

        // Create the patient
        const patient = await prisma.patient.create({
            data: {
                firstName,
                lastName,
                dateOfBirth: new Date(dateOfBirth),
                gender: gender as $Enums.Gender,
                phone: phone || null,
                email: email || null,
                address: address || null,
                emergencyContact: emergencyContact || undefined,
                medicalHistory: medicalHistory || null,
                primaryTherapistId: user.therapistProfile.id,
                organizationId: user.therapistProfile.organizationId
            }
        });

        return NextResponse.json(
            {
                message: "Patient created successfully",
                patient: {
                    id: patient.id,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    email: patient.email
                }
            },
            { status: 201 }
        );
    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error creating patient:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} */

export async function GET(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['THERAPIST']);

        // Get therapist profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { therapistProfile: true }
        });

        if (!user?.therapistProfile) {
            return NextResponse.json(
                { error: "Therapist profile not found" },
                { status: 404 }
            );
        }

        // Get patients for this specific therapist only
        const patients = await prisma.patient.findMany({
            where: {
                primaryTherapistId: user.therapistProfile.id // This is the key filter
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                therapySessions: {
                    orderBy: { scheduledAt: 'desc' }
                }
            }
        });

        // Enhanced formatting to match your UI
        const formattedPatients = patients.map(patient => {
            const allSessions = patient.therapySessions || [];
            const pastSessions = allSessions.filter(session => 
                new Date(session.scheduledAt) < new Date()
            );
            const futureSessions = allSessions.filter(session => 
                new Date(session.scheduledAt) >= new Date()
            );
            
            const lastSession = pastSessions.length > 0 ? pastSessions[0] : null;
            const nextSession = futureSessions.length > 0 ? futureSessions[0] : null;
            
            // Determine status based on session activity
            let status: "active" | "inactive" | "completed" = "inactive";
            if (nextSession) {
                status = "active";
            } else if (lastSession) {
                const daysSinceLastSession = Math.floor(
                    (new Date().getTime() - new Date(lastSession.scheduledAt).getTime()) / (1000 * 60 * 60 * 24)
                );
                status = daysSinceLastSession <= 30 ? "active" : "inactive";
            }

            return {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                phone: patient.phone,
                email: patient.email,
                lastSession: lastSession ? lastSession.scheduledAt : null,
                nextSession: nextSession ? nextSession.scheduledAt : null,
                status,
                age: calculateAge(patient.dateOfBirth)
            };
        });

        return NextResponse.json(
            { 
                patients: formattedPatients,
                totalCount: formattedPatients.length,
                therapistId: user.therapistProfile.id // For debugging
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching patients:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

function calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
