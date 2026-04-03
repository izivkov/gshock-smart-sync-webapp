"use client"

import React, { useEffect, useState } from 'react';
import { Box, Paper, Divider, Typography } from '@mui/material';
import AppDialog from '../components/AppDialog';
import AppDatePicker from '../components/AppDatePicker';
import AppSelect from '../components/AppSelect';
import ReminderData, { dayOfWeekType, monthType, repeatPeriodType } from './ReminderData';
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

type frequencyDisplayType = "Does not repeat" | "Weekly" | "Monthly" | "Yearly";

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
        condigureDialog(initReminderData);
    }, [initReminderData]);

    const frequencyDisplayOptions: frequencyDisplayType[] = ["Does not repeat", "Weekly", "Monthly", "Yearly"];
    const displayMap: Record<repeatPeriodType, frequencyDisplayType> = {
        "NEVER": "Does not repeat",
        "WEEKLY": "Weekly",
        "MONTHLY": "Monthly",
        "YEARLY": "Yearly"
    };

    const forDisplay = (value: repeatPeriodType): frequencyDisplayType => {
        return displayMap[value];
    };

    const getRepeatPeriodType = (str: string): repeatPeriodType => {
        const reverseMap: Record<string, repeatPeriodType> = Object.entries(displayMap)
            .reduce((acc, [key, value]) => {
                acc[value] = key as repeatPeriodType;
                return acc;
            }, {} as Record<string, repeatPeriodType>);

        return reverseMap[str];
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

        setFrequency(reminderData.repeatPeriod)
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

    const handleSelectFrequency = (displayValue: frequencyDisplayType) => {
        const frequency = getRepeatPeriodType(displayValue)
        setFrequency(frequency);

        if (frequency !== "NEVER") { setRepeatEventsVisible(true) } else { setRepeatEventsVisible(false) }
        if (frequency === "WEEKLY") { setWeeklyEventsVisible(true) } else { setWeeklyEventsVisible(false) }

        const newReminderData: ReminderData = {
            ...reminderData,
            repeatPeriod: frequency,
        }
        setReminderData(newReminderData)
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
                displayValues.push("N/A");
            }
        });

        return displayValues;
    }

    return (
        <AppDialog open={dialogOpen} onClose={() => handleClose(reminderData)} title="Edit Reminder">
            <Paper elevation={0} sx={{ p: 1, bgcolor: 'transparent' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                    <AppInput label='Title' size="lg" initialValue={reminderData.title} onChange={(value) => reminderData.title = value} className="w-full max-w-sm" />

                    <AppSelect label='Frequency' value={forDisplay(reminderData.repeatPeriod)} items={frequencyDisplayOptions} className="w-full max-w-sm" onSelected={handleSelectFrequency} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 'sm', alignItems: 'center' }}>
                        <AppDatePicker open={open} label='Start Date' initialDate={startDate} onDateSelected={date => startDateSelected(date)} />
                    </Box>

                    {endDateVisible && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 'sm', alignItems: 'center' }}>
                            <AppDatePicker open={open} label='End Date' initialDate={endDate} onDateSelected={date => endDateSelected(date)} />
                        </Box>
                    )}

                    {repeatEventsVisible && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2, width: '100%', maxWidth: 'sm' }}>
                            <Box sx={{ flex: 1, borderBottom: '1px solid rgba(139, 94, 60, 0.15)', pb: 2 }}>
                                <AppRadioButtonList
                                    selectedIndexInit={endOnIndex}
                                    name="endsOn"
                                    label='Ends on'
                                    orientation="vertical"
                                    onChange={onEndsSelected}
                                    radioButtons={[
                                        <AppText key="never" text="Never" variant='paragraph' disabled={endOnIndex !== 0} />,
                                        <Box key="on" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                            <AppText text="On" variant='paragraph' disabled={endOnIndex !== 1} />
                                            <AppDatePicker disabled={endOnIndex !== 1} label={""} onDateSelected={endDateSelected} initialDate={startDate} open={false} />
                                        </Box>,
                                        <Box key="after" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                            <AppText text="After" variant='paragraph' disabled={endOnIndex !== 2} />
                                            <AppInput disabled={endOnIndex !== 2} type="number" label='Occurrences' onChange={onOccurencesChange} className="w-24" />
                                        </Box>
                                    ]}
                                />
                            </Box>

                            {weeklyEventsVisible && (
                                <Box sx={{ flex: 1 }}>
                                    <AppCheckboxList
                                        label='Repeat on'
                                        displayValues={checkBoxes.map(checkBox => checkBox.displayValue)}
                                        selectedSetInit={lookupDisplayValues(reminderData.daysOfWeek)}
                                        onChange={daysOfWeekSelected}
                                    />
                                </Box>
                            )}
                        </Box>
                    )}

                    <Divider sx={{ width: '100%', my: 1 }} />

                    {error.state && (
                        <Typography color="error" variant="caption" sx={{ mt: -1 }}>
                            {error.message}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, pt: 2, width: '100%' }}>
                        <AppDialogButton label="Cancel" onClick={() => handleClose(null)} />
                        <AppDialogButton label="Save" onClick={() => onSave(reminderData)} />
                    </Box>
                </Box>
            </Paper>
        </AppDialog>
    );
};

export default ReminderEditDialog;
