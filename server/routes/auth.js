import express from "express";
import { checkToken, exchangeCode } from "../controllers/auth.js";

const router = express.Router();

router.post("/exchange-code", exchangeCode);
//router.post("/refresh-token", refreshTokens); moved to seperate lambda
router.get("/check-token", checkToken);

export default router;
