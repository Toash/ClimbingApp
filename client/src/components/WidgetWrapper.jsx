import { Box } from "@mui/material";
import { styled } from "@mui/system";


const WidgetWrapper = styled(Box)(({ theme }) => ({
  padding: "1.25rem",
  backgroundColor: theme.palette.background.alt,
  borderRadius: "0.25rem",
  outline: `0px solid ${theme.palette.neutral.outline}`,
  position: "relative",
}));

export default WidgetWrapper;
