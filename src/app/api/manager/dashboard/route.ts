import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        await requireApiAuth(req, ['MANAGER']);

        // Get user statistics
        const totalUsers = await prisma.user.count();

        // Get new users this month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const newUsersThisMonth = await prisma.user.count({
            where: {
                createdAt: {
                    gte: startOfMonth
                }
            }
        });

        // Get total therapy sessions count
        const totalSessions = await prisma.therapySession.count();

        // Get new therapy sessions this month
        const newSessionsThisMonth = await prisma.therapySession.count({
            where: {
            createdAt: {
                gte: startOfMonth,
            },
            },
        });

        // Get user role distribution
        const userRoles = await prisma.user.groupBy({
            by: ['role'],
            _count: {
                id: true
            }
        });

        const userRoleDistribution = {
            normalUsers: userRoles.find(r => r.role === 'NORMAL_USER')?._count.id || 0,
            parents: userRoles.find(r => r.role === 'PARENT_GUARDIAN')?._count.id || 0,
            therapists: userRoles.find(r => r.role === 'THERAPIST')?._count.id || 0,
            managers: userRoles.find(r => r.role === 'MANAGER')?._count.id || 0,
            admins: userRoles.find(r => r.role === 'ADMIN')?._count.id || 0,
        };

        // Get recent system events (using recent notifications as proxy)
        const recentNotifications = await prisma.notification.findMany({
            where: {
                type: "SYSTEM",
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            },
            orderBy: { createdAt: "desc" },
            take: 5
        });

        const recentEvents = recentNotifications.map(notification => ({
            id: notification.id,
            message: notification.message,
            timestamp: new Date(notification.createdAt).toLocaleString(),
            type: notification.isUrgent ? "warning" as const : "info" as const
        }));
        
        const dbSizeResult = await prisma.$queryRaw<{ size_pretty: string; size_bytes: bigint }[]>`
            SELECT
                pg_size_pretty(pg_database_size(current_database())) AS size_pretty,
                pg_database_size(current_database()) AS size_bytes;
            `;

        const databaseSize = dbSizeResult[0]?.size_pretty || "Unknown";
        const databaseSizeBytes = dbSizeResult[0]?.size_bytes ?? BigInt(0);

        // Hardcoded max capacity 100 MB in bytes
        const maxDbBytes = 500 * 1024 * 1024; // 500 MB

        let databaseUsage: string | null = null;
        if (maxDbBytes && Number(databaseSizeBytes) > 0) {
            let percent = Number(databaseSizeBytes) / maxDbBytes * 100;
            if (percent > 0 && percent < 0.1) {
                percent = 0.1;
            }
            databaseUsage = percent > 100 ? "100.0" : percent.toFixed(1);
        } else if (maxDbBytes) {
            databaseUsage = "0.0";
        }

        // Get recent therapy sessions with therapist and patient details
        const recentSessions = await prisma.therapySession.findMany({
            select: {
            id: true,
            duration: true,
            status: true,
            createdAt: true,
            scheduledAt: true,
            therapist: {
                select: {
                    id: true,
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            },
            patient: {
                select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
                }
            }
            },
            orderBy: {
            scheduledAt: 'desc'
            },
            take: 5 // Get last 5 sessions
        });

        // Transform the data to match the UI requirements
        const sessionOversightData = recentSessions.map(session => ({
            id: session.id,
            therapist: {
                id: session.therapist.id,
                name: session.therapist.user.name ? `Dr. ${session.therapist.user.name}` : "Dr. Unknown",
                email: session.therapist.user.email
            },
            patient: {
                id: session.patient.id,
                name: `${session.patient.firstName} ${session.patient.lastName.charAt(0)}.`,
                email: session.patient.email
            },
            sessionDetails: {
                duration: session.duration || 0, // in minutes
                status: session.status, // 'COMPLETED', 'IN_PROGRESS', 'CANCELLED', etc.
                //amount: session.amount || 0, // session fee
                //commission: session.commission || 0, // platform commission
                //commissionRate: session.commissionRate || 10, // commission percentage
                scheduledAt: session.scheduledAt,
                //completedAt: session.completedAt,
                createdAt: session.createdAt
            }
        }));

        // Simulate some system metrics (in a real app, these would come from monitoring systems)
        const ManagerData = {
            systemStatus: "online" as const,
            totalUsers,
            newUsersThisMonth,
            databaseSize,
            databaseUsage,
            totalSessions,
            newSessionsThisMonth,
            sessionOversightData,
            recentNotifications: recentEvents,
            systemHealth: {
                cpuUsage: Math.random() * 30 + 20,      // 20-50%
                memoryUsage: Math.random() * 20 + 40,   // 40-60%
                diskUsage: Math.random() * 30 + 50,     // 50-80%
                networkIO: `${(Math.random() * 50 + 10).toFixed(1)} MB/s`
            },
            userRoleDistribution,
            recentEvents
        };

        return NextResponse.json(ManagerData);

    } catch (error) {
        // Handle authentication/authorization errors
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching admin dashboard data:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}
