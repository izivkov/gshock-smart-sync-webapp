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
        <Box sx={{ px: 2, pt: 3, pb: 2, maxWidth: 500, mx: 'auto', width: '100%' }}>
            {/* Page title — matches Android */}
            <Typography
                variant="h5"
                align="center"
                sx={{ mb: 2.5, fontWeight: 500, color: 'text.primary', letterSpacing: 0.2 }}
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