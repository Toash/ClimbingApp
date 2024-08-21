import { Box, Divider, Typography, useTheme } from "@mui/material";
import { isAllOf } from "@reduxjs/toolkit";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const YourStats = ({ userId }) => {
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const token = useSelector((state) => state.token);
  const [vGrade, setVGrade] = useState(null);
  const [attempts, setAttempts] = useState(null);

  const getHighestVGradePost = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/posts/${userId}/hiscore`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      return data;
    } catch (e) {
      console.log("Cannot find user or post with hiscore");
      console.log(e.message);
      return null;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      const post = await getHighestVGradePost(userId);
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

export default YourStats;
