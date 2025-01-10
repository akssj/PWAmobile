import express from "express";
import { getTestData, getExchangeRates } from '../controllers/dataController.js';

const router = express.Router();

router.get('/testdata', getTestData);
router.get('/getExchangeRates', getExchangeRates);

export default router;
