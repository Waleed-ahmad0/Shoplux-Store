import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Helper to create URL-safe slug from product name
const createSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-');     // Replace multiple hyphens with single
};

export async function POST(req) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files");
        const productName = formData.get("productName") || "product";

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

        // Create directory if it doesn't exist
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const uploadedUrls = [];
        const slug = createSlug(productName);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file || typeof file === "string") continue;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate filename with only product name
            const extension = file.name.split(".").pop();
            const imageIndex = files.length > 1 ? `-${i + 1}` : '';
            const filename = `${slug}${imageIndex}.${extension}`;
            const filepath = path.join(uploadDir, filename);

            await writeFile(filepath, buffer);
            uploadedUrls.push(`/uploads/products/${filename}`);
        }

        return NextResponse.json({
            success: true,
            urls: uploadedUrls
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
