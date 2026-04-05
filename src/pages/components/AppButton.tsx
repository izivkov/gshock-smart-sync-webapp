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
}

const AppButton: React.FC<ButtonProps> = ({ 
    label, 
    onClick, 
    size = 'medium',
    variant = 'contained',
    startIcon,
    fullWidth = false,
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
            sx={{
                backgroundColor: variant === 'contained' ? '#8B5E3C' : 'transparent',
                color: variant === 'contained' ? '#FFFFFF' : '#8B5E3C',
                border: variant === 'outlined' ? '1px solid rgba(139, 94, 60, 0.5)' : 'none',
                '&:hover': {
                    backgroundColor: variant === 'contained' ? '#5C3A1E' : 'rgba(139, 94, 60, 0.08)',
                    borderColor: variant === 'outlined' ? '#8B5E3C' : undefined,
                },
                borderRadius: '100px',
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: variant === 'contained' ? '0 1px 3px rgba(139, 94, 60, 0.2)' : 'none',
                ...sizeStyles[size],
            }}
        >
            {label}
        </Button>
    )
}

export default AppButton;
