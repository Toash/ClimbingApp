import { PersonAddOutlined, PersonRemoveOutlined } from "@mui/icons-material";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFriends } from "state";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";
import { useState, useEffect } from "react";
import fetchWithRetry from "fetchWithRetry";

const Friend = ({ friendId, name, subtitle, userPicturePath }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loggedIn = useSelector((state) => state.user);
  const id = useSelector((state) => state.user?.cid);
  const token = useSelector((state) => state.token);
  const friends = useSelector((state) => state.user?.friends);
  const isFriend = friends
    ? friends.find((friend) => friend.cid === friendId)
    : null;

  const { palette } = useTheme();
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  const [vGrade, setVGrade] = useState(null);

  const patchFriend = async () => {
    const response = await fetchWithRetry(
      process.env.REACT_APP_API_BASE_URL + `/users/${id}/${friendId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    dispatch(setFriends({ friends: data })); // why are we storing friends list in state
  };

  useEffect(() => {
    const getHighestVGradePost = async (userId) => {
      try {
        const getUserURL =
          process.env.REACT_APP_API_BASE_URL + `/posts/user/${userId}/hiscore`;
        const getUserOptions = {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        };

        const response = await fetchWithRetry(
          getUserURL,
          getUserOptions,
          dispatch
        );
        const data = await response.json();
        return data;
      } catch (e) {
        console.log("Cannot find user or post with hiscore");
        console.log(e.message);
        return null;
      }
    };
    const fetchMax = async () => {
      const post = await getHighestVGradePost(friendId);
      setVGrade(post.vGrade);
    };
    fetchMax();
  }, [dispatch, friendId, token]);
  return (
    <FlexBetween>
      <FlexBetween gap="1rem">
        <UserImage s3key={userPicturePath} size="55px" />
        <Box
          onClick={() => {
            navigate(`/profile/${friendId}`);
            navigate(0); //janky solution because dom does not rerender
          }}
        >
          <Typography
            color={main}
            variant="h5"
            fontWeight="500"
            sx={{
              "&:hover": {
                color: palette.primary.light,
                cursor: "pointer",
              },
            }}
          >
            {name}
          </Typography>
          <Typography color={medium} fontSize="0.75rem">
            {vGrade ? `V${vGrade}` : null}
          </Typography>
        </Box>
      </FlexBetween>
      {loggedIn && id != friendId && (
        <IconButton
          onClick={() => patchFriend()}
          sx={{ backgroundColor: primaryLight, p: "0.6rem" }}
        >
          {isFriend ? (
            <PersonRemoveOutlined sx={{ color: primaryDark }} />
          ) : (
            <PersonAddOutlined sx={{ color: primaryDark }} />
          )}
        </IconButton>
      )}
    </FlexBetween>
  );
};

export default Friend;
