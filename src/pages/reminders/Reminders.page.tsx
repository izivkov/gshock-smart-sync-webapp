"use client"

import React, { useEffect, useState } from 'react';
import {
    Box, Button, Snackbar, Alert, Stack,
} from '@mui/material';
import ReminderCard from './ReminderCard';
import GShockAPI from '@/api/GShockAPI';
import ScreenTitle from '../components/ScreenTitle';
import ReminderData, { monthType, repeatPeriodType } from './ReminderData';

const Reminders: React.FC = () => {

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
            const newReminders = await GShockAPI.getEventsFromWatch();
            setReminders(newReminders.slice(0, 5));
        })();
    }, []);

    const sendToWatch = async () => {
        try {
            await GShockAPI.setEvents(reminders);
            setSnackbarMessage('Events sent to watch');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            
            // Re-fetch to confirm and update UI
            const newReminders = await GShockAPI.getEventsFromWatch();
            setReminders(newReminders.slice(0, 5));
        } catch (error) {
            setSnackbarMessage('Failed to send events');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    }

    const onChange = (reminder: ReminderData, number: 1 | 2 | 3 | 4 | 5) => {
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
            <ScreenTitle title="Events" />

            <Stack spacing={1.5} sx={{ px: { xs: 1.5, sm: 2 } }}>
                {reminders.map((reminder, index) => (
                    <ReminderCard
                        key={index}
                        number={(index + 1) as 1 | 2 | 3 | 4 | 5}
                        initialReminder={reminder}
                        onChange={onChange}
                    />
                ))}
            </Stack>

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

