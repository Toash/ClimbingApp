import React from "react";
import { Box, Typography } from "@mui/material";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <Box role="alert" padding="1rem" border="1px solid red" borderRadius="8px">
      <Typography variant="h6" color="error">
        Something went wrong:
      </Typography>
      <Typography variant="body1" color="error">
        {error.message}
      </Typography>
      <Typography variant="body2" color="error">
        {error.stack}
      </Typography>
      <button onClick={resetErrorBoundary}>Try again</button>
    </Box>
  );
};

export default ErrorFallback;
