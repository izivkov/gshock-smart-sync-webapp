import React, { useEffect, useState } from 'react';
import AppDialog from '../components/AppDialog';
import AppDatePicker from '../components/AppDatePicker';
import AppSelect from '../components/AppSelect';
import ReminderData, { dayOfWeekType, monthType, repeatPeriodType } from './ReminderData';
import { Card, CardBody, CardFooter, CardHeader } from '@material-tailwind/react';
import AppDialogButton from '../components/AppDialogButton';
import AppCheckboxList from '../components/AppCheckboxList';
import AppRadioButtonList from '../components/AppRadioButtonList';
import AppText from '../components/AppText';
import AppInput from '../components/AppInput';
import { fromDayJsDate, toDayJsDate } from './ReminderUtils';
import { Dayjs } from 'dayjs';

interface ReminderEditDialogProps {
    open: boolean;
    handleClose: (returnData: any) => void;
    startDate: Dayjs;
    initReminderData: ReminderData;
}

const ReminderEditDialog: React.FC<ReminderEditDialogProps> = ({ open, handleClose, startDate, initReminderData }) => {

    const [endOnIndex, setOnIndex] = useState(0);
    const [repeatEventsVisible, setRepeatEventsVisible] = useState(false);
    const [weeklyEventsVisible, setWeeklyEventsVisible] = useState(false);
    const [endDateVisible, setEndDateVisible] = useState(false);
    const [endDate, setEndDate] = useState(initReminderData.endDate ? toDayJsDate(initReminderData.endDate) : startDate);
    const [error, setError] = useState({ state: false, message: "" });
    const [dialogOpen, setDialogOpen] = React.useState(open);
    const [frequency, setFrequency] = React.useState(initReminderData.repeatPeriod);
    const [reminderData, setReminderData] = useState<ReminderData>(initReminderData);

    useEffect(() => {
        setDialogOpen(open)
    }, [open]);

    useEffect(() => {
        setReminderData(initReminderData);
        condigureDialog(reminderData);
    }, [initReminderData]);

    const displayMap: Record<repeatPeriodType, string> = {
        "NEVER": "Does not repeat",
        "DAILY": "Daily",
        "WEEKLY": "Weekly",
        "MONTHLY": "Monthly",
        "YEARLY": "Yearly"
    };

    const forDisplay = (value: repeatPeriodType): string => {
        return displayMap[value] || "Does not repeat";
    };

    const getRepeatPeriodType = (str: string): repeatPeriodType | null => {
        const reverseMap: Record<string, repeatPeriodType> = Object.entries(displayMap)
            .reduce((acc, [key, value]) => {
                acc[value] = key as repeatPeriodType;
                return acc;
            }, {} as Record<string, repeatPeriodType>);

        return reverseMap[str] || null;
    };

    const condigureDialog = (reminderData: ReminderData) => {
        const start = toDayJsDate(reminderData.startDate);
        const end = toDayJsDate(reminderData.endDate);

        if (reminderData.endDate && !end.isSame(start)) {
            setOnIndex(1)
        } else {
            setOnIndex(0)
        }
        if (reminderData.repeatPeriod !== "NEVER") { setRepeatEventsVisible(true) } else { setRepeatEventsVisible(false) }
        if (reminderData.repeatPeriod === "WEEKLY") { setWeeklyEventsVisible(true) } else { setWeeklyEventsVisible(false) }

        setFrequency(forDisplay(reminderData.repeatPeriod))
        setEndDate(toDayJsDate(reminderData.endDate));
    }

    interface CheckboxValues {
        value: dayOfWeekType;
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
        reminderData.startDate = fromDayJsDate(startDate);
        if (!reminderData.endDate) {
            reminderData.endDate = { year: startDate.year(), month: startDate.format("MMMM") as monthType, day: startDate.date() };
        }
    };

    const endDateSelected = (endDate: Dayjs) => {
        setOnIndex(1)

        const startDate = toDayJsDate(reminderData.startDate);
        if (endDate < startDate) {
            setError({ state: true, message: "End date must be after start date" })
            reminderData.endDate = fromDayJsDate(startDate);
            setError({ state: true, message: "Error: End date must be same or after start date" })
        } else {
            setError({ state: false, message: "" })
            reminderData.endDate = fromDayJsDate(endDate)
        }
    };

    const handleSelectFrequency = (frequency: string) => {
        reminderData.repeatPeriod = getRepeatPeriodType(frequency) || "NEVER"
        if (reminderData.repeatPeriod !== "NEVER") { setRepeatEventsVisible(true) } else { setRepeatEventsVisible(false) }
        if (reminderData.repeatPeriod === "WEEKLY") { setWeeklyEventsVisible(true) } else { setWeeklyEventsVisible(false) }
    }

    function onOccurencesChange(value: string): void {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num > 0) {
            reminderData.occurrences = num;
            reminderData.endDate = { year: startDate.year(), month: startDate.format("MMMM") as monthType, day: startDate.date() }
            setOnIndex(2)
            setError({ state: false, message: "" })
            setEndDateVisible(false)
        } else {
            reminderData.occurrences = 0
            setError({ state: true, message: "Please enter a number greater than 0" })
        }
    }

    function daysOfWeekSelected(selected: string[]): void {
        function getValuesByDisplayValues(displayValues: string[]): dayOfWeekType[] {
            const values: dayOfWeekType[] = [];

            displayValues.forEach(displayValue => {
                const foundCheckBox = checkBoxes.find(checkBox => checkBox.displayValue === displayValue);
                if (foundCheckBox) {
                    values.push(foundCheckBox.value);
                }
            });

            return values;
        }

        reminderData.daysOfWeek = getValuesByDisplayValues(selected)
    }

    const onEndsSelected = ((index: number, checked: boolean) => {
        setOnIndex(index)
    })

    const onSave = (reminderData: any) => {
        if (!reminderData.title || reminderData.title == "") {
            reminderData.title = "No Title"
        }
        if (!reminderData.endDate) {
            reminderData.endDate = reminderData.startDate
        }
        handleClose(reminderData)
    }

    const lookupDisplayValues = (values: string[]): string[] => {
        const displayValues: string[] = [];

        values.forEach(value => {
            const foundCheckbox = checkBoxes.find(cb => cb.value === value);
            if (foundCheckbox) {
                displayValues.push(foundCheckbox.displayValue);
            } else {
                // If no matching value is found, you can handle it here.
                // For example, pushing a default value or throwing an error.
                displayValues.push("N/A");
                // throw new Error(`Display value not found for ${value}`);
            }
        });

        return displayValues;
    }

    return (
        <div>
            <AppDialog open={dialogOpen} onClose={() => handleClose(reminderData)} title="Edit Reminder">

                <Card className="mx-auto w-full max-w-1xl">
                    <CardHeader className="flex flex-row justify-between" children={<></>} />
                    <CardBody className="flex flex-col gap-4">
                        <AppInput label='Title' size="lg" initialValue={reminderData.title} onChange={(value) => reminderData.title = value} className="w-full" />
                        <AppSelect label='Frequency' value={frequency} items={options} className="w-full" onSelected={handleSelectFrequency} />
                        <div className="flex flex-row justify-between items-center gap-4">
                            <AppDatePicker open={open} label='Start Date' initialDate={startDate} onDateSelected={date => startDateSelected(date)} />
                        </div>
                        {endDateVisible && <div className="flex flex-row justify-between items-center gap-4">
                            <AppDatePicker open={open} label='End Date' initialDate={endDate} onDateSelected={date => endDateSelected(date)} />
                        </div>}

                        {repeatEventsVisible && <div className="flex flex-row justify-start gap-2" >
                            <div className={weeklyEventsVisible ? "border-r border-gray-400 p-4" : ""}>
                                <AppRadioButtonList selectedIndexInit={endOnIndex} name="endsOn" label='Ends on' orientation="vertical" onChange={onEndsSelected} radioButtons={[

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
                                <AppCheckboxList label='Repeat on' displayValues={checkBoxes.map(checkBox => checkBox.displayValue)} selectedSetInit={lookupDisplayValues(reminderData.daysOfWeek)} onChange={daysOfWeekSelected} />
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

