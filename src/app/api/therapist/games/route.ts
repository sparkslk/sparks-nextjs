import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { GameCategory, GameDifficulty, Prisma } from "@prisma/client";

/**
 * @swagger
 * /api/therapist/games:
 *   get:
 *     summary: Get available games for assignment
 *     description: Retrieve all active games that therapists can assign to patients
 *     tags:
 *       - Therapist
 *       - Games
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [COGNITIVE, MEMORY, ATTENTION, PROBLEM_SOLVING, EMOTIONAL_REGULATION, SOCIAL_SKILLS, MOTOR_SKILLS, LANGUAGE, CREATIVITY, RELAXATION]
 *         description: Filter by game category
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD, ADAPTIVE]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *     responses:
 *       200:
 *         description: Games retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a therapist
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
    try {
        await requireApiAuth(req, ['THERAPIST']);

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const difficulty = searchParams.get('difficulty');
        const search = searchParams.get('search');

        // Build where clause
        const where: Prisma.GameWhereInput = {
            isActive: true
        };

        if (category && Object.values(GameCategory).includes(category as GameCategory)) {
            where.category = category as GameCategory;
        }

        if (difficulty && Object.values(GameDifficulty).includes(difficulty as GameDifficulty)) {
            where.difficulty = difficulty as GameDifficulty;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Get all active games
        const games = await prisma.game.findMany({
            where,
            select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                category: true,
                difficulty: true,
                targetSkills: true,
                ageRange: true,
                estimatedTime: true,
                createdAt: true
            },
            orderBy: [
                { category: 'asc' },
                { difficulty: 'asc' },
                { title: 'asc' }
            ]
        });

        return NextResponse.json({
            games,
            total: games.length
        });

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
