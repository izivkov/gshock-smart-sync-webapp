"use client";

import React from "react";
import { Card, type CardProps } from "@mui/material";
import { peachCardSx } from "../theme/peachCardStyles";

type PeachCardProps = CardProps & {
    /** Default padding 3 (24px); set false for no padding */
    padded?: boolean;
};

/**
 * Rounded peach “card” surface matching the Android G-Shock app lists / time blocks.
 */
const PeachCard: React.FC<PeachCardProps> = ({ children, sx, padded = true, ...rest }) => (
    <Card
        elevation={0}
        sx={[
            peachCardSx,
            padded ? { p: 3 } : undefined,
            ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        {...rest}
    >
        {children}
    </Card>
);

export default PeachCard;
