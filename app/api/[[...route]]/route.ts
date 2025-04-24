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

export const GET = handle(app);