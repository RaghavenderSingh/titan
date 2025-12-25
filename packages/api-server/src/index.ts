import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { authRouter } from "./routes/auth";
import { webhookRouter } from "./routes/webhook";
import { projectRouter } from "./routes/project";
import { deploymentRouter } from "./routes/deployment";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.set("io", io);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/webhooks", webhookRouter);
app.use("/api/projects", projectRouter);
app.use("/api/deployments", deploymentRouter);

app.use(errorHandler);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("subscribe-deployment", (deploymentId: string) => {
    socket.join(`deployment:${deploymentId}`);
    console.log(`Client subscribed to deployment: ${deploymentId}`);
  });

  socket.on("unsubscribe-deployment", (deploymentId: string) => {
    socket.leave(`deployment:${deploymentId}`);
    console.log(`Client unsubscribed from deployment: ${deploymentId}`);
  });

  // Handle deployment log events from build worker and broadcast to subscribers
  socket.on("deployment-log", (data: { deploymentId: string; log: string; timestamp: string }) => {
    console.log(`Log for deployment ${data.deploymentId}:`, data.log.substring(0, 100));
    // Broadcast to all clients subscribed to this deployment
    io.to(`deployment:${data.deploymentId}`).emit("deployment-log", data);
  });

  // Handle deployment status updates from build worker and broadcast to subscribers
  socket.on("deployment-update", (data: { deploymentId: string; status: string; logs?: string; timestamp: string }) => {
    console.log(`Status update for deployment ${data.deploymentId}:`, data.status);
    // Broadcast to all clients subscribed to this deployment
    io.to(`deployment:${data.deploymentId}`).emit("deployment-update", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(` API Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});

export { io };
