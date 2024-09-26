import { format } from "date-fns";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
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
import { setPost } from "state";
import refreshAccessToken from "refreshAccessToken";

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
  const [editedVGrade, setEditedVGrade] = useState(vGrade);
  const [editedAttempts, setEditedAttempts] = useState(attempts);
  const [editedDate, setEditedDate] = useState(createdAt);

  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);

  //logged in user info
  const loggedIn = useSelector((state) => state.user);
  const loggedInUserId = useSelector((state) => state.user?._id);

  const isCurrentUserPost = loggedInUserId === postUserId;
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const formattedDate = format(new Date(createdAt), "MMMM d, yyyy");
  const { palette } = useTheme();

  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(
      process.env.REACT_APP_API_BASE_URL + `/posts/post/${postId}/like`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId }),
      }
    );
    if (response.status == 401) {
      console.log("Unauthorized request... attempting to refresh token.");
      await refreshAccessToken(dispatch);
    }

    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const postComment = async () => {
    if (newComment.trim() === "") return;

    const response = await fetch(
      process.env.REACT_APP_API_BASE_URL + `/posts/post/${postId}/comment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: loggedInUserId,
          comment: newComment,
        }),
      }
    );

    if (response.status == 401) {
      console.log("Unauthorized request... attempting to refresh token.");
      await refreshAccessToken(dispatch);
    }
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
    setNewComment("");
  };
  const toggleLikeComment = async (commentId) => {
    const response = await fetch(
      process.env.REACT_APP_API_BASE_URL +
        `/posts/post/${postId}/${commentId}/like`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: loggedInUserId,
        }),
      }
    );
    if (response.status == 401) {
      console.log("Unauthorized request... attempting to refresh token.");
      await refreshAccessToken(dispatch);
    }
  };

  const deletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(
          process.env.REACT_APP_API_BASE_URL + `/posts/post/${postId}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status == 401) {
          console.log("Unauthorized request... attempting to refresh token.");
          await refreshAccessToken(dispatch);
        }

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
        vGrade: editedVGrade,
        attempts: editedAttempts,
        createdAt: editedDate,
      };

      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL + `/posts/post/${postId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );
      if (response.status == 401) {
        console.log("Unauthorized request... attempting to refresh token.");
        await refreshAccessToken(dispatch);
      }

      if (response.ok) {
        const updatedPost = await response.json();
        dispatch(setPost({ post: updatedPost }));
        setIsEditing(false);
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
        {loggedIn && isCurrentUserPost && (
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
      <Typography
        color={main}
        sx={{ mt: "0rem", mb: "1rem", fontSize: "1rem" }}
      >
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
                src={
                  process.env.REACT_APP_API_BASE_URL + `/assets/${mediaPath}`
                }
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
              src={process.env.REACT_APP_API_BASE_URL + `/assets/${mediaPath}`}
            />
          )}
        </>
      )}

      {/* DESCRIPTION */}
      <Typography color={main} sx={{ mt: "1rem", fontSize: "1rem" }}>
        {description}
      </Typography>

      <FlexBetween mt="2rem">
        <FlexBetween gap="1rem">
          {/* LIKES */}
          <FlexBetween gap="0.3rem">
            {loggedIn ? (
              <>
                <IconButton onClick={patchLike}>
                  {isLiked ? (
                    <FavoriteOutlined sx={{ color: primary }} />
                  ) : (
                    <FavoriteBorderOutlined />
                  )}
                </IconButton>
              </>
            ) : (
              <FavoriteBorderOutlined />
            )}
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

      <Divider></Divider>
      {isComments && (
        <>
          <Box>
            {/* Display all comments from array */}
            {comments.map((comment, i) => (
              //comment
              <Box display="flex" alignItems="center" marginTop="1rem">
                <Box
                  key={`${name}-${i}`}
                  display="flex"
                  alignItems="center"
                  mb="0.5rem"
                >
                  <Avatar
                    src={
                      process.env.REACT_APP_API_BASE_URL +
                      `/assets/${comment.userImage}`
                    }
                  />
                  <Box
                    ml="1rem"
                    flex="1"
                    sx={{
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography sx={{ color: main }}>
                      <strong>{comment.name}</strong> {comment.comment}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    ml: "auto",
                  }}
                >
                  {/* LIKE COMMENT */}
                  {loggedIn && (
                    <>
                      <FlexBetween gap="1rem">
                        <FlexBetween gap="0rem">
                          <IconButton
                            onClick={() => toggleLikeComment(comment._id)}
                          >
                            {comment.likeCount[loggedInUserId] ? (
                              <FavoriteOutlined sx={{ color: primary }} />
                            ) : (
                              <FavoriteBorderOutlined />
                            )}
                          </IconButton>
                          <Typography>{comment.likeCount.length}</Typography>
                        </FlexBetween>
                        <IconButton>
                          <DeleteIcon></DeleteIcon>
                        </IconButton>
                      </FlexBetween>
                    </>
                  )}
                </Box>
              </Box>
            ))}
            <Divider />
          </Box>
          {/* COMMENT SOMETHING */}
          <Divider />
          {loggedIn && (
            <>
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
            </>
          )}
        </>
      )}

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
            label="V-Grade"
            value={editedVGrade}
            onChange={(e) => setEditedVGrade(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Attempts"
            value={editedAttempts}
            onChange={(e) => setEditedAttempts(e.target.value)}
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
