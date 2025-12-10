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
            index: true // Primary lookup by email
        },
        password: {
            type: String,
            select: false
        },
        googleId: {
            type: String,
            sparse: true,
            unique: true,
            index: true // OAuth lookup
        },
        githubId: {
            type: String,
            sparse: true,
            unique: true,
            index: true // OAuth lookup
        },
        discordId: {
            type: String,
            sparse: true,
            unique: true,
            index: true // OAuth lookup
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
            index: true // Filter active users
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
            index: true // Filter verified users
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

// ===== INDEXES FOR OPTIMIZATION & SCALABILITY =====

// Compound index: Active and verified users
userschema.index({ isActive: 1, isEmailVerified: 1 });

// Compound index: User by name (for admin search)
userschema.index({ firstName: 1, lastName: 1 });

// Text index for user search
userschema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// Index for sorting by registration date (admin analytics)
userschema.index({ createdAt: -1 });

// Index for sorting by last login (activity tracking)
userschema.index({ lastLogin: -1 });

// Compound index: Active users sorted by creation date
userschema.index({ isActive: 1, createdAt: -1 });

const User = models?.User || model("User", userschema);
export default User;