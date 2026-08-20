import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import dbConnect from "./mongodb"
import User from "@/models/user"
export const authOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "email", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }
                try {
                    await dbConnect()
                    const userdata = await User.findOne({ email: credentials.email }).select("+password");
                    if (!userdata || !userdata.password) {
                        return null
                    }
                    const passcheck = await bcrypt.compare(credentials.password, userdata.password);
                    if (!passcheck) {
                        return null
                    }
                    return {
                        id: userdata._id.toString(),
                        email: userdata.email,
                        firstName: userdata.firstName,
                        lastName: userdata.lastName,
                        profileImage: userdata.profileImage,
                        authMethods: userdata.authMethods
                    };
                } catch (error) {
                    console.error("Credentials auth error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "credentials") {
                return true;
            }
            try {
                await dbConnect();
                const existingUser = await User.findOne({ email: user.email });
                const providerIdField = `${account.provider}Id`;
                if (existingUser) {
                    existingUser[providerIdField] = account.providerAccountId;
                    if (!existingUser.authMethods.includes(account.provider)) {
                        existingUser.authMethods.push(account.provider);
                    }
                    if (!existingUser.firstName && user?.name) {
                        existingUser.firstName = user.name;
                    }
                    if (!existingUser.profileImage && user.image) {
                        existingUser.profileImage = user.image;
                    }
                    existingUser.lastLogin = new Date();
                    existingUser.isEmailVerified = true;
                    await existingUser.save();
                    user.id = existingUser._id.toString();
                    user.firstName = existingUser.firstName;
                    user.lastName = existingUser.lastName || "";
                    user.profileImage = existingUser.profileImage;
                    user.authMethods = existingUser.authMethods;
                } else {
                    const newUser = new User({
                        email: user.email,
                        firstName: profile?.name || user.name || "User",
                        [providerIdField]: account.providerAccountId,
                        authMethods: [account.provider],
                        profileImage: profile?.image || user.image || null,
                        isEmailVerified: true,
                        lastLogin: new Date()
                    });
                    await newUser.save();
                    user.id = newUser._id.toString();
                    user.firstName = newUser.firstName;
                    user.lastName = newUser.lastName || "";
                    user.profileImage = newUser.profileImage;
                    user.authMethods = newUser.authMethods;
                }
                return true;
            } catch (error) {
                console.error("SignIn callback error:", error);
                return false;
            }
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.profileImage = user.profileImage;
                token.authMethods = user.authMethods;
                if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
                    token.role = 'admin';
                } else {
                    token.role = 'customer';
                }
            }
            if (account) {
                token.provider = account.provider;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
                session.user.profileImage = token.profileImage;
                session.user.authMethods = token.authMethods;
                session.user.provider = token.provider;
                session.user.role = token.role;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },
    debug: process.env.NODE_ENV === 'development',
    secret: process.env.NEXTAUTH_SECRET
}