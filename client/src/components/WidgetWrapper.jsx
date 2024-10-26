import { Box } from "@mui/material";
import { styled } from "@mui/system";

// what does styled do and what is theme
// WidgetWrapper is just a box so it also accepts the respective properties.
// TODO: look into mui styled function.
const WidgetWrapper = styled(Box)(({ theme }) => ({
  padding: "1.5rem 1.5rem 0.75rem 1.5rem",
  backgroundColor: theme.palette.background.alt,
  borderRadius: "0.75rem",
  outline: `0px solid ${theme.palette.neutral.outline}`,
}));

export default WidgetWrapper;
