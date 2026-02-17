"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Box, Grid, Typography, Fab } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AlarmCard from './AlarmCard';
import AppSwitch from '@components/AppSwitch';
import GShockAPI from '@/api/GShockAPI';

const Alarms: React.FC = () => {
    const initialized = useRef(false)
    const [alarms, setAlarms] = useState<{
        hour: number, minute: number, hourlyChime: boolean, enabled: boolean
    }[]>([
        { hour: 0, minute: 0, hourlyChime: false, enabled: false },
        { hour: 0, minute: 0, hourlyChime: false, enabled: false },
        { hour: 0, minute: 0, hourlyChime: false, enabled: false },
        { hour: 0, minute: 0, hourlyChime: false, enabled: false },
        { hour: 0, minute: 0, hourlyChime: false, enabled: false },
    ]);

    useEffect(() => {
        (async () => {
            if (!initialized.current) {
                initialized.current = true;
                const newAlarms = await GShockAPI.getAlarms();
                setAlarms(newAlarms);
            }
        })()
    }, [alarms]);

    const sendToWatch = async () => {
        await GShockAPI.setAlarms(alarms);
    }

    const onChange = (
        alarmnumber: 1 | 2 | 3 | 4 | 5,
        alarm: {
            hour: number,
            minute: number,
            hourlyChime: boolean,
            enabled: boolean
        }) => {
        const newAlarms = [...alarms];
        newAlarms[alarmnumber - 1] = alarm;
        setAlarms(newAlarms);
    }

    const onSignalChange = (checked: boolean) => {
        const newAlarms = [...alarms];
        newAlarms[0].hourlyChime = checked;
        setAlarms(newAlarms);
    }

    if (!alarms || alarms.length === 0) {
        return <Typography variant="h6">No alarms found</Typography>;
    }

    return (
        <Box sx={{ py: 4, position: 'relative' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <AppSwitch text="Signal (Hourly Chime)" initialValue={alarms[0].hourlyChime} onChange={onSignalChange} />
            </Box>

            <Grid container spacing={4} justifyContent="center">
                {alarms.map((alarm, index) => (
                    <Grid item xs={12} md={6} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <AlarmCard number={(index + 1) as 1 | 2 | 3 | 4 | 5} alarm={alarm} onChange={onChange} />
                    </Grid>
                ))}
            </Grid>

            {/* Floating Action Button for sending to watch */}
            <Fab
                color="primary"
                aria-label="send"
                onClick={sendToWatch}
                sx={{
                    position: 'fixed',
                    bottom: { xs: 90, md: 32 },
                    right: 32,
                    boxShadow: 4
                }}
            >
                <SendIcon />
            </Fab>
        </Box>
    );
};

export default Alarms;
