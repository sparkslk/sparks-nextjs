import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { GameCategory, GameDifficulty } from "@prisma/client";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireApiAuth(req, ['ADMIN']);
        const { id } = await params;
        const data = await req.json();

        const game = await prisma.game.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                category: data.category as GameCategory,
                embedUrl: data.embedUrl,
                thumbnailUrl: data.thumbnailUrl,
                iframeWidth: data.iframeWidth,
                iframeHeight: data.iframeHeight,
                allowFullscreen: data.allowFullscreen,
                targetSkills: data.targetSkills,
                ageRange: data.ageRange,
                difficulty: data.difficulty as GameDifficulty,
                estimatedTime: parseInt(data.estimatedTime),
                isActive: data.isActive,
            },
        });

        return NextResponse.json({ message: "Game updated successfully", game });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error updating game:", error);
        return NextResponse.json(
            { error: "Failed to update game" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireApiAuth(req, ['ADMIN']);
        const { id } = await params;

        // Soft delete by deactivating
        const game = await prisma.game.update({
            where: { id },
            data: { isActive: false },
        });

        return NextResponse.json({ message: "Game deactivated successfully", game });

    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error("Error deactivating game:", error);
        return NextResponse.json(
            { error: "Failed to deactivate game" },
            { status: 500 }
        );
    }
}
