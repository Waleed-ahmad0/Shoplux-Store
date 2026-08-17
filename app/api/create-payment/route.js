import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';
import Product from '@/models/product';
import _ from 'lodash';
import { computeOrderTotal } from '@/lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'unauthorized' }, { status: 401 })
    }
    const { items, email, shippingMethod } = await request.json();
    if (!items) {
      return NextResponse.json(
        { error: 'Invalid items' },
        { status: 400 }
      );
    }
    const generateOrderId = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 11);
      return `ORD-${timestamp}-${random}`.toUpperCase();
    };

    const orderId = generateOrderId()
    const { total } = await computeOrderTotal(items, shippingMethod);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      receipt_email: email,
      metadata: {
        orderId: orderId,
        userId: session.user.id
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
