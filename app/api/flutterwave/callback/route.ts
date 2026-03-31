import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SUBSCRIPTION_BASE_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscriptions`
  : 'http://localhost:3000/dashboard/subscriptions';

/**
 * GET /api/flutterwave/callback
 *
 * Flutterwave redirects here after the hosted payment page.
 * Query params: transaction_id, tx_ref, status
 *
 * Flow:
 * 1. Check status param — if not "successful", redirect with error.
 * 2. Verify transaction with Flutterwave API using transaction_id.
 * 3. Check for duplicate processing using tx_ref (via Payment table).
 * 4. Update user subscription and create Payment record atomically.
 * 5. Redirect to subscriptions page with success param.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const transactionId = searchParams.get('transaction_id');
  const txRef = searchParams.get('tx_ref');

  if (status !== 'successful') {
    console.log('Payment not successful on redirect:', { status, txRef });
    return NextResponse.redirect(
      `${SUBSCRIPTION_BASE_URL}?payment=failed&reason=cancelled`
    );
  }

  if (!transactionId || !txRef) {
    console.error('Missing transaction_id or tx_ref in callback');
    return NextResponse.redirect(
      `${SUBSCRIPTION_BASE_URL}?payment=failed&reason=invalid_callback`
    );
  }

  try {
    const verifyResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const verifyData = await verifyResponse.json();
    console.log('Flutterwave verification response:', {
      status: verifyData.status,
      txRef: verifyData.data?.tx_ref,
      chargeStatus: verifyData.data?.status,
    });

    if (!verifyResponse.ok || verifyData.status !== 'success') {
      console.error('Flutterwave verification failed:', verifyData);
      return NextResponse.redirect(
        `${SUBSCRIPTION_BASE_URL}?payment=failed&reason=verification_failed`
      );
    }

    const transaction = verifyData.data;

    if (transaction.status !== 'successful') {
      return NextResponse.redirect(
        `${SUBSCRIPTION_BASE_URL}?payment=failed&reason=charge_failed`
      );
    }

    const { planId, billingCycle, userId } = transaction.meta || {};

    if (!planId || !billingCycle || !userId) {
      console.error('Missing metadata in verified transaction:', transaction.meta);
      return NextResponse.redirect(
        `${SUBSCRIPTION_BASE_URL}?payment=failed&reason=missing_metadata`
      );
    }

    // Dedup via Payment table — unique on txRef
    const alreadyProcessed = await prisma.payment.findUnique({
      where: { txRef },
      select: { id: true },
    });

    if (alreadyProcessed) {
      console.log('Duplicate callback, tx_ref already processed:', txRef);
      return NextResponse.redirect(
        `${SUBSCRIPTION_BASE_URL}?payment=success&plan=${planId}`
      );
    }

    const now = new Date();
    const subscriptionEndDate =
      billingCycle === 'yearly'
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    // Update subscription and record payment atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: Number(userId) },
        data: {
          subscriptionPlan: planId,
          subscriptionCycle: billingCycle,
          subscriptionStartDate: now,
          subscriptionEndDate,
          subscriptionTxRef: txRef,
          cancelledAt: null,
          charactersUsed: 0,
        },
      }),
      prisma.payment.create({
        data: {
          txRef,
          transactionId,
          planId,
          billingCycle,
          amount: transaction.amount,
          currency: transaction.currency ?? 'USD',
          status: 'successful',
          userId: Number(userId),
        },
      }),
    ]);

    console.log('Subscription updated and payment recorded:', {
      userId,
      planId,
      billingCycle,
      subscriptionEndDate,
      txRef,
      amount: transaction.amount,
    });

    return NextResponse.redirect(
      `${SUBSCRIPTION_BASE_URL}?payment=success&plan=${planId}`
    );
  } catch (error) {
    console.error('Error in Flutterwave callback:', error);
    return NextResponse.redirect(
      `${SUBSCRIPTION_BASE_URL}?payment=failed&reason=server_error`
    );
  }
}
