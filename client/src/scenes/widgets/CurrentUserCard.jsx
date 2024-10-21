import React from "react";
import { ManageAccountsOutlined } from "@mui/icons-material";

import { Box, Typography, Divider, useTheme } from "@mui/material";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import useAuthenticatedUser from "data/useAuthenticatedUser";

const CurrentUserCard = () => {
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;

  const { data, isLoading, isSuccess } = useAuthenticatedUser();

  if (isLoading) {
    return <Typography>Fetching user data...</Typography>
  }


  if (isSuccess) {
    return (
      <WidgetWrapper>
        {/* FIRST ROW*/}
        <FlexBetween
          gap="0.5rem"
          pb="1.1rem"
        >
          <FlexBetween gap="1rem">
            <UserImage s3key={data.userPicturePath}></UserImage>
            <Box>
              <Typography
                variant="h4"
                color={dark}
                fontWeight="500"
              >
                {data.firstName} {data.lastName}
              </Typography>
              <Typography color={medium}>{data.friends.length} friends</Typography>
            </Box>
          </FlexBetween>
          <ManageAccountsOutlined /> {/* TODO: EDIT NAME */}
        </FlexBetween>

        <Divider />
      </WidgetWrapper>
    );
  };
}

export default CurrentUserCard;
