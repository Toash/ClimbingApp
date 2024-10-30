import React from "react";
import { Divider, Typography, useTheme } from "@mui/material";
import WidgetWrapper from "components/WidgetWrapper";
import useAuthenticatedUser from "data/useAuthenticatedUser.ts";

function CurrentUserStats() {

  const { palette } = useTheme();

  const { data, isSuccess, isLoading } = useAuthenticatedUser();

  if (isLoading) {
    return <Typography>Fetching user data...</Typography>
  }

  if (isSuccess) {
    return (
      <WidgetWrapper m="2rem 0">
        <Typography
          variant="h6"
          sx={{
            fontSize: "2rem",
            color: palette.neutral.main,
          }}
        >
          Stats
        </Typography>
        <Divider sx={{ marginBottom: "1rem" }}></Divider>

        <Typography>
          {"Max Grade: " + data.vGrade}

        </Typography>
        <Typography>

          {"Preferred Style:"}

        </Typography>
      </WidgetWrapper>
    );
  }



};


export default CurrentUserStats;
