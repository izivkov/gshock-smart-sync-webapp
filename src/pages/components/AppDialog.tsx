"use client"

import React, { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

interface AppDialogProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    title: string;
    style?: React.CSSProperties;
}

const AppDialog: React.FC<AppDialogProps> = ({ open, onClose, title, style, children }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{ paper: { style, sx: { borderRadius: 3, minWidth: 320 } } }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
        </Dialog>
    );
};

export default AppDialog;
