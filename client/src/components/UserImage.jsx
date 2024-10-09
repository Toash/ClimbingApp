import { Box } from "@mui/material";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { useState, useEffect } from "react";

/**
 * Fetches a user image from an S3 bucket and renders it with the specified size.
 *
 * This asynchronous component retrieves the image using the provided S3 key,
 * sends a `GetObjectCommand` to the S3 bucket, and renders the image in an
 * HTML <img> element. The image is styled to be a circle with a customizable
 * size, and by default, it's displayed at 60px x 60px.
 *
 * @async
 * @function UserImage
 * @param {Object} props - The component props.
 * @param {string} props.s3key - public S3 media url
 * @param {string} [props.size="60px"] - The width and height of the image (default is "60px").
 * @returns {JSX.Element} A box containing the user image rendered as a circular image.
 *
 * @example
 * <UserImage s3key="path/to/image.jpg" size="100px" />
 */
const UserImage = ({ s3key, size = "60px" }) => {
  useEffect(() => {
    if (!s3key) {
      const errorMsg = "Error: key is undefined in UserImage component.";
      console.error(errorMsg, new Error().stack);
      throw new Error(`${errorMsg} Check the component hierarchy.`);
    }
  }, []);

  const img_url = `https://toash-climbing-media.s3.us-east-2.amazonaws.com/${s3key}`;
  return (
    <Box width={size} height={size}>
      <img
        style={{ objectFit: "cover", borderRadius: "50%" }}
        width={size}
        height={size}
        alt=""
        src={img_url}
      />
    </Box>
  );
};

export default UserImage;
