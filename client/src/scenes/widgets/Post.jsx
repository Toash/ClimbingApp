import React, { useEffect } from "react";
import { useState } from "react";
import { format } from "date-fns";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  Menu as MenuIcon,
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
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import UserCard from "components/UserCard";
import WidgetWrapper from "components/WidgetWrapper";

import fetchWithRetry from "auth/fetchWithRetry";
import PropTypes from 'prop-types'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";
import useAuthenticatedUser from "data/useAuthenticatedUser.js";
import { styled, keyframes } from "@mui/system";
import EditPost from "./EditPost.jsx";
import { useMediaQuery } from "@mui/system";
import { enqueueSnackbar } from "notistack";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogClimbForm from "./LogClimbForm.jsx";
import MoreVertIcon from '@mui/icons-material/MoreVert';

const Post = ({
  climbDate,
  postId,
  postUserId,
  //user info
  name,

  //climbing info
  vGrade,
  attempts,
  title,
  description,
  angle,
  holds,
  styles,

  //media
  mediaPath,
  likes,
  comments,
}) => {

  // data used to pass into the form if editing.
  let data = {
    postId,

    title,
    vGrade,
    attempts,
    description,
    angle,
    holds,
    styles,
    climbDate,

  }
  const [isEditing, setIsEditing] = useState(false);
  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Hamburger menu
  const [hamburgerAnchorEl, setHamburgerAnchorEl] = React.useState(null);
  const hamburgerOpen = Boolean(hamburgerAnchorEl);
  const handleHamburgerClick = (event) => {
    setHamburgerAnchorEl(event.currentTarget);
  };
  const handleHamburgerClose = () => {
    setHamburgerAnchorEl(null);
  };


  const { palette } = useTheme();

  const primary = palette.primary.main;

  const queryClient = useQueryClient();


  /**
   * Mutation to toggle like on post.
   */
  const togglePostLikeMutation = useMutation({
    mutationFn: async () => {
      await fetchWithRetry(
        import.meta.env.VITE_APP_API_BASE_URL + `/posts/post/${postId}/like`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("id_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userData.cid }),
        }
      );

    }, onMutate: async () => {
      await queryClient.cancelQueries(QUERY_KEYS.POSTS);
      const previousData = queryClient.getQueryData(QUERY_KEYS.POSTS);

      // directly set the query data to update the UI
      queryClient.setQueryData(QUERY_KEYS.POSTS, (old) => {
        return old.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              likes: {
                ...post.likes,
                [userData.cid]: !post.likes[userData.cid],
              },
            };
          }
          return post; // return unchanged post
        });
      });

      // return previous data to rollback if mutation fails (as context)
      return { previousData };
    }, onError: (err, newData, context) => {

      //rollback to previous data
      queryClient.setQueryData(QUERY_KEYS.POSTS, context.previousData);
      enqueueSnackbar("There was an error when trying to like the post. Please try again later.", { variant: "error" })
    }, onSettled: () => {
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
        import.meta.env.VITE_APP_API_BASE_URL + `/posts/post/${postId}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("id_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userData.cid,
            comment: variables.comment,
          }),
        }
      );
      setNewComment("");
    }, onSuccess: () => {
      //invalid posts
      //TODO implement infinite scrolling
      queryClient.invalidateQueries(QUERY_KEYS.POSTS);
    }, onError: () => {
      enqueueSnackbar("There was an error when trying to post a comment. Please try again later.", { variant: "error" })
    }
  })

  /**
   * Mutation to toggle like, accepts object containing commentId
   */
  const toggleCommentLikeMutation = useMutation({
    mutationFn: async (variables) => {
      await fetchWithRetry(
        import.meta.env.VITE_APP_API_BASE_URL +
        `/posts/post/${postId}/${variables.commentId}/like`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("id_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userData.cid,
          }),
        }
      );
    }, onSuccess: () => {
      //invalid posts
      //TODO implement infinite scrolling
      queryClient.invalidateQueries(QUERY_KEYS.POSTS);
    }, onError: () => {
      enqueueSnackbar("There was an error when trying to like a comment. Please try again later.", { variant: "error" })
    }
  })

  /**
   * Mutation to delete post
   */
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      if (window.confirm("Are you sure you want to delete this post?")) {
        const response = await fetchWithRetry(
          import.meta.env.VITE_APP_API_BASE_URL + `/posts/post/${postId}?userId=${userData.cid}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("id_token")}`,
            },
          }
        );
        return response.json();
      }
    }, onSuccess: (data) => {
      //invalid posts
      //TODO implement infinite scrolling
      queryClient.invalidateQueries(QUERY_KEYS.POSTS);
      queryClient.invalidateQueries(QUERY_KEYS.CURRENT_USER)
      enqueueSnackbar(data.message, { variant: "info" })
    }, onError: (data) => {
      enqueueSnackbar(data.message, { variant: "error" })
    }
  })


  const { data: userData, isSuccess, } = useAuthenticatedUser({ required: false });

  const isCurrentUserPost = () => {
    if (isSuccess) {
      return userData.cid === postUserId;
    }
    return false;
  }




  // inline styling is bloating this component so much
  return (
    <>
      <WidgetWrapper width="100%" maxWidth="1000px" m="0rem 0">
        <Box display="flex" alignItems="center" justifyContent={"space-between"}>
          <Box>
            <UserCard
              userId={postUserId}
            />
          </Box>
          {isCurrentUserPost() && (
            <>
              <IconButton
                sx={{ height: "3rem", width: "3rem" }}
                id="basic-button"
                aria-controls={hamburgerOpen ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={hamburgerOpen ? 'true' : undefined}
                onClick={handleHamburgerClick}>
                <MoreVertIcon></MoreVertIcon>
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={hamburgerAnchorEl}
                open={hamburgerOpen}
                onClose={handleHamburgerClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem onClick={() => setIsEditing(!isEditing)}>Edit</MenuItem>
                <MenuItem onClick={() => deletePostMutation.mutate()}>Delete</MenuItem>

              </Menu>
            </>
          )}
        </Box>
        {/* TITLE AND GRADE */}
        <Typography color={palette.neutral.main} sx={{ mt: "1rem", fontSize: "1.5rem" }}>
          {vGrade !== null ? title + " - V" + vGrade : title}
        </Typography>

        <Divider />
        {/* ATTEMPTS */}
        <Typography
          color={palette.neutral.main}
          sx={{ mt: "1rem", mb: "1rem", fontSize: "1rem" }}
        >
          {attempts
            ? attempts !== 1
              ? attempts + " Attempts "
              : <Typography component="span">
                Flash
              </Typography>
            : null}
        </Typography>

        {/* MEDIA */}
        {
          mediaPath && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center", // Optional, for vertical centering
              }}>
              {mediaPath.endsWith(".mp4") ||
                mediaPath.endsWith(".mov")
                ? (
                  <video
                    controls
                    style={{ borderRadius: "0.75rem", marginTop: "0.75rem", width: "100%", maxHeight: "800px" }}
                  >
                    {/* Add #t=0.001 to generate thumbnail on IOS safari. */}
                    <source src={mediaPath + "#t=0.001"} />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    alt="post"
                    style={{ borderRadius: "0.75rem", marginTop: "0.75rem", width: "100%", maxHeight: "800px" }}
                    src={mediaPath}
                  />
                )}
            </div>
          )
        }

        {/* DESCRIPTION */}
        <Typography color={palette.neutral.main} sx={{ mt: "1rem", fontSize: "1rem" }}>
          {description}
        </Typography>

        <FlexBetween mt="2rem">
          <FlexBetween gap="1rem">
            {/* LIKES */}
            <FlexBetween gap="0.3rem">
              {isSuccess ? (
                <>
                  <IconButton onClick={() => togglePostLikeMutation.mutate()}>
                    {!!likes[userData.cid] ? (
                      <FavoriteOutlined sx={{ color: primary }} />
                    ) : (
                      <FavoriteBorderOutlined />
                    )}
                  </IconButton>
                </>
              ) : (
                <FavoriteBorderOutlined />
              )}
              <Typography>{Object.keys(likes).length}</Typography>
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
          <Typography color={palette.neutral.main} sx={{ fontSize: "0.875rem" }}>
            {climbDate && format(new Date(climbDate), "MMMM d, yyyy")}
          </Typography>
        </FlexBetween>

        <Divider></Divider>
        {
          isComments && (
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
                          import.meta.env.VITE_APP_API_BASE_URL +
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
                        <Typography sx={{ color: palette.neutral.main }}>
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
                                {!!comment.likeCount[userData.cid] ? (
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
          )
        }

        {/* Edit Post Dialog */}
        <Dialog open={isEditing} onClose={() => setIsEditing(false)} fullWidth>
          <LogClimbForm onPostButtonClicked={() => setIsEditing(false)} edit data={data} />
        </Dialog>
      </WidgetWrapper >
    </>
  );
};


export default Post;
