import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { amount, email, orderId } = await request.json();

    if (!amount || amount <= 0) {
      return Response.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

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
