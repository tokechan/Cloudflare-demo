import { files } from "@/db/schema";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const app = new Hono().basePath("/api");

app.get("/files", async (c) => {
    const db = drizzle(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (getCloudflareContext().env as any).DB as unknown as D1Database
    );
    const filesResponse = await db.select().from (files);
    return c.json(filesResponse);
});

app.post("/upload", async (c) => {
    const formData = await c.req.formData();
    const fileData = formData.get("file");
    const expirationDays = Number(formData.get("expiration"));

    if (!fileData) {
        return c.json({ success: false, message: "No file uploaded" }, 400);
    }
    const file = fileData as File;
    const fileName = file.name;
    const filePath = `uploads/${Date.now()}-${fileName}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    try {
        const db = drizzle(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getCloudflareContext().env as any).DB as unknown as D1Database
        );

        await db.insert(files).values({
            fileName,
            filePath,
            contentType: file.type,
            expiresAt: expiresAt.toISOString(),
        });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return c.json(
            { success: false, message: "Failed to upload file" },
            500
        );
    }
        
    return c.json({ success: true, message: "File uploaded successfully" });
    });

export const GET = handle(app);
export const POST = handle(app);