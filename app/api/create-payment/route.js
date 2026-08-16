import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
            const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'unauthorized'},{ status: 401 })
        }
    const { amount, email } = await request.json();

    if (!amount || amount <= 0) {
      return Response.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }
 const generateOrderId = () => {
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substring(2, 11);
            return `ORD-${timestamp}-${random}`.toUpperCase();
        };

        const orderId= generateOrderId()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      receipt_email: email,
      metadata: {
        orderId: orderId,
      },
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
