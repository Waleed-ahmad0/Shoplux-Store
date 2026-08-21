import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { computeOrderTotal } from "@/lib/pricing";
import Product from "@/models/product";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("computeOrderTotal - price integrity", () => {
  it("ignores a client-supplied price and uses the real Product price instead", async () => {
    const variantAttrs = { color: "red", size: "M" };

    const product = await Product.create({
      name: "Test Shirt",
      description:'there is no description',
      brand:"no brand",
      category: "Fashion",
      productType: "Shirt",
      variants: [{ attributes: variantAttrs, price: 50, stockCount: 10, sku: "TEST-SKU-1", images: ["test.png"] }],
    });

    const items = [
      {
        productId: product._id.toString(),
        quantity: 2,
        selectedVariant: variantAttrs,
        price: 0.01, 
      },
    ];

    const { subtotal, verifiedItems } = await computeOrderTotal(items, "standard");

    expect(subtotal).toBe(100); 
    expect(verifiedItems[0].price).toBe(50);
  });

  it("rejects an order when quantity exceeds available stock", async () => {
    const variantAttrs = { color: "blue", size: "L" };

    const product = await Product.create({
      name: "Low Stock Item",
      description:'there is no description',
      brand:"no brand",
      category: "Fashion",
      productType: "Shirt",
      variants: [{ attributes: variantAttrs, price: 20, stockCount: 1, sku: "TEST-SKU-2", images: ["test2.png"] }],
    });

    const items = [{ productId: product._id.toString(), quantity: 5, selectedVariant: variantAttrs }];

    await expect(computeOrderTotal(items, "standard")).rejects.toThrow(/insufficient stock/i);
  });
});