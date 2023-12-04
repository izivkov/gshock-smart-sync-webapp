"use client"

import React, { useEffect, useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import AlarmTime from "./AlarmTime";
import AlarmPeriod from "./AlarmPeriod";
import AppSwitch from "@components/AppSwitch";
import TimePickerDialog from "./TimePickerDialog";
import dayjs, { Dayjs } from 'dayjs';
import { Edit } from '@mui/icons-material';

interface Alarm {
    hour: number,
    minute: number,
    hourlyChime: boolean,
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
    const [hourlyChime, setHourlyChime] = useState(alarm.hourlyChime);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [time, setTime] = useState(dayjs().hour(hour).minute(minute));

    useEffect(() => {
        setHour(alarm.hour);
        setMinute(alarm.minute);
        setHourlyChime(alarm.hourlyChime);
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
                hourlyChime: hourlyChime,
                enabled: enabled
            }

            onChange(number, alarm)
        }
    };

    const title = `Alarm ${number}`;

    const header = <div className="flex flex-row w-full justify-between items-center pl-4 pr-4">
        <AppText text={title} variant='h5' />
        <Edit className="cursor-pointer" onClick={() => handleOpenDialog()} />
    </div>

    const body = <div className="flex flex-row items-center justify-between">
        <div className="flex gap-6 items-center">
            <div>
                <AlarmTime alarmTime={time} />
            </div>
            <AlarmPeriod period="Daily" />
            <TimePickerDialog initialTime={time} open={dialogOpen} handleClose={handleCloseDialog} />
        </div>
        <div className="flex justify-end">
            <AppSwitch initialValue={alarm.enabled} onChange={(checked) => { }} />
        </div>
    </div >

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="w-96 h-10 flex flex-row text-center items-center"
            classNameBody="bg-white" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default AlarmCard;
export type { Alarm }