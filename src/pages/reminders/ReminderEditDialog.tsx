import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import AppDialog from '../components/AppDialog';
import AppDatePicker from '../components/AppDatePicker';
import AppSelect from '../components/AppSelect';
import ReminderData from './ReminderData';
import { Card, CardBody, CardFooter, CardHeader, Checkbox, DialogHeader, Input, Typography } from '@material-tailwind/react';
import AppDialogButton from '../components/AppDialogButton';
import AppCheckboxList from '../components/AppCheckboxList';
import AppRadioButtonList from '../components/AppRadioButtonList';
import AppText from '../components/AppText';
import AppInput from '../components/AppInput';

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

    type daysOfWeekType = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
    interface CheckboxValues {
        value: daysOfWeekType;
        displayValue: string;
    }

    const checkBoxes: CheckboxValues[] = [
        { value: "MONDAY", displayValue: "Mon" },
        { value: "TUESDAY", displayValue: "Tue" },
        { value: "WEDNESDAY", displayValue: "Wed" },
        { value: "THURSDAY", displayValue: "Thu" },
        { value: "FRIDAY", displayValue: "Fri" },
        { value: "SATURDAY", displayValue: "Sat" },
        { value: "SUNDAY", displayValue: "Sun" }
    ]

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
        reminderData.time.repeatOption = (e)
    }

    function onOccurencesChange(e: any): void {
        reminderData.time.occurrences = (e.target.value);
    }

    function daysOfWeekSelected(selected: number[]): void {
        reminderData.time.daysOfWeek = [];

        const newValues: string[] = selected.map(index => checkBoxes[index].value)
        newValues.forEach((value: string) => {
            reminderData.time.daysOfWeek.push(value);
        })
    }

    const onEndsSelected = ((index: number, checked: boolean) => {
        console.log(`onEndsSelected: ${index}, ${checked}`);
    })

    return (
        <div>
            <AppDialog open={open} onClose={() => handleClose(reminderData)} title="Edit Reminder">

                <Card className="mx-auto w-full max-w-1xl">
                    <CardHeader className="flex flex-row justify-between" children={undefined} />
                    <CardBody className="flex flex-col gap-4">
                        <AppInput label='Title' className="w-full" />
                        <AppSelect label='Frequency' value={options[0]} items={options} className="w-full" onSelected={handleSelectFrequency} />
                        <div className="flex flex-row justify-between items-center gap-4">
                            <AppDatePicker open={open} label='Start Date' initialDate={startDate} onTimeSelected={date => startDateSelected(date)} />
                            <AppDatePicker open={open} label='End Date' initialDate={endDate} onTimeSelected={date => endDateSelected(date)} />
                        </div>

                        <div className="flex flex-row justify-start gap-2">
                            <div className="border-r border-gray-400 p-4">
                                <AppRadioButtonList label='End on' onChange={onEndsSelected} radioButtons={[

                                    <AppText text="Never" variant='paragraph' />,

                                    <div className='flex flex-row gap-2 items-center'>
                                        <AppText text="On" variant='paragraph' />
                                        <AppDatePicker label={""} onTimeSelected={endDateSelected} initialDate={dayjs()} open={false} />
                                    </div>,

                                    <div className='flex flex-row gap-2 items-center'>
                                        <AppText text="After" variant='paragraph' />
                                        <AppInput type="number" label='Occurences' onChange={onOccurencesChange} />
                                    </div>]} />
                            </div>
                            <div className="">
                                <AppCheckboxList label='Repeat on' displayValues={checkBoxes.map(checkBox => checkBox.displayValue)} onChange={daysOfWeekSelected} />
                            </div>
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