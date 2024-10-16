import { Box, Typography, useTheme } from "@mui/material";
import UserCard from "components/UserCard";
import WidgetWrapper from "components/WidgetWrapper";
import fetchWithRetry from "fetchWithRetry";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "state";
import React from "react";
import PropTypes from "prop-types"

const FriendListWidget = ({ userId }) => {
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const token = useSelector((state) => state.token);
  const friends = useSelector((state) => state.user.friends)

  const getFriends = async () => {
    const response = await fetchWithRetry(
      process.env.REACT_APP_API_BASE_URL + `/users/${userId}/friends`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    dispatch(setFriends({ friends: data })); // so we can see store friends of other users
  };

  useEffect(() => {
    getFriends();
  }, []);

  return (
    <WidgetWrapper>
      {console.log("HERE IS FRIENDS: ", friends)}
      <Typography
        color={palette.neutral.dark}
        variant="h5"
        fontWeight="500"
        sx={{ mb: "1.5rem" }}
      >
        Friend List
      </Typography>
      <Box display="flex" flexDirection="column" gap="1.5rem">
        {friends.map((friend) => (
          <UserCard
            key={friend._id}
            friendId={friend._id}
            name={`${friend.firstName} ${friend.lastName}`}
            subtitle={friend.occupation}
            userPicturePath={friend.picturePath}
          />
        ))}
      </Box>
    </WidgetWrapper>
  );
};

FriendListWidget.propTypes = {
  userId: PropTypes.string.isRequired
}

export default FriendListWidget;
