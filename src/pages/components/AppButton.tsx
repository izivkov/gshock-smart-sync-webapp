"use client"

import React, { Component } from 'react';

import { Button } from "@material-tailwind/react";

interface ButtonProps {
    label: string;
    onClick?: () => void;
}

const AppButton: React.FC<ButtonProps> = ({ label, onClick }) => {
    return (
        <Button variant="outlined" size="md"
            className="focus:outline-none text-white bg-purple-900 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900" onClick={onClick}>
            {label}
        </Button>
    )
}

export default AppButton;