import React from "react";
import { useState } from "react";

import { EditOutlined, DeleteOutlined, Add, Remove } from "@mui/icons-material";
import { useTheme, Box, Button, Divider, Typography, Select, MenuItem, FormControl, InputLabel, InputBase, FormGroup, FormControlLabel, IconButton, Checkbox, FormLabel, Modal, CircularProgress, TextField, Icon } from '@mui/material';

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Dropzone from "react-dropzone";
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";

import fetchWithRetry from "auth/fetchWithRetry";
import { uploadMedia } from "data/uploadMedia";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";
import useAuthenticatedUser from "data/useAuthenticatedUser.js";
import { useMediaQuery } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { v4 as uuidv4 } from 'uuid';
import VideocamIcon from '@mui/icons-material/Videocam';
import Cassette from "/cassette.png"

/**
 * Allows user to specify post attributes then post a post.
 * Contains Dropzone to hold files.
 * data: contains all of the state (including postId), initializes the state if mode is edit.
 * @returns
 */
const LogClimbForm = ({ onPostButtonClicked, edit, data, compressMedia = false }) => {

  // FORM DATA

  let postId;
  if (edit) {
    postId = data?.postId
  }
  const [angle, setAngle] = useState(edit ? data?.angle : "")
  const [holds, setHolds] = useState(edit ? data?.holds : [])
  const [styles, setStyles] = useState(edit ? data?.styles : [])
  const [media, setMedia] = useState(edit ? data?.media : null); // of type File
  const [title, setTitle] = useState(edit ? data?.title : "");
  const [vGrade, setVGrade] = useState(edit ? data?.vGrade : 0);
  const [attempts, setAttempts] = useState(edit ? data?.attempts : 1);
  const [description, setDescription] = useState(edit ? data?.description : "");
  const [selectedDate, setSelectedDate] = useState(edit && data?.climbDate ? new Date(data?.climbDate) : new Date()); // State for date

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
          formData.append("userId", userData.cid);
          formData.append("title", title);
          formData.append("vGrade", vGrade);
          formData.append("attempts", attempts);
          formData.append("description", description);
          formData.append("angle", angle);
          formData.append("holds", holds);
          formData.append("styles", styles);

          if (selectedDate) {
            console.log("selectedDate", selectedDate)
            formData.append("climbDate", selectedDate.toISOString()); // Add selected date to form data
          } else if (!edit && media?.lastModifiedDate) {
            formData.append("climbDate", media.lastModifiedDate.toISOString());
          }

          if (media) {
            // console.log("Last modified date for file: ", media.lastModifiedDate)
            // upload media
            const fileName = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
            const extension = media.name.split(".").pop();
            const path = `${userData.cid}/${fileName}.${extension}`;


            let message;
            let fullUrl;
            if (media.size >= 20000000 && compressMedia) {
              ({ url: fullUrl, message } = await uploadMedia({ s3key: path, media, compress: true }));
            } else {
              ({ url: fullUrl, message } = await uploadMedia({ s3key: path, media, compress: false }));
            }
            formData.append("mediaPath", fullUrl);
            enqueueSnackbar(message, { variant: "success" });
          }

          if (edit) {
            formData.append("edit", "true")
            formData.append("postId", postId)
          } else {
            formData.append("edit", "false")
          }


          let response;
          if (edit) {
            response = await fetchWithRetry(
              import.meta.env.VITE_APP_API_BASE_URL + `/posts/post/${postId}`,
              {
                method: "PATCH",
                headers: { Authorization: `Bearer ${localStorage.getItem("id_token")}` },
                body: formData,
              }
            );
          } else {
            response = await fetchWithRetry(
              import.meta.env.VITE_APP_API_BASE_URL + "/posts",
              {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("id_token")}` },
                body: formData,
              }
            );
          }

          return response.json();
        } catch (e) {
          throw e;
        }
      },

      onSuccess: (data) => {
        // we just changed the post so we need to get posts again.
        queryClient.invalidateQueries(QUERY_KEYS.POSTS)
        queryClient.invalidateQueries(QUERY_KEYS.USER_POSTS)
        queryClient.invalidateQueries(QUERY_KEYS.WEEKLY_USER_POSTS)
        setMedia(null);
        setTitle("");
        setVGrade(0);
        setAttempts(1);
        setSelectedDate(null);
        setDescription("");
        setAngle("");
        setHolds([])
        setStyles([])

        if (edit) {
          enqueueSnackbar("Successfully edited climb.", { variant: "success" });
        } else {
          enqueueSnackbar("Successfully logged climb!", { variant: "success" });
        }

      },
      onError: (error) => {
        enqueueSnackbar("There was an error when trying to log the climb. " + error, { variant: "error" });
      },
      onSettled: () => {
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
    if (holds.includes(hold)) {
      // toggle off
      setHolds(holds.filter(s => s !== hold))
    } else {
      // toggle on
      setHolds([...holds, hold])
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

  const { data: userData, isSuccess, isLoading } = useAuthenticatedUser();


  if (isLoading) {
    return <Typography>Fetching user data...</Typography>
  }

  // can change this to support other grades (font)
  const grades =
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((x) => {
      return (
        {
          value: x,
          label: `V${x}`
        }
      )
    })


  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  if (isSuccess) {

    const handleSubmit = () => {
      postMutation.mutate()
      enqueueSnackbar("Logging climb. This may take a while.", { variant: "info" });
      onPostButtonClicked();
    }


    return (
      <>
        <WidgetWrapper sx={{ width: "100%" }}>
          <Typography align="center" variant="h1" sx={{ padding: "1rem", color: palette.neutral.main, fontWeight: "500", mb: "1rem" }}> {!edit ? "Log Climb" : "Edit Climb"}</Typography>

          <FlexBetween>

            <Box
              display="flex"
              gap={1}
              sx={{ width: "100%" }}
            >
              {/* TITLE */}
              <Box sx={{ flexGrow: 10 }}>
                <TextField
                  label="Title"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                  sx={{
                    color: palette.neutral.main,
                    fontSize: "1rem", // Optional: ensure consistent font size
                    width: "100%",

                  }}
                />
              </Box>

              {/* V-Grade Input */}
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  label="V-Grade"
                  select
                  value={vGrade}
                  onChange={(e) => setVGrade(e.target.value)}
                  sx={{
                    color: palette.neutral.main,
                    width: "100%"
                  }}
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </MenuItem>
                  ))}
                </TextField>
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
              label="Angle"
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
                <FormControlLabel control={<Checkbox checked={holds.includes(hold)} />} onChange={handleHoldChange} value={hold}
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

          {!edit &&
            <Dropzone
              accept={{
                "image/*": [".png", ".gif", ".jpeg", ".jpg"],
                "video/*": [".mp4", ".mov",]
              }}
              maxSize={150000000} // 150 MB
              multiple={false}
              onDrop={(acceptedFiles) => setMedia(acceptedFiles[0])}
              onDropRejected={() => enqueueSnackbar("Maximum file size is 150 MB. Allowed video types are mp4 and mov, Allowed image types are png, gif, jpeg / jpg")}
            >
              {({ getRootProps, getInputProps }) => (
                <Box
                  sx={{
                    display: "flex"
                  }}>
                  <Box
                    {...getRootProps()}
                    border={`2px solid ${palette.primary.main}`}
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

                      <Box sx={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center"
                      }}>
                        {/*<a href="https://www.flaticon.com/free-icons/radio-cassette" title="radio cassette icons">Radio cassette icons created by PIXARTIST - Flaticon</a> */}
                        <Box
                          component="img"
                          src={Cassette}
                          sx={{
                            textColor: "white",
                            width: 36, // Set size to match typical icon dimensions
                            height: 36,
                          }}
                        />

                        <Typography color={palette.neutral.main}>
                          Add Beta
                        </Typography>
                      </Box>
                    ) : (
                      <Typography color={palette.neutral.main}>
                        {media.name}
                      </Typography>
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
                </Box>
              )}
            </Dropzone>
          }



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
            disabled={!title}
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



export default LogClimbForm;
