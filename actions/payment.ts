import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { PLANS, getPlanPrice } from '@/constants/Plans';
import type { BillingCycle } from '@/constants/Plans';

export async function initiatePayment(req: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      console.error('Missing Flutterwave API keys');
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
    }

    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { planId?: string; billingCycle?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { planId, billingCycle } = body;

    if (!planId || !billingCycle) {
      return NextResponse.json({ error: 'Missing planId or billingCycle' }, { status: 400 });
    }

    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
      return NextResponse.json({ error: 'Invalid billingCycle' }, { status: 400 });
    }

    // Free plan requires no payment
    if (planId === 'free') {
      return NextResponse.json({ error: 'Free plan requires no payment' }, { status: 400 });
    }

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Yearly = 10 months charged (2 months free)
    const amount = getPlanPrice(plan.monthlyPrice, billingCycle as BillingCycle);

    const txRef = `talktune-${planId}-${Date.now()}`;

    const payload = {
      tx_ref: txRef,
      amount,
      currency: 'USD',
      redirect_url: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/flutterwave/callback`
        : 'http://localhost:3000/api/flutterwave/callback',
      customer: {
        email: user.email,
        phonenumber: user.phoneNumber || '',
        name: user.name || '',
      },
      customizations: {
        title: 'Talktune Subscription',
        description: `${plan.name} — ${billingCycle} billing`,
        logo: 'https://www.talktune.co/logo.png',
      },
      meta: {
        planId,
        billingCycle,
        userId: user.id,
      },
    };

    console.log('Initiating Flutterwave payment:', {
      txRef,
      planId,
      billingCycle,
      amount,
      currency: 'USD',
      customer: { email: user.email },
    });

    const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await flutterwaveResponse.json();

    if (!flutterwaveResponse.ok) {
      console.error('Flutterwave API error:', data);
      return NextResponse.json(
        { error: 'Payment initiation failed', details: data.message || 'Unknown error' },
        { status: flutterwaveResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in initiatePayment:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
