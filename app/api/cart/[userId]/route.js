import dbConnect from "@/lib/mongodb";
import Cart from "@/models/cart";
import { NextResponse } from "next/server";

// GET all products
export async function GET(request, { params }) {
    try {
        const { userId } = await params
        await dbConnect();
        const products = await Cart.find({ userId });
        return NextResponse.json(products);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST create product
export async function POST(req, { params }) {
    try {
        const { userId } = await params
        await dbConnect();
        const body = await req.json();
        // ✅ You decide validation rules here
        if (!body) {
            return NextResponse.json({ error: "body is undefined" }, { status: 400 });
        }
        const repeated = await Cart.findOne(
            {
                productId: body.productId,
                userId,
                selectedVariant: body.selectedVariant

            })
        if (repeated) {
            return NextResponse.json({ error: "product already in the cart" });

        }

        const result = await Cart.create(body);

        return NextResponse.json({ message: "sucessfully added in the cart", status: 201 })

    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const userId =(await params).userId
        if (!userId) {
            return NextResponse.json({ error: "userId is missing" }, { status: 400 });

        }

        const result = await Cart.deleteMany({ userId })

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function PATCH(request, { params }) {

    try {
        const { userId } = await params
        if (!userId) {
            return NextResponse.json({ error: "user id is missing", data }, { status: 400 });

        }
        await dbConnect();
        const data = await request.json();
        if (typeof data.quantity !== 'number' || data.quantity <= 0) {
            return NextResponse.json({ error: "Quantity must be a positive integer", data }, { status: 400 });
        }
        if (!data.id) {
            return NextResponse.json({ error: "id is missing" }, { status: 400 });
        }
        const result = await Cart.findOneAndUpdate(

            { userId, productId: data.id },
            { $set: { quantity: data.quantity } },
            { returnDocument: 'after' }
        );
        return NextResponse.json({ success: true, result });
    } catch (error) {
        return NextResponse.json({ "internal server error": error.toString() });
    }
}
