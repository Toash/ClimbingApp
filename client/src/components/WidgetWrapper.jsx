import { Box } from "@mui/material";
import { styled, keyframes } from "@mui/system";

// Define keyframes for a yellow lightning flash effect with random sparks
const lightningFlash = keyframes`
  0% { box-shadow: 0 0 5px 0 #2EAA2E; }
  100% { box-shadow: 0 0 20px 0 #2EAA2E; }
`;



// theme property will be passed in from the parent component 
// should forward prop to prevent passing to dom. (remove error)
const WidgetWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "lightning",
})(({ theme, lightning = false }) => ({
  padding: "1.5rem 1.5rem 0.75rem 1.5rem",
  backgroundColor: theme.palette.background.alt,
  borderRadius: "0.75rem",
  outline: `0px solid ${theme.palette.neutral.outline}`,
  position: "relative",
  animation: lightning ? `${lightningFlash} 3s infinite ease-in-out alternate` : null,

}));

export default WidgetWrapper;
