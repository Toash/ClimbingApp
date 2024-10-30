import React from "react";
import { PersonAddOutlined, PersonRemoveOutlined } from "@mui/icons-material";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";
import PropTypes from 'prop-types'
import useUserById from "data/useUserById";
import useAuthenticatedUser from "data/useAuthenticatedUser.ts";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";

/**
 * Friend card
 * @param {*} object containing friendId(cid), userPicturePath 
 * @returns 
 */
const UserCard = ({ userId }) => {
  const { palette } = useTheme();
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  const { data: currentUserData, isLoading: currentUserIsLoading, isSuccess: currentUserIsSuccess } = useAuthenticatedUser();
  const { data: userData, isLoading: userIsLoading, isSuccess: userIsSuccess } = useUserById(userId);

  const queryClient = useQueryClient();

  const patchFriendMutation = useMutation({
    mutationFn: async (ids) => {
      const token = localStorage.getItem("id_token")

      await fetch(
        import.meta.env.VITE_APP_API_BASE_URL + `/users/${ids.currentUserId}/${ids.userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: () => {
      // get the friends list again.
      queryClient.invalidateQueries([QUERY_KEYS.CURRENT_USER])
      queryClient.invalidateQueries([QUERY_KEYS.USER_BY_ID(userId)])
    },
  })


  if (currentUserIsLoading || userIsLoading) {
    return <Typography>Loading...</Typography>
  }

  if (patchFriendMutation.isError) {
    return <Typography>Error trying to patch friend</Typography>
  }

  if (currentUserIsSuccess && userIsSuccess) {
    let isFriend = currentUserData.friends
      ? currentUserData.friends.find((user) => user.cid === userData.cid)
      : null;

    return (
      <FlexBetween>
        <FlexBetween gap="1rem">
          <UserImage s3key={userData.picturePath} size="55px" />
          <Box>
            <Typography
              color={main}
              variant="h5"
              fontWeight="500"
            >
              {userData.firstName} {userData.lastName}
            </Typography>
            <Typography color={medium} fontSize="0.75rem">
              V{userData.vGrade}
            </Typography>
          </Box>
        </FlexBetween>
        {currentUserData.cid != userData.cid && (
          <IconButton
            onClick={() => patchFriendMutation.mutate({ currentUserId: currentUserData.cid, userId: userData.cid })}
            sx={{ backgroundColor: primaryLight, p: "0.6rem" }}
          >
            {!!isFriend ? (
              <PersonRemoveOutlined sx={{ color: primaryDark }} />
            ) : (
              <PersonAddOutlined sx={{ color: primaryDark }} />
            )}
          </IconButton>
        )}
      </FlexBetween>
    );
  }

};

UserCard.propTypes = {
  userId: PropTypes.string.isRequired,
}

export default UserCard;
