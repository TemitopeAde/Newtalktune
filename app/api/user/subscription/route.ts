import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { PLANS, getPlanPrice } from '@/constants/Plans';
import type { BillingCycle } from '@/constants/Plans';

/**
 * GET /api/user/subscription
 * Returns the authenticated user's current subscription, usage, and payment history.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscriptionPlan: true,
        subscriptionCycle: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        cancelledAt: true,
        charactersUsed: true,
        Payment: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            txRef: true,
            planId: true,
            billingCycle: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const planId = dbUser.subscriptionPlan ?? 'free';
    const cycle = (dbUser.subscriptionCycle ?? 'monthly') as BillingCycle;
    const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0];

    // Character limits
    const monthlyLimits: Record<string, number | null> = {
      free: 300,
      creator: 174000,
      pro: null,
    };
    const monthlyLimit = monthlyLimits[planId] ?? null;

    return NextResponse.json({
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        features: plan.features,
        monthlyPrice: plan.monthlyPrice,
        amountPaid: plan.monthlyPrice > 0 ? getPlanPrice(plan.monthlyPrice, cycle) : 0,
      },
      billingCycle: cycle,
      startDate: dbUser.subscriptionStartDate,
      endDate: dbUser.subscriptionEndDate,
      cancelledAt: dbUser.cancelledAt,
      isCancelled: !!dbUser.cancelledAt,
      usage: {
        charactersUsed: dbUser.charactersUsed,
        monthlyLimit,
        isUnlimited: monthlyLimit === null,
      },
      payments: dbUser.Payment,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/user/subscription
 * Manually updates a user's subscription plan (admin or post-payment fallback).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { planId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { planId } = body;
    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
    }

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid planId' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionPlan: planId },
    });

    return NextResponse.json({ success: true, planId });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/user/subscription
 * Cancels the user's subscription at the end of the current billing period.
 * Sets cancelledAt to now — the plan remains active until subscriptionEndDate.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscriptionPlan: true,
        subscriptionEndDate: true,
        cancelledAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!dbUser.subscriptionPlan || dbUser.subscriptionPlan === 'free') {
      return NextResponse.json(
        { error: 'No active paid subscription to cancel' },
        { status: 400 }
      );
    }

    if (dbUser.cancelledAt) {
      return NextResponse.json(
        { error: 'Subscription is already cancelled' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { cancelledAt: new Date() },
    });

    console.log('Subscription cancelled:', {
      userId: user.id,
      plan: dbUser.subscriptionPlan,
      activeUntil: dbUser.subscriptionEndDate,
    });

    return NextResponse.json({
      success: true,
      message: 'Your subscription has been cancelled. You will retain access until the end of your billing period.',
      activeUntil: dbUser.subscriptionEndDate,
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
