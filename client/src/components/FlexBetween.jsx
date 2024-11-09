import { Box } from "@mui/material";
import { styled } from "@mui/system";

/**
 * A styled component that creates a Box with flex display,
 * space-between justification, and center alignment of items.
 *
 * @component
 * @example
 * return (
 *   <FlexBetween>
 *     <div>Item 1</div>
 *     <div>Item 2</div>
 *   </FlexBetween>
 * );
 */
const FlexBetween = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export default FlexBetween;
