"use client";

import React from "react";
import { Box, type BoxProps } from "@mui/material";
import { peachCardSx } from "../theme/peachCardStyles";

type PeachCardProps = BoxProps & {
    /** Default padding 3 (24px); set false for no padding */
    padded?: boolean;
};

/**
 * Rounded peach “card” surface matching the Android G-Shock app lists / time blocks.
 */
const PeachCard: React.FC<PeachCardProps> = ({ children, sx, padded = true, ...rest }) => (
    <Box
        sx={[
            peachCardSx,
            padded ? { p: 3 } : undefined,
            ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        {...rest}
    >
        {children}
    </Box>
);

export default PeachCard;
