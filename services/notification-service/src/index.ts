import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { db } from "./db";
import { notifications } from "./db/schema";
import { startConsumer } from "./consumer";
import { addClient, removeClient } from "./ws";

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Notification Service API",
          version: "1.0.0",
          description:
            "API for notifications in Suilens. Provides WebSocket endpoint for real-time order notifications.",
        },
        tags: [
          { name: "Notifications", description: "Notification endpoints" },
          { name: "Health", description: "Health check" },
        ],
      },
    })
  )
  .get(
    "/api/notifications",
    async () => {
      return db.select().from(notifications);
    },
    {
      detail: {
        tags: ["Notifications"],
        summary: "Get all notifications",
        description: "Returns a list of all notifications",
      },
    }
  )
  .get("/health", () => ({ status: "ok", service: "notification-service" }), {
    detail: {
      tags: ["Health"],
      summary: "Health check",
      description: "Returns the health status of the notification service",
    },
  })
  .ws("/ws", {
    open(ws) {
      addClient(ws);
      console.log("WebSocket client connected");
    },
    close(ws) {
      removeClient(ws);
      console.log("WebSocket client disconnected");
    },
    message(ws, message) {
      // No-op: server only sends, doesn't receive
    },
  })
  .listen(3003);

startConsumer().catch(console.error);

console.log(`Notification Service running on port ${app.server?.port}`);
