import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma, $Enums, Patient, Therapist, ParentGuardian } from "@prisma/client";
//import { create } from "domain";

console.log("API route file loaded");

export async function GET(req: NextRequest) {
    try {
        await requireApiAuth(req, ['ADMIN']);

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

        const formattedTherapists = therapists.map(therapist => {
            console.log('Therapist data:', {
                id: therapist.id,
                session_rate: therapist.session_rate,
                bio: therapist.bio,
                session_rate_type: typeof therapist.session_rate,
                bio_type: typeof therapist.bio
            });
            
            return {
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
                sessionRate: therapist.session_rate?.toNumber() || 0,
                bio: therapist.bio || "",
            };
        });

        const formattedGuardians = guardians.map(guardian => {
            console.log('Guardian data:', {
                id: guardian.id,
                contact_no: guardian.contact_no,
                contact_no_type: typeof guardian.contact_no,
                relationship: guardian.relationship
            });
            
            return {
                id: guardian.id,
                role: 'Guardian',
                fullName: guardian.user.name || "Unknown Guardian",
                email: guardian.user.email || "Unknown Email",
                patient: guardian.patient
                    ? `${guardian.patient.firstName} ${guardian.patient.lastName}`
                    : "Unknown Patient",
                relationship: guardian.relationship, // if exists
                contactNo: guardian.contact_no || "",
                createdAt: guardian.createdAt,
                // Add more guardian-specific fields here
            };
        });

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

export async function POST(req: NextRequest) {
    try {
        await requireApiAuth(req, ['ADMIN']);

        const body = await req.json();
        console.log('Received POST data:', body); // Debug log
        const { role, temporaryPassword, ...userData } = body;

        // Validate that password is provided
        if (!temporaryPassword) {
            return NextResponse.json({
                error: "Temporary password is required"
            }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

        type FormattedUser = {
            id: string;
            role: string;
            fullName?: string;
            fullname?: string;
            firstName?: string;
            lastName?: string;
            email: string | null;
            phone?: string | null;
            dateOfBirth?: Date | null;
            gender?: string | null;
            address?: string | null;
            medicalHistory?: string | null;
            emergencyContact?: string | null;
            licenseNumber?: string | null;
            specialization?: string | string[] | null;
            experience?: number | null;
            availability?: string | null;
            rating?: number;
            relationship?: string | null;
            patientId?: string;
            patient?: string;
            name?: string | null;
            createdAt: Date;
            sessionRate?: number;
            bio?: string;
            contactNo?: string;
        };
        
        let createdUser: FormattedUser | Patient | Therapist | ParentGuardian;

        switch (role) {
            case 'Patient':
                try {
                    // Validate required fields for Patient
                    if (!userData.fullName || !userData.email) {
                        return NextResponse.json({
                            error: "Full name and email are required for patients"
                        }, { status: 400 });
                    }

                    // Split fullName into firstName and lastName
                    const [firstName, ...lastNameParts] = userData.fullName.split(' ');
                    const lastName = lastNameParts.join(' ') || '';

                    // First create a user record for the patient
                    const patientUser = await prisma.user.create({
                        data: {
                            name: userData.fullName,
                            email: userData.email,
                            role: 'NORMAL_USER',
                            password: hashedPassword,
                        }
                    });

                    // Build patientData with correct type
                    const patientData: Prisma.PatientCreateInput = {
                        user: { connect: { id: patientUser.id } },
                        firstName: firstName,
                        lastName: lastName,
                        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date(), // fallback to now if missing
                        gender: (userData.gender ? userData.gender.toUpperCase() : 'OTHER') as $Enums.Gender, // cast to enum
                        email: userData.email,
                        phone: userData.phone || null,
                        address: userData.address || null,
                        medicalHistory: userData.medicalHistory || null,
                        emergencyContact: userData.emergencyContact || undefined,
                    };

                    console.log('Creating patient with data:', patientData); // Debug log

                    const patientResult = await prisma.patient.create({
                        data: patientData,
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                }
                            }
                        }
                    });

                    // Return formatted patient data
                    createdUser = {
                        id: patientResult.id,
                        role: 'Patient',
                        fullName: `${patientResult.firstName} ${patientResult.lastName}`,
                        firstName: patientResult.firstName,
                        lastName: patientResult.lastName,
                        email: patientResult.email,
                        phone: patientResult.phone,
                        dateOfBirth: patientResult.dateOfBirth,
                        gender: patientResult.gender,
                        address: patientResult.address,
                        medicalHistory: patientResult.medicalHistory,
                        emergencyContact: JSON.stringify(patientResult.emergencyContact),
                        createdAt: patientResult.createdAt,
                    };
                } catch (patientError) {
                    console.error('Patient creation error:', patientError);
                    throw patientError;
                }
                break;

            case 'Therapist':
                try {
                    // Validate required fields for Therapist
                    if (!userData.fullname || !userData.licenseNumber) {
                        return NextResponse.json({
                            error: "Full name and license number are required for therapists"
                        }, { status: 400 });
                    }

                    console.log('Creating therapist user:', userData.fullname); // Debug log

                    // Generate email if not provided
                    const therapistEmail = userData.email || `${userData.fullname.toLowerCase().replace(/\s+/g, '.')}@therapist.temp`;

                    // First create a user record
                    const therapistUser = await prisma.user.create({
                        data: {
                            name: userData.fullname,
                            email: therapistEmail,
                            role: 'THERAPIST',
                            password: hashedPassword,
                        }
                    });

                    console.log('Created therapist user:', therapistUser.id); // Debug log

                    const therapistData: Prisma.TherapistCreateInput = {
                        user: { connect: { id: therapistUser.id } },
                        licenseNumber: userData.licenseNumber,
                    };

                    // Only add optional fields if they have values
                    if (userData.specialization) therapistData.specialization = userData.specialization;
                    if (userData.experience) therapistData.experience = parseInt(userData.experience);
                    if (userData.availability) therapistData.availability = userData.availability;
                    if (userData.sessionRate) therapistData.session_rate = parseFloat(userData.sessionRate);
                    if (userData.bio) therapistData.bio = userData.bio;

                    console.log('Creating therapist with data:', therapistData); // Debug log

                    // Then create the therapist record
                    const therapistResult = await prisma.therapist.create({
                        data: therapistData,
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                }
                            }
                        }
                    });

                    // Return formatted therapist data
                    createdUser = {
                        id: therapistResult.id,
                        role: 'Therapist',
                        fullname: therapistResult.user.name || '',
                        email: therapistResult.user.email,
                        licenseNumber: therapistResult.licenseNumber,
                        specialization: therapistResult.specialization,
                        experience: therapistResult.experience,
                        availability: JSON.stringify(therapistResult.availability),
                        createdAt: therapistResult.createdAt,
                        rating: therapistResult.rating?.toNumber() || 0,
                        sessionRate: therapistResult.session_rate?.toNumber() || 0,
                        bio: therapistResult.bio || "",
                    } as FormattedUser;
                } catch (therapistError) {
                    console.error('Therapist creation error:', therapistError);
                    throw therapistError;
                }
                break;

            case 'Guardian':
                try {
                    // Validate required fields for Guardian
                    if (!userData.fullName || !userData.email) {
                        return NextResponse.json({
                            error: "Full name and email are required for guardians"
                        }, { status: 400 });
                    }

                    // First create a user record
                    const guardianUser = await prisma.user.create({
                        data: {
                            name: userData.fullName,
                            email: userData.email,
                            role: 'PARENT_GUARDIAN',
                            password: hashedPassword,
                        }
                    });

                    // Find patient by name if provided
                    let patientId = null;
                    if (userData.patient) {
                        const patient = await prisma.patient.findFirst({
                            where: {
                                OR: [
                                    {
                                        firstName: {
                                            contains: userData.patient.split(' ')[0],
                                            mode: 'insensitive'
                                        }
                                    },
                                    {
                                        lastName: {
                                            contains: userData.patient.split(' ').slice(1).join(' '),
                                            mode: 'insensitive'
                                        }
                                    }
                                ]
                            }
                        });
                        patientId = patient?.id || null;
                    }

                    const guardianData: Prisma.ParentGuardianCreateInput = {
                        user: { connect: { id: guardianUser.id } },
                        relationship: userData.relationship || 'Other',
                        patient: patientId ? { connect: { id: patientId } } : undefined
                    } as Prisma.ParentGuardianCreateInput;

                    // Then create the guardian record
                    const guardianResult = await prisma.parentGuardian.create({
                        data: guardianData,
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
                        }
                    });

                    // Return formatted guardian data
                    createdUser = {
                        id: guardianResult.id,
                        role: 'Guardian',
                        fullName: guardianResult.user?.name || '',
                        email: guardianResult.user?.email || '',
                        patient: guardianResult.patient
                            ? `${guardianResult.patient.firstName} ${guardianResult.patient.lastName}`
                            : userData.patient || "Unknown Patient",
                        relationship: guardianResult.relationship,
                        createdAt: guardianResult.createdAt,
                    };
                } catch (guardianError) {
                    console.error('Guardian creation error:', guardianError);
                    throw guardianError;
                }
                break;

            case 'Manager':
                try {
                    // Validate required fields for Manager
                    if (!userData.fullName || !userData.email) {
                        return NextResponse.json({
                            error: "Full name and email are required for managers"
                        }, { status: 400 });
                    }

                    const managerResult = await prisma.user.create({
                        data: {
                            name: userData.fullName,
                            email: userData.email,
                            role: 'MANAGER',
                            password: hashedPassword,
                        }
                    });

                    // Return formatted manager data
                    createdUser = {
                        id: managerResult.id,
                        role: 'Manager',
                        fullName: managerResult.name || '',
                        email: managerResult.email || '',
                        createdAt: managerResult.createdAt,
                    };
                } catch (managerError) {
                    console.error('Manager creation error:', managerError);
                    throw managerError;
                }
                break;

            default:
                return NextResponse.json({
                    error: "Invalid role specified"
                }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: `${role} created successfully`,
            data: createdUser
        }, { status: 201 });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }

        console.error("Detailed error creating user:", error);

        // Handle specific Prisma errors
        if (error && typeof error === 'object' && 'code' in error) {
            console.error("Prisma error code:", error.code);
            if (error.code === 'P2002') {
                return NextResponse.json({
                    error: "A user with this email already exists"
                }, { status: 409 });
            }
            if (error.code === 'P2003') {
                return NextResponse.json({
                    error: "Foreign key constraint failed - referenced record not found"
                }, { status: 400 });
            }
        }

        // Return more detailed error message for debugging
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Error message:", errorMessage);

        return NextResponse.json({
            error: `Failed to create user: ${errorMessage}`
        }, { status: 500 });
    }
}
