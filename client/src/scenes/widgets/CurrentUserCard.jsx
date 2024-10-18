import React from "react";
import { ManageAccountsOutlined } from "@mui/icons-material";

import { Box, Typography, Divider, useTheme } from "@mui/material";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import fetchWithRetry from "fetchWithRetry";

const CurrentUserCard = ({ userId, picturePath }) => {
  const [user, setUser] = useState(null);
  const { palette } = useTheme();
  const navigate = useNavigate();
  const token = useSelector((state) => state.token);
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;

  const getUser = async () => {
    const response = await fetchWithRetry(
      process.env.REACT_APP_API_BASE_URL + `/users/${userId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    setUser(data);
  };

  // runs by default when the componenet is rendered
  useEffect(() => {
    getUser();
  }, []);

  // we can add a loading component here later
  if (!user) {
    return null;
  }

  const { firstName, lastName, friends } = user;

  return (
    <WidgetWrapper>
      {/* FIRST ROW*/}
      <FlexBetween
        gap="0.5rem"
        pb="1.1rem"
        onClick={() => navigate(`/profile/${userId}`)}
      >
        <FlexBetween gap="1rem">
          <UserImage s3key={picturePath}></UserImage>
          <Box>
            <Typography
              variant="h4"
              color={dark}
              fontWeight="500"
              sx={{
                "&:hover": { color: palette.primary.light, cursor: "pointer" },
              }}
            >
              {firstName} {lastName}
            </Typography>
            <Typography color={medium}>{friends.length} friends</Typography>
          </Box>
        </FlexBetween>
        <ManageAccountsOutlined /> {/* TODO: EDIT NAME */}
      </FlexBetween>

      <Divider />
    </WidgetWrapper>
  );
};

export default CurrentUserCard;
