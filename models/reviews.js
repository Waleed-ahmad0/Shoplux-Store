import mongoose, { Schema, model, models } from "mongoose";

const reviewSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
            index: true 
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product is required'],
            index: true 
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
            index: true 
        },
        status: {
            type: String,
            enum: {
                values: ['pending', 'approved', 'rejected'],
                message: '{VALUE} is not a valid status'
            },
            default: 'pending',
            index: true 
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


reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });

reviewSchema.index({ productId: 1, rating: -1, createdAt: -1 });

reviewSchema.index({ userId: 1, createdAt: -1 });

reviewSchema.index({ productId: 1, status: 1, verified: 1, createdAt: -1 });

reviewSchema.index({ productId: 1, helpfulCount: -1 });

reviewSchema.index({ status: 1, createdAt: 1 });

reviewSchema.index({ productId: 1, rating: 1 });

const Review = models.Review || model('Review', reviewSchema);
export default Review;