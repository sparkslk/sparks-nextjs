import { NextRequest, NextResponse } from "next/server";
import { prisma} from "@/lib/prisma";
import { RefundStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const refundId = params.id;
    if (!refundId || typeof refundId !== 'string') {
      return NextResponse.json({ error: "Invalid refund id" }, { status: 400 });
    }

    const body = await request.json();
    const rawStatus: string | undefined = body?.refundStatus;
    const note: string | null = body?.adminNote ?? body?.adminNotes ?? null;

    const existingRefund = await prisma.cancelRefund.findUnique({
      where: { id: refundId as any },
    });

    if (!existingRefund) {
      return NextResponse.json(
        { error: "Refund not found for id: " + refundId },
        { status: 404 }
      );
    }

    // Validate and convert refund status to enum
    const data: any = { updatedAt: new Date() };
    if (typeof rawStatus === 'string') {
      let clean = rawStatus.trim().toUpperCase();
      if (Object.values(RefundStatus).includes(clean as RefundStatus)) {
        data.refundStatus = clean as RefundStatus;
        data.processedAt = clean === 'DONE' ? new Date() : null;
      } else {
        return NextResponse.json(
          { error: `Invalid refundStatus value '${rawStatus}'. Allowed: ${Object.values(RefundStatus).join(', ')}` },
          { status: 400 }
        );
      }
    }
    if (note !== undefined) {
      data.adminNotes = note;
    }
    try {
      console.log('Updating cancelRefund id:', refundId, data);
      const updatedRefund = await prisma.cancelRefund.update({
        where: { id: refundId as any },
        data,
      });
      return NextResponse.json({ success: true, refund: updatedRefund });
    } catch (dbErr) {
      console.error('Prisma error on refund update:', dbErr);
      return NextResponse.json(
        { error: String(dbErr) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating refund:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}