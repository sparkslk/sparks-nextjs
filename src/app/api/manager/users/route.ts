import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
//import { create } from "domain";

console.log("API route file loaded");

export async function GET(req: NextRequest) {
    try {
        await requireApiAuth(req, ['MANAGER']);

        const url = new URL(req.url);
        //const patientId = url.searchParams.get('id');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const search = url.searchParams.get('search'); // Search by name or email

        // Get all patients with pagination and search
        const skip = (page - 1) * limit;

        // Build where clause for search
        const whereClause: Record<string, unknown> = {};
        if (search) {
            whereClause.OR = [
                {
                    firstName: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    lastName: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ];
        }

        // Get total count for pagination
        /*const totalPatients = await prisma.patient.count({
            where: whereClause
        });*/

        const patients = await prisma.patient.findMany({
            where: whereClause,
            /*include: {
                guardian: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        relationship: true
                    }
                }
            },*/
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });


        // Get all users from user table (for roles: Guardian, Manager, Admin)
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        const therapists = await prisma.therapist.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        const guardians = await prisma.parentGuardian.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        // Format each user type (add fields as needed)
        const formattedPatients = patients.map(patient => ({
            id: patient.id,
            role: 'Patient',
            firstName: patient.firstName,
            lastName: patient.lastName,
            fullName: `${patient.firstName} ${patient.lastName}`,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            phone: patient.phone,
            email: patient.email,
            address: patient.address,
            emergencyContact: patient.emergencyContact,
            medicalHistory: patient.medicalHistory,
            createdAt: patient.createdAt,
            // Add more patient-specific fields here
        }));

        const formattedTherapists = therapists.map(therapist => ({
            id: therapist.id,
            role: 'Therapist',
            fullname: therapist.user.name || "Unknown Therapist",
            email: therapist.user.email || "Unknown Email",
            licenseNumber: therapist.licenseNumber,
            specialization: therapist.specialization,
            experience: therapist.experience,
            availability: therapist.availability,
            createdAt: therapist.createdAt,
            rating: therapist.rating || 0,
        }));

        const formattedGuardians = guardians.map(guardian => ({
            id: guardian.id,
            role: 'Guardian',
            fullName: guardian.user.name || "Unknown Guardian",
            email: guardian.user.email || "Unknown Email",
            patient: guardian.patient
                ? `${guardian.patient.firstName} ${guardian.patient.lastName}`
                : "Unknown Patient",
            relationship: guardian.relationship, // if exists
            createdAt: guardian.createdAt,
            // Add more guardian-specific fields here
        }));

        const formattedManagers = users.filter(u => u.role === 'MANAGER').map(manager => ({
            id: manager.id,
            role: 'Manager',
            fullName: manager.name,
            email: manager.email,
            createdAt: manager.createdAt,
            // Add more manager-specific fields here
        }));

        // Combine all users into one array
        const allUsers = [
            ...formattedPatients,
            ...formattedTherapists,
            ...formattedGuardians,
            ...formattedManagers,
        ];

        return NextResponse.json({
            success: true,
            data: allUsers,
            pagination: {
                page,
                limit,
                total: allUsers.length,
                totalPages: Math.ceil(allUsers.length / limit)
            }
        });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching patient data:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}