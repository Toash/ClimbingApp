import { AccordionDetails, AccordionSummary, Button, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState, useRef } from "react";
import WidgetWrapper from "./WidgetWrapper.jsx";
import Accordion from "@mui/material/Accordion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

const CollapsibleWidgetWrapper = ({ defaultExpanded, label, children }) => {
    const { palette } = useTheme();


    // // can use useref to directly aqccess dom elements
    // // and hold variables that can change without causing additonal rerenders
    // const contentRef = useRef();
    // if (contentRef.current) {
    //     console.log(contentRef.current.scrollHeight);
    // }

    return (


        <Accordion defaultExpanded={defaultExpanded} sx={{ backgroundColor: palette.background.default, width: "100%" }}>
            <AccordionSummary
                sx={{ fontSize: "1.5rem", fontWeight: "500" }}
                expandIcon={<ExpandMoreIcon />}
            >
                {label}
            </AccordionSummary>
            <>{children}</>


        </Accordion>
    )
}

export default CollapsibleWidgetWrapper;