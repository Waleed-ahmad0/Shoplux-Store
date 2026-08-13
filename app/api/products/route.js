import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Products from "@/models/product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET() {
    try {
        await dbConnect();
        const products = await Products.find({});
        return NextResponse.json(products);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session?.user?.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ message: 'unauthorized', status: 401 })
        }

        const body = await req.json();
        await dbConnect();
        if (!body) {
            return NextResponse.json({ error: "name and price are required" }, { status: 400 });
        }

        const result = await Products.create(body);

        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session?.user?.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ message: 'unauthorized'},{ status: 401 })
        }
        const productid = await req.json();
        await dbConnect();
        if (!productid) {
            return NextResponse.json({ error: "productid is required" }, { status: 400 });
        }

        const result = await Products.deleteOne(productid);

        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}