"use client"

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { peachCardCompactSx } from '../theme/peachCardStyles';
import AlarmTime from "./AlarmTime";
import AlarmPeriod from "./AlarmPeriod";
import AppSwitch from "@components/AppSwitch";
import TimePickerDialog from "./TimePickerDialog";
import dayjs, { Dayjs } from 'dayjs';
import { Edit } from '@mui/icons-material';

interface Alarm {
    hour: number,
    minute: number,
    hasHourlyChime: boolean,
    enabled: boolean
}

interface AlarmCardProps {
    number: 1 | 2 | 3 | 4 | 5;
    alarm: Alarm;
    onChange: (alarmNumber: 1 | 2 | 3 | 4 | 5, alarm: Alarm) => void
}

const AlarmCard: React.FC<AlarmCardProps> = ({ number, alarm, onChange }) => {

    const [hour, setHour] = useState(alarm.hour);
    const [minute, setMinute] = useState(alarm.minute);
    const [enabled, setEnabled] = useState(alarm.enabled);
    const [hasHourlyChime, setHasHourlyChime] = useState(alarm.hasHourlyChime);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [time, setTime] = useState(dayjs().hour(hour).minute(minute));

    useEffect(() => {
        setHour(alarm.hour);
        setMinute(alarm.minute);
        setHasHourlyChime(alarm.hasHourlyChime);
        setEnabled(alarm.enabled);
        setTime(dayjs().hour(alarm.hour).minute(alarm.minute));
    }, [alarm]);

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = (time: any) => {
        setDialogOpen(false);
        if (time) {
            setTime(time);

            alarm = {
                hour: time.hour(),
                minute: time.minute(),
                hasHourlyChime: hasHourlyChime,
                enabled: enabled
            }

            onChange(number, alarm)
        }
    };

    const onEnabledChange = (checked: boolean) => {
        setEnabled(checked);
        const newAlarm = { ...alarm, enabled: checked };
        onChange(number, newAlarm);
    };

    return (
        <Box sx={{
            ...peachCardCompactSx,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 2,
            minHeight: 72,
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 65 }}>
                    Alarm {number}
                </Typography>
                <Box onClick={handleOpenDialog} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AlarmTime alarmTime={time} />
                    <AlarmPeriod period="Daily" />
                    <Edit sx={{ fontSize: 20, color: 'primary.main', opacity: 0.6 }} />
                </Box>
            </Box>

            <AppSwitch initialValue={enabled} onChange={onEnabledChange} />

            <TimePickerDialog initialTime={time} open={dialogOpen} handleClose={handleCloseDialog} />
        </Box>
    );
}

export default AlarmCard;
export type { Alarm }