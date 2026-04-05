"use client"

import React from 'react';
import { Box, Typography } from '@mui/material';
import TimeCard from './TimeCard';
import TimerCard from './TimerCard';
import HomeTimeCard from './HomeTimeCard';
import ConditionCard from './ConditionCard';
import WatchNameCard from './WatchNameCard';

const Time: React.FC = () => {
    return (
        <Box sx={{ 
            px: { xs: 2, md: 4 }, 
            pt: { xs: 3, md: 4 }, 
            pb: { xs: 2, md: 4 }, 
            maxWidth: { xs: 500, md: 600 }, 
            mx: 'auto', 
            width: '100%' 
        }}>
            {/* Page title — matches Android */}
            <Typography
                variant="h5"
                sx={{ 
                    mb: 3, 
                    fontWeight: 500, 
                    color: 'text.primary', 
                    letterSpacing: 0.2,
                    textAlign: { xs: 'center', md: 'left' }
                }}
            >
                Time
            </Typography>

            {/* Stacked cards vertically, matching Android layout */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TimeCard />
                <TimerCard />
                <WatchNameCard />
                {/* Home Time and Condition side-by-side at bottom */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                        <HomeTimeCard />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <ConditionCard />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Time;
