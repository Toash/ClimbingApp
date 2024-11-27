import Post from "../models/Post.js";
import User from "../models/User.js";
import { S3Client, DeleteObjectCommand, waitUntilObjectNotExists, S3ServiceException } from "@aws-sdk/client-s3";
import updateHiscore from "./helpers/updateHiscore.js";
import getWeekDates from "./helpers/getWeekDates.js";

// returns json with errors if there are any int he postData
const validatePostInput = (postData) => {
  const errors = {};
  if (!postData.title || postData.title.trim() === "") {
    errors.title = "Title is required";
  }
  if (isNaN(postData.vGrade) || postData.vGrade < 0 || postData.vGrade > 17) {
    errors.vGrade = "A valid V-Grade is required";
  }
  if (!postData.attempts || isNaN(postData.attempts) || postData.attempts < 0) {
    errors.attempts = "A valid number of attempts is required";
  }
  if (postData.climbDate && isNaN(new Date(postData.climbDate).getTime())) {
    errors.climbDate = "A valid date is required";
  }
  return Object.keys(errors).length > 0 ? errors : null;
};

/* CREATE */
/**
 * Creates / edits a post and then updates the user hiscore
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const logClimb = async (req, res) => {

  try {
    const {
      userId,
      title,
      vGrade,
      angle,
      holds,
      styles,
      attempts,
      description,
      mediaPath,

      climbDate,
      edit
    } = req.body;

    let postId;
    if (edit === "true") {
      ({ postId } = req.params)
    }

    const validationErrors = validatePostInput({
      title,
      vGrade,
      attempts,
      climbDate
    });
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validationErrors });
    }

    // get user info
    const user = await User.findOne({ cid: userId });
    if (!user) {
      throw new Error(
        `Cannot find User with cid ${userId} when trying to make a new post.`
      );
    }
    const firstName = user.firstName;
    const lastName = user.lastName;
    const userPicturePath = user.picturePath;

    // convert comma seperated strings to arrays
    const holdsArray = holds.split(",");
    const stylesArray = styles.split(",");

    const newPostData = {
      cid: userId,
      firstName,
      lastName,
      userPicturePath,

      title,
      description,
      vGrade,
      attempts,
      angle,
      holds: holdsArray,
      styles: stylesArray,

      mediaPath,

      likes: {},
      comments: [],
    };

    if (climbDate) {
      newPostData.climbDate = climbDate;
    }


    if (edit === "true") {
      // edit post
      if (!postId) throw new Error("post id must be defined when editing a post.")

      //remove undefined values.
      const editedPostData = Object.fromEntries(
        Object.entries(newPostData).filter(([_, value]) => value !== undefined)
      );

      const result = await Post.findByIdAndUpdate(postId, { $set: editedPostData })

      if (!result) {
        res.status(404).json({ message: "Could not find the post when updating." })
      }

    } else {
      // create post
      const newPost = new Post(newPostData);
      await newPost.save();
    }


    //update user highscore
    await updateHiscore(userId);


    res.status(201).json({ message: "Successfully logged climb." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// deletes post and associated media if it exists.
export const deletePost = async (req, res) => {

  const userId = req.query.userId;
  const { postId } = req.params;

  if (!userId) {
    throw new Error("userId must be specified in query parameters when deleting.")
  }
  if (!postId) {
    throw new Error("postId must be specified in the URL when deleting.")
  }

  let mediaDeleted = false;


  const deleteObject = async (fullS3Key) => {
    const url = new URL(fullS3Key);
    // The pathname gives us everything after the domain
    const s3key = url.pathname.substring(1); // Remove the leading "/"


    const client = new S3Client({ region: "us-east-2" })
    try {
      await client.send(new DeleteObjectCommand({
        Bucket: process.env.MEDIA_BUCKET,
        Key: s3key
      }))
      await waitUntilObjectNotExists(
        { client },
        { Bucket: process.env.MEDIA_BUCKET, Key: s3key }
      )
      console.log(`Object with key ${s3key} was deleted from media bucket, or it never existed in the first place.`)

    } catch (caught) {
      if (
        caught instanceof S3ServiceException &&
        caught.name === "NoSuchBucket"
      ) {
        console.error(
          `Error from S3 while deleting object. The bucket doesn't exist.`,
        );
      } else if (caught instanceof S3ServiceException) {
        console.error(
          `Error from S3 while deleting object. ${caught.name}: ${caught.message}`,
        );
      } else {
        throw caught;
      }
    }
  }
  try {


    // Ensure media attach to post is also deleted if it exists.
    const postToDelete = await Post.findById(postId);
    const mediaPath = postToDelete?.mediaPath;
    if (mediaPath) {
      //delete s3 object
      try {
        await deleteObject(mediaPath)
        console.log("S3 object at " + mediaPath + " successfully deleted.")
        mediaDeleted = true;
      } catch (e) {
        res.status(500).json({ message: e.message });
        console.log("error trying to delete bucket, " + e.message)
      }

    }

    // Find and delete the post by id
    const deletedPost = await Post.findByIdAndDelete(postId);

    //update user highscore
    await updateHiscore(userId);

    if (deletedPost) {
      if (mediaDeleted) {
        res
          .status(200)
          .json({ message: "Post deleted successfully along with associated media.", deletedPost });
      } else {
        res
          .status(200)
          .json({ message: "Post deleted successfully.", deletedPost });
      }

    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* READ */

