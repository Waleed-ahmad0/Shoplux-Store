import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { PATCH } from "@/app/api/order/route";
import Order from "@/models/order";
import { getServerSession } from "next-auth";

vi.mock("next-auth");
vi.mock("@/lib/mongodb", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("PATCH /api/order - ownership", () => {
  it("blocks a stranger from cancelling someone else's order", async () => {
    const owner = new mongoose.Types.ObjectId();
    const stranger = new mongoose.Types.ObjectId();

    const order = await Order.create({
      userId: owner,
      orderId: "ORD-TEST-001",
      orderedItems: [],
      subtotal: 100,
      shippingCost: 0,
      tax: 8.75,
      total: 108.75,
      status: "pending",
      paymentMethod: "cod",
      shippingMethod: "standard",
      shippingForm: {
        firstName: "there is nothing",
        lastName: "there is nothing",
        email: "waleed@gmail.com",
        phone: "there is nothing",
        address: "there is nothing",
        city: "there is nothing",
        zipCode: "there is nothing",
      },
    });

    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: stranger.toString(), email: "stranger@test.com" },
    });

    const req = new Request("http://localhost/api/order", {
      method: "PATCH",
      body: JSON.stringify({
        orderId: order._id.toString(),
        status: "cancelled",
      }),
    });
    const res = await PATCH(req);

    expect(res.status).toBe(401);
    const unchanged = await Order.findById(order._id);
    expect(unchanged.status).toBe("pending");
  });

  it("allows the owner to cancel their own order", async () => {
    const owner = new mongoose.Types.ObjectId();

    const order = await Order.create({
      userId: owner,
      orderId: "ORD-TEST-002",
      orderedItems: [],
      subtotal: 50,
      shippingCost: 0,
      tax: 4.38,
      total: 54.38,
      status: "pending",
      paymentMethod: "cod",
      shippingMethod: "standard",
      shippingForm: {
        firstName: "there is nothing",
        lastName: "there is nothing",
        email: "waleed@gmail.com",
        phone: "there is nothing",
        address: "there is nothing",
        city: "there is nothing",
        zipCode: "there is nothing",
      },
    });

    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: owner.toString(), email: "owner@test.com" },
    });

    const req = new Request("http://localhost/api/order", {
      method: "PATCH",
      body: JSON.stringify({
        orderId: order._id.toString(),
        status: "cancelled",
      }),
    });
    const res = await PATCH(req);

    expect(res.status).toBe(200);
    const updated = await Order.findById(order._id);
    expect(updated.status).toBe("cancelled");
  });
});
