import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/order";
import Cart from "@/models/cart";
import Product from "@/models/product";
import _ from "lodash";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export async function POST(request) {
  const body = await request.text(); 
  const signature = request.headers.get("stripe-signature");
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { orderId, userId, items: itemsJson } = paymentIntent.metadata;
    try {
      await dbConnect();
      const existing = await Order.findOne({ orderId });
      if (existing) {
        return NextResponse.json({ received: true });
      }
      const items = JSON.parse(itemsJson);
      let total = 0;
      const verifiedItems = [];
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) continue; 
        const variant = product.variants.find((v) =>
          _.isEqual(Object.fromEntries(v.attributes), item.selectedVariant)
        );
        if (!variant) continue;
        const unitPrice = variant.salePrice ?? variant.price;
        total += unitPrice * item.quantity;
        verifiedItems.push({
          productId: product._id,
          name: product.name,
          brand: product.brand,
          price: unitPrice,
          quantity: item.quantity,
          image: variant.images[0],
          selectedVariant: item.selectedVariant,
        });
        variant.stockCount -= item.quantity;
        await product.save();
      }
      await Order.create({
        userId,
        orderId,
        orderedItems: verifiedItems,
        total,
        paymentStatus: "paid",
        status: "pending",
        paymentIntentId: paymentIntent.id,
      });
      await Cart.deleteMany({ userId });
    } catch (err) {
      console.error("Webhook order creation failed:", err);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}