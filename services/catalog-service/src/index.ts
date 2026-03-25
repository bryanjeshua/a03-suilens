import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { db } from "./db";
import { lenses } from "./db/schema";
import { eq } from "drizzle-orm";

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Catalog Service API",
          version: "1.0.0",
          description: "API for managing lens catalog in Suilens",
        },
        tags: [
          { name: "Lenses", description: "Lens catalog endpoints" },
          { name: "Health", description: "Health check" },
        ],
      },
    })
  )
  .get("/api/lenses", async () => {
    return db.select().from(lenses);
  }, {
    detail: {
      tags: ["Lenses"],
      summary: "Get all lenses",
      description: "Returns a list of all available lenses in the catalog",
    },
  })
  .get("/api/lenses/:id", async ({ params }) => {
    const results = await db
      .select()
      .from(lenses)
      .where(eq(lenses.id, params.id));
    if (!results[0]) {
      return new Response(JSON.stringify({ error: "Lens not found" }), {
        status: 404,
      });
    }
    return results[0];
  }, {
    params: t.Object({
      id: t.String({ format: "uuid", description: "Lens UUID" }),
    }),
    detail: {
      tags: ["Lenses"],
      summary: "Get lens by ID",
      description: "Returns a single lens by its UUID",
    },
  })
  .get("/health", () => ({ status: "ok", service: "catalog-service" }), {
    detail: {
      tags: ["Health"],
      summary: "Health check",
      description: "Returns the health status of the catalog service",
    },
  })
  .listen(3001);

console.log(`Catalog Service running on port ${app.server?.port}`);
