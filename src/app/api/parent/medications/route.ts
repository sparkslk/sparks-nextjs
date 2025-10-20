import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
  }

  try {
    const medications = await prisma.medication.findMany({
      where: {
        patientId: patientId
      },
      include: {
        Therapist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    const history = await prisma.medicationHistory.findMany({
      where: {
        medication: {
          patientId: patientId
        }
      },
      include: {
        medication: {
          include: {
            Therapist: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        changedAt: 'desc'
      }
    });

    return NextResponse.json({ medications, history });
  } catch (error) {
    console.error("Error fetching medications:", error);
    return NextResponse.json({ error: "Failed to fetch medications" }, { status: 500 });
  }
}