import express from "express";
import multer from "multer";
import {
  getFeedPosts,
  getUserPosts,
  likePost,
  commentPost,
  deletePost,
  editPost,
  getHighestVGradePost,
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId", verifyToken, getUserPosts);
router.get("/:userId/hiscore", verifyToken, getHighestVGradePost);

/* UPDATE */
router.patch("/:id", verifyToken, editPost);
router.patch("/:id/like", verifyToken, likePost);

// Add a new comment to a post
router.post("/:postId/comment", verifyToken, commentPost);

/* DELETE */
router.delete("/:id", verifyToken, deletePost);
export default router;
