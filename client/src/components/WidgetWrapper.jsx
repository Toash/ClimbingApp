import { Box } from "@mui/material";
import { styled, keyframes } from "@mui/system";


// theme property will be passed in from the parent component 
// should forward prop to prevent passing to dom. (remove error)
const WidgetWrapper = styled(Box)(({ theme }) => ({
  padding: "1.5rem 1.5rem 0.75rem 1.5rem",
  backgroundColor: theme.palette.background.alt,
  borderRadius: "0.75rem",
  outline: `0px solid ${theme.palette.neutral.outline}`,
  position: "relative",
}));

export default WidgetWrapper;
