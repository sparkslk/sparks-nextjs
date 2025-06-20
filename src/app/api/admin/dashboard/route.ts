import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
        }

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

        // Simulate some system metrics (in a real app, these would come from monitoring systems)
        const adminData = {
            systemStatus: "online" as const,
            totalUsers,
            newUsersThisMonth,
            databaseSize: "2.4GB", // This would be calculated from actual DB size
            databaseCapacity: 68,   // This would be calculated from actual capacity
            securityAlerts: 0,      // Would come from security monitoring
            resolvedAlertsToday: 0, // Would come from security monitoring
            systemHealth: {
                cpuUsage: Math.random() * 30 + 20,      // 20-50%
                memoryUsage: Math.random() * 20 + 40,   // 40-60%
                diskUsage: Math.random() * 30 + 50,     // 50-80%
                networkIO: `${(Math.random() * 50 + 10).toFixed(1)} MB/s`
            },
            userRoleDistribution,
            recentEvents
        };

        return NextResponse.json(adminData);

    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}
