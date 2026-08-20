import { Schema, models, model } from "mongoose"
const productSchema = new Schema({
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
    index: true 
  },
  productType: {
    type: String,
    required: true,
    trim: true,
    index: true 
  },
  brand: {
    type: String,
    trim: true,
    index: true 
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
productSchema.index({ category: 1, productType: 1 });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ 'variants.price': 1 });
productSchema.index({ 'variants.stockCount': 1 });
productSchema.index({ 'variants.sku': 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ productType: 1, createdAt: -1 });
const Product = models.Product || model("Product", productSchema);
export default Product;