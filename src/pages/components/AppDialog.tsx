"use client"

import React, { ReactNode } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@material-tailwind/react";

interface AppDialogProps {
    open: boolean;
    onClose: (date: any) => void;
    children: ReactNode;
    title: string;
    style?: React.CSSProperties;
}

const AppDialog: React.FC<AppDialogProps> = ({ open, onClose, title, style, children }) => {

    return (

        <Dialog size="sm" style={style} className="flex flex-col justify-between items-start w-full gap-4 p-4 overflow-visible"
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
