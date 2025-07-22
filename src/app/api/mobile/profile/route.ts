import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Get patient profile
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

    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        },
        primaryTherapist: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json({
        hasProfile: false,
        user: {
          id: payload.userId,
          email: payload.email
        }
      });
    }

    return NextResponse.json({
      hasProfile: true,
      profile: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        medicalHistory: patient.medicalHistory,
        email: patient.user?.email,
        image: patient.user?.image,
        therapist: patient.primaryTherapist ? {
          id: patient.primaryTherapist.id,
          name: patient.primaryTherapist.user.name || "Your Therapist",
          email: patient.primaryTherapist.user.email
        } : null
      }
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create patient profile
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

    // Check if profile already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { userId: payload.userId }
    });

    if (existingPatient) {
      return NextResponse.json(
        { error: "Profile already exists. Use PATCH to update." },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'phone'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create patient profile
    const patient = await prisma.patient.create({
      data: {
        userId: payload.userId,
        email: payload.email,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        phone: data.phone,
        address: data.address || '',
        emergencyContact: data.emergencyContactName || data.emergencyContactPhone ? {
          name: data.emergencyContactName || '',
          phone: data.emergencyContactPhone || '',
          relation: data.emergencyContactRelation || ''
        } : undefined,
        medicalHistory: data.medicalHistory || ''
      }
    });

    // Update user name if provided
    if (data.firstName || data.lastName) {
      await prisma.user.update({
        where: { id: payload.userId },
        data: {
          name: `${data.firstName} ${data.lastName}`.trim()
        }
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email
      }
    });

  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update patient profile
export async function PATCH(request: NextRequest) {
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

    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Profile not found. Use POST to create." },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode',
      'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation',
      'medicalHistory', 'currentMedications', 'allergies', 'previousTherapy',
      'reasonForTherapy', 'goals'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (data.dateOfBirth) {
      updateData.dateOfBirth = new Date(data.dateOfBirth);
    }

    if (data.gender && ['MALE', 'FEMALE', 'OTHER'].includes(data.gender)) {
      updateData.gender = data.gender;
    }

    // Update patient profile
    const updatedPatient = await prisma.patient.update({
      where: { id: patient.id },
      data: updateData
    });

    // Update user name if changed
    if (data.firstName || data.lastName) {
      const firstName = data.firstName || updatedPatient.firstName;
      const lastName = data.lastName || updatedPatient.lastName;
      
      await prisma.user.update({
        where: { id: payload.userId },
        data: {
          name: `${firstName} ${lastName}`.trim()
        }
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedPatient.id,
        firstName: updatedPatient.firstName,
        lastName: updatedPatient.lastName,
        email: updatedPatient.email
      }
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}