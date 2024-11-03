import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchWithRetry from "auth/fetchWithRetry.js";
import { QUERY_KEYS } from "queryKeys.ts";
import WidgetWrapper from "components/WidgetWrapper.jsx";
import { DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";


export default function EditPost({ postId, title, description, vGrade, attempts, createdAt, onEdit }) {
    const [editedTitle, setEditedTitle] = useState(title);
    const [editedDescription, setEditedDescription] = useState(description);
    const [editedVGrade, setEditedVGrade] = useState(vGrade);
    const [editedAttempts, setEditedAttempts] = useState(attempts);
    const [editedDate, setEditedDate] = useState(createdAt);


    const queryClient = useQueryClient();

    const updatePostMutation = useMutation({
        mutationFn: async () => {
            try {
                const updatedData = {
                    title: editedTitle,
                    description: editedDescription,
                    vGrade: editedVGrade,
                    attempts: editedAttempts,
                    createdAt: editedDate,
                };

                const response = await fetchWithRetry(
                    import.meta.env.VITE_APP_API_BASE_URL + `/posts/post/${postId}`,
                    {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("id_token")}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(updatedData),
                    }
                );

                if (response.ok) {
                    const updatedPost = await response.json();

                } else {
                    console.error("Failed to update the post");
                }
            } catch (error) {
                console.error("An error occurred while updating the post:", error);
            }
        },
        onSuccess: () => {

        }, onSettled: () => {
            //invalid posts
            //TODO implement infinite scrolling
            queryClient.invalidateQueries(QUERY_KEYS.POSTS);
        }

    })


    return <WidgetWrapper>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
            <TextField
                fullWidth
                variant="outlined"
                label="Title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                sx={{ mt: 2 }}
            />
            <TextField
                fullWidth
                variant="outlined"
                label="V-Grade"
                value={editedVGrade}
                onChange={(e) => setEditedVGrade(e.target.value)}
                sx={{ mt: 2 }}
            />
            <TextField
                fullWidth
                variant="outlined"
                label="Attempts"
                value={editedAttempts}
                onChange={(e) => setEditedAttempts(e.target.value)}
                sx={{ mt: 2 }}
            />
            <TextField
                fullWidth
                variant="outlined"
                label="Description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                multiline
                rows={4}
                sx={{ mt: 2 }}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onEdit()} color="secondary">
                Cancel
            </Button>
            <Button onClick={() => {
                updatePostMutation.mutate();
                onEdit();
            }} color="primary" variant="contained">
                Save
            </Button>
        </DialogActions>
    </WidgetWrapper>
}