import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// Get patient dashboard data
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

    // Get user and patient data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        patientProfile: {
          include: {
            primaryTherapist: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const patient = user.patientProfile;
    const now = new Date();
    // const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // If no patient profile, return basic data
    if (!patient) {
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        },
        hasProfile: false,
        needsProfileSetup: true,
        stats: {
          upcomingSessions: 0,
          completedSessions: 0,
          totalSessions: 0,
          nextSession: null
        },
        recentActivity: [],
        quickActions: [
          {
            id: "create-profile",
            title: "Complete Your Profile",
            description: "Set up your patient profile to get started",
            icon: "profile",
            action: "CREATE_PROFILE"
          }
        ]
      });
    }

    // Get session statistics
    const [upcomingSessions, completedSessions, totalSessions, nextSession] = await Promise.all([
      prisma.therapySession.count({
        where: {
          patientId: patient.id,
          scheduledAt: { gte: now },
          status: { in: ["SCHEDULED", "REQUESTED", "APPROVED"] }
        }
      }),
      prisma.therapySession.count({
        where: {
          patientId: patient.id,
          status: "COMPLETED"
        }
      }),
      prisma.therapySession.count({
        where: { patientId: patient.id }
      }),
      prisma.therapySession.findFirst({
        where: {
          patientId: patient.id,
          scheduledAt: { gte: now },
          status: { in: ["SCHEDULED", "REQUESTED", "APPROVED"] }
        },
        orderBy: { scheduledAt: 'asc' },
        include: {
          therapist: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          }
        }
      })
    ]);

    // Get recent sessions
    const recentSessions = await prisma.therapySession.findMany({
      where: {
        patientId: patient.id,
        OR: [
          { scheduledAt: { gte: oneMonthAgo } },
          { 
            AND: [
              { status: "COMPLETED" },
              { updatedAt: { gte: oneMonthAgo } }
            ]
          }
        ]
      },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    // Get recent notifications
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: user.id,
        createdAt: { gte: oneMonthAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Format recent activity
    const recentActivity = [
      ...recentSessions.map(session => ({
        id: session.id,
        type: 'session' as const,
        title: `${session.type.toLowerCase().replace('_', ' ')} session`,
        description: `${session.status} - ${session.therapist.user.name || 'Therapist'}`,
        date: session.updatedAt,
        status: session.status,
        icon: 'calendar'
      })),
      ...notifications.map(notif => ({
        id: notif.id,
        type: 'notification' as const,
        title: notif.title,
        description: notif.message.substring(0, 100) + (notif.message.length > 100 ? '...' : ''),
        date: notif.createdAt,
        isRead: notif.isRead,
        isUrgent: notif.isUrgent,
        icon: notif.type === 'APPOINTMENT' ? 'calendar' : 'bell'
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

    // Determine quick actions based on patient status
    const quickActions = [];

    if (!patient.primaryTherapistId) {
      quickActions.push({
        id: "find-therapist",
        title: "Find a Therapist",
        description: "Browse and request a therapist",
        icon: "search",
        action: "FIND_THERAPIST"
      });
    } else {
      quickActions.push({
        id: "book-session",
        title: "Book a Session",
        description: "Schedule your next appointment",
        icon: "calendar-plus",
        action: "BOOK_SESSION"
      });

      if (nextSession) {
        quickActions.push({
          id: "view-next-session",
          title: "Next Session",
          description: `${nextSession.scheduledAt.toLocaleDateString()} at ${nextSession.scheduledAt.toLocaleTimeString()}`,
          icon: "calendar-check",
          action: "VIEW_SESSION",
          data: { sessionId: nextSession.id }
        });
      }
    }

    quickActions.push(
      {
        id: "view-sessions",
        title: "My Sessions",
        description: "View all your sessions",
        icon: "calendar",
        action: "VIEW_SESSIONS"
      },
      {
        id: "resources",
        title: "ADHD Resources",
        description: "Learn more about ADHD",
        icon: "book",
        action: "VIEW_RESOURCES"
      }
    );

    // Get unread notification count
    const unreadNotifications = await prisma.notification.count({
      where: {
        receiverId: user.id,
        isRead: false
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name || `${patient.firstName} ${patient.lastName}`,
        email: user.email,
        image: user.image
      },
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender
      },
      hasProfile: true,
      therapist: patient.primaryTherapist ? {
        id: patient.primaryTherapist.id,
        name: patient.primaryTherapist.user.name || "Your Therapist",
        email: patient.primaryTherapist.user.email,
        image: patient.primaryTherapist.user.image,
        specializations: patient.primaryTherapist.specialization
      } : null,
      stats: {
        upcomingSessions,
        completedSessions,
        totalSessions,
        nextSession: nextSession ? {
          id: nextSession.id,
          type: nextSession.type,
          scheduledAt: nextSession.scheduledAt,
          therapistName: nextSession.therapist.user.name || "Therapist"
        } : null,
        unreadNotifications
      },
      recentActivity,
      quickActions
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}