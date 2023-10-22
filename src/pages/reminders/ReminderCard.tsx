"use client"

import React, { useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import dayjs from 'dayjs';
import Period from './Period';
import AppCheckbox from '../components/AppCheckbox';
import Frequency from './Frequency';
import Event from '@model/Event';

interface ReminderCardProps {
    description: string;
    number: 1 | 2 | 3 | 4 | 5;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ number, description }) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs().add(1, 'day'));

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = (time: any) => {
        setDialogOpen(false);
    };

    const year = startDate.year();
    const month = startDate.format("MMMM");
    const day = startDate.day();

    // INZ TEST - get events from eatch instead
    const jsonStr = {
        "time": {
            "enabled": true,
            "repeatPeriod": "WEEKLY",
            "startDate": {
                "year": 2024,
                "month": "SEPTEMBER",
                "day": 7
            },
            "endDate": {
                "year": 2023,
                "month": "SEPTEMBER",
                "day": 7
            },
            "daysOfWeek": [
                "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
            ]
        },
        "title": "Pay Phodora"
    }
    const event = Event.createEvent(jsonStr);
    // End of test

    const title = `Reminder ${number}`

    const header = <div className="flex flex-row justify-between">
        <AppText text={title} variant='h5' />
    </div>

    const body = <div className='flex flex-row justify-between'>
        <div className="flex flex-col justify-between">
            <AppText text={description} variant='h5' />
            <Period event={event} />
        </div>
        <div className="flex flex-col justify-between">
            <AppCheckbox checked={true} />
            <Frequency event={event} />
        </div>
    </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-6 w-96" classNameHeader="h-10 pl-6 flex flex-row text-center items-center"
            classNameBody="bg-white" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default ReminderCard;