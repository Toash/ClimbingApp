import express from "express";
import { exchangeCode } from "../controllers/auth";

const router = express.Router();

router.post("/exchange-code", exchangeCode);
router.post("/refresh-token");

export default router;
