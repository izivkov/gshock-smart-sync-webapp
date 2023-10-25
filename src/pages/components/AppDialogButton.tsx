"use client"

import React, { Component } from 'react';

import { Button } from "@material-tailwind/react";

interface AppDialogButtonProps {
    label: string;
    onClick?: () => void;
}

const AppDialogButton: React.FC<AppDialogButtonProps> = ({ label, onClick }) => {
    return (
        <Button variant="text" size="md"
            className="focus:outline-none font-large rounded-lg text-sm px-5 py-2.5" onClick={onClick}>
            {label}
        </Button>
    )
}

export default AppDialogButton;