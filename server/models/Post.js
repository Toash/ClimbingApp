import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  // ------------- USER ------------
  userId: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userPicturePath: String,

  // ------------- CLIMBING INFO -------------
  vGrade: Number,
  attempts: Number,
  title: String,
  description: String,

  // ------------- MEDIA -------------
  mediaPath: String,

  //map is more efficient than array for lookup O(1)
  likes: {
    type: Map,
    of: Boolean,
  },
  comments: {
    type: Array,
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);

export default Post;
