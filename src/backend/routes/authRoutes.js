import express from "express";
import { registerUser, loginUser, verifyToken } from "../controllers/authController.js";
import { getTestData } from '../controllers/dataController.js';

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({ message: "Protected data", user: req.user });
});

router.get('/test-data', getTestData);

export default router;
