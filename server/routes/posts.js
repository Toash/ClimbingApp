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
  createPost,
} from "../controllers/posts.js";

const router = express.Router();

/* READ */
router.get("/", getFeedPosts);
router.get("/user/:userId", getUserPosts);
router.get("/user/:userId/hiscore", getHighestVGradePost);

/* POST */
router.post("/", createPost);

/* UPDATE */
router.patch("/post/:postId", editPost);
router.patch("/post/:postId/like", likePost);
router.patch("/post/:postId/:commentId/like", toggleLikeComment);

// Add a new comment to a post
router.post("/post/:postId/comment", commentPost);

/* DELETE */
router.delete("/post/:postId", deletePost);
export default router;
