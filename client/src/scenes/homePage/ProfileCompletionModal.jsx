import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
} from "@mui/material";
import { Auth, Storage } from "aws-amplify";

function ProfileCompletionDialog({ open, onComplete }) {
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload the profile image to S3
      const photoKey = `profile-images/${username}-${Date.now()}`;
      await Storage.put(photoKey, profileImage, {
        contentType: profileImage.type,
      });

      const profileImageUrl = await Storage.get(photoKey);

      // Get Cognito user ID
      const user = await Auth.currentAuthenticatedUser();
      const cognitoUserId = user.attributes.sub;

      // Save profile in the backend (e.g., MongoDB)
      const response = await fetch("/api/user-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cognitoUserId,
          username,
          profileImageUrl,
        }),
      });

      if (response.ok) {
        onComplete();
      }
    } catch (error) {
      console.error("Error completing profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} disableEscapeKeyDown disableBackdropClick>
      <DialogTitle>Complete Your Profile</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting}
            style={{ marginTop: "20px" }}
          >
            {isSubmitting ? "Submitting..." : "Save Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileCompletionDialog;
