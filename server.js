import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import webhookRoute from "./routes/webhook.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo Connected"))
  .catch(err => console.error(err));

app.use("/webhook", webhookRoute);

app.listen(3000, () => console.log("🚀 Server running on port 3000"));