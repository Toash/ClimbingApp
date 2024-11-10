import express from "express";
import { compressMedia, getPresignedPutUrl } from "../controllers/media.js";

const router = express.Router();

router.get("/presigned-upload", getPresignedPutUrl);
//router.get("/compress", async (req, res) => res.status(200).json({ message: "Hello from the get request for media compression endpoint!" }))
router.get("/compress", async (req, res) => res.status(200))
router.post("/compress", compressMedia)

export default router;
