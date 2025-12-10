import mongoose, { Schema, model, models } from "mongoose";

const reviewSchema = new Schema(
    {
        userId: {
            type: String,
            ref: 'User',
            required: [true, 'User is required'],
            index: true // Fast lookups by user
        },
        productId: {
            type: String,
            ref: 'Product',
            required: [true, 'Product is required'],
            index: true // Fast lookups by product
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating must be at most 5'],
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minLength: [5, 'Title must be at least 5 characters'],
            maxLength: [100, 'Title must not exceed 100 characters']
        },
        comment: {
            type: String,
            required: false,
            trim: true,
            minLength: [10, 'Comment must be at least 10 characters'],
            maxLength: [1000, 'Comment must not exceed 1000 characters']
        },
        images: [{
            type: String,
            required: false,
        }],
        verified: {
            type: Boolean,
            default: false,
            index: true // Filter verified reviews
        },
        status: {
            type: String,
            enum: {
                values: ['pending', 'approved', 'rejected'],
                message: '{VALUE} is not a valid status'
            },
            default: 'pending',
            index: true // Filter by status
        },
        helpfulCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

// ===== INDEXES FOR OPTIMIZATION & SCALABILITY =====

// Unique compound index: Prevent duplicate reviews from same user for same product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Compound index: Product reviews by status and date (most common query for product pages)
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });

// Compound index: Product reviews by rating (sorting by rating)
reviewSchema.index({ productId: 1, rating: -1, createdAt: -1 });

// Compound index: User's reviews sorted by date
reviewSchema.index({ userId: 1, createdAt: -1 });

// Compound index: Approved reviews for a product (public display)
reviewSchema.index({ productId: 1, status: 1, verified: 1, createdAt: -1 });

// Index for most helpful reviews
reviewSchema.index({ productId: 1, helpfulCount: -1 });

// Admin: Pending reviews to moderate
reviewSchema.index({ status: 1, createdAt: 1 });

// Index for calculating average rating per product
reviewSchema.index({ productId: 1, rating: 1 });

const Review = models.Review || model('Review', reviewSchema);
export default Review;