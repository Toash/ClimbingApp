import { Dialog, DialogTitle, FormControl, InputLabel, TextField, Input, Typography, useTheme, Divider, Button } from "@mui/material";
import { Box } from "@mui/system";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import getCidFromToken from "auth/getCidFromToken.js";
import { uploadMedia } from "data/uploadMedia.js";
import useAuthenticatedUser from "data/useAuthenticatedUser.js";
import { enqueueSnackbar } from "notistack";
import { QUERY_KEYS } from "queryKeys.ts";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function EditAccount({ open, onClose, firstTime, data }) {

    const [media, setMedia] = useState(null);
    const [profilePicturePath, setProfilePicturePath] = useState(data?.profilePicturePath || "")

    const { palette } = useTheme();

    const onDrop = useCallback((acceptedFiles) => {
        setMedia(acceptedFiles[0])
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const { data: userData, isLoading, isError } = useAuthenticatedUser();

    // dont load the component unless we have the user information.
    if (isLoading) {
        return (
            <Typography>Loading...</Typography>
        )
    }
    if (isError || !userData) {
        return <Typography>Error loading user data. Please try again.</Typography>;
    }
    const [firstName, setFirstName] = useState(userData?.firstName || "");
    const [lastName, setLastName] = useState(userData?.lastName || "");

    const queryClient = useQueryClient();

    const editAccountMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append("firstName", firstName);
            formData.append("lastName", lastName);


            if (media) {
                const extension = media.name.split(".").pop()
                const s3key = `${userData.cid}/profile_picture.${extension}`;
                const { url } = await uploadMedia({ s3key, media, overwrite: true })
                formData.append("mediaPath", s3key)

            }

            const cid = await getCidFromToken(localStorage.getItem("id_token"))

            // updates the user info
            const response = await fetch(import.meta.env.VITE_APP_API_BASE_URL + `/users/${cid}/edit${firstTime ? "?create=true" : ""}`,
                {
                    method: "PATCH",
                    headers: {
                        // Authorization: `Bearer ${localStorage.getItem("id_token")}`,
                        // shouldnt manually specifiy content type as multipart form data as browser will auto generate boundary string.
                    },
                    body: formData
                }
            )

            if (response.status >= 200 && response.status <= 299) {
                const data = await response.json();
                return data
            } else {
                const data = await response.json();
                throw new Error(data.message)
            }


        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(QUERY_KEYS.CURRENT_USER)
            enqueueSnackbar(data.message, { variant: "success" })
        },
        onError: (error) => {
            enqueueSnackbar(`There was an error when trying to edit the user: ${error}`, { variant: "error" })
        }

    })

    const handleSubmit = () => {
        editAccountMutation.mutate();
        onClose();

    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth>
            <DialogTitle sx={{ fontSize: "1.5rem" }} align="center">
                {firstTime ? "Welcome! " : "Edit user info"}

            </DialogTitle>
            <Divider />
            <FormControl sx={{ margin: "1.5rem ", gap: "2rem" }}>
                <Box sx={{ display: "flex", gap: "1rem" }}>
                    <TextField
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        fullWidth
                        required
                    ></TextField>
                    <TextField
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        fullWidth
                        required
                    ></TextField>
                </Box>

                <Box sx={{ cursor: "pointer", padding: "1rem", outline: `solid ${palette.primary.main}` }} {...getRootProps()}>
                    <Input {...getInputProps()} />
                    {
                        media ? <Typography>{media.name}</Typography> : <Typography>Drag and Drop or Click to Browse</Typography>
                    }
                </Box>

                <Divider />

                <Box>
                    <Button
                        disabled={!(firstName && lastName)}
                        onClick={handleSubmit}
                        sx={{
                            color: palette.background.alt,
                            backgroundColor: palette.primary.main,
                        }}
                    >
                        {firstTime ? "Create profile" : "Update profile"}
                    </Button>
                </Box>
            </FormControl>


        </Dialog>
    )
}