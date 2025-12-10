import { Schema, models, model } from "mongoose"

const productSchema = new Schema({
  productid: {
    type: String,
    required: true,
    unique: true,
    index: true // Primary lookup index
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    index: true // Filter products by category
  },
  productType: {
    type: String,
    required: true,
    trim: true,
    index: true // Filter by product type (men, women, laptops, etc.)
  },
  brand: {
    type: String,
    trim: true,
    index: true // Filter products by brand
  },
  variants: {
    type: [{
      attributes: {
        type: Map,
        of: String,
        required: true
      },
      price: { type: Number, required: true },
      stockCount: { type: Number, required: true, min: 0 },
      salePrice: { type: Number },
      images: [{ type: String }],
      sku: { type: String, required: true }
    }],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one variant is required"
    }
  }
}, {
  timestamps: true
});

// ===== INDEXES FOR OPTIMIZATION & SCALABILITY =====

// Compound index: Category + productType (most common filter combination)
productSchema.index({ category: 1, productType: 1 });

// Compound index: Category + brand (brand filtering within category)
productSchema.index({ category: 1, brand: 1 });

// Compound index: Category + createdAt (new arrivals in category)
productSchema.index({ category: 1, createdAt: -1 });

// Index for price sorting (using first variant's price)
productSchema.index({ 'variants.price': 1 });

// Index for finding products in stock
productSchema.index({ 'variants.stockCount': 1 });

// Index for SKU lookups (inventory management)
productSchema.index({ 'variants.sku': 1 });

// Text index for search functionality
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

// Compound index for product type + creation date
productSchema.index({ productType: 1, createdAt: -1 });

const Product = models.Product || model("Product", productSchema);
export default Product;