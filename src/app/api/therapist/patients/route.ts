import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { $Enums } from "../../../../../generated/prisma";

const Gender = $Enums.Gender;

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is a therapist
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { therapistProfile: true }
        });

        if (!user || user.role !== "THERAPIST" || !user.therapistProfile) {
            return NextResponse.json(
                { error: "Only therapists can create patients" },
                { status: 403 }
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
                gender: gender as keyof typeof Gender,
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
        console.error("Error creating patient:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is a therapist
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { therapistProfile: true }
        });

        if (!user || user.role !== "THERAPIST" || !user.therapistProfile) {
            return NextResponse.json(
                { error: "Only therapists can view patients" },
                { status: 403 }
            );
        }

        // Get patients for this therapist
        const patients = await prisma.patient.findMany({
            where: {
                primaryTherapistId: user.therapistProfile.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                therapySessions: {
                    orderBy: { scheduledAt: 'desc' },
                    take: 1
                }
            }
        });

        const formattedPatients = patients.map(patient => {
            const lastSession = patient.therapySessions[0];
            return {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                phone: patient.phone,
                email: patient.email,
                lastSession: lastSession ? lastSession.scheduledAt : null,
                status: "active" // You can implement proper status logic later
            };
        });

        return NextResponse.json(
            { patients: formattedPatients },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching patients:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
