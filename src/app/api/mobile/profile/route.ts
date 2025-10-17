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
        user: true,
        primaryTherapist: {
          include: {
            user: true
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

    // Debug log for patient data
    console.log('DEBUG: patient.emergencyContact:', patient.emergencyContact);
    console.log('DEBUG: patient.medicalHistory:', patient.medicalHistory);
    console.log('DEBUG: patient.email:', patient.email);
    console.log('DEBUG: patient.phone:', patient.phone);

    // Handle emergencyContact as object or stringified JSON
    let emergencyContactRaw = patient.emergencyContact;
    if (typeof emergencyContactRaw === 'string') {
      try {
        emergencyContactRaw = JSON.parse(emergencyContactRaw);
      } catch {
        emergencyContactRaw = {};
      }
    }
    let emergencyContact: { name: string; phone: string; relation: string } = { name: '', phone: '', relation: '' };
    if (emergencyContactRaw && typeof emergencyContactRaw === 'object' && !Array.isArray(emergencyContactRaw)) {
      emergencyContact = {
        name: typeof emergencyContactRaw.name === 'string' ? emergencyContactRaw.name : '',
        phone: typeof emergencyContactRaw.phone === 'string' ? emergencyContactRaw.phone : '',
        relation: typeof emergencyContactRaw.relation === 'string' ? emergencyContactRaw.relation : ''
      };
    }

    const profileResponse = {
      hasProfile: true,
      profile: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        address: patient.address,
        emergencyContact,
        medicalHistory: patient.medicalHistory || '',
        email: patient.email,
        image: patient.user ? patient.user.image : null,
        therapist: patient.primaryTherapist && patient.primaryTherapist.user ? {
          id: patient.primaryTherapist.id,
          name: patient.primaryTherapist.user.name || "Your Therapist",
          email: patient.primaryTherapist.user.email
        } : null
      }
    };

    console.log('DEBUG: Returning profile response:', JSON.stringify(profileResponse, null, 2));

    return NextResponse.json(profileResponse);

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
        user: { connect: { id: payload.userId } },
        email: payload.email,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        phone: data.phone,
        address: data.address || '',
        emergencyContact: data.emergencyContact || undefined,


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
    // Map emergency contact fields from UI to emergencyContact object
    if (
      data.emergencyContactName ||
      data.emergencyContactPhone ||
      data.emergencyContactRelation
    ) {
      updateData.emergencyContact = {
        name: data.emergencyContactName || '',
        phone: data.emergencyContactPhone || '',
        relation: data.emergencyContactRelation || ''
      };
    }
    // Map medical info
    if (data.medicalInfo !== undefined) {
      updateData.medicalHistory = data.medicalInfo;
    }
    // Map other allowed fields
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'address',
      'currentMedications', 'allergies', 'previousTherapy',
      'reasonForTherapy', 'goals', 'dateOfBirth', 'gender', 'city', 'state', 'zipCode'
    ];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }
    if (
      updateData.dateOfBirth &&
      (typeof updateData.dateOfBirth === 'string' || typeof updateData.dateOfBirth === 'number')
    ) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
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