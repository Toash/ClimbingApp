import express from "express";
import { exchangeCode, refreshTokens } from "../controllers/auth";

const router = express.Router();

router.post("/exchange-code", exchangeCode);
router.post("/refresh-token", refreshTokens);

export default router;
