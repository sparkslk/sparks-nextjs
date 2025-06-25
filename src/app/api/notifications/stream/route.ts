import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { addUserStream, removeUserStream } from "@/lib/sse";

// Server-Sent Events endpoint for real-time notifications
export async function GET(req: NextRequest) {
    try {
        // Try to get session, but don't fail if not authenticated
        // We'll handle this gracefully
        let session;
        try {
            session = await requireApiAuth(req);
        } catch {
            console.log("SSE connection attempted without authentication, closing connection");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Set up SSE headers
        const responseHeaders = new Headers({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
        });

        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();

                try {
                    // Send initial connection message
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        type: 'connected',
                        message: 'Connected to notification stream',
                        timestamp: new Date().toISOString()
                    })}\n\n`));

                    // Keep connection alive with periodic heartbeat
                    const heartbeat = setInterval(() => {
                        try {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                                type: 'heartbeat',
                                timestamp: new Date().toISOString()
                            })}\n\n`));
                        } catch {
                            console.log("Heartbeat failed, cleaning up connection");
                            clearInterval(heartbeat);
                        }
                    }, 30000); // Send heartbeat every 30 seconds

                    // Store the controller for sending notifications
                    addUserStream(session.user.id, controller, encoder);

                    // Clean up on close
                    req.signal.addEventListener('abort', () => {
                        console.log(`SSE connection closed for user ${session.user.id}`);
                        clearInterval(heartbeat);
                        removeUserStream(session.user.id);
                        try {
                            controller.close();
                        } catch {
                            // Connection already closed
                        }
                    });

                } catch {
                    console.error("Error setting up SSE stream:");
                    try {
                        controller.error();
                    } catch {
                        // Controller already closed
                    }
                }
            },
        });

        return new Response(stream, {
            headers: responseHeaders,
        });

    } catch (error) {
        console.error("SSE connection error:", error);
        if (error instanceof NextResponse) {
            return error;
        }
        return NextResponse.json(
            { error: "Failed to establish SSE connection" },
            { status: 500 }
        );
    }
}
