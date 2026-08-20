import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Cart from "@/models/cart";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
        }
        await dbConnect();
        const products = await Cart.find({ userId: session.user.id });
        return NextResponse.json(products);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
        }
        await dbConnect();
        const body = await req.json();
        if (!body?.productId || !body?.selectedVariant) {
            return NextResponse.json({ error: "productId and selectedVariant are required" }, { status: 400 });
        }
        const repeated = await Cart.findOne({
            productId: body.productId,
            userId: session.user.id,
            selectedVariant: body.selectedVariant,
        });
        if (repeated) {
            return NextResponse.json({ error: "product already in the cart" }, { status: 409 });
        }
        await Cart.create({ ...body, userId: session.user.id });
        return NextResponse.json({ message: "successfully added to cart" }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
        }
        await dbConnect();
        const data = await req.json();
        if (!data?.productId || !data?.selectedVariant) {
            return NextResponse.json({ error: "productId and selectedVariant are required" }, { status: 400 });
        }
        await Cart.findOneAndDelete({
            userId: session.user.id,
            productId: data.productId,
            selectedVariant: data.selectedVariant,
        });
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
        }
        await dbConnect();
        const data = await request.json();
        if (typeof data.quantity !== 'number' || data.quantity <= 0) {
            return NextResponse.json({ error: "Quantity must be a positive integer" }, { status: 400 });
        }
        if (!data.id || !data.selectedVariant) {
            return NextResponse.json({ error: "id and selectedVariant are required" }, { status: 400 });
        }
        const result = await Cart.findOneAndUpdate(
            { userId: session.user.id, productId: data.id, selectedVariant: data.selectedVariant },
            { $set: { quantity: data.quantity } },
            { new: true }
        );
        if (!result) {
            return NextResponse.json({ error: "cart item not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, result });
    } catch (error) {
        return NextResponse.json({ error: error.toString() }, { status: 500 });
    }
}