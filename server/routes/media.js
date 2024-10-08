import express from "express";
import { getPresignedPutUrl } from "../controllers/media.js";

const router = express.Router();

router.get("/presigned-upload", getPresignedPutUrl);

export default router;
