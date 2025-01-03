import express from "express";
import { registerUser, loginUser, verifyToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({ message: "Protected data", user: req.user });
});

export default router;
