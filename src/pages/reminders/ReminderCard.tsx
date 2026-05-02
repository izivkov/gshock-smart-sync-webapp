"use client"

import React, { useEffect, useState } from 'react';
import { Box, Typography, Switch, IconButton, Card } from '@mui/material';
import { Edit } from '@mui/icons-material';
import dayjs from 'dayjs';
import Period from './Period';
import ReminderEditDialog from './ReminderEditDialog';
import ReminderData, { monthType } from './ReminderData';
import AppSwitch from '../components/AppSwitch';
import { peachCardCompactSx } from '../theme/peachCardStyles';
import { calculateEndDateFromOccurences, getFrequencyFormatted, getPeriodFormatted, toDayJsDate } from './ReminderUtils';

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
    const [period, setPeriod] = useState("");
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
        setPeriod(getPeriodFormatted(initialReminder.startDate, initialReminder.endDate));
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
        setDaysOfWeek(reminderData.daysOfWeek);

        setFrequency(getFrequencyFormatted(reminderData.repeatPeriod, reminderData.startDate, reminderData.daysOfWeek));
        setPeriod(getPeriodFormatted(reminderData.startDate, reminderData.endDate));

        if (reminderData.occurrences > 1) {
            const calculatedEnd = calculateEndDateFromOccurences(
                reminderData.occurrences,
                reminder.startDate,
                reminderData.repeatPeriod,
                reminderData.daysOfWeek
            );
            setEndDate(calculatedEnd);
            setPeriod(getPeriodFormatted(reminderData.startDate, calculatedEnd));
        }

        setDialogOpen(false);

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
        <Card sx={{
            ...peachCardCompactSx,
            px: 2,
            py: 1.25,
            minHeight: 60,
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 65 }}>
                    Event {number}
                </Typography>
                <Box onClick={handleOpenDialog} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {title || 'Untitled'}
                        </Typography>
                        {(period || frequency) && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.25 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {period}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'right' }}>
                                    {frequency}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Edit sx={{ fontSize: 20, color: 'primary.main', opacity: 0.6, ml: 1 }} />
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                <AppSwitch initialValue={enabled} onChange={setEnabledValue} />
            </Box>

            <ReminderEditDialog startDate={toDayjsDate(startDate)} open={dialogOpen} handleClose={handleCloseDialog} initReminderData={reminder} />
        </Card>
    );
}

export default ReminderCard;
