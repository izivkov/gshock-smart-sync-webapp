"use client"

import React, { useEffect, useRef, useState } from 'react';
import {
    Box, Typography, Divider, Button, Paper
} from '@mui/material';
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
        <Box sx={{ pt: 3, pb: 10, maxWidth: 500, mx: 'auto', width: '100%' }}>
            {/* Page title — matches Android "Events" */}
            <Typography
                variant="h5"
                align="center"
                sx={{ mb: 2.5, fontWeight: 500, color: 'text.primary', letterSpacing: 0.2 }}
            >
                Events
            </Typography>

            {/* Event list — rounded card with rows */}
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mx: 1 }}>
                {reminders.map((reminder, index) => (
                    <React.Fragment key={index}>
                        <ReminderCard
                            number={(index + 1) as 1 | 2 | 3 | 4 | 5}
                            initialReminder={reminder}
                            onChange={onChange}
                        />
                        {index < reminders.length - 1 && (
                            <Divider sx={{ mx: 0, borderColor: 'rgba(139,94,60,0.10)' }} />
                        )}
                    </React.Fragment>
                ))}
            </Paper>

            {/* Bottom action — matches Android "SEND TO WATCH REMINDERS" */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                    variant="text"
                    onClick={sendToWatch}
                    sx={{
                        color: '#8B5E3C',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        letterSpacing: 1,
                    }}
                >
                    SEND TO WATCH REMINDERS
                </Button>
            </Box>
        </Box>
    );
};

export default Reminders;