import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import AppDialog from '../components/AppDialog';
import AppDatePicker from '../components/AppDatePicker';
import AppSelect from '../components/AppSelect';
import ReminderData from './ReminderData';
import { Card, CardBody, CardFooter, CardHeader, Checkbox, DialogHeader, Input, Typography } from '@material-tailwind/react';
import AppDialogButton from '../components/AppDialogButton';
import AppCheckboxList from '../components/AppCheckboxList';

interface ReminderEditDialogProps {
    open: boolean;
    handleClose: (returnData: any) => void;
    startDate: Dayjs;
    endDate?: Dayjs;
    reminderData: ReminderData;
}

const ReminderEditDialog: React.FC<ReminderEditDialogProps> = ({ open, handleClose, startDate, endDate, reminderData }) => {

    if (!endDate) {
        endDate = startDate;
    }

    const options = [
        'Does not repeat', 'Weekly', 'Monthly', 'Yearly'
    ]

    const startDateSelected = (startDate: Dayjs) => {
        reminderData.time.startDate = { year: dayjs(startDate).year(), month: dayjs(startDate).format("MMMM"), day: dayjs(startDate).date() };
    };

    const endDateSelected = (endDate: Dayjs) => {
        reminderData.time.endDate = { year: dayjs(startDate).year(), month: dayjs(startDate).format("MMMM"), day: dayjs(startDate).date() };
    };

    const handleSelectFrequency = (e: string) => {
        reminderData.time.repeatPeriod = e
    }

    return (
        <div>
            <AppDialog open={open} onClose={() => handleClose(reminderData)} title="Edit Reminder">

                <Card className="mx-auto w-full max-w-1xl">
                    <CardHeader className="flex flex-row justify-between" children={undefined} />
                    <CardBody className="flex flex-col gap-4">
                        <AppSelect label='Frequency' value={options[0]} items={options} onSelected={handleSelectFrequency} />
                        <div className="flex flex-row justify-between items-center gap-4">
                            <AppDatePicker open={open} label='Start Date' initialDate={startDate} onTimeSelected={date => startDateSelected(date)} />
                            <AppDatePicker open={open} label='End Date' initialDate={endDate} onTimeSelected={date => endDateSelected(date)} />
                        </div>
                        <div className="flex flex-row justify-between items-center gap-4">
                            <AppCheckboxList checkBoxNames={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} />
                        </div>
                    </CardBody>
                    <CardFooter className="pt-0 flex flex-row justify-end">
                        <AppDialogButton label="Calcel" onClick={() => handleClose(null)} />
                        <AppDialogButton label="Save" onClick={() => handleClose(reminderData)} />
                    </CardFooter>
                </Card>
            </AppDialog>
        </div >
    );
};

export default ReminderEditDialog;