// this assumes that the pageSize is always constant when calling the function again and again.
export const getFeedPosts = async (req, res) => {
  try {

    const { pageSize, pageNumber } = req.query;

    if (Number(pageSize) <= 0 || Number(pageNumber) < 0) {
      res.status(400).json({ message: "Page size must be positive and page number must be greater than 0." })
    }

    const totalPosts = await Post.countDocuments();

    const posts = await Post.find().sort({ climbDate: -1 }).skip(Number(pageNumber) * Number(pageSize)).limit(Number(pageSize))

    // calculate the next cursor.
    const postsGotSoFar = (Number(pageNumber) + 1) * Number(pageSize);
    const nextPageNumber = Number(totalPosts) > Number(postsGotSoFar) ? Number(pageNumber) + 1 : null;

    // return nextCursor, the starting item number.
    // nextPageNumber will be null when there is no more items left.
    res.status(200).json({ data: posts, nextPageNumber });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


export const getHighestVGradePost = async (req, res) => {
  try {
    // console.log("GETTING HIGHEST V GRADE POST");
    const { userId } = req.params;

    // Find all posts associated with a user, and sort them by v grade is descending. Pick the first one
    const post = await Post.find({ cid: userId }).sort({ vGrade: -1 }).limit(1);

    if (post.length > 0) {
      res.status(200).json(post[0]);
    } else {
      res.status(404).json({ message: "No posts found for this user" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to get posts for the current week
export const getWeeklyPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = getWeekDates();

    const posts = await Post.find({
      cid: userId,
      climbDate: { $gte: startDate, $lte: endDate },
    }).sort({ climbDate: -1 });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* UPDATE */
/**
 * Uses _id to keep track of who likes.
 * @param {*} req
 * @param {*} res
 */
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(postId);
    const isLiked = post.likes.get(userId); // get in map

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, comment } = req.body;

    const user = await User.findOne({ cid: userId });
    const name = user.firstName + " " + user.lastName;
    const userImage = user.picturePath;

    const post = await Post.findById(postId);
    if (post) {
      const newComment = {
        userId,
        userImage,
        name,
        comment,
        likeCount: new Map(),
      };

      post.comments.push(newComment);
      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(404).json({ message: "Cannot find post" });
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const toggleLikeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    //toggle like
    if (comment.likeCount.get(userId)) {
      comment.likeCount.delete(userId);
    } else {
      comment.likeCount.set(userId, true);
    }

    await post.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
