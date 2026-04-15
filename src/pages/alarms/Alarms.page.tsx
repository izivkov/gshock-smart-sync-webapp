"use client"

import React, { useEffect, useRef, useState } from 'react';
import {
    Box, Typography, Button, Snackbar, Alert, Stack, Divider, useTheme
} from '@mui/material';
import AlarmCard from './AlarmCard';
import AppSwitch from '@components/AppSwitch';
import GShockAPI from '@/api/GShockAPI';
import ScreenTitle from '../components/ScreenTitle';

const BOTTOM_NAV_HEIGHT = '80px';

const Alarms: React.FC = () => {
    const theme = useTheme();
    const initialized = useRef(false);
    const [alarms, setAlarms] = useState<{
        hour: number, minute: number, hasHourlyChime: boolean, enabled: boolean
    }[]>([
        { hour: 0, minute: 0, hasHourlyChime: false, enabled: false },
        { hour: 0, minute: 0, hasHourlyChime: false, enabled: false },
        { hour: 0, minute: 0, hasHourlyChime: false, enabled: false },
        { hour: 0, minute: 0, hasHourlyChime: false, enabled: false },
        { hour: 0, minute: 0, hasHourlyChime: false, enabled: false },
    ]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    useEffect(() => {
        (async () => {
            if (!initialized.current) {
                initialized.current = true;
                try {
                    const newAlarms = await GShockAPI.getAlarms();
                    setAlarms(Array.isArray(newAlarms) ? newAlarms.slice(0, 5) : []);
                } catch (e) {
                    console.error("Failed to fetch alarms", e);
                }
            }
        })()
    }, []);

    const sendToPhone = async () => { /* placeholder */ }

    const sendToWatch = async () => {
        try {
            await GShockAPI.setAlarms(alarms);
            setSnackbarMessage('Alarms sent to watch');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Failed to send alarms');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    }

    const onChange = (
        alarmnumber: 1 | 2 | 3 | 4 | 5,
        alarm: { hour: number, minute: number, hasHourlyChime: boolean, enabled: boolean }
    ) => {
        const newAlarms = [...alarms];
        newAlarms[alarmnumber - 1] = alarm;
        setAlarms(newAlarms);
    }

    const onSignalChange = (checked: boolean) => {
        const newAlarms = [...alarms];
        newAlarms.forEach(a => a.hasHourlyChime = checked); // Ensure consistent update
        setAlarms([...newAlarms]);
        GShockAPI.setAlarms(newAlarms);
    }

    if (!alarms || alarms.length === 0) {
        return <Typography variant="h6" sx={{ p: 4, textAlign: 'center' }}>No alarms found</Typography>;
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: { xs: '100dvh', md: '100%' },
            width: '100%',
            overflow: 'hidden',
            bgcolor: 'background.default'
        }}>
            {/* 1. SCROLLABLE CONTENT AREA */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                px: { xs: 1.5, sm: 3, md: 4 },
                pt: 2,
                pb: 2
            }}>
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <ScreenTitle title="Alarms" />

                    <Stack spacing={1} sx={{ mt: 1 }}>
                        {alarms.map((alarm, index) => (
                            <AlarmCard
                                key={index}
                                number={(index + 1) as 1 | 2 | 3 | 4 | 5}
                                alarm={alarm}
                                onChange={onChange}
                            />
                        ))}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, mb: 4 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Signal (chime)
                        </Typography>
                        <AppSwitch text="" initialValue={alarms[0].hasHourlyChime} onChange={onSignalChange} />
                    </Box>
                </Box>
            </Box>

            {/* 2. FIXED BOTTOM BUTTON AREA */}
            <Box sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                mb: { xs: BOTTOM_NAV_HEIGHT, md: 0 },
                pb: { xs: `calc(env(safe-area-inset-bottom) + 8px)`, md: 2 },
                zIndex: 10,
                boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'center',
                gap: 2
            }}>
                <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 600 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={sendToWatch}
                        sx={{ borderRadius: 2, py: 1.2 }}
                    >
                        To Watch
                    </Button>
                </Box>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Alarms;
