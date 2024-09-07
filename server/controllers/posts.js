import Post from "../models/Post.js";
import User from "../models/User.js";

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
  if (postData.createdAt && isNaN(new Date(postData.createdAt).getTime())) {
    errors.createdAt = "A valid date is required";
  }
  return Object.keys(errors).length > 0 ? errors : null;
};

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, title, vGrade, attempts, description, createdAt } =
      req.body;

    const validationErrors = validatePostInput({
      title,
      vGrade,
      attempts,
      createdAt,
    });
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validationErrors });
    }

    const mediaPath = req.file ? req.file.filename : null;

    // get user info
    const user = await User.findById(userId);
    const firstName = user.firstName;
    const lastName = user.lastName;
    const userPicturePath = user.picturePath;

    const newPostData = {
      userId,
      firstName,
      lastName,
      userPicturePath,

      title,
      description,
      vGrade,
      attempts,

      mediaPath,

      likes: {},
      comments: [],
    };

    if (createdAt) {
      newPostData.createdAt = createdAt;
    }

    const newPost = new Post(newPostData);
    await newPost.save();

    const posts = await Post.find();
    res.status(201).json(posts); //send posts in res
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

export const editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, vGrade, attempts } = req.body;

    const validationErrors = validatePostInput({
      title,
      vGrade,
      attempts,
    });
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validationErrors });
    }

    const post = await Post.findById(id);
    // TODO: get the edited fields and update the corresponding post.
    if (post) {
      post.title = title;
      post.description = description;
      post.vGrade = vGrade;
      post.attempts = attempts;

      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(404).send("Post not found");
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params; // Get the postId from the request parameters

    // Find and delete the post by id
    const deletedPost = await Post.findByIdAndDelete(id);

    if (deletedPost) {
      res
        .status(200)
        .json({ message: "Post deleted successfully", deletedPost });
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getHighestVGradePost = async (req, res) => {
  try {
    console.log("GETTING HIGHEST V GRADE POST");
    const { userId } = req.params;

    // get highest v grade
    const post = await Post.find({ userId }).sort({ vGrade: -1 }).limit(1);

    if (post.length > 0) {
      res.status(200).json(post[0]);
    } else {
      res.status(404).json({ message: "No posts found for this user" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
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

    const user = await User.findById(userId);
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
      res.status(404).json({ message: err.message });
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
