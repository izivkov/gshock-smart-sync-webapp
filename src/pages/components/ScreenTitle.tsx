"use client"

import React from "react";
import { Typography } from "@mui/material";

interface ScreenTitleProps {
    title: string;
}

const ScreenTitle: React.FC<ScreenTitleProps> = ({ title }) => (
    <Typography
        variant="h5"
        component="h1"
        sx={{
            mb: 3,
            fontWeight: 500,
            color: "text.primary",
            letterSpacing: 0.2,
            textAlign: "center",
            width: "100%",
        }}
    >
        {title}
    </Typography>
);

export default ScreenTitle;
