import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Products from "@/models/product";
// GET all products
export async function GET() {
    try {
        await dbConnect();
        const products = await Products.find({});
        return NextResponse.json(products);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST create product
export async function POST(req) {
    try {
        const body = await req.json();
        await dbConnect();
        // ✅ You decide validation rules here
        if (!body) {
            return NextResponse.json({ error: "name and price are required" }, { status: 400 });
        }

        const result = await Products.create(body);

        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
