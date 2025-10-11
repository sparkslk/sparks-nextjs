import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { GameCategory, GameDifficulty } from "@prisma/client";

/**
 * @swagger
 * /api/admin/games:
 *   get:
 *     summary: List all games
 *     description: Get all games with optional filters
 *     tags:
 *       - Admin
 *       - Games
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by game category
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Games retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
    try {
        await requireApiAuth(req, ['ADMIN', 'MANAGER']);

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const isActiveParam = searchParams.get('isActive');

        interface WhereClause {
            category?: GameCategory;
            isActive?: boolean;
        }

        const where: WhereClause = {};

        if (category) {
            where.category = category as GameCategory;
        }

        if (isActiveParam !== null) {
            where.isActive = isActiveParam === 'true';
        }

        const games = await prisma.game.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        assignments: true,
                        sessions: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ games });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error fetching games:", error);
        return NextResponse.json(
            { error: "Failed to fetch games" },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/admin/games:
 *   post:
 *     summary: Add a new game
 *     description: Create a new game with embedding configuration
 *     tags:
 *       - Admin
 *       - Games
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - embedUrl
 *               - difficulty
 *               - ageRange
 *               - estimatedTime
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               embedUrl:
 *                 type: string
 *               thumbnailUrl:
 *                 type: string
 *               difficulty:
 *                 type: string
 *               ageRange:
 *                 type: string
 *               estimatedTime:
 *                 type: integer
 *               targetSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Game created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
    try {
        const session = await requireApiAuth(req, ['ADMIN']);
        const data = await req.json();

        // Validate required fields
        if (!data.title || !data.description || !data.category || !data.embedUrl || !data.difficulty || !data.ageRange || !data.estimatedTime) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate embedUrl format
        if (!data.embedUrl.startsWith('http://') && !data.embedUrl.startsWith('https://')) {
            return NextResponse.json(
                { error: "Invalid embed URL format. Must start with http:// or https://" },
                { status: 400 }
            );
        }

        // Create the game
        const game = await prisma.game.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category as GameCategory,
                embedUrl: data.embedUrl,
                thumbnailUrl: data.thumbnailUrl || null,
                iframeWidth: data.iframeWidth || "100%",
                iframeHeight: data.iframeHeight || "600px",
                allowFullscreen: data.allowFullscreen !== false,
                targetSkills: data.targetSkills || [],
                ageRange: data.ageRange,
                difficulty: data.difficulty as GameDifficulty,
                estimatedTime: parseInt(data.estimatedTime),
                isActive: true,
                addedBy: session.user.id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(
            { message: "Game added successfully", game },
            { status: 201 }
        );

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error creating game:", error);
        return NextResponse.json(
            { error: "Failed to create game" },
            { status: 500 }
        );
    }
}
