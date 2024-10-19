import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import UserCard from "components/UserCard";
import WidgetWrapper from "components/WidgetWrapper";
import PropTypes from "prop-types"
import getAuthenticatedUser from "data/getAuthenticatedUser";

const FriendListWidget = () => {
  const { palette } = useTheme();

  const { data, isSuccess, isLoading } = getAuthenticatedUser();


  if (isLoading) {
    return <Typography>Getting current user...</Typography>
  }

  if (isSuccess) {
    return (
      <WidgetWrapper>
        <Typography
          color={palette.neutral.dark}
          variant="h5"
          fontWeight="500"
          sx={{ mb: "1.5rem" }}
        >
          Friend List
        </Typography>
        <Box display="flex" flexDirection="column" gap="1.5rem">
          {data.friends.map((friend) => (
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
  }

};

FriendListWidget.propTypes = {
  userId: PropTypes.string.isRequired
}

export default FriendListWidget;
