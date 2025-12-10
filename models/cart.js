import mongoose, { Schema, model, models } from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true // Single field index for fast user lookups
    },
    productId: {
        type: String,
        required: true,
        index: true // Single field index for product queries
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    salePrice: {
        type: Number,
        min: 0
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },

    selectedVariant: {
        type: Object,
        required: true
    },

    stockCount: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },

}, {
    timestamps: true
});

// ===== INDEXES FOR OPTIMIZATION & SCALABILITY =====

// Compound unique index: Ensures one product per user (prevents duplicates)
// Also optimizes queries that filter by both userId and productId
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Index for fetching all cart items for a user (most common query)
// Includes createdAt for sorting by when items were added
cartSchema.index({ userId: 1, createdAt: -1 });

// Index for admin analytics: finding carts by product
cartSchema.index({ productId: 1, createdAt: -1 });

// TTL Index: Automatically delete abandoned cart items after 30 days
// This helps with database cleanup and storage optimization
// Set to 30 days (30 * 24 * 60 * 60 = 2592000 seconds)
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 2592000 });

// Index for price-based queries (for analytics like "high value carts")
cartSchema.index({ userId: 1, price: -1 });

const Cart = models?.Cart || model("Cart", cartSchema);
export default Cart;