"use client"

import React, { useEffect, useRef, useState } from 'react';
import {
    Box, Typography, Divider, Button, Paper, Snackbar, Alert
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
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    useEffect(() => {
        (async () => {
            if (!initialized.current) {
                initialized.current = true;
                const newReminders = await GShockAPI.getEventsFromWatch();
                setReminders(newReminders.slice(0, 5));
            }
        })()
    }, []);

    const sendToWatch = async () => {
        try {
            await GShockAPI.setEvents(reminders);
            setSnackbarMessage('Events sent to watch');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Failed to send events');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    }

    const onChange = (reminder: ReminderData, number: 1 | 2 | 3 | 4 | 5) => {
        if (!initialized.current) return;
        const newReminders = JSON.parse(JSON.stringify(reminders));
        newReminders[number - 1] = reminder;
        setReminders(newReminders);
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
            {/* Page title — matches Android "Events" */}
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

            {/* Bottom action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, px: 2 }}>
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

// Force server-side rendering — avoids null React context during static prerendering
export const getServerSideProps = async () => ({ props: {} });
export default Reminders;

