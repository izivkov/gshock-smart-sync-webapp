"use client"

import React, { useEffect, useRef, useState } from 'react';
import {
    Box, Typography, Switch, Divider, Button, Paper
} from '@mui/material';
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

    const sendToPhone = async () => { /* placeholder */ }
    const sendToWatch = async () => {
        await GShockAPI.setAlarms(alarms);
    }

    const onChange = (
        alarmnumber: 1 | 2 | 3 | 4 | 5,
        alarm: { hour: number, minute: number, hourlyChime: boolean, enabled: boolean }
    ) => {
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
        <Box sx={{ 
            px: { xs: 0, md: 4 },
            pt: { xs: 3, md: 4 }, 
            pb: { xs: 10, md: 4 }, 
            maxWidth: { xs: 500, md: 600 }, 
            mx: 'auto', 
            width: '100%' 
        }}>
            {/* Page title */}
            <Typography
                variant="h5"
                sx={{ 
                    mb: 3, 
                    fontWeight: 500, 
                    color: 'text.primary', 
                    letterSpacing: 0.2,
                    textAlign: { xs: 'center', md: 'left' },
                    px: { xs: 0, md: 0 }
                }}
            >
                Watch Alarms
            </Typography>

            {/* Alarm list — rounded card with rows */}
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mx: 1 }}>
                {alarms.map((alarm, index) => (
                    <React.Fragment key={index}>
                        <AlarmCard
                            number={(index + 1) as 1 | 2 | 3 | 4 | 5}
                            alarm={alarm}
                            onChange={onChange}
                        />
                        {index < alarms.length - 1 && (
                            <Divider sx={{ mx: 0, borderColor: 'rgba(139,94,60,0.10)' }} />
                        )}
                    </React.Fragment>
                ))}
            </Paper>

            {/* Signal (chime) toggle below the list */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 3, mt: 2 }}>
                <Typography variant="body1" sx={{ color: 'text.primary', mr: 1 }}>
                    Signal (chime)
                </Typography>
                <AppSwitch text="" initialValue={alarms[0].hourlyChime} onChange={onSignalChange} />
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
                    variant="outlined"
                    onClick={sendToWatch}
                    sx={{ flexShrink: 0 }}
                >
                    Send to Watch
                </Button>
            </Box>
        </Box>
    );
};

export default Alarms;
