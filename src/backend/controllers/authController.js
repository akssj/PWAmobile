import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connection } from "../db.js";

const SECRET_KEY = "secret";

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
};

// Weryfikacja tokena
const verifyToken = (req, res, next) => {
  const token = req.body.authorization;

  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

// Rejestracja użytkownika
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [existingUser] = await connection.promise().query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    await connection.promise().query(
      "INSERT INTO user (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    const [newUser] = await connection.promise().query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    const userId = newUser[0].id;

    await connection.promise().query(
      "INSERT INTO user_balances (user_id, currency, balance) VALUES (?, 'PLN', ?)",
      [userId, 1000]
    );

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error during registration", error: err.message });
  }
};

// Logowanie użytkownika
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await connection.promise().query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await verifyPassword(password, user[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user[0]);
    return res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    return res.status(500).json({ message: "Error during login", error: err.message });
  }
};

// Pobieranie sald użytkownika
export const getUserBalances = async (req, res) => {
  verifyToken(req, res, async () => {
    const userId = req.user.id;

    try {
      const [balances] = await connection.promise().query(
        "SELECT * FROM user_balances WHERE user_id = ?",
        [userId]
      );

      if (balances.length === 0) {
        return res.status(404).json({ message: "No balances found for this user." });
      }

      return res.status(200).json(balances);
    } catch (err) {
      return res.status(500).json({ message: "Error fetching balances", error: err.message });
    }
  });
};

// Pobieranie historii zakupu użytkownika
export const getBuyHistory = async (req, res) => {
  verifyToken(req, res, async () => {
    const userId = req.user.id;

    try {
      const [buyHistory] = await connection.promise().query(
        "SELECT * FROM user_buy_history WHERE user_id = ?",
        [userId]
      );

      if (buyHistory.length === 0) {
        return res.status(200).json({ message: "No buy history found for this user." });
      }

      return res.status(200).json(buyHistory);
    } catch (err) {
      return res.status(500).json({ message: "Error fetching buy history", error: err.message });
    }
  });
};

// Pobieranie historii sprzedaży użytkownika
export const getSellHistory = async (req, res) => {
  verifyToken(req, res, async () => {
    const userId = req.user.id;

    try {
      const [sellHistory] = await connection.promise().query(
        "SELECT * FROM user_sell_history WHERE user_id = ?",
        [userId]
      );

      if (sellHistory.length === 0) {
        return res.status(200).json({ message: "No sell history found for this user." });
      }

      return res.status(200).json(sellHistory);
    } catch (err) {
      return res.status(500).json({ message: "Error fetching sell history", error: err.message });
    }
  });
};
