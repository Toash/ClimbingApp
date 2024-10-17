import { Box } from "@mui/material";
import { useEffect } from "react";
import React from "react";
import { useState } from "react";
import PropTypes from "prop-types"

/**
 * Fetches a user image from an S3 bucket and renders it with the specified size.
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
  const [imgUrl, setImgUrl] = useState("https://toash-climbing-media.s3.us-east-2.amazonaws.com/default.png");
  useEffect(() => {
    if (s3key && s3key.trim() !== "") {
      setImgUrl(`https://toash-climbing-media.s3.us-east-2.amazonaws.com/${s3key}`);
    }
  }, []);


  return (
    <Box width={size} height={size}>
      <img
        style={{ objectFit: "cover", borderRadius: "50%" }}
        width={size}
        height={size}
        alt=""
        src={imgUrl}
      />
    </Box>
  );
};

UserImage.propTypes = {

  s3key: PropTypes.string.isRequired,
  size: PropTypes.string
}



export default UserImage;
