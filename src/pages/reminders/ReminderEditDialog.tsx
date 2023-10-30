import React, { useEffect, useState } from 'react';
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
    endDate?: Dayjs | null;
    reminderData: ReminderData;
}

const ReminderEditDialog: React.FC<ReminderEditDialogProps> = ({ open, handleClose, startDate, endDate, reminderData }) => {

    const [endOnIndex, setOnIndex] = useState(0);
    const [repeatEventsVisible, setRepeatEventsVisible] = useState(false);
    const [weeklyEventsVisible, setWeeklyEventsVisible] = useState(false);
    const [error, setError] = useState({ state: false, message: "" });
    const [dialogOpen, setDislogOpen] = React.useState(open);

    useEffect(() => {
        setDislogOpen(open)
    }, [open]);

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
        reminderData.time.startDate = fromDayJsDate(startDate);
        if (!reminderData.time.endDate) {
            reminderData.time.endDate = { year: startDate.year(), month: startDate.format("MMMM"), day: startDate.date() };
        }
    };

    const endDateSelected = (endDate: Dayjs) => {
        setOnIndex(1)

        const startDate = toDayJsDate(reminderData.time.startDate);
        if (endDate < startDate) {
            setError({ state: true, message: "End date must be after start date" })
            reminderData.time.endDate = fromDayJsDate(startDate);
            setError({ state: true, message: "Error: End date must be same or after start date" })
        } else {
            setError({ state: false, message: "" })
            reminderData.time.endDate = fromDayJsDate(endDate)
        }
    };

    const toDayJsDate = (date: { year: number, month: string, day: number } | null): Dayjs => {
        if (!date) {
            return dayjs();
        }

        const { year, month, day } = date;

        const dateString = `${year}-${month}-${day}`;
        const dayjsDate = dayjs(dateString, { format: 'YYYY-MMMM-DD' });

        return dayjsDate;
    }

    const fromDayJsDate = (date: Dayjs): { year: number, month: string, day: number } => {
        const dayjsDate = dayjs(date);
        return { year: dayjsDate.year(), month: dayjsDate.format("MMMM"), day: dayjsDate.date() }
    }

    const handleSelectFrequency = (frequency: string) => {
        reminderData.time.repeatPeriod = (frequency)
        if (reminderData.time.repeatPeriod !== "Does not repeat") { setRepeatEventsVisible(true) } else { setRepeatEventsVisible(false) }
        if (reminderData.time.repeatPeriod === "Weekly") { setWeeklyEventsVisible(true) } else { setWeeklyEventsVisible(false) }
    }

    function onOccurencesChange(value: string): void {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num > 0) {
            reminderData.time.occurrences = num;
            reminderData.time.endDate = null
            setOnIndex(2)
            setError({ state: false, message: "" })
        } else {
            reminderData.time.occurrences = 1
            setError({ state: true, message: "Please enter a number greater than 0" })
        }
    }

    function daysOfWeekSelected(selected: number[]): void {
        reminderData.time.daysOfWeek = [];
        reminderData.time.daysOfWeek.push(...selected.map(index => checkBoxes[index].value))
    }

    const onEndsSelected = ((index: number, checked: boolean) => {
        setOnIndex(index)
    })


    const onSave = (reminderData: any) => {
        if (!reminderData.title || reminderData.title == "") {
            reminderData.title = "No Title"
        }
        if (!reminderData.time.endDate) {
            reminderData.time.endDate = reminderData.time.startDate
        }
        handleClose(reminderData)
    }

    return (
        <div>
            <AppDialog open={dialogOpen} onClose={() => handleClose(reminderData)} title="Edit Reminder">

                <Card className="mx-auto w-full max-w-1xl">
                    <CardHeader className="flex flex-row justify-between" children={<></>} />
                    <CardBody className="flex flex-col gap-4">
                        <AppInput label='Title' size="lg" initialValue={reminderData.title} onChange={(value) => reminderData.title = value} className="w-full" />
                        <AppSelect label='Frequency' value={options[0]} items={options} className="w-full" onSelected={handleSelectFrequency} />
                        <div className="flex flex-row justify-between items-center gap-4">
                            <AppDatePicker open={open} label='Date' initialDate={startDate} onDateSelected={date => startDateSelected(date)} />
                        </div>

                        {repeatEventsVisible && <div className="flex flex-row justify-start gap-2" >
                            <div className={weeklyEventsVisible ? "border-r border-gray-400 p-4" : ""}>
                                <AppRadioButtonList checkedIndex={endOnIndex} label='End on' onChange={onEndsSelected} radioButtons={[

                                    <AppText disabled={endOnIndex != 0} text="Never" variant='paragraph' />,

                                    <div className='flex flex-row gap-2 items-center'>
                                        <AppText text="On" variant='paragraph' />
                                        <AppDatePicker disabled={endOnIndex != 1} label={""} onDateSelected={endDateSelected} initialDate={startDate} open={false} />
                                    </div>,

                                    <div className='flex flex-row gap-2 items-center'>
                                        <AppText text="After" variant='paragraph' />
                                        <AppInput disabled={endOnIndex != 2} type="number" label='Occurences' onChange={onOccurencesChange} />
                                    </div>]} />
                            </div>
                            {weeklyEventsVisible && <div className="">
                                <AppCheckboxList label='Repeat on' displayValues={checkBoxes.map(checkBox => checkBox.displayValue)} onChange={daysOfWeekSelected} />
                            </div>}
                        </div>
                        }
                    </CardBody>
                    <CardFooter className="pt-0 flex flex-col justify-start">
                        {error && <div className="text-red-500">
                            <AppText text={error.message} variant='paragraph' />
                        </div>}
                        <div className="pt-0 flex flex-row justify-end">
                            <AppDialogButton label="Calcel" onClick={() => handleClose(null)} />
                            <AppDialogButton label="Save" onClick={() => onSave(reminderData)} />
                        </div>
                    </CardFooter>
                </Card>
            </AppDialog>
        </div >
    );
};

export default ReminderEditDialog;