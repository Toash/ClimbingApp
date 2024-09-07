import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userImage: { type: String },
    name: { type: String, required: true },
    comment: { type: String, required: true },
    likeCount: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
