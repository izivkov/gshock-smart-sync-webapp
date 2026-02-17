"use client"

import React from 'react';
import { Box, Grid } from '@mui/material';
import TimeCard from './TimeCard';
import TimerCard from './TimerCard';
import HomeTimeCard from './HomeTimeCard';
import ConditionCard from './ConditionCard';
import WatchNameCard from './WatchNameCard';

const Time: React.FC = () => {
    return (
        <Box sx={{ py: 4 }}>
            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} md={6} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TimeCard />
                </Grid>
                <Grid item xs={12} md={6} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TimerCard />
                </Grid>
                <Grid item xs={12} md={6} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <WatchNameCard />
                </Grid>
                <Grid item xs={12} md={6} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <HomeTimeCard />
                </Grid>
                <Grid item xs={12} md={6} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ConditionCard />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Time;