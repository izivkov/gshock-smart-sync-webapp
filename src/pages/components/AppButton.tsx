"use client"

import React from 'react';
import Button from '@mui/material/Button';

interface ButtonProps {
    label: string;
    onClick?: () => void;
}

const AppButton: React.FC<ButtonProps> = ({ label, onClick }) => {
    return (
        <Button
            variant="contained"
            onClick={onClick}
            sx={{
                backgroundColor: '#6366f1', // Indigo 500
                background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                '&:hover': {
                    background: 'linear-gradient(45deg, #4f46e5 30%, #9333ea 90%)',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                },
                borderRadius: '12px',
                textTransform: 'none',
                padding: '12px 28px',
                fontWeight: 'bold',
                boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
            }}
        >
            {label}
        </Button>
    )
}

export default AppButton;