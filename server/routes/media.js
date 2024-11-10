import express from "express";
import { compressMedia, getPresignedPutUrl } from "../controllers/media.js";

const router = express.Router();

router.get("/presigned-upload", getPresignedPutUrl);
router.post("/compress", compressMedia)

export default router;
