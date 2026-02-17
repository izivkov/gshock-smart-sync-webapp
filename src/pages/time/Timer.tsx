"use client"

import React from 'react';
import { Box } from '@mui/material';
import TimerCard from './TimerCard';

const Timer: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <TimerCard />
        </Box>
    );
};

export default Timer;