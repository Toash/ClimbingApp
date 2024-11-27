import React from "react";
import { CircularProgress, Divider, Typography, useTheme } from "@mui/material";
import WidgetWrapper from "components/WidgetWrapper";
import useAuthenticatedUser from "data/useAuthenticatedUser.js";

function CurrentUserStats({ showTitle = true }) {

  const { palette } = useTheme();

  const { data, isSuccess, isLoading } = useAuthenticatedUser();

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isSuccess) {
    return (

      <WidgetWrapper width="100%">

        {showTitle && <>        <Typography
          variant="h6"
          sx={{
            fontSize: "2rem",
            color: palette.neutral.main,
          }}
        >
          Stats
        </Typography>
          <Divider sx={{ marginBottom: "1rem" }}></Divider></>}
        {data.vGrade && <Typography>
          {"Max Grade: " + data.vGrade}
        </Typography>}

        {/* <Typography>

          {"Preferred Style:"}

        </Typography> */}
      </WidgetWrapper>
    );
  }



};


export default CurrentUserStats;
