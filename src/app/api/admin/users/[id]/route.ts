import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";

console.log("API route file loaded");

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("PATCH request received for user id:", id);

  try {
    await requireApiAuth(req, ["ADMIN"]);

    const body = await req.json();

    console.log("Request body:", body);

    if (!body.role) {
      return NextResponse.json({ error: "Missing user role" }, { status: 400 });
    }

    let updatedUser;

    switch (body.role) {
      case "Patient":
        updatedUser = await prisma.patient.update({
          where: { id },
          data: {
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            email: body.email,
            gender: body.gender,
            dateOfBirth: body.dateOfBirth,
            address: body.address,
            medicalHistory: body.medicalHistory,
            emergencyContact: body.emergencyContact,
          },
        });
        break;

      case "Therapist": {
        // Update therapist-specific fields
        // Ensure specialization is always an array (String[])
        let specializationArr = body.specialization;
        if (typeof specializationArr === "string") {
          specializationArr = specializationArr.split(",").map((s: string) => s.trim()).filter(Boolean);
        } else if (!Array.isArray(specializationArr)) {
          specializationArr = [];
        }
        // Convert experience to integer or null
        let experienceInt = null;
        if (typeof body.experience === "number") {
          experienceInt = body.experience;
        } else if (typeof body.experience === "string" && body.experience.trim() !== "") {
          const parsed = parseInt(body.experience, 10);
          experienceInt = isNaN(parsed) ? null : parsed;
        }
        // Fetch therapist to get userId
        const therapistRecord = await prisma.therapist.findUnique({ where: { id } });
        if (!therapistRecord || !therapistRecord.userId) {
          return NextResponse.json({ error: "Therapist or associated user not found" }, { status: 404 });
        }
        const therapistUpdate = prisma.therapist.update({
          where: { id },
          data: {
            licenseNumber: body.licenseNumber,
            specialization: specializationArr,
            experience: experienceInt,
            availability: body.availability,
            rating: body.rating,
          },
        });
        // Update user table for email and name (handle fullname/fullName/name)
        const userUpdate = prisma.user.update({
          where: { id: therapistRecord.userId },
          data: {
            email: body.email,
            name: body.fullname || body.fullName || body.name,
          },
        });
        const [therapist, user] = await prisma.$transaction([therapistUpdate, userUpdate]);
        updatedUser = { ...therapist, email: user.email, name: user.name };
        break;
      }

      case "Guardian":
        updatedUser = await prisma.parentGuardian.update({
          where: { id },
          data: {
            relationship: body.relationship,
          },
        });
        break;

      case "Manager":
        updatedUser = await prisma.user.update({
          where: { id },
          data: {
            name: body.fullName || body.name,
            email: body.email,
          },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 400 }
        );
    }

    console.log("User updated successfully:", updatedUser);

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("DELETE request received for user id:", id);

  try {
    await requireApiAuth(req, ["ADMIN"]);

    // First, we need to determine what type of user this is
    // We'll check each table to find the user
    let userType: string | null = null;
    let userExists = false;

    // Check if user exists in each role table
    const patient = await prisma.patient.findUnique({ where: { id } });
    const therapist = await prisma.therapist.findUnique({ where: { id } });
    const guardian = await prisma.parentGuardian.findUnique({ where: { id } });
    const manager = await prisma.user.findUnique({ where: { id } });

    if (patient) {
      userType = "Patient";
      userExists = true;
    } else if (therapist) {
      userType = "Therapist";
      userExists = true;
    } else if (guardian) {
      userType = "Guardian";
      userExists = true;
    } else if (manager) {
      userType = "Manager";
      userExists = true;
    }

    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log(`Deleting user of type: ${userType}`);

    // Delete user based on their role
    switch (userType) {
      case "Patient":
        // Delete the patient record
        await prisma.patient.delete({
          where: { id }
        });
        break;

      case "Therapist":
        // Delete the therapist record
        await prisma.therapist.delete({
          where: { id }
        });
        break;

      case "Guardian":
        // Delete related patient relationships if any
        // You might need to handle patient relationships here
        await prisma.parentGuardian.delete({
          where: { id }
        });
        break;

      case "Manager":
        // Delete the manager/user record
        await prisma.user.delete({
          where: { id }
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid user type" },
          { status: 400 }
        );
    }

    console.log("User deleted successfully");

    return NextResponse.json({ 
      success: true, 
      message: "User deleted successfully",
      deletedUserId: id,
      userType 
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: "Cannot delete user due to existing relationships. Please remove related data first." },
          { status: 409 }
        );
      }
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}