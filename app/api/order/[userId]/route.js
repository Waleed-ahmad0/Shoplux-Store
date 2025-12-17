import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/order";
import _ from "lodash"
import Cart from "@/models/cart"
import Product from "@/models/product";

// GET all orders for a user
export async function GET(req, { params }) {
    try {
        const { userId } = await params;
        await dbConnect();
        const orders = await Order.find({ userId });
        return NextResponse.json(orders);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST create order
export async function POST(req, { params }) {
    try {
        const { userId } = await params;
        const body = await req.json();

        // Validation
        if (!body) {
            return NextResponse.json({ error: "body is required" }, { status: 400 });
        }

        // Validate required fields
        if (!body.orderId) {
            return NextResponse.json({ error: "orderId is required" }, { status: 400 });
        }
        if (!body.orderedItems || !Array.isArray(body.orderedItems) || body.orderedItems.length === 0) {
            return NextResponse.json({ error: "orderedItems are required" }, { status: 400 });
        }

        await dbConnect();
        await Cart.deleteMany({ userId })
        const datafordb = { userId, ...body };
        const result = await Order.create(datafordb);



        datafordb.orderedItems.map(async item => {
            const check = await Product.findOne({ productid: item.productId })
            const matchedproduct = check.variants.map(async variant => {
                const variantsMap = variant.attributes
                const variantsObject = Object.fromEntries(variantsMap);
                const areEqual = _.isEqual(item.selectedVariant, variantsObject);
                if (areEqual) {
                    variant.stockCount -= item.quantity;
                    await check.save();
                }
            })
        })



        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const data = await request.json();

        if (!data.status) {
            return NextResponse.json({ error: "status is missing" }, { status: 400 });
        }
        if (!data.orderId) {
            return NextResponse.json({ error: "orderId is missing" }, { status: 400 });
        }

        const updateData = { status: data.status };
        if (data.returnReason) {
            updateData.returnReason = data.returnReason;
        }

        await dbConnect();
        const result = await Order.findOneAndUpdate(
            { orderId: data.orderId },
            { $set: updateData },
            { returnDocument: 'after', new: true }
        );
        if (data.status === "cancelled") {
            data.orderedItems.map(async item => {
                const check = await Product.findOne({ productid: item.productId })
                const matchedproduct = check.variants.map(async variant => {
                    const variantsMap = variant.attributes
                    const variantsObject = Object.fromEntries(variantsMap);
                    const areEqual = _.isEqual(item.selectedVariant, variantsObject);
                    if (areEqual) {
                        variant.stockCount += item.quantity;
                        await check.save();
                    }
                })
            })
        }

        return NextResponse.json({ success: true, result });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const UserId = await req.json();

        if (!UserId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });

        }
        await Order.deleteMany({ UserId });
        return NextResponse.json({ message: "user orders has been deleted" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}