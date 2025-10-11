import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDonationOrderId, formatPayHereAmount, generatePayHereHash, getPayHereConfig } from '@/lib/payhere';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      frequency = 'ONE_TIME',
      donorName,
      donorEmail,
      donorPhone,
      isAnonymous = false,
      message,
    } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    if (!isAnonymous && (!donorEmail || !donorName)) {
      return NextResponse.json(
        { error: 'Donor name and email are required for non-anonymous donations' },
        { status: 400 }
      );
    }

    // Get user session if logged in
    const session = await getServerSession();
    const userId = session?.user?.id || null;

    // Get client IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';

    // Generate order ID
    const orderId = generateDonationOrderId();

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        amount,
        currency: 'LKR',
        frequency,
        paymentMethod: null,
        paymentStatus: 'PENDING',
        payHereOrderId: orderId,
        donorName: isAnonymous ? 'Anonymous' : donorName,
        donorEmail: isAnonymous ? null : donorEmail,
        donorPhone: isAnonymous ? null : donorPhone,
        isAnonymous,
        message: message || null,
        userId,
        receiptSent: false,
        source: 'website',
        ipAddress,
      },
    });

    // Generate PayHere payment data
    const config = getPayHereConfig();
    const formattedAmount = formatPayHereAmount(amount);

    const paymentHash = generatePayHereHash(
      config.merchantId,
      orderId,
      formattedAmount,
      'LKR',
      config.merchantSecret
    );

    // Prepare PayHere payment data
    const paymentData = {
      sandbox: config.mode === 'sandbox',
      merchant_id: config.merchantId,
      return_url: config.returnUrl,
      cancel_url: config.cancelUrl,
      notify_url: config.notifyUrl,
      order_id: orderId,
      items: `Donation to SPARKS - ${frequency.replace('_', ' ')}`,
      amount: formattedAmount,
      currency: 'LKR',
      first_name: isAnonymous ? 'Anonymous' : donorName?.split(' ')[0] || 'Donor',
      last_name: isAnonymous ? 'Donor' : donorName?.split(' ').slice(1).join(' ') || '',
      email: isAnonymous ? 'anonymous@sparks.help' : donorEmail,
      phone: isAnonymous ? '0000000000' : donorPhone || '0000000000',
      address: '',
      city: 'Colombo',
      country: 'Sri Lanka',
      hash: paymentHash,
      custom_1: donation.id,
      custom_2: frequency,
    };

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        orderId: donation.payHereOrderId,
        amount: donation.amount,
        currency: donation.currency,
      },
      paymentData,
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}
