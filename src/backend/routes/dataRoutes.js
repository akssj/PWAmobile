import express from "express";
import { getExchangeRates, getCurrencyHistory } from '../controllers/dataController.js';

const router = express.Router();

router.get('/getExchangeRates', getExchangeRates);
router.get('/getCurrencyHistory/:currencyCode', getCurrencyHistory);

export default router;
