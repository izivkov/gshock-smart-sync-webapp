"use client"

import React, { useEffect, useState } from 'react';
import { Box, Typography, Switch, IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import dayjs from 'dayjs';
import Period from './Period';
import ReminderEditDialog from './ReminderEditDialog';
import ReminderData, { monthType } from './ReminderData';
import AppSwitch from '../components/AppSwitch';
import { calculateEndDateFromOccurences, getFrequencyFormatted, toDayJsDate } from './ReminderUtils';

interface ReminderCardProps {
    number: 1 | 2 | 3 | 4 | 5;
    initialReminder: ReminderData;
    onChange: (reminder: ReminderData, number: 1 | 2 | 3 | 4 | 5) => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ number, initialReminder, onChange }) => {

    const createEndDate = (reminder: ReminderData): { year: number, month: monthType, day: number } => {
        return reminder.endDate ? reminder.endDate : reminder.startDate;
    }

    const [reminder, setReminder] = useState<ReminderData>(initialReminder);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [startDate, setStartDate] = useState(reminder.startDate);
    var [endDate, setEndDate] = useState(createEndDate(reminder));
    const [title, setTitle] = useState(reminder.title);
    const [repeatPeriod, setRepeatPeriod] = useState(reminder.repeatPeriod);
    const [enabled, setEnabled] = useState(reminder.enabled);
    const [daysOfWeek, setDaysOfWeek] = useState(reminder.daysOfWeek);
    const [frequency, setFrequency] = useState("");
    const [incompatible, setInciompatible] = useState(reminder.incompatible);

    useEffect(() => {
        const reminderData: ReminderData = {
            title: title,
            startDate: startDate,
            endDate: endDate,
            repeatPeriod: repeatPeriod,
            daysOfWeek: daysOfWeek,
            enabled: enabled,
            incompatible: incompatible,
            occurrences: 0
        }

        setReminder(reminderData);

    }, [title, startDate, endDate, repeatPeriod, daysOfWeek, enabled, incompatible, frequency]);

    useEffect(() => {
        setStartDate(initialReminder.startDate);
        setEndDate(createEndDate(initialReminder));
        setTitle(initialReminder.title);
        setRepeatPeriod(initialReminder.repeatPeriod);
        setEnabled(initialReminder.enabled);
        setDaysOfWeek(initialReminder.daysOfWeek);
        setFrequency(getFrequencyFormatted(initialReminder.repeatPeriod, initialReminder.startDate, initialReminder.daysOfWeek));

    }, [initialReminder]);

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };


    const handleCloseDialog = (reminderData: ReminderData) => {
        if (!reminderData) {
            setDialogOpen(false);
            return;
        }

        setStartDate(reminderData.startDate);
        setRepeatPeriod(reminderData.repeatPeriod);

        if (reminderData.repeatPeriod === "NEVER") {
            setEndDate(reminderData.startDate);
        } else {
            setEndDate(reminderData.endDate as { year: number, month: monthType, day: number });
        }

        const start = toDayJsDate(reminderData.startDate);
        const end = toDayJsDate(reminderData.endDate);

        if (!reminderData.endDate || end <= start) {
            setEndDate(reminderData.startDate);
        }

        setTitle(reminderData.title);
        // setEnabled(reminderData.enabled);
        setDaysOfWeek(reminderData.daysOfWeek);

        setFrequency(getFrequencyFormatted(reminderData.repeatPeriod, reminderData.startDate, reminderData.daysOfWeek));
        if (reminderData.occurrences > 1) {
            setEndDate(calculateEndDateFromOccurences(
                reminderData.occurrences,
                reminder.startDate,
                reminderData.repeatPeriod,
                reminderData.daysOfWeek));
        }

        setDialogOpen(false);

        // Create a complete reminder data object with all fields
        const updatedReminderData: ReminderData = {
            title: reminderData.title,
            startDate: reminderData.startDate,
            endDate: reminderData.endDate,
            repeatPeriod: reminderData.repeatPeriod,
            daysOfWeek: reminderData.daysOfWeek,
            enabled: reminderData.enabled !== undefined ? reminderData.enabled : enabled,
            incompatible: reminderData.incompatible || false,
            occurrences: reminderData.occurrences || 0
        };

        // pass data back to Remiders component
        onChange(updatedReminderData, number);
    };

    const toDayjsDate = ({ year, month, day }: { year: number, month: string, day: number }): dayjs.Dayjs => {
        return dayjs(`${year}-${month}-${day}`);
    }

    const setEnabledValue = (value: boolean) => {
        setEnabled(value);
        onChange({ ...reminder, enabled: value }, number);
    }

    return (
        <Box sx={{
            px: 2,
            py: 2,
            bgcolor: 'background.paper',
            minHeight: 72
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 65 }}>
                    Event {number}
                </Typography>
                <Box onClick={handleOpenDialog} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {title || 'Untitled'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {frequency}
                        </Typography>
                    </Box>
                    <Edit sx={{ fontSize: 20, color: 'primary.main', opacity: 0.6, ml: 'auto' }} />
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <AppSwitch initialValue={enabled} onChange={setEnabledValue} />
            </Box>

            <ReminderEditDialog startDate={toDayjsDate(startDate)} open={dialogOpen} handleClose={handleCloseDialog} initReminderData={reminder} />
        </Box>
    );
}

export default ReminderCard;