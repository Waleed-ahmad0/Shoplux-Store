import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import address from "@/models/address";
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "unauthorized", status: 401 });
    }
    await dbConnect();
    const getaddress = await address.find({ userId: session.user.id });
    return NextResponse.json(getaddress, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "unauthorized", status: 401 });
    }
    const body = await req.json();
    await dbConnect();
    const f_add = { ...body, userId: session.user.id };
    const saveaddress = await address.create(f_add);
    return NextResponse.json({ saveaddress }, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "unauthorized", status: 401 });
    }
    await dbConnect();
    const body = req.json();
    const useraddress = {
      ...body,
      userId: session.user.id,
    };
    const deletaddress = await address.deleteOne(useraddress);
    return NextResponse.json(deletaddress, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
