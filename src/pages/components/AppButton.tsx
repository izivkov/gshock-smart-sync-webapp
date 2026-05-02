"use client"

import React from 'react';
import Button from '@mui/material/Button';

interface ButtonProps {
    label: string;
    onClick?: () => void;
    size?: 'small' | 'medium' | 'large';
    variant?: 'contained' | 'outlined' | 'text';
    startIcon?: React.ReactNode;
    fullWidth?: boolean;
    disabled?: boolean;
}

const AppButton: React.FC<ButtonProps> = ({ 
    label, 
    onClick, 
    size = 'medium',
    variant = 'contained',
    startIcon,
    fullWidth = false,
    disabled = false,
}) => {
    const sizeStyles = {
        small: { padding: '6px 16px', fontSize: '0.8125rem' },
        medium: { padding: '8px 20px', fontSize: '0.875rem' },
        large: { padding: '12px 28px', fontSize: '1rem' },
    };

    return (
        <Button
            variant={variant}
            onClick={onClick}
            startIcon={startIcon}
            fullWidth={fullWidth}
            disabled={disabled}
            sx={{
                ...sizeStyles[size],
            }}
        >
            {label}
        </Button>
    )
}

export default AppButton;
