import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/order";
import _ from "lodash"
import Cart from "@/models/cart"
import Product from "@/models/product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { computeOrderTotal } from "@/lib/pricing";
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'unauthorized' }, { status: 401 })
        }
        const userId = session?.user?.id
        await dbConnect();
        const orders = await Order.find({ userId });
        return NextResponse.json(orders);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'unauthorized' }, { status: 401 })
        }
        const userId = session?.user?.id;
        const body = await req.json();
        if (!body) {
            return NextResponse.json({ error: "body is required" }, { status: 400 });
        }
        const { verifiedItems, subtotal, shippingCost, tax, total } =
            await computeOrderTotal(body.orderedItems, body.shippingMethod);
        const generateOrderId = () => {
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substring(2, 11);
            return `ORD-${timestamp}-${random}`.toUpperCase();
        };
        const orderId = generateOrderId()
        if (!body.orderedItems || !Array.isArray(body.orderedItems) || body.orderedItems.length === 0) {
            return NextResponse.json({ error: "orderedItems are required" }, { status: 400 });
        }
        await dbConnect();
        await Promise.all(
            verifiedItems.map(async (item) => {
                const product = await Product.findById(item.productId);
                const variant = product.variants.find((v) =>
                    _.isEqual(Object.fromEntries(v.attributes), item.selectedVariant)
                );
                variant.stockCount -= item.quantity;
                await product.save();
            })
        );
        const datafordb = { ...body, userId, orderId, orderedItems: verifiedItems, subtotal, shippingCost, tax, total };
        await Cart.deleteMany({ userId })
        const result = await Order.create(datafordb);
        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'unauthorized' }, { status: 401 })
        }
        const data = await request.json();
        if (!data.status) {
            return NextResponse.json({ error: "status is missing" }, { status: 400 });
        }
        if (!data.orderId) {
            return NextResponse.json({ error: "orderId is missing" }, { status: 400 });
        }
        await dbConnect();
        const findorder = await Order.findById(data.orderId);
        if (!findorder) {
            return NextResponse.json({ error: "order not found" }, { status: 404 });
        }
        const isOwner = findorder.userId.equals(session.user.id);
        const isAdmin = session.user.email === process.env.ADMIN_EMAIL;
        if (data.status === "cancelled") {
            if (!isOwner && !isAdmin) {
                return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
            }
        } else if (!isAdmin) {
            return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
        }
        const updateData = { status: data.status };
        if (data.returnReason) {
            updateData.returnReason = data.returnReason;
        }
        const result = await Order.findOneAndUpdate(
            { _id: data.orderId },
            { $set: updateData },
            { new: true }
        );
        if (data.status === "cancelled") {
            await Promise.all(
                findorder.orderedItems.map(async item => {
                    let check;
                    if (mongoose.Types.ObjectId.isValid(item.productId)) {
                        check = await Product.findById(item.productId);
                    }
                    if (!check) {
                        throw new Error(`Product not found: ${item.productId}`);
                    }
                    for (const variant of check.variants) {
                        const variantsObject = Object.fromEntries(variant.attributes);
                        if (_.isEqual(item.selectedVariant, variantsObject)) {
                            variant.stockCount += item.quantity;
                            await check.save();
                            break;
                        }
                    }
                })
            );
        }
        return NextResponse.json({ success: true, result });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'unauthorized' }, { status: 401 })
        }
        await dbConnect();
        const userId = session.user.id
        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }
        await Order.deleteMany({ userId });
        return NextResponse.json({ message: "user orders has been deleted" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}