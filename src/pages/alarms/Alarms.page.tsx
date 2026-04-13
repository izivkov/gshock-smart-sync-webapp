"use client"

import React, { useEffect, useRef, useState } from 'react';
import {
    Box, Typography, Button, Snackbar, Alert, Stack,
} from '@mui/material';
import AlarmCard from './AlarmCard';
import AppSwitch from '@components/AppSwitch';
import GShockAPI from '@/api/GShockAPI';
import ScreenTitle from '../components/ScreenTitle';

const Alarms: React.FC = () => {
    const initialized = useRef(false)
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
                const newAlarms = await GShockAPI.getAlarms();
                // Ensure we only keep the first 5 alarms
                setAlarms(Array.isArray(newAlarms) ? newAlarms.slice(0, 5) : []);
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
        newAlarms[0].hasHourlyChime = checked;
        setAlarms(newAlarms);
        // Immediately save the change to the watch
        const updatedAlarms = [...newAlarms];
        updatedAlarms[0].hasHourlyChime = checked;
        GShockAPI.setAlarms(updatedAlarms);
    }

    if (!alarms || alarms.length === 0) {
        return <Typography variant="h6">No alarms found</Typography>;
    }

    return (
        <Box sx={{ 
            px: { xs: 0, md: 4 },
            pt: { xs: 3, md: 4 }, 
            pb: { xs: 10, md: 4 }, 
            maxWidth: { xs: 500, md: 600 }, 
            mx: 'auto', 
            width: '100%' 
        }}>
            <ScreenTitle title="Alarms" />

            <Stack spacing={1.5} sx={{ px: { xs: 1.5, sm: 2 } }}>
                {alarms.map((alarm, index) => (
                    <AlarmCard
                        key={index}
                        number={(index + 1) as 1 | 2 | 3 | 4 | 5}
                        alarm={alarm}
                        onChange={onChange}
                    />
                ))}
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 2.5, mt: 2 }}>
                <Typography variant="body1" sx={{ color: 'text.primary', mr: 1 }}>
                    Signal (chime)
                </Typography>
                <AppSwitch text="" initialValue={alarms[0].hasHourlyChime} onChange={onSignalChange} />
            </Box>

            {/* Bottom action buttons — matching Android */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, px: 2 }}>
                <Button
                    variant="outlined"
                    onClick={sendToPhone}
                    sx={{ flexShrink: 0 }}
                >
                    Send to Phone
                </Button>
                <Button
                    variant="contained"
                    onClick={sendToWatch}
                    sx={{ flexShrink: 0 }}
                >
                    Send to Watch
                </Button>
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
export default Alarms;
