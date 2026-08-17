import Product from "@/models/product";
import _ from "lodash";

const SHIPPING_RATES = { standard: 0, express: 24.99, overnight: 49.99 };
const TAX_RATE = 0.0875;

export async function computeOrderTotal(items, shippingMethod) {
  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);

    const variant = product.variants.find((v) =>
      _.isEqual(Object.fromEntries(v.attributes), item.selectedVariant),
    );
    if (!variant) throw new Error(`Variant not found`);
    if (variant.stockCount < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const unitPrice = variant.salePrice ?? variant.price;
    subtotal += unitPrice * item.quantity;
    verifiedItems.push({
      productId: product._id,
      name: product.name,
      brand: product.brand,
      price: unitPrice,
      quantity: item.quantity,
      image: variant.images[0],
      selectedVariant: item.selectedVariant,
    });
  }

  const shippingCost = SHIPPING_RATES[shippingMethod] ?? SHIPPING_RATES.standard;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shippingCost + tax;

  return { verifiedItems, subtotal, shippingCost, tax, total };
}