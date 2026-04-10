"use client"

import React from 'react';
import { Button } from "@mui/material";

interface AppDialogButtonProps {
    label: string;
    onClick?: () => void;
}

const AppDialogButton: React.FC<AppDialogButtonProps> = ({ label, onClick }) => {
    return (
        <Button variant="text" size="medium" onClick={onClick}
            sx={{ fontWeight: 500, borderRadius: 2, textTransform: 'none', px: 2.5, py: 1 }}>
            {label}
        </Button>
    );
};

export default AppDialogButton;