"use client"

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import WatchIcon from '@mui/icons-material/Watch';
import TimerIcon from '@mui/icons-material/Timer';
import PublicIcon from '@mui/icons-material/Public';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnected';
import TimerInput from './TimerInput';
import BatteryLevel from './BatteryLevel';
import DigitalClock from '../components/DigitalClock';
import GShockAPI from '@/api/GShockAPI';
import { progressEvents, EventAction } from '@api/ProgressEvents';
import { watchInfo } from '@api/WatchInfo';
import { ConnectionContext } from '../_app.page';
import ScreenTitle from '../components/ScreenTitle';
import PeachCard from '../components/PeachCard';
import {
    formatHomeTimeForDisplay,
    formatTemperatureFromCelsius,
    isNorthAmerica12HourClock,
    useFahrenheitForTemperature,
} from '@/utils/localeDisplay';

const Time: React.FC = () => {
    const { isConnected } = useContext(ConnectionContext);
    const [timerValue, setTimerValue] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [homeTime, setHomeTime] = useState<string>("");
    const [batteryLevel, setBatteryLevel] = useState<number>(0);
    const [temperature, setTemperature] = useState<number>(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

    // Initial data load
    useEffect(() => {
        (async () => {
            const timer = await GShockAPI.getTimer();
            setTimerValue(timer);
            setHomeTime(await GShockAPI.getHomeTime());
            setTemperature(await GShockAPI.getWatchTemperature());
            setBatteryLevel(await GShockAPI.getBatteryLevel());
        })();
    }, []);

    // Refresh battery level and temperature when connection status changes
    useEffect(() => {
        if (isConnected) {
            (async () => {
                const level = await GShockAPI.getBatteryLevel();
                const temp = await GShockAPI.getWatchTemperature();
                const homeTime = await GShockAPI.getHomeTime();
                const timer = await GShockAPI.getTimer();
                setTimerValue(timer);
                setBatteryLevel(level);
                setTemperature(temp);
                setHomeTime(homeTime);
            })();
        }
    }, [isConnected]);

    const handleTimerChange = (value: { hours: number, minutes: number, seconds: number }) => {
        setTimerValue(value);
    };

    const handleSetTime = async () => {
        try {
            await GShockAPI.setTime();
            setHomeTime(await GShockAPI.getHomeTime()); // 👈 directly update state
            setSnackbarMessage('Time sent to watch');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Failed to send time');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleSetTimer = () => {
        try {
            const timeInSeconds = timerValue.hours * 3600 + timerValue.minutes * 60 + timerValue.seconds;
            GShockAPI.setTimer(timeInSeconds);
            setSnackbarMessage('Timer sent to watch');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Failed to send timer');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const use12HourClock = useMemo(() => isNorthAmerica12HourClock(), []);
    const fahrenheitTemp = useMemo(() => useFahrenheitForTemperature(), []);
    const tempShown = formatTemperatureFromCelsius(temperature, fahrenheitTemp);

    return (
        <Box sx={{
            px: { xs: 2, md: 3 },
            pt: { xs: 2, md: 3 },
            pb: { xs: 12, md: 3 },
            maxWidth: 480,
            mx: 'auto',
            width: '100%'
        }}>
            <ScreenTitle title="Time" />

            <PeachCard sx={{ p: 2, mb: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '12px',
                                backgroundColor: 'rgba(139, 94, 60, 0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <WatchIcon sx={{ color: '#8B5E3C', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: '#2D1A0E',
                                    lineHeight: 1.2,
                                    fontSize: '1.125rem',
                                }}
                            >
                                {watchInfo.name || 'G-Shock'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <BluetoothConnectedIcon sx={{ fontSize: 12, color: '#4CAF50' }} />
                                <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 500 }}>
                                    Connected
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <BatteryLevel key={batteryLevel} level={batteryLevel} />
                </Box>
            </PeachCard>

            <PeachCard sx={{ mb: 2, position: 'relative', overflow: 'hidden' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: -40,
                        right: -40,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(139, 94, 60, 0.05)',
                    }}
                />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography
                        sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#8B5E3C',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            mb: 1,
                        }}
                    >
                        Local Time
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <DigitalClock size="large" showSeconds={true} />
                            <Typography
                                sx={{
                                    fontSize: '0.8125rem',
                                    color: '#7A5C44',
                                    mt: 0.5,
                                }}
                            >
                                {timeZone.replace('_', ' ')}
                            </Typography>
                        </Box>
                        <Button variant="contained" onClick={handleSetTime} sx={{ flexShrink: 0, borderRadius: 100 }}>
                            Send to Watch
                        </Button>
                    </Box>
                </Box>
            </PeachCard>

            <PeachCard sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TimerIcon sx={{ fontSize: 18, color: '#8B5E3C' }} />
                    <Typography
                        sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#8B5E3C',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}
                    >
                        Timer
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TimerInput initialValue={timerValue} onUpdate={handleTimerChange} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" onClick={handleSetTimer} sx={{ borderRadius: 100 }}>
                            Send to Watch
                        </Button>
                    </Box>
                </Box>
            </PeachCard>

            <PeachCard sx={{ mb: 2, py: 4, textAlign: 'center' }}>
                <Typography
                    sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: '#8B5E3C',
                        letterSpacing: '0.35em',
                    }}
                >
                    CASIO
                </Typography>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: '#2D1A0E',
                        mt: 0.75,
                        fontFamily: '"SF Mono", "Roboto Mono", monospace',
                        letterSpacing: '0.04em',
                    }}
                >
                    {(watchInfo.shortName || watchInfo.name || 'G-SHOCK').toUpperCase()}
                </Typography>
            </PeachCard>

            <Box sx={{ display: 'grid', gridTemplateColumns: watchInfo.hasTemperature ? '1fr 1fr' : '1fr', gap: 1.5 }}>
                <PeachCard sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                        <PublicIcon sx={{ fontSize: 16, color: '#8B5E3C' }} />
                        <Typography
                            sx={{
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                color: '#8B5E3C',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                            }}
                        >
                            Home Time
                        </Typography>
                    </Box>
                    <Typography
                        sx={{
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: '#2D1A0E',
                            fontFamily: '"SF Mono", "Roboto Mono", monospace',
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {formatHomeTimeForDisplay(homeTime || undefined, use12HourClock)}
                    </Typography>
                </PeachCard>

                {watchInfo.hasTemperature && (
                    <PeachCard sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                            <ThermostatIcon sx={{ fontSize: 16, color: '#8B5E3C' }} />
                            <Typography
                                sx={{
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    color: '#8B5E3C',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                }}
                            >
                                Temperature
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                color: '#2D1A0E',
                                fontFamily: '"SF Mono", "Roboto Mono", monospace',
                            }}
                        >
                            {tempShown.text}
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    color: '#7A5C44',
                                    ml: 0.25,
                                }}
                            >
                                {tempShown.unit}
                            </Typography>
                        </Typography>
                    </PeachCard>
                )}
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export const getServerSideProps = async () => ({ props: {} });
export default Time;