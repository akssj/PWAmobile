import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { connection } from "./db.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
