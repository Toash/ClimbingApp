import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    console.log("creating post...");
    const { userId, description } = req.body;
    const picturePath = req.files.picture
      ? req.files.picture[0].filename
      : null;
    const videoPath = req.files.video ? req.files.video[0].filename : null;

    const user = await User.findById(userId);

    const firstName = user.firstName;
    const lastName = user.lastName;
    const userPicturePath = user.picturePath;

    const newPostData = {
      userId,
      firstName,
      lastName,
      description,
      picturePath,
      userPicturePath,
      videoPath,
      likes: {},
      comments: [],
    };

    console.log("!!!!!");
    console.log(newPostData);

    const newPost = new Post(newPostData);
    await newPost.save();

    const posts = await Post.find();
    res.status(201).json(posts); //send posts in res
  } catch (err) {
    res.status(409).json({ message: err.message });
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

    const post = await Post.findById(postId);
    if (post) {
      post.comments.push({ userId, comment });
      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(404).send("Post not found");
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
