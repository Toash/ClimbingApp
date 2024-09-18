import express from "express";
import multer from "multer";
import {
  getFeedPosts,
  getUserPosts,
  likePost,
  commentPost,
  toggleLikeComment,
  deletePost,
  editPost,
  getHighestVGradePost,
} from "../controllers/posts.js";

const router = express.Router();

/* READ */
router.get("/", getFeedPosts);
router.get("/:userId", getUserPosts);
router.get("/:userId/hiscore", getHighestVGradePost);

/* UPDATE */
router.patch("/:id", editPost);
router.patch("/:id/like", likePost);
router.patch("/:postId/:commentId/like", toggleLikeComment);

// Add a new comment to a post
router.post("/:postId/comment", commentPost);

/* DELETE */
router.delete("/:id", deletePost);
export default router;
