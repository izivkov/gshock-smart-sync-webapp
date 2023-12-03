"use client"

import React, { useEffect, useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import dayjs from 'dayjs';
import Period from './Period';
import ReminderEditDialog from './ReminderEditDialog';
import ReminderData, { monthType } from './ReminderData';
import Edit from '@mui/icons-material/Edit';
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
        setEnabled(reminderData.enabled);
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

        // pass data back to Remiders component
        onChange(reminderData, number);
    };

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
                <Period startDate={startDate} endDate={endDate} />
            </div>
            <div className='flex flex-col justify-between items-end'>
                <AppSwitch initialValue={enabled} onChange={setEnabled} />
                <div className="pt-2 pr-2">
                    <AppText text={frequency} />
                </div>
            </div>
        </div>

    const footer =
        <div className="flex w-0">
            <ReminderEditDialog startDate={toDayjsDate(startDate)} open={dialogOpen} handleClose={handleCloseDialog} initReminderData={reminder} />
        </div>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="w-96 h-10 flex flex-row text-center items-center"
            classNameBody="bg-white" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default ReminderCard;