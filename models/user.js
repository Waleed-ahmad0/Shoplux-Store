import mongoose, { Schema, model, models } from "mongoose";
const userschema = new Schema(
    {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true 
        },
        password: {
            type: String,
            select: false
        },
        googleId: {
            type: String,
            sparse: true,
            unique: true,
            index: true 
        },
        githubId: {
            type: String,
            sparse: true,
            unique: true,
            index: true 
        },
        discordId: {
            type: String,
            sparse: true,
            unique: true,
            index: true 
        },
        authMethods: {
            type: [String],
            enum: ['credentials', 'google', 'github', 'discord'],
            default: []
        },
        profileImage: {
            type: String,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
            index: true 
        },
        lastLogin: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
    }
);
userschema.index({ isActive: 1, isEmailVerified: 1 });
userschema.index({ firstName: 1, lastName: 1 });
userschema.index({ firstName: 'text', lastName: 'text', email: 'text' });
userschema.index({ createdAt: -1 });
userschema.index({ lastLogin: -1 });
userschema.index({ isActive: 1, createdAt: -1 });
const User = models?.User || model("User", userschema);
export default User;