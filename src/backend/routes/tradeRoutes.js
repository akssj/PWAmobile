import express from "express";
import { addFunds, purchaseCurrency, sellCurrency } from '../controllers/tradeController.js';

const router = express.Router();

router.post('/addFunds', addFunds);
router.post('/purchase', purchaseCurrency);
router.post('/sell', sellCurrency);

export default router;
