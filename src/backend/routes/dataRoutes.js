import express from "express";
import { getTestData } from '../controllers/dataController.js';

const router = express.Router();

router.get('/testdata', getTestData);

export default router;
