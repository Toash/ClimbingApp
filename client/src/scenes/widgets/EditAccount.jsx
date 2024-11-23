import { Dialog, DialogTitle, FormControl, InputLabel, TextField, Input, Typography, useTheme, Divider } from "@mui/material";
import { Box } from "@mui/system";
import { useMutation } from "@tanstack/react-query";
import useAuthenticatedUser from "data/useAuthenticatedUser.ts";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function EditAccount({ open, onClose, firstTime = true, data }) {
    const [firstName, setFirstName] = useState(data?.firstName || "");
    const [lastName, setLastName] = useState(data?.lastName || "");
    const [media, setMedia] = useState(null);
    const [profilePicturePath, setProfilePicturePath] = useState(data?.profilePicturePath || "")

    const { palette } = useTheme();

    const onDrop = useCallback((acceptedFiles) => {
        setMedia(acceptedFiles[0])
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const { data: userData } = useAuthenticatedUser();

    const editAccountMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append("firstName", firstName);
            formData.append("lastName", lastName);


            if (media) {

            }

        }
    })

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
                <Box>
                    <TextField
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        fullWidth
                    ></TextField>
                </Box>

                <Box sx={{ cursor: "pointer", padding: "1rem", outline: `solid ${palette.primary.main}` }} {...getRootProps()}>
                    <Input {...getInputProps()} />
                    {
                        <Typography>Drag and Drop or Click to Browse</Typography>
                    }
                </Box>
            </FormControl>


        </Dialog>
    )
}