import { connection } from "../db.js";
import axios from "axios";
import jwt from 'jsonwebtoken';

export const addFunds = (req, res) => {
  const userId = req.body.user_id;
  const amount = 1000;

  connection.query(
    `SELECT * FROM user_balances WHERE user_id = ? AND currency = "PLN"`,
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Błąd bazy danych", error: err.message });
      }

      if (result.length > 0) {
        const newBalance = result[0].balance + amount;

        connection.query(
          `UPDATE user_balances SET balance = ?, updated_at = NOW() WHERE user_id = ? AND currency = "PLN"`,
          [newBalance, userId],
          (err) => {
            if (err) {
              return res.status(500).json({ message: "Błąd podczas aktualizacji salda", error: err.message });
            }
            return res.status(200).json({ message: `Saldo zostało zasilone o ${amount} PLN.` });
          }
        );
      } else {
        connection.query(
          `INSERT INTO user_balances (user_id, currency, balance) VALUES (?, "PLN", ?)`,
          [userId, amount],
          (err) => {
            if (err) {
              return res.status(500).json({ message: "Błąd podczas dodawania salda", error: err.message });
            }
            return res.status(200).json({ message: `Utworzono nowe saldo w PLN i zasilono je o ${amount}.` });
          }
        );
      }
    }
  );
};

export const purchaseCurrency = async (req, res) => {
  const { target_currency, amount, authorization } = req.body;

  if (!authorization) {
    return res.status(401).json({ message: 'Brak tokenu uwierzytelniającego.' });
  }

  try {
    const decodedToken = jwt.verify(authorization, "secret");
    const user_id = decodedToken.id;

    if (!user_id) {
      return res.status(401).json({ message: 'Nieprawidłowy token.' });
    }

    const source_currency = 'PLN';

    const [result] = await connection.promise().query(
      `SELECT * FROM user_balances WHERE user_id = ? AND currency = ?`,
      [user_id, source_currency]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono salda w PLN.' });
    }

    const sourceBalance = result[0].balance;

    const { ask } = await getExchangeRate(target_currency);

    const requiredPLN = amount * ask;

    if (sourceBalance < requiredPLN) {
      return res.status(400).json({ message: 'Brak wystarczających środków w PLN.' });
    }

    await connection.promise().query(
      `UPDATE user_balances SET balance = balance - ?, updated_at = NOW() WHERE user_id = ? AND currency = ?`,
      [requiredPLN, user_id, source_currency]
    );

    const [targetResult] = await connection.promise().query(
      `SELECT * FROM user_balances WHERE user_id = ? AND currency = ?`,
      [user_id, target_currency]
    );

    if (targetResult.length > 0) {
      const newTargetBalance = targetResult[0].balance + amount;
      await connection.promise().query(
        `UPDATE user_balances SET balance = ?, updated_at = NOW() WHERE user_id = ? AND currency = ?`,
        [newTargetBalance, user_id, target_currency]
      );
    } else {
      await connection.promise().query(
        `INSERT INTO user_balances (user_id, currency, balance) VALUES (?, ?, ?)`,
        [user_id, target_currency, amount]
      );
    }

    return res.status(200).json({
      message: `Zakupiono ${amount.toFixed(2)} ${target_currency} za ${requiredPLN.toFixed(2)} PLN po kursie sprzedaży (ask) ${ask.toFixed(4)}.`,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Błąd podczas realizacji transakcji.',
      error: error.message,
    });
  }
};


export const sellCurrency = async (req, res) => {
  const { user_id, source_currency, target_currency, amount } = req.body;

  try {
    const [result] = await connection.promise().query(
      `SELECT * FROM user_balances WHERE user_id = ? AND currency = ?`,
      [user_id, source_currency]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Nie znaleziono salda w wybranej walucie." });
    }

    const sourceBalance = result[0].balance;

    if (sourceBalance < amount) {
      return res.status(400).json({ message: "Brak wystarczających środków w wybranej walucie." });
    }

    const { bid } = await getExchangeRate(source_currency);

    const targetAmount = amount * bid;

    await connection.promise().query(
      `UPDATE user_balances SET balance = balance - ?, updated_at = NOW() WHERE user_id = ? AND currency = ?`,
      [amount, user_id, source_currency]
    );

    const [targetResult] = await connection.promise().query(
      `SELECT * FROM user_balances WHERE user_id = ? AND currency = ?`,
      [user_id, target_currency]
    );

    if (targetResult.length > 0) {
      const newTargetBalance = targetResult[0].balance + targetAmount;
      await connection.promise().query(
        `UPDATE user_balances SET balance = ?, updated_at = NOW() WHERE user_id = ? AND currency = ?`,
        [newTargetBalance, user_id, target_currency]
      );
    } else {
      await connection.promise().query(
        `INSERT INTO user_balances (user_id, currency, balance) VALUES (?, ?, ?)`,
        [user_id, target_currency, targetAmount]
      );
    }

    return res.status(200).json({
      message: `Sprzedano ${amount} ${source_currency} za ${targetAmount.toFixed(2)} ${target_currency} po kursie bid ${bid}.`,
    });

  } catch (error) {
    return res.status(500).json({ message: "Błąd podczas realizacji transakcji", error: error.message });
  }
};

export const getExchangeRate = async (Currency) => {
  try {
    const url = `https://api.nbp.pl/api/exchangerates/rates/C/${Currency}/?format=json`;
    const response = await axios.get(url);
    const { bid, ask } = response.data.rates[0];
    return { bid, ask };
  } catch (error) {
    throw new Error("Błąd podczas pobierania kursu wymiany.");
  }
};



