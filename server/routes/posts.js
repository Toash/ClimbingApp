import express from "express";
import multer from "multer";
import {
  getFeedPosts,
  likePost,
  commentPost,
  toggleLikeComment,
  deletePost,
  editPost,
  getHighestVGradePost,
  logClimb,
  getWeeklyUserPosts,
  getUserPosts,
} from "../controllers/posts.js";
const router = express.Router();

// use temporary storage and access it in the backend to upload, store file in memory as Buffer object
// "When using memory storage, the file info will contain a field called buffer that contains the entire file.""
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* READ */
router.get("/", getFeedPosts);
router.get("/user/:userId/weekly", getWeeklyUserPosts);
router.get("/user/:userId", getUserPosts);
//router.get("/user/:userId", getUserPosts);
router.get("/user/:userId/hiscore", getHighestVGradePost);

/* POST */
// Will send the media (picture, video) in req.file
router.post("/", upload.none(), logClimb);

/* UPDATE */
router.patch("/post/:postId", upload.none(), logClimb);
router.patch("/post/:postId/like", likePost);
router.patch("/post/:postId/:commentId/like", toggleLikeComment);

// Add a new comment to a post
router.post("/post/:postId/comment", commentPost);

/* DELETE */
router.delete("/post/:postId", deletePost);
export default router;
