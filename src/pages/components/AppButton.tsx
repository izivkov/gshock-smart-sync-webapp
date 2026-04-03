

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
                backgroundColor: '#4c1d95', // purple-900
                '&:hover': {
                    backgroundColor: '#5b21b6', // purple-800
                },
                borderRadius: '8px',
                textTransform: 'none',
                padding: '10px 20px',
            }}
        >
            {label}
        </Button>
    )
}

export default AppButton;