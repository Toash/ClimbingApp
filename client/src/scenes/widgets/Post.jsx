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
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import UserCard from "components/UserCard";
import WidgetWrapper from "components/WidgetWrapper";

import fetchWithRetry from "auth/fetchWithRetry";
import PropTypes from 'prop-types'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";
import useAuthenticatedUser from "data/useAuthenticatedUser.ts";
import { styled, keyframes } from "@mui/system";
import EditPost from "./EditPost.jsx";
import { useMediaQuery } from "@mui/system";

const Post = ({
  createdAt,
  postId,
  postUserId,
  //user info
  name,

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
  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const formattedDate = format(new Date(createdAt), "MMMM d, yyyy");

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
          body: JSON.stringify({ userId: data.cid }),
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
                [data.cid]: !post.likes[data.cid],
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
        import.meta.env.VITE_APP_API_BASE_URL +
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
          import.meta.env.VITE_APP_API_BASE_URL + `/posts/post/${postId}/`,
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


  const { data, isSuccess } = useAuthenticatedUser();

  const isCurrentUserPost = () => {
    if (isSuccess) {
      return data.cid === postUserId;
    }
    return false;
  }

  const [isFlash, setIsFlash] = useState(attempts === 1);

  // Define keyframes for the flash effect
  const flashAnimation = keyframes`
0%, 100% {
  color: yellow;
  text-shadow: 0 0 10px yellow, 0 0 10px yellow, 0 0 10px yellow, 0 0 10px yellow, 0 0 10px yellow, 0 0 10px yellow;
}
50% {
  color: white;
  text-shadow: none;
}
`;


  // define a styled Typography for the flash text
  const FlashText = styled(Typography)(({ theme }) => ({
    animation: `${flashAnimation} 2s infinite`,
    transform: "scale(2)",
    display: "inline-block",
  }));

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  // inline styling is bloating this component so much
  return (

    <WidgetWrapper minWidth={isNonMobileScreens ? "75%" : "100%"} maxWidth="50%" m="0rem 0">
      <Box display="flex">
        <Box flex="1">
          <UserCard
            userId={postUserId}
          />
        </Box>
        {isCurrentUserPost() && (
          <>
            {/* <IconButton
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
            </IconButton> */}
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
              <Box component="span" sx={{ ml: "8px" }}>
                < FlashText component="span" >
                  ⚡︎
                </FlashText>
              </Box>
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
              mediaPath.endsWith(".mov") ||
              mediaPath.endsWith(".avi") ? (
              <video
                controls
                style={{ borderRadius: "0.75rem", marginTop: "0.75rem", width: "100%" }}
              >
                <source src={mediaPath} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                alt="post"
                style={{ borderRadius: "0.75rem", marginTop: "0.75rem", width: "100%" }}
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
                  {!!likes[data.cid] ? (
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
          {formattedDate}
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
        )
      }

      {/* Edit Post Dialog */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)}>
        <EditPost
          postId={postId}
          title={title}
          description={description}
          vGrade={vGrade}
          attempts={attempts}
          createdAt={createdAt}
          onEdit={() => { setIsEditing(false) }} >

        </EditPost>
      </Dialog>
    </WidgetWrapper >
  );
};





Post.propTypes = {
  createdAt: PropTypes.string.isRequired,
  postId: PropTypes.any.isRequired,
  postUserId: PropTypes.string.isRequired,
  //user info
  name: PropTypes.string.isRequired,
  //picturePath: PropTypes.string.isRequired,

  //climbing info
  vGrade: PropTypes.number.isRequired,
  attempts: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,

  //media
  mediaPath: PropTypes.string,
  likes: PropTypes.object.isRequired,
  comments: PropTypes.array.isRequired,
}

export default Post;
