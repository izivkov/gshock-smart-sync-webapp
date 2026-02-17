"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Box, Grid, Typography, Fab } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReminderCard from './ReminderCard';
import GShockAPI from '@/api/GShockAPI';
import ReminderData, { monthType, repeatPeriodType } from './ReminderData';

const Reminders: React.FC = () => {
    const initialized = useRef(false)

    const reminderInit = {
        daysOfWeek: [],
        enabled: false,
        endDate: null,
        startDate: { year: 2000, month: 'JANUARY' as monthType, day: 1 },
        incompatible: false,
        repeatPeriod: 'NEVER' as repeatPeriodType,
        occurrences: 0,
        title: ''
    }
    const initialReminders = Array.from({ length: 5 }, () => ({ ...reminderInit }));
    const [reminders, setReminders] = useState<ReminderData[]>(initialReminders);

    useEffect(() => {
        (async () => {
            if (!initialized.current) {
                initialized.current = true;
                const newReminders = await GShockAPI.getEventsFromWatch();
                setReminders(newReminders);
            }
        })()
    }, [reminders]);

    const sendToWatch = async () => {
        await GShockAPI.setEvents(reminders);
    }

    const onChange = (reminder: ReminderData, number: 1 | 2 | 3 | 4 | 5) => {
        if (!initialized.current) return;
        const newReminders = JSON.parse(JSON.stringify(reminders));
        newReminders[number - 1] = reminder;
        setReminders(newReminders);
    }

    return (
        <Box sx={{ py: 4, position: 'relative' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Reminders
            </Typography>

            <Grid container spacing={4} justifyContent="center">
                {reminders.map((reminder, index) => (
                    <Grid item xs={12} md={6} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <ReminderCard
                            number={(index + 1) as 1 | 2 | 3 | 4 | 5}
                            initialReminder={reminder}
                            onChange={onChange}
                        />
                    </Grid>
                ))}
            </Grid>

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

export default Reminders;