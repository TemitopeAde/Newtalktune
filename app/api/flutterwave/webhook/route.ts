import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/flutterwave/webhook:
 *   post:
 *     summary: Handle Flutterwave payment webhooks
 *     description: >
 *       Receives payment notifications from Flutterwave and updates user subscriptions.
 *       Acts as a safety net for cases where the redirect callback didn't complete
 *       (e.g. browser closed, network drop). Uses the Payment table for tx_ref
 *       deduplication to avoid double-processing transactions already handled
 *       by the callback route.
 *     responses:
 *       200:
 *         description: Webhook processed successfully (or already processed — idempotent)
 *       400:
 *         description: Invalid webhook signature, missing metadata, or payment not successful
 *       404:
 *         description: User not found for the given customer email
 *       500:
 *         description: Webhook not configured or internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('verif-hash');

    if (!process.env.FLUTTERWAVE_SECRET_HASH) {
      console.error('FLUTTERWAVE_SECRET_HASH is not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    if (signature !== process.env.FLUTTERWAVE_SECRET_HASH) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(body);
    console.log('Webhook received:', {
      event: payload.event,
      txRef: payload.data?.tx_ref,
      status: payload.data?.status,
    });

    if (payload.event !== 'charge.completed') {
      return NextResponse.json({ success: true, message: 'Event received' });
    }

    const { status, tx_ref, customer, amount, currency } = payload.data;

    if (status !== 'successful') {
      console.log('Webhook: payment not successful:', { status, tx_ref });
      return NextResponse.json({ success: false, message: 'Payment not successful' });
    }

    const { planId, billingCycle, userId } = payload.data.meta || {};

    if (!planId || !billingCycle || !userId) {
      console.error('Webhook: missing metadata:', payload.data.meta);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // Dedup via Payment table
    const alreadyProcessed = await prisma.payment.findUnique({
      where: { txRef: tx_ref },
      select: { id: true },
    });

    if (alreadyProcessed) {
      console.log('Webhook: tx_ref already processed, skipping:', tx_ref);
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    const user = await prisma.user.findUnique({
      where: { email: customer.email },
      select: { id: true },
    });

    if (!user) {
      console.error('Webhook: user not found for email:', customer.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const subscriptionEndDate =
      billingCycle === 'yearly'
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionPlan: planId,
          subscriptionCycle: billingCycle,
          subscriptionStartDate: now,
          subscriptionEndDate,
          subscriptionTxRef: tx_ref,
          cancelledAt: null,
          charactersUsed: 0,
        },
      }),
      prisma.payment.create({
        data: {
          txRef: tx_ref,
          transactionId: String(payload.data.id ?? ''),
          planId,
          billingCycle,
          amount,
          currency: currency ?? 'USD',
          status: 'successful',
          userId: user.id,
        },
      }),
    ]);

    console.log('Webhook: subscription updated and payment recorded:', {
      userId: user.id,
      planId,
      billingCycle,
      subscriptionEndDate,
      txRef: tx_ref,
    });

    return NextResponse.json({ success: true, message: 'Subscription updated successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
