import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connection } from "../db.js";

export const registerUser = (req, res) => {
  const {email, password } = req.body;

  const query = "SELECT * FROM user WHERE email = ?";
  connection.query(query, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (result.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: "Error hashing password", error: err });

      const insertQuery = "INSERT INTO user (email, password) VALUES (?, ?)";
      connection.query(insertQuery, [email, hashedPassword], (err) => {
        if (err) return res.status(500).json({ message: "Error inserting user", error: err });
        return res.status(201).json({ message: "User registered successfully" });
      });
    });
  });
};

export const loginUser = (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM user WHERE email = ?";
  connection.query(query, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: "Error comparing passwords", error: err });

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, "secret", { expiresIn: "1h" });

      return res.status(200).json({ message: "Login successful", token });
    });
  });
};

export const getUserBalances = (req, res) => {
  verifyToken(req, res, async () => {
    const userId = req.user.id;

    try {
      const [result] = await connection.promise().query(
        "SELECT * FROM user_balances WHERE user_id = ?",
        [userId]
      );

      if (result.length === 0) {
        return res.status(404).json({ message: "No balances found for this user." });
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching user balances", error: error.message });
    }
  });
};


export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

