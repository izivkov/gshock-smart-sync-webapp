"use client"

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, IconButton, Tooltip, Divider } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import WatchIcon from '@mui/icons-material/Watch';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import PublicIcon from '@mui/icons-material/Public';
import SyncIcon from '@mui/icons-material/Sync';
import TimerInput from './TimerInput';
import BatteryLevel from './BatteryLevel';
import DigitalClock from '../components/DigitalClock';
import GShockAPI from '@/api/GShockAPI';
import { progressEvents } from '@api/ProgressEvents';
import { watchInfo } from '@api/WatchInfo';

const Time: React.FC = () => {
    const [timerValue, setTimerValue] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [homeTime, setHomeTime] = useState<string>("");
    const [batteryLevel, setBatteryLevel] = useState<number>(0);
    const [temperature, setTemperature] = useState<number>(0);

    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

    useEffect(() => {
        (async () => {
            const timer = await GShockAPI.getTimer();
            setTimerValue(timer);
            setHomeTime(await GShockAPI.getHomeTime());
            setTemperature(await GShockAPI.getWatchTemperature());
            setBatteryLevel(await GShockAPI.getBatteryLevel());
        })();
    }, []);

    const handleTimerChange = (value: { hours: number, minutes: number, seconds: number }) => {
        setTimerValue(value);
    };

    const handleSetTime = () => {
        GShockAPI.setTime();
        progressEvents.onNext("HomeTimeUpdated");
    };

    const handleSetTimer = () => {
        const timeInSeconds = timerValue.hours * 3600 + timerValue.minutes * 60 + timerValue.seconds;
        GShockAPI.setTimer(timeInSeconds);
    };

    // Shared card styles
    const cardStyle = {
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(139, 94, 60, 0.08)',
        backgroundColor: '#FCEEE6',
        height: '100%',
    };

    const sectionLabelStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: '#7A5C44',
        fontSize: '0.75rem',
        fontWeight: 500,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        mb: 1.5,
    };

    return (
        <Box sx={{ 
            px: { xs: 2, md: 3 }, 
            pt: { xs: 2, md: 3 }, 
            pb: { xs: 10, md: 3 }, 
            maxWidth: { xs: '100%', md: 520 }, 
            mx: 'auto', 
            width: '100%' 
        }}>
            {/* Watch Name Header */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 3,
                px: 1,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <WatchIcon sx={{ color: '#8B5E3C', fontSize: 28 }} />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D1A0E', lineHeight: 1.2 }}>
                            {watchInfo.name || 'G-Shock'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#7A5C44' }}>
                            Connected
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Current Time Card - Hero */}
            <Card sx={{ ...cardStyle, mb: 2 }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Box sx={sectionLabelStyle}>
                                <AccessTimeIcon sx={{ fontSize: 16 }} />
                                <span>Current Time</span>
                            </Box>
                            <DigitalClock />
                            <Typography variant="body2" sx={{ color: '#7A5C44', mt: 0.5 }}>
                                {timeZone}
                            </Typography>
                        </Box>
                        <Tooltip title="Sync time to watch">
                            <IconButton 
                                onClick={handleSetTime}
                                sx={{ 
                                    backgroundColor: '#8B5E3C',
                                    color: '#FFFFFF',
                                    width: 44,
                                    height: 44,
                                    '&:hover': { backgroundColor: '#5C3A1E' },
                                }}
                            >
                                <SyncIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </CardContent>
            </Card>

            {/* Timer Card */}
            <Card sx={{ ...cardStyle, mb: 2 }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Box sx={sectionLabelStyle}>
                                <TimerIcon sx={{ fontSize: 16 }} />
                                <span>Timer</span>
                            </Box>
                            <TimerInput initialValue={timerValue} onUpdate={handleTimerChange} />
                        </Box>
                        <Tooltip title="Set timer on watch">
                            <IconButton 
                                onClick={handleSetTimer}
                                sx={{ 
                                    backgroundColor: '#8B5E3C',
                                    color: '#FFFFFF',
                                    width: 44,
                                    height: 44,
                                    mt: 2.5,
                                    '&:hover': { backgroundColor: '#5C3A1E' },
                                }}
                            >
                                <SyncIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </CardContent>
            </Card>

            {/* Watch Status Row - Two columns */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {/* Home Time */}
                <Card sx={cardStyle}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={sectionLabelStyle}>
                            <PublicIcon sx={{ fontSize: 16 }} />
                            <span>Home</span>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D1A0E' }}>
                            {homeTime || '--:--'}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Temperature */}
                <Card sx={cardStyle}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={sectionLabelStyle}>
                            <ThermostatIcon sx={{ fontSize: 16 }} />
                            <span>Temp</span>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D1A0E' }}>
                            {temperature}°C
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Battery Status */}
            <Card sx={{ ...cardStyle, mt: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#7A5C44', fontWeight: 500 }}>
                            Battery
                        </Typography>
                        <BatteryLevel level={batteryLevel} />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Time;
