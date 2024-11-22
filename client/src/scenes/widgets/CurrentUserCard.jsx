import React from "react";
import { ManageAccountsOutlined } from "@mui/icons-material";

import { Box, Typography, Divider, useTheme, CircularProgress, IconButton } from "@mui/material";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import useAuthenticatedUser from "data/useAuthenticatedUser.ts";

const CurrentUserCard = ({ handleEditAccount }) => {
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;

  const { data, isLoading, isSuccess } = useAuthenticatedUser();

  if (isLoading) {
    return <CircularProgress />;
  }


  if (isSuccess) {
    return (
      <WidgetWrapper width="100%">
        {/* FIRST ROW*/}
        <FlexBetween
          gap="0.5rem"
          pb="1.1rem"
        >
          <FlexBetween gap="1rem">
            <UserImage s3key={data.picturePath}></UserImage>
            <Box>
              <Typography
                variant="h4"
                color={dark}
                fontWeight="500"
              >
                {data.firstName} {data.lastName}
              </Typography>
            </Box>
          </FlexBetween>
          <IconButton onClick={handleEditAccount}>
            <ManageAccountsOutlined />
          </IconButton>

        </FlexBetween>

        <Divider />
      </WidgetWrapper>
    );
  };
}

export default CurrentUserCard;
