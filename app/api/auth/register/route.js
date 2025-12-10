import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(request) {
   try {
      await dbConnect();

      const { email, password, firstname, lastname } = await request.json();
      if (!email || !password || !firstname || !lastname) {
         return NextResponse.json({ error: "credentials is missing" }, { status: 400 });
      }

      const existinguser = await User.findOne({ email });
      if (existinguser) {
         return NextResponse.json({ error: "user already exist" }, { status: 400 });
      }

      const hashed = await bcrypt.hash(password, 10);
      const createuser = await User.create({ email, password: hashed , firstName:firstname, lastName:lastname ,  authMethods: ['credentials']});

      return NextResponse.json(
         { message: "user created successfully", user: createuser },
         { status: 201 }
      );
   } catch (error) {
      console.error("Register error:", error);
      return NextResponse.json({ error: "server error" }, { status: 500 });
   }
}