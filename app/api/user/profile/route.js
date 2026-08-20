import User from "@/models/user";
import Order from "@/models/order";
import Cart from "@/models/cart";
import Review from "@/models/reviews";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    return Response.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      hasPassword: !!user.password,
      googleId: user.googleId,
      githubId: user.githubId,
      discordId: user.discordId,
      authMethods: user.authMethods,
      profileImage: user.profileImage,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      linkedAccounts: {
        google: !!user.googleId,
        github: !!user.githubId,
        discord: !!user.discordId,
        credentials: user.authMethods.includes('credentials')
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
        }
        await dbConnect();
        const userEmail = session.user.email;
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const userId = user._id;
        await Promise.all([
            Order.deleteMany({ userId }),
            Cart.deleteMany({ userId }),
            Review.deleteMany({ userId }),
        ]);
        await User.deleteOne({ _id: userId });
        return NextResponse.json({ message: "User and all associated data have been deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}