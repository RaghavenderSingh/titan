import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";
import { webhookRouter } from "./routes/webhook";
import { projectRouter } from "./routes/project";
import { deploymentRouter } from "./routes/deployment";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/webhooks", webhookRouter);
app.use("/api/projects", projectRouter);
app.use("/api/deployments", deploymentRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});
