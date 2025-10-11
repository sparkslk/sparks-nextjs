import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPayHereNotification, parsePayHereMethod, getPayHereConfig } from '@/lib/payhere';
import type { PayHereNotification } from '@/lib/payhere';

export async function POST(req: NextRequest) {
  try {
    // Parse form data from PayHere
    const formData = await req.formData();

    const notification: PayHereNotification = {
      merchant_id: formData.get('merchant_id') as string,
      order_id: formData.get('order_id') as string,
      payment_id: formData.get('payment_id') as string,
      payhere_amount: formData.get('payhere_amount') as string,
      payhere_currency: formData.get('payhere_currency') as string,
      status_code: formData.get('status_code') as string,
      md5sig: formData.get('md5sig') as string,
      custom_1: formData.get('custom_1') as string | undefined,
      custom_2: formData.get('custom_2') as string | undefined,
      status_message: formData.get('status_message') as string | undefined,
      card_holder_name: formData.get('card_holder_name') as string | undefined,
      card_no: formData.get('card_no') as string | undefined,
      card_expiry: formData.get('card_expiry') as string | undefined,
      method: formData.get('method') as string | undefined,
    };

    // Verify signature
    const config = getPayHereConfig();
    const isValid = verifyPayHereNotification(notification, config.merchantSecret);

    if (!isValid) {
      console.error('Invalid PayHere signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Find donation by order ID
    const donation = await prisma.donation.findFirst({
      where: { payHereOrderId: notification.order_id },
    });

    if (!donation) {
      console.error('Donation not found:', notification.order_id);
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    // Parse status
    let paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

    switch (notification.status_code) {
      case '2':
        paymentStatus = 'COMPLETED';
        break;
      case '0':
        paymentStatus = 'PENDING';
        break;
      case '-1':
        paymentStatus = 'CANCELLED';
        break;
      case '-2':
        paymentStatus = 'FAILED';
        break;
      case '-3':
        paymentStatus = 'REFUNDED';
        break;
      default:
        paymentStatus = 'FAILED';
    }

    // Update donation
    const updatedDonation = await prisma.donation.update({
      where: { id: donation.id },
      data: {
        paymentStatus,
        payHerePaymentId: notification.payment_id,
        payHereStatusCode: notification.status_code,
        paymentMethod: parsePayHereMethod(notification.method),
      },
    });

    // Log the update
    console.log('Donation updated:', {
      id: updatedDonation.id,
      orderId: updatedDonation.payHereOrderId,
      status: paymentStatus,
      paymentId: notification.payment_id,
    });

    // TODO: Send confirmation email if payment is completed
    // TODO: Send notification to admin

    return NextResponse.json({ success: true, status: paymentStatus });
  } catch (error) {
    console.error('Error processing PayHere webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
