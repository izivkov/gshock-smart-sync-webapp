"use client"

import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Box, Typography, Button, Snackbar, Alert, Stack } from '@mui/material';
import WatchIcon from '@mui/icons-material/Watch';
import TimerIcon from '@mui/icons-material/Timer';
import PublicIcon from '@mui/icons-material/Public';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import SendIcon from '@mui/icons-material/Send';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnected';
import TimerInput from './TimerInput';
import BatteryLevel from './BatteryLevel';
import DigitalClock from '../components/DigitalClock';
import GShockAPI from '@/api/GShockAPI';
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

const BOTTOM_NAV_HEIGHT = '80px';

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

    const refreshWatchData = useCallback(async () => {
        if (!isConnected) return;
        try {
            const timer = await GShockAPI.getTimer();
            setTimerValue(timer);
            const ht = await GShockAPI.getHomeTime();
            setHomeTime(ht);
            const temp = await GShockAPI.getWatchTemperature();
            setTemperature(temp);
            const level = await GShockAPI.getBatteryLevel();
            setBatteryLevel(level);
        } catch (error) {
            console.error("Watch refresh failed:", error);
        }
    }, [isConnected]);

    useEffect(() => {
        refreshWatchData();
    }, [isConnected, refreshWatchData]);

    const handleSetTime = async () => {
        try {
            await GShockAPI.setTime();
            setTimeout(async () => {
                const updatedHomeTime = await GShockAPI.getHomeTime();
                setHomeTime(updatedHomeTime);
            }, 500);
            setSnackbarMessage('Time synced');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Sync failed');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleSetTimer = async () => {
        try {
            const timeInSeconds = timerValue.hours * 3600 + timerValue.minutes * 60 + timerValue.seconds;
            await GShockAPI.setTimer(timeInSeconds);
            setSnackbarMessage('Timer set');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Timer failed');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const use12HourClock = useMemo(() => isNorthAmerica12HourClock(), []);
    const fahrenheitTemp = useMemo(() => useFahrenheitForTemperature(), []);
    const tempShown = formatTemperatureFromCelsius(temperature, fahrenheitTemp);

    return (
        <Box sx={{
            width: '100%',
            height: { xs: '100dvh', md: '100%' },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.default',
            pb: { xs: BOTTOM_NAV_HEIGHT, md: 0 }
        }}>
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                px: { xs: 1.5, sm: 3, md: 4 },
                pt: 1,
                pb: 2
            }}>
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    {/* Wrap ScreenTitle in a Box to handle the margin fix */}
                    <Box sx={{ mb: 1.5 }}>
                        <ScreenTitle title="Time" />
                    </Box>

                    <Stack spacing={1.5} sx={{ width: '100%' }}>
                        <PeachCard sx={{ p: 1.25 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{
                                        width: 36, height: 36, borderRadius: '8px',
                                        bgcolor: 'rgba(139, 94, 60, 0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <WatchIcon sx={{ color: '#8B5E3C', fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, color: '#2D1A0E', fontSize: '0.95rem', lineHeight: 1 }}>
                                            {watchInfo.name || 'G-Shock'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                            <BluetoothConnectedIcon sx={{ fontSize: 10, color: isConnected ? '#4CAF50' : '#f44336' }} />
                                            <Typography variant="caption" sx={{ color: isConnected ? '#4CAF50' : '#f44336', fontWeight: 600, fontSize: '0.65rem' }}>
                                                {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <BatteryLevel level={batteryLevel} />
                            </Box>
                        </PeachCard>

                        <PeachCard sx={{ p: 1.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                Phone Time
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <DigitalClock size="medium" showSeconds={true} />
                                    <Typography sx={{ fontSize: '0.7rem', color: '#7A5C44', mt: 0.2 }}>
                                        {timeZone.split('/').pop()?.replace('_', ' ')}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained" size="small" onClick={handleSetTime}
                                    startIcon={<SendIcon sx={{ fontSize: '0.9rem !important' }} />}
                                    sx={{ borderRadius: 100, px: 2, height: 32, textTransform: 'none', fontWeight: 600 }}
                                >
                                    Sync
                                </Button>
                            </Box>
                        </PeachCard>

                        <PeachCard sx={{ p: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                                <TimerIcon sx={{ fontSize: 16, color: '#8B5E3C' }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase' }}>
                                    Timer
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                <TimerInput initialValue={timerValue} onUpdate={setTimerValue} />
                                <Button
                                    variant="contained" size="small" onClick={handleSetTimer}
                                    startIcon={<SendIcon sx={{ fontSize: '0.9rem !important' }} />}
                                    sx={{ borderRadius: 100, px: 2, height: 32, textTransform: 'none', fontWeight: 600 }}
                                >
                                    Set
                                </Button>
                            </Box>
                        </PeachCard>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                            <PeachCard sx={{ p: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                    <PublicIcon sx={{ fontSize: 14, color: '#8B5E3C' }} />
                                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase' }}>
                                        Watch
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#2D1A0E', fontFamily: 'monospace' }}>
                                    {formatHomeTimeForDisplay(homeTime || undefined, use12HourClock)}
                                </Typography>
                            </PeachCard>

                            {watchInfo.hasTemperature && (
                                <PeachCard sx={{ p: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <ThermostatIcon sx={{ fontSize: 14, color: '#8B5E3C' }} />
                                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase' }}>
                                            Temp
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#2D1A0E', fontFamily: 'monospace' }}>
                                        {tempShown.text}{tempShown.unit}
                                    </Typography>
                                </PeachCard>
                            )}
                        </Box>
                    </Stack>
                </Box>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Time;
