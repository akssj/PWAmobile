import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/trade", tradeRoutes);

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
