"use client"

import React, { useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import AlarmTime from "./AlarmTime";
import AppPeriod from "@components/AppPeriod";
import AppSwitch from "@components/AppSwitch";
import TimePickerDialog from "../components/TimePickerDialog";
import dayjs from 'dayjs';

interface AlarmCardProps {
    number: 1 | 2 | 3 | 4 | 5;
}

const AlarmCard: React.FC<AlarmCardProps> = ({ number }) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const [alarmTime, setTime] = useState(dayjs('2023-01-01T03:10'));

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = (time: any) => {
        setDialogOpen(false);
        setTime(time);
    };

    const title = `Alarm ${number}`

    const header = <div className="flex flex-row justify-between">
        <AppText text={title} variant='h5' />
    </div>

    const body = <div className="flex flex-row items-center justify-between">
        <div className="flex gap-6 items-center">
            <div onClick={handleOpenDialog}>
                <AlarmTime alarmTime={alarmTime} />
            </div>
            <AppPeriod period="Daily" />

            <TimePickerDialog initialTime={alarmTime} open={dialogOpen} handleClose={handleCloseDialog} />

        </div>
        <div className="flex justify-end">
            <AppSwitch checked={true} />
        </div>
    </div >

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-6 w-96" classNameHeader="h-10 pl-6 flex flex-row text-center items-center"
            classNameBody="bg-white" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default AlarmCard;