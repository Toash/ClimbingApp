import { EditOutlined, DeleteOutlined, Add, Remove } from "@mui/icons-material";
import {
  Box,
  Divider,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  useMediaQuery,
  TextField,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker"; // Import DatePicker from MUI
import Dropzone from "react-dropzone";
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const [media, setMedia] = useState(null);
  const [post, setPost] = useState("");
  const [vGrade, setVGrade] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(null); // State for date
  const { palette } = useTheme();
  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width : 1000px)");
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;

  const handlePost = async () => {
    const formData = new FormData();
    formData.append("userId", _id);
    formData.append("title", post);
    formData.append("vGrade", vGrade);
    formData.append("attempts", attempts);
    formData.append("description", description);
    if (selectedDate) {
      formData.append("createdAt", selectedDate.toISOString()); // Add selected date to form data
    }
    if (media) {
      formData.append("media", media);
      formData.append("mediaPath", media.name);
    }

    // Update posts
    const response = await fetch(`http://localhost:3001/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    // Sort
    if (response.ok) {
      const postsResponse = await fetch("http://localhost:3001/posts", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const postsData = await postsResponse.json();
      dispatch(setPosts({ posts: postsData }));
    }

    setMedia(null);
    setPost("");
    setVGrade(0);
    setAttempts(1);
    setSelectedDate(null);
    window.location.reload();
  };

  const handleAttemptsIncrement = () => {
    setAttempts((prev) => Math.min(prev + 1, 999));
  };

  const handleAttemptsDecrement = () => {
    setAttempts((prev) => Math.max(prev - 1, 1));
  };

  return (
    <WidgetWrapper>
      <FlexBetween gap="1.5rem">
        <UserImage image={picturePath} />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: "100%" }}
        >
          {/* TITLE */}
          <InputBase
            placeholder="Enter a title for your climb"
            onChange={(e) => setPost(e.target.value)}
            value={post}
            sx={{
              flexGrow: 1,
              backgroundColor: palette.neutral.light,
              borderRadius: "2rem",
              padding: "1rem 2rem",
              color: palette.neutral.main,
              fontSize: "1rem", // Optional: ensure consistent font size
              outline: `1px solid ${palette.neutral.outline}`,
            }}
          />

          {/* V-Grade Input */}
          <Box display="flex" alignItems="center" sx={{ marginLeft: "2rem" }}>
            <Typography
              variant="h6"
              sx={{ marginRight: "1rem", color: palette.neutral.main }}
            >
              V-Grade:
            </Typography>

            <InputBase
              type="number"
              value={vGrade}
              onChange={(e) => setVGrade(e.target.value)}
              sx={{
                width: "150px",
                backgroundColor: palette.neutral.light,
                borderRadius: "2rem",
                padding: "1rem 2rem",
                color: palette.neutral.main,
                fontSize: "1rem",
                outline: `1px solid ${palette.neutral.outline}`,
              }}
              inputProps={{ min: 0, max: 17 }}
            />
          </Box>
        </Box>
      </FlexBetween>

      {/* Number of Attempts Input */}
      <Box display="flex" alignItems="center" sx={{ marginTop: "1.5rem" }}>
        <Button
          onClick={handleAttemptsDecrement}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
            minWidth: "40px",
            height: "40px",
          }}
        >
          <Remove />
        </Button>

        <Typography
          variant="h6"
          sx={{
            color: palette.neutral.main,
            minWidth: "50px",
            textAlign: "center",
          }}
        >
          {attempts}
        </Typography>

        <Button
          onClick={handleAttemptsIncrement}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
            minWidth: "40px",
            height: "40px",
          }}
        >
          <Add />
        </Button>

        <Typography
          variant="h6"
          sx={{ color: palette.neutral.main, marginLeft: "1rem" }}
        >
          Attempts
        </Typography>
      </Box>
      <Divider sx={{ marginTop: "1.5rem", marginBottom: "2rem" }}></Divider>
      {/* ADD MEDIA  */}
      <Box
        sx={{
          backgroundColor: palette.neutral.light, // Match background color
          borderRadius: "2rem", // Match border radius
          padding: "1rem 2rem", // Match padding
          marginTop: "1rem",
          outline: `1px solid ${palette.neutral.outline}`,
        }}
      >
        <Dropzone
          acceptedFiles=".jpg,.jpeg,.png,video/*"
          multiple={false}
          onDrop={(acceptedFiles) => setMedia(acceptedFiles[0])}
        >
          {({ getRootProps, getInputProps }) => (
            <FlexBetween>
              <Box
                {...getRootProps()}
                border={`2px dashed ${palette.primary.main}`}
                p="1rem"
                width="100%"
                sx={{
                  "&:hover": { cursor: "pointer" },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <input {...getInputProps()} />
                {!media ? (
                  <Typography color={palette.neutral.main}>
                    Add Media (Optional)
                  </Typography>
                ) : (
                  <FlexBetween>
                    <Typography color={palette.neutral.main}>
                      {media.name}
                    </Typography>
                    <EditOutlined />
                  </FlexBetween>
                )}
              </Box>
              {media && (
                <IconButton
                  onClick={() => setMedia(null)}
                  sx={{
                    marginLeft: "1rem",
                    color: palette.error.main,
                  }}
                >
                  <DeleteOutlined />
                </IconButton>
              )}
            </FlexBetween>
          )}
        </Dropzone>
      </Box>

      {/* Description */}
      <InputBase
        fullWidth
        placeholder="Description (Optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{
          width: "100%",
          backgroundColor: palette.neutral.light,
          borderRadius: "2rem",
          padding: "1rem 2rem",
          color: palette.neutral.main,
          marginTop: "1rem",
          outline: `1px solid ${palette.neutral.outline}`,
        }}
      />

      {/* Date Picker */}
      <Box
        sx={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}
      >
        <DatePicker
          label="Select Date (Optional)"
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          sx={{
            backgroundColor: palette.neutral.light,
            color: palette.neutral.main,
          }}
        />
      </Box>
      <Divider sx={{ margin: "1.25rem 0" }} />

      <Button
        disabled={!post}
        onClick={handlePost}
        sx={{
          color: palette.background.alt,
          backgroundColor: palette.primary.main,
          borderRadius: "3rem",
        }}
      >
        POST
      </Button>
    </WidgetWrapper>
  );
};

export default MyPostWidget;
