import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
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
        const whereClause: any = {};
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

        let createdUser: any;

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

                    const patientData: any = {
                        userId: patientUser.id,
                        firstName: firstName,
                        lastName: lastName,
                        email: userData.email,
                    };

                    // Only add optional fields if they have values
                    if (userData.phone) patientData.phone = userData.phone;
                    if (userData.dateOfBirth) patientData.dateOfBirth = new Date(userData.dateOfBirth);
                    if (userData.gender) patientData.gender = userData.gender.toUpperCase();
                    if (userData.address) patientData.address = userData.address;
                    if (userData.medicalHistory) patientData.medicalHistory = userData.medicalHistory;
                    if (userData.emergencyContact) patientData.emergencyContact = userData.emergencyContact;

                    console.log('Creating patient with data:', patientData); // Debug log

                    createdUser = await prisma.patient.create({
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
                        id: createdUser.id,
                        role: 'Patient',
                        fullName: `${createdUser.firstName} ${createdUser.lastName}`,
                        firstName: createdUser.firstName,
                        lastName: createdUser.lastName,
                        email: createdUser.email,
                        phone: createdUser.phone,
                        dateOfBirth: createdUser.dateOfBirth,
                        gender: createdUser.gender,
                        address: createdUser.address,
                        medicalHistory: createdUser.medicalHistory,
                        emergencyContact: createdUser.emergencyContact,
                        createdAt: createdUser.createdAt,
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

                    const therapistData: any = {
                        userId: therapistUser.id,
                        licenseNumber: userData.licenseNumber,
                    };

                    // Only add optional fields if they have values
                    if (userData.specialization) therapistData.specialization = userData.specialization;
                    if (userData.experience) therapistData.experience = parseInt(userData.experience);
                    if (userData.availability) therapistData.availability = userData.availability;

                    console.log('Creating therapist with data:', therapistData); // Debug log

                    // Then create the therapist record
                    createdUser = await prisma.therapist.create({
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
                        id: createdUser.id,
                        role: 'Therapist',
                        fullname: createdUser.user.name,
                        email: createdUser.user.email,
                        licenseNumber: createdUser.licenseNumber,
                        specialization: createdUser.specialization,
                        experience: createdUser.experience,
                        availability: createdUser.availability,
                        createdAt: createdUser.createdAt,
                        rating: createdUser.rating || 0,
                    };
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

                    const guardianData: any = {
                        userId: guardianUser.id,
                    };

                    // Only add optional fields if they have values
                    if (patientId) guardianData.patientId = patientId;
                    if (userData.relationship) guardianData.relationship = userData.relationship;

                    // Then create the guardian record
                    createdUser = await prisma.parentGuardian.create({
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
                        id: createdUser.id,
                        role: 'Guardian',
                        fullName: createdUser.user.name,
                        email: createdUser.user.email,
                        patient: createdUser.patient 
                            ? `${createdUser.patient.firstName} ${createdUser.patient.lastName}`
                            : userData.patient || "Unknown Patient",
                        relationship: createdUser.relationship,
                        createdAt: createdUser.createdAt,
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

                    createdUser = await prisma.user.create({
                        data: {
                            name: userData.fullName,
                            email: userData.email,
                            role: 'MANAGER',
                            password: hashedPassword,
                        }
                    });

                    // Return formatted manager data
                    createdUser = {
                        id: createdUser.id,
                        role: 'Manager',
                        fullName: createdUser.name,
                        email: createdUser.email,
                        createdAt: createdUser.createdAt,
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
