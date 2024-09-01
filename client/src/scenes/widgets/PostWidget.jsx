import { format } from "date-fns";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";

import { alpha } from "@mui/material/styles";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  Box,
  Divider,
  IconButton,
  Typography,
  TextField,
  Button,
  useTheme,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost, setPosts } from "state";

const PostWidget = ({
  createdAt,
  postId,
  postUserId,
  //user info
  name,
  userPicturePath,

  //climbing info
  vGrade,
  attempts,
  title,
  description,

  //media
  mediaPath,
  likes,
  comments,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);

  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isCurrentUserPost = loggedInUserId === postUserId;
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const formattedDate = format(new Date(createdAt), "MMMM d, yyyy");
  const { palette } = useTheme();

  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });

    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const postComment = async () => {
    if (newComment.trim() === "") return;

    const response = await fetch(
      `http://localhost:3001/posts/${postId}/comment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId, comment: newComment }),
      }
    );
    console.log("test");
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
    setNewComment("");
  };

  const deletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        // Send the DELETE request to the server
        const response = await fetch(`http://localhost:3001/posts/${postId}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          window.location.reload(); // this is inefficient, but deletion happens rarely so should be fine for now
        } else {
          console.error("Failed to delete the post");
        }
      } catch (error) {
        console.error("An error occurred while deleting the post:", error);
      }
    }
  };

  // replace original fields with "edited" fields
  const updatePost = async () => {
    try {
      // Create a JSON object with the edited data
      const updatedData = {
        title: editedTitle,
        description: editedDescription,
      };

      // Send PATCH request with JSON payload
      const response = await fetch(`http://localhost:3001/posts/${postId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`, // Authorization header
          "Content-Type": "application/json", // Content-Type header to indicate JSON
        },
        body: JSON.stringify(updatedData), // Convert the object to a JSON string
      });

      if (response.ok) {
        const updatedPost = await response.json();
        dispatch(setPost({ post: updatedPost }));
        setIsEditing(false); // Exit edit mode after saving
      } else {
        console.error("Failed to update the post");
      }
    } catch (error) {
      console.error("An error occurred while updating the post:", error);
    }
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Box display="flex">
        <Box flex="1">
          <Friend
            friendId={postUserId}
            name={name}
            userPicturePath={userPicturePath}
          />
        </Box>
        {isCurrentUserPost && (
          <>
            <IconButton
              sx={{
                backgroundColor: alpha(palette.info.light, 0.1),
                color: palette.info.main,
                height: "2.5rem",
                width: "2.5rem",
                marginRight: "0.5rem",
              }}
              onClick={() => setIsEditing(!isEditing)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              sx={{
                backgroundColor: alpha(palette.error.light, 0.1),
                color: palette.error.main,
                height: "2.5rem",
                width: "2.5rem",
              }}
              onClick={() => deletePost()}
            >
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Box>
      {/* TITLE AND GRADE */}
      <Typography color={main} sx={{ mt: "1rem", fontSize: "2rem" }}>
        {vGrade !== null ? title + " - V" + vGrade : title}
      </Typography>

      {/* ATTEMPTS */}
      <Typography color={main} sx={{ mt: "1rem", fontSize: "1rem" }}>
        {attempts
          ? attempts !== 1
            ? attempts + " Attempts "
            : "Flash⚡︎"
          : null}
      </Typography>

      {/* MEDIA */}
      {mediaPath && (
        <>
          {mediaPath.endsWith(".mp4") ||
          mediaPath.endsWith(".mov") ||
          mediaPath.endsWith(".avi") ? (
            <video
              width="100%"
              height="auto"
              controls
              style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
            >
              <source
                src={`http://localhost:3001/assets/${mediaPath}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              width="100%"
              height="auto"
              alt="post"
              style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
              src={`http://localhost:3001/assets/${mediaPath}`}
            />
          )}
        </>
      )}

      {/* DESCRIPTION */}
      <Typography color={main} sx={{ mt: "1rem", fontSize: "1rem" }}>
        {description}
      </Typography>

      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          {/* LIKES */}
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>
          {/* COMMENT SECTION */}
          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>
        {/* DATE */}
        <Typography color={main} sx={{ fontSize: "0.875rem" }}>
          {formattedDate}
        </Typography>
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          {comments.map((comment, i) => (
            <Box
              key={`${name}-${i}`}
              display="flex"
              alignItems="center"
              mb="0.5rem"
            >
              <Avatar
                src={`http://localhost:3001/assets/${comment.userPicturePath}`}
              />
              <Box ml="1rem">
                <Typography sx={{ color: main }}>{comment.userName}</Typography>
                <Typography sx={{ color: main, pl: "1rem" }}>
                  {comment.comment}
                </Typography>
              </Box>
            </Box>
          ))}
          <Divider />
        </Box>
      )}

      {/* COMMENT SOMETHING */}
      <Divider />
      <Box mt="1rem">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Comment something..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: "0.5rem" }}
          onClick={postComment}
        >
          Post Comment
        </Button>
      </Box>
      {/* Edit Post Dialog */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)}>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            variant="outlined"
            label="Title"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Description"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            multiline
            rows={4}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={updatePost} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetWrapper>
  );
};

export default PostWidget;
