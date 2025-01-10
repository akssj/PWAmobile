import express from "express";
import { registerUser, loginUser, getUserBalances } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/balance", getUserBalances);

export default router;
