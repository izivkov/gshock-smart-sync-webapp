"use client"

import React, { ReactNode } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@material-tailwind/react";

interface AppDialogProps {
    open: boolean;
    onClose: (date: any) => void;
    children: ReactNode;
    title: string;
}

const AppDialog: React.FC<AppDialogProps> = ({ open, onClose, title, children }) => {

    return (

        <Dialog size="xs" style={{ zIndex: 0 }} className="w-96"
            title={title}
            open={open}
            handler={onClose}
            animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 0.9, y: -100 },
            }
            }>
            <DialogHeader>{title}</DialogHeader>
            {children}

        </Dialog >
    )
}

export default AppDialog;
