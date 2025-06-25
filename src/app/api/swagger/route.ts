import { NextResponse } from "next/server";
import { getApiDocs } from "../../../lib/swagger";

/**
 * @swagger
 * /api/swagger:
 *   get:
 *     summary: Get API specification
 *     description: Returns the OpenAPI/Swagger specification for the API
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: API specification retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: OpenAPI 3.0 specification
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET() {
    try {
        console.log('Swagger endpoint called');
        const spec = await getApiDocs();
        console.log('Generated spec with paths:', Object.keys((spec as Record<string, unknown>).paths || {}));

        return NextResponse.json(spec, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
            },
        });
    } catch (error) {
        console.error('Error generating API documentation:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate API documentation',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
