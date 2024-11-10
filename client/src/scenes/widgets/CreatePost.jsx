import React from "react";
import { useState } from "react";

import { EditOutlined, DeleteOutlined, Add, Remove } from "@mui/icons-material";
import { useTheme, Box, Button, Divider, Typography, Select, MenuItem, FormControl, InputLabel, InputBase, FormGroup, FormControlLabel, IconButton, Checkbox, FormLabel, Modal, CircularProgress } from '@mui/material';

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Dropzone from "react-dropzone";
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";

import fetchWithRetry from "auth/fetchWithRetry";
import { uploadMedia } from "data/uploadMedia";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";
import useAuthenticatedUser from "data/useAuthenticatedUser.ts";
import { useMediaQuery } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import CloseIcon from '@mui/icons-material/Close';
import { enqueueSnackbar } from "notistack";


/**
 * Allows user to specify post attributes then post a post.
 * Contains Dropzone to hold files.
 * @returns
 */
const CreatePost = ({ onPostButtonClicked, onPostCreateResolved }) => {

  // FORM DATA
  const [angle, setAngle] = useState("")
  const [holdTypes, setHoldTypes] = useState([])
  const [styles, setStyles] = useState([])
  const [media, setMedia] = useState(null);
  const [post, setPost] = useState("");
  const [vGrade, setVGrade] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(null); // State for date


  const { palette } = useTheme();

  const queryClient = useQueryClient();

  /**
   * Post something, invalidate posts cache.
   */
  const postMutation = useMutation(
    {
      mutationFn: async () => {

        try {
          const formData = new FormData();
          formData.append("userId", data.cid);
          formData.append("title", post);
          formData.append("vGrade", vGrade);
          formData.append("attempts", attempts);
          formData.append("description", description);
          formData.append("angle", angle);
          formData.append("holds", holdTypes);
          formData.append("styles", styles);


          if (selectedDate) {
            formData.append("createdAt", selectedDate.toISOString()); // Add selected date to form data
          }

          if (media) {
            // upload media
            const path = `${data.cid}/${media.name}`;

            const fullUrl = await uploadMedia(path, media);
            formData.append("mediaPath", fullUrl);

          }

          const response = await fetchWithRetry(
            import.meta.env.VITE_APP_API_BASE_URL + "/posts",
            {
              method: "POST",
              headers: { Authorization: `Bearer ${localStorage.getItem("id_token")}` },
              body: formData,
            }
          );
          return response.json();
        } catch (e) {
          throw e;
        }
      },

      onSuccess: () => {
        // we just changed the post so we need to get posts again.
        queryClient.invalidateQueries(QUERY_KEYS.POSTS)
        setMedia(null);
        setPost("");
        setVGrade(0);
        setAttempts(1);
        setSelectedDate(null);
        setDescription("");
        setAngle("");
        setHoldTypes([])
        setStyles([])

        enqueueSnackbar("Successfully logged climb!", { variant: "success" });
      },
      onError: (error) => {
        console.log("Error posting:", error)
        enqueueSnackbar("There was an error when trying to log the climb.", { variant: "error" });
      },
      onSettled: () => {
        onPostCreateResolved();
      }
    }
  )


  const handleAttemptsIncrement = () => {
    setAttempts((prev) => Math.min(prev + 1, 999));
  };

  const handleAttemptsDecrement = () => {
    setAttempts((prev) => Math.max(prev - 1, 1));
  };

  const handleAngleChange = (event) => {
    setAngle(event.target.value);
  };

  const holdNames = ["Crimp", "Sloper", "Pocket", "Pinch"]
  const styleNames = ["Static", "Dynamic", "Coordination"]

  const handleHoldChange = (event) => {
    const hold = event.target.value;
    if (holdTypes.includes(hold)) {
      // toggle off
      setHoldTypes(holdTypes.filter(s => s !== hold))
    } else {
      // toggle on
      setHoldTypes([...holdTypes, hold])
    }
  }

  const handleStyleChange = (event) => {
    const style = event.target.value;
    if (styles.includes(style)) {
      // toggle off
      setStyles(styles.filter(s => s !== style))
    } else {
      // toggle on
      setStyles([...styles, style])
    }
  }

  const { data, isSuccess, isLoading } = useAuthenticatedUser();


  if (isLoading) {
    return <Typography>Fetching user data...</Typography>
  }


  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  if (isSuccess) {

    const handleSubmit = () => {
      postMutation.mutate()
      onPostButtonClicked();
    }


    return (
      <>

        <WidgetWrapper>
          <FlexBetween gap="1.5rem">
            {isNonMobileScreens && <UserImage s3key={data.picturePath} />}

            <Box
              display={isNonMobileScreens ? "flex" : "block"}
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
                  width: "100%",
                  mb: isNonMobileScreens ? undefined : "1rem"
                }}
              />

              {/* V-Grade Input */}
              <Box display="flex" alignItems="center" sx={{ marginLeft: isNonMobileScreens ? "2rem" : "1rem" }}>
                <Typography
                  variant="h6"
                  sx={{ marginRight: "1rem", color: palette.neutral.main, whiteSpace: "nowrap" }}

                >
                  V-Grade:
                </Typography>

                <InputBase
                  type="number"
                  value={vGrade}
                  onChange={(e) => setVGrade(e.target.value)}
                  sx={{
                    width: isNonMobileScreens ? "100px" : "100%",
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
          <Divider sx={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}></Divider>



          {/* OPTIONAL DATA */}
          <Box display="flex" justifyContent={"center"}>
            <Typography variant="h6" sx={{ color: palette.neutral.main, fontSize: "1.5rem" }}>
              Optional Data
            </Typography>
          </Box>
          <Divider sx={{ margin: "1rem 0" }} />
          {/* ADD ANGLE DROPDOWN */}

          <FormControl fullWidth sx={{ marginBottom: "1rem" }}>
            <InputLabel id="angle-label">Angle</InputLabel>
            <Select
              labelId="angle-label"
              value={angle}
              label="angle"
              onChange={handleAngleChange}
            >
              <MenuItem value="Slab">Slab</MenuItem>
              <MenuItem value="Vertical">Vertical</MenuItem>
              <MenuItem value="Overhang">Overhang (5-30 degrees)</MenuItem>
              <MenuItem value="Overhang">Overhang (30+ degrees)</MenuItem>
            </Select>
          </FormControl>

          <FormGroup>
            <Divider sx={{ margin: "1rem 0" }} />
            <FormLabel component="legend">Holds</FormLabel>
            <Divider sx={{ margin: "1rem 0" }} />
            {
              holdNames.map((hold) => (
                <FormControlLabel control={<Checkbox checked={holdTypes.includes(hold)} />} onChange={handleHoldChange} value={hold}
                  label={hold} key={hold} />

              ))
            }
            <Divider sx={{ margin: "1rem 0" }} />
            <FormLabel component="legend">Type</FormLabel>
            <Divider sx={{ margin: "1rem 0" }} />
            {
              styleNames.map((style) => (
                <FormControlLabel control={<Checkbox checked={styles.includes(style)} />} onChange={handleStyleChange} value={style}
                  label={style} key={style} />

              ))
            }

          </FormGroup>

          <Divider sx={{ margin: "2rem 0" }} />

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
              accept={{
                "image/*": [".png", ".gif", ".jpeg", ".jpg"],
                "video/*": [".mp4", ".mov",]
              }}
              maxSize={100000000} // 100 MB
              multiple={false}
              onDrop={(acceptedFiles) => setMedia(acceptedFiles[0])}
              onDropRejected={() => enqueueSnackbar("Maximum file size is 100 MB.")}
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
            onClick={handleSubmit}
            sx={{
              color: palette.background.alt,
              backgroundColor: palette.primary.main,
              borderRadius: "3rem",
            }}
          >
            POST
          </Button>
        </WidgetWrapper>
      </>
    );
  }
};



export default CreatePost;
