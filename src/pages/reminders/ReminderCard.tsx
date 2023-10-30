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

interface ReminderCardProps {
    number: 1 | 2 | 3 | 4 | 5;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ number }) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(null);

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = (reminderData: any) => {
        // alert(`handleCloseDialog: ${JSON.stringify(reminderData)}`);
        setDialogOpen(false);
    };

    const year = startDate.year();
    const month = startDate.format("MMMM");
    const day = startDate.day();

    // INZ TEST - get events from eatch instead
    const event = Event.createEvent({
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
    });
    // End of test

    const title = `Reminder ${number}`

    const reminderData: ReminderData = {
        time: {
            enabled: true,
            startDate: { year: year, month: month, day: day },
            endDate: { year: year, month: month, day: day } || null,
            repeatPeriod: "Never",
            daysOfWeek: [],
            occurrences: 1
        },
        title: "Test Reminder"
    }

    const header = <div className="flex flex-row w-full justify-between items-center pl-4 gap-20">
        <AppText text={title} variant='h5' />
        <Edit className="cursor-pointer" onClick={handleOpenDialog} />
    </div>

    const body = <div className='flex flex-row justify-between'>
        <div className="flex flex-col justify-between">
            <AppText text={""} variant='h5' />
            <Period event={event} />
        </div>
        <div className="flex flex-col justify-between">
            <ReminderEditDialog startDate={startDate} endDate={endDate} open={dialogOpen} handleClose={handleCloseDialog} reminderData={reminderData} />
        </div>
    </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="w-96 h-10 flex flex-row text-center items-center"
            classNameBody="bg-white" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default ReminderCard;