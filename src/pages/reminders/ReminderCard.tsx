"use client"

import React, { useEffect, useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import dayjs from 'dayjs';
import Period from './Period';
import Event from '@model/Event';
import ReminderEditDialog from './ReminderEditDialog';
import ReminderData from './ReminderData';
import Edit from '@mui/icons-material/Edit';
import AppSwitch from '../components/AppSwitch';
import { start } from 'repl';
import { toDayJsDate } from './Reminders';

interface ReminderCardProps {
    number: 1 | 2 | 3 | 4 | 5;
    reminder: ReminderData;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ number, reminder }) => {

    const createEndDate = (reminder: ReminderData): { year: number, month: string, day: number } => {
        return reminder.endDate ? reminder.endDate : reminder.startDate;
    }

    const [dialogOpen, setDialogOpen] = useState(false);
    const [startDate, setStartDate] = useState(reminder.startDate);
    const [endDate, setEndDate] = useState(createEndDate(reminder));
    const [title, setTitle] = useState(reminder.title);
    const [repeatPeriod, setRepeatPeriod] = useState(reminder.repeatPeriod);
    const [enabled, setEnabled] = useState(reminder.enabled);
    const [daysOfWeek, setDaysOfWeek] = useState(reminder.daysOfWeek);
    const [frequency, setFrequency] = useState("");

    useEffect(() => {
        setStartDate(reminder.startDate);
        setEndDate(createEndDate(reminder));
        setTitle(reminder.title);
        setRepeatPeriod(reminder.repeatPeriod);
        setEnabled(reminder.enabled);
        setDaysOfWeek(reminder.daysOfWeek);
        setFrequency(event.getFrequencyFormatted());
    }, [reminder]);

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = (reminderData: ReminderData) => {
        setStartDate(reminderData.startDate);
        setRepeatPeriod(reminderData.repeatPeriod);

        if (reminderData.repeatPeriod === "NEVER") {
            setEndDate(reminderData.startDate);
        } else {
            setEndDate(reminderData.endDate as { year: number, month: string, day: number });
        }

        const start = toDayJsDate(reminderData.startDate);
        const end = toDayJsDate(reminderData.endDate);

        if (!reminderData.endDate || end <= start) {
            setEndDate(reminderData.startDate);
        }
        setTitle(reminderData.title);
        setEnabled(reminderData.enabled);
        setDaysOfWeek(reminderData.daysOfWeek);

        event.update(reminderData)

        setFrequency(event.getFrequencyFormatted());

        setDialogOpen(false);
    };

    const event = new Event(
        title,
        startDate,
        endDate,
        reminder.repeatPeriod,
        reminder.daysOfWeek,
        reminder.enabled,
        reminder.incompatible,
    )

    const header = <div className="flex flex-row w-full justify-between items-center pl-4 pr-4">
        <AppText text={title} variant='h5' />
        <Edit className="cursor-pointer" onClick={handleOpenDialog} />
    </div>

    const toDayjsDate = ({ year, month, day }: { year: number, month: string, day: number }): dayjs.Dayjs => {
        return dayjs(`${year}-${month}-${day}`);
    }

    const body =
        <div className='flex flex-row w-full justify-between items-center'>
            <div className="flex flex-col justify-between">
                <Period event={event} />
            </div>
            <div className='flex flex-col justify-between items-end'>
                <AppSwitch checked={enabled} onChange={setEnabled} />
                <div className="pt-2 pr-2">
                    <AppText text={frequency} />
                </div>
            </div>
        </div>

    const footer =
        <div className="flex w-0">
            <ReminderEditDialog startDate={toDayjsDate(startDate)} open={dialogOpen} handleClose={handleCloseDialog} reminderData={reminder} />
        </div>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="w-96 h-10 flex flex-row text-center items-center"
            classNameBody="bg-white" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default ReminderCard;