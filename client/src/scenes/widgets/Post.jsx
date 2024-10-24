import React from "react";
import { useState } from "react";
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
import UserCard from "components/UserCard";
import WidgetWrapper from "components/WidgetWrapper";

import fetchWithRetry from "auth/fetchWithRetry";
import PropTypes from 'prop-types'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";
import useAuthenticatedUser from "data/useAuthenticatedUser";

const Post = ({
  createdAt,
  postId,
  postUserId,
  //user info
  name,
  picturePath,

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



  const likeCount = Object.keys(likes).length;

  const formattedDate = format(new Date(createdAt), "MMMM d, yyyy");

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const queryClient = useQueryClient();


  /**
   * Mutation to toggle like on post.
   */
  const togglePostLikeMutation = useMutation({
    mutationFn: async () => {
      await fetchWithRetry(
        process.env.REACT_APP_API_BASE_URL + `/posts/post/${postId}/like`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("id_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: data.cid }),
        }
      );

    }, onSuccess: () => {
      //invalid posts
      //TODO implement infinite scrolling
      queryClient.invalidateQueries(QUERY_KEYS.POSTS);
    }

  })

  /**
   * Mutation to post comment, accepts object containing comment.
   */
  const postCommentMutation = useMutation({
    mutationFn: async (variables) => {
      if (variables.comment.trim() === "") return;

      const response = fetchWithRetry(
        process.env.REACT_APP_API_BASE_URL + `/posts/post/${postId}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("id_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: data.cid,
            comment: variables.comment,
          }),
        }
      );
      setNewComment("");
    }, onSuccess: () => {
      //invalid posts
      //TODO implement infinite scrolling
      queryClient.invalidateQueries(QUERY_KEYS.POSTS);
    }
  })

  /**
   * Mutation to toggle like, accepts object containing commentId
   */
  const toggleCommentLikeMutation = useMutation({
    mutationFn: async (variables) => {
      await fetchWithRetry(
        process.env.REACT_APP_API_BASE_URL +
        `/posts/post/${postId}/${variables.commentId}/like`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("id_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: data.cid,
          }),
        }
      );
    }, onSuccess: () => {
      //invalid posts
      //TODO implement infinite scrolling
      queryClient.invalidateQueries(QUERY_KEYS.POSTS);
    }
  })

  /**
   * Mutation to delete post
   */
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      if (window.confirm("Are you sure you want to delete this post?")) {
        await fetchWithRetry(
          process.env.REACT_APP_API_BASE_URL + `/posts/post/${postId}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("id_token")}`,
            },
          }
        );
      }
    }, onSuccess: () => {
      //invalid posts
      //TODO implement infinite scrolling
      queryClient.invalidateQueries(QUERY_KEYS.POSTS);
    }
  })

  /**
   * Update post mutation
   */
  const updatePostMutation = useMutation({
    mutationFn: async () => {
      try {
        const updatedData = {
          title: editedTitle,
          description: editedDescription,
          vGrade: editedVGrade,
          attempts: editedAttempts,
          createdAt: editedDate,
        };

        const response = await fetchWithRetry(
          process.env.REACT_APP_API_BASE_URL + `/posts/post/${postId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("id_token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
          }
        );

        if (response.ok) {
          const updatedPost = await response.json();
          setIsEditing(false);
        } else {
          console.error("Failed to update the post");
        }
      } catch (error) {
        console.error("An error occurred while updating the post:", error);
      }
    }, onSuccess: () => {
      //invalid posts
      //TODO implement infinite scrolling
      queryClient.invalidateQueries(QUERY_KEYS.POSTS);
    }

  })

  const { data, isSuccess } = useAuthenticatedUser();

  const isCurrentUserPost = () => {
    if (isSuccess) {
      return data.cid === postUserId;
    }
    return false;
  }

  const isLiked = () => {
    if (isSuccess) {
      return !!likes[data.cid];
    }
    return false;
  }

  // inline styling is bloating this component so much
  return (
    <WidgetWrapper m="2rem 0">
      <Box display="flex">
        <Box flex="1">
          <UserCard
            friendId={postUserId}
          />
        </Box>
        {isCurrentUserPost() && (
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
              onClick={() => deletePostMutation.mutate()}
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
              <source src={mediaPath} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              width="100%"
              height="auto"
              alt="post"
              style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
              src={mediaPath}
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
            {isSuccess ? (
              <>
                <IconButton onClick={() => togglePostLikeMutation.mutate()}>
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
              <Box key={i} display="flex" alignItems="center" marginTop="1rem">
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
                  {isSuccess && (
                    <>
                      <FlexBetween gap="1rem">
                        <FlexBetween gap="0rem">
                          <IconButton
                            onClick={() => toggleCommentLikeMutation({ commentId: comment._id })}
                          >
                            {!!comment.likeCount[data.cid] ? (
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
          {isSuccess && (
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
                  onClick={postCommentMutation({ comment: newComment })}
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
          <Button onClick={() => updatePostMutation.mutate()} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetWrapper>
  );
};





Post.propTypes = {
  createdAt: PropTypes.string.isRequired,
  postId: PropTypes.any.isRequired,
  postUserId: PropTypes.string.isRequired,
  //user info
  name: PropTypes.string.isRequired,
  userPicturePath: PropTypes.string.isRequired,

  //climbing info
  vGrade: PropTypes.number.isRequired,
  attempts: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,

  //media
  mediaPath: PropTypes.string.isRequired,
  likes: PropTypes.number.isRequired,
  comments: PropTypes.array.isRequired,
}

export default Post;
