import express from "express";
import { getTestData, getExchangeRates, getCurrencyHistory } from '../controllers/dataController.js';

const router = express.Router();

router.get('/testdata', getTestData);
router.get('/getExchangeRates', getExchangeRates);
router.get('/getCurrencyHistory/:currencyCode', getCurrencyHistory);

export default router;
