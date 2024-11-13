import mongoose from "mongoose";
import Comment from "./Comment.js";

const postSchema = new mongoose.Schema(
  {
    // ------------- USER ------------
    cid: {
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
    angle: String,

    holds: Array,
    styles: Array,


    title: String,
    description: String,

    climbDate: Date,

    // ------------- MEDIA -------------
    // link to object in s3 bucket
    mediaPath: String,

    //map is more efficient than array for lookup O(1)
    likes: {
      type: Map,
      of: Boolean,
    },
    // make sure it is comment schema
    comments: [Comment.schema],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
