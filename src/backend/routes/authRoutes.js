import express from "express";
import { registerUser, loginUser, getUserBalances, getBuyHistory, getSellHistory } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/balance", getUserBalances);
router.post("/buyHistory", getBuyHistory);
router.post("/sellHistory", getSellHistory);

export default router;
