import React from "react";
import { Divider, Typography, useTheme } from "@mui/material";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHighestVGradePost } from "data/getHighestVGradePost";
import PropTypes from 'prop-types'

function CurrentUserStats({ userId }) {

  const { palette } = useTheme();
  const token = useSelector((state) => state.token);
  const [vGrade, setVGrade] = useState(null);
  const [attempts, setAttempts] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const post = await useHighestVGradePost(userId);
      setVGrade(post.vGrade);
      setAttempts(post.attempts);
    };

    fetchStats();
  }, [userId, token]);
  return (
    <WidgetWrapper m="2rem 0">
      <Typography
        variant="h6"
        sx={{
          fontSize: "2rem",
          color: palette.neutral.main,
        }}
      >
        Your Stats
      </Typography>
      <Divider sx={{ marginBottom: "1rem" }}></Divider>

      {vGrade != null ? (
        <Typography>
          {"Max Grade: "}
          {vGrade != null ? "V" + vGrade : "Loading..."}
          {attempts != null ? ` (${attempts} attempts)` : "Loading..."}
        </Typography>
      ) : (
        <Typography>Post something</Typography>
      )}
    </WidgetWrapper>
  );
};

CurrentUserStats.propTypes = {
  userId: PropTypes.string
}

export default CurrentUserStats;
