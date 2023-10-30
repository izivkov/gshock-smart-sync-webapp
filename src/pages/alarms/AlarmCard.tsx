"use client"

import React, { useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import AlarmTime from "./AlarmTime";
import AlarmPeriod from "./AlarmPeriod";
import AppSwitch from "@components/AppSwitch";
import TimePickerDialog from "./TimePickerDialog";
import dayjs from 'dayjs';
import { Edit } from '@mui/icons-material';

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

    const header = <div className="flex flex-row w-full justify-between items-center pl-4 pr-4">
        <AppText text={title} variant='h5' />
        <Edit className="cursor-pointer" onClick={() => handleOpenDialog()} />
    </div>

    const body = <div className="flex flex-row items-center justify-between">
        <div className="flex gap-6 items-center">
            <div>
                <AlarmTime alarmTime={alarmTime} />
            </div>
            <AlarmPeriod period="Daily" />

            <TimePickerDialog initialTime={alarmTime} open={dialogOpen} handleClose={handleCloseDialog} />
        </div>
        <div className="flex justify-end">
            <AppSwitch checked={true} />
        </div>
    </div >

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="w-96 h-10 flex flex-row text-center items-center"
            classNameBody="bg-white" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default AlarmCard;