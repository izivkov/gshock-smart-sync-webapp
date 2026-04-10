"use client"

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormGroup,
    Checkbox,
    FormHelperText,
    Button,
    Typography,
    Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ReminderData, { dayOfWeekType, monthType, repeatPeriodType } from './ReminderData';
import { fromDayJsDate, toDayJsDate } from './ReminderUtils';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface ReminderEditDialogProps {
    open: boolean;
    handleClose: (returnData: any) => void;
    startDate: Dayjs;
    initReminderData: ReminderData;
}

type frequencyDisplayType = "Does not repeat" | "Daily" | "Weekly" | "Monthly" | "Yearly";

const ReminderEditDialog: React.FC<ReminderEditDialogProps> = ({ open, handleClose, startDate, initReminderData }) => {

    const [endOnIndex, setOnIndex] = useState(0);
    const [repeatEventsVisible, setRepeatEventsVisible] = useState(false);
    const [weeklyEventsVisible, setWeeklyEventsVisible] = useState(false);
    const [endDate, setEndDate] = useState(initReminderData.endDate ? toDayJsDate(initReminderData.endDate) : startDate);
    const [currentStartDate, setCurrentStartDate] = useState(startDate);
    const [error, setError] = useState({ state: false, message: "" });
    const [frequency, setFrequency] = useState(initReminderData.repeatPeriod);
    const [reminderData, setReminderData] = useState<ReminderData>(initReminderData);
    const [title, setTitle] = useState(initReminderData.title);

    useEffect(() => {
        setReminderData(initReminderData);
        setTitle(initReminderData.title);
        configureDialog(initReminderData);
    }, [initReminderData]);

    const frequencyDisplayOptions: frequencyDisplayType[] = ["Does not repeat", "Daily", "Weekly", "Monthly", "Yearly"];
    const displayMap: Record<repeatPeriodType, frequencyDisplayType> = {
        "NEVER": "Does not repeat",
        "DAILY": "Daily",
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

    const configureDialog = (reminderData: ReminderData) => {
        const start = toDayJsDate(reminderData.startDate);
        const end = reminderData.endDate ? toDayJsDate(reminderData.endDate) : start;

        setCurrentStartDate(start);
        setEndDate(end);

        if (reminderData.occurrences > 0) {
            setOnIndex(2);
        } else if (reminderData.endDate && !end.isSame(start)) {
            setOnIndex(1);
        } else {
            setOnIndex(0);
        }
        
        if (reminderData.repeatPeriod !== "NEVER") { 
            setRepeatEventsVisible(true) 
        } else { 
            setRepeatEventsVisible(false) 
        }
        
        if (reminderData.repeatPeriod === "WEEKLY") { 
            setWeeklyEventsVisible(true) 
        } else { 
            setWeeklyEventsVisible(false) 
        }

        setFrequency(reminderData.repeatPeriod);
    }

    const checkBoxes = [
        { value: "MONDAY", displayValue: "Mon" },
        { value: "TUESDAY", displayValue: "Tue" },
        { value: "WEDNESDAY", displayValue: "Wed" },
        { value: "THURSDAY", displayValue: "Thu" },
        { value: "FRIDAY", displayValue: "Fri" },
        { value: "SATURDAY", displayValue: "Sat" },
        { value: "SUNDAY", displayValue: "Sun" }
    ]

    const handleSelectFrequency = (displayValue: frequencyDisplayType) => {
        const freq = getRepeatPeriodType(displayValue)
        setFrequency(freq);

        if (freq !== "NEVER") { setRepeatEventsVisible(true) } else { setRepeatEventsVisible(false) }
        if (freq === "WEEKLY") { setWeeklyEventsVisible(true) } else { setWeeklyEventsVisible(false) }

        setReminderData({
            ...reminderData,
            repeatPeriod: freq,
        })
    }

    const handleEndOnChange = (index: number) => {
        setOnIndex(index);
    }

    const handleOccurrencesChange = (value: string) => {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num > 0) {
            reminderData.occurrences = num;
            reminderData.endDate = { year: startDate.year(), month: startDate.format("MMMM") as monthType, day: startDate.date() }
            setError({ state: false, message: "" })
        } else {
            reminderData.occurrences = 0
            setError({ state: true, message: "Please enter a number greater than 0" })
        }
    }

    const handleDaysOfWeekChange = (day: string, checked: boolean) => {
        if (checked) {
            reminderData.daysOfWeek = [...reminderData.daysOfWeek, day as dayOfWeekType];
        } else {
            reminderData.daysOfWeek = reminderData.daysOfWeek.filter(d => d !== day);
        }
    }

    const handleSave = () => {
        const data = {
            ...reminderData,
            title: title || "No Title",
            endDate: reminderData.endDate || reminderData.startDate
        };
        handleClose(data);
    }

    return (
        <Dialog open={open} onClose={() => handleClose(reminderData)} fullWidth maxWidth="sm">
            <DialogTitle>Edit Event</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        fullWidth
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        variant="outlined"
                    />

                    <FormControl fullWidth>
                        <InputLabel>Frequency</InputLabel>
                        <Select
                            value={forDisplay(frequency)}
                            label="Frequency"
                            onChange={(e) => handleSelectFrequency(e.target.value as frequencyDisplayType)}
                        >
                            {frequencyDisplayOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Start Date"
                            value={currentStartDate}
                            onChange={(newDate) => {
                                if (newDate) {
                                    setCurrentStartDate(newDate);
                                    reminderData.startDate = fromDayJsDate(newDate);
                                    if (!reminderData.endDate) {
                                        reminderData.endDate = { year: newDate.year(), month: newDate.format("MMMM") as monthType, day: newDate.date() };
                                    }
                                }
                            }}
                            slotProps={{
                                textField: { fullWidth: true }
                            }}
                        />
                    </LocalizationProvider>

                    {repeatEventsVisible && (
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                Ends on
                            </Typography>
                            <RadioGroup
                                value={endOnIndex.toString()}
                                onChange={(e) => handleEndOnChange(parseInt(e.target.value))}
                            >
                                <FormControlLabel
                                    value="0"
                                    control={<Radio />}
                                    label="Never"
                                />
                                <FormControlLabel
                                    value="1"
                                    control={<Radio />}
                                    label="On a specific date"
                                />
                                <FormControlLabel
                                    value="2"
                                    control={<Radio />}
                                    label="After a number of occurrences"
                                />
                            </RadioGroup>

                            {endOnIndex === 1 && (
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="End Date"
                                        value={endDate}
                                        onChange={(newDate) => {
                                            if (newDate) {
                                                const startDayJs = toDayJsDate(reminderData.startDate);
                                                if (newDate < startDayJs) {
                                                    setError({ state: true, message: "End date must be after start date" });
                                                    reminderData.endDate = fromDayJsDate(startDayJs);
                                                } else {
                                                    setError({ state: false, message: "" });
                                                    setEndDate(newDate);
                                                    reminderData.endDate = fromDayJsDate(newDate);
                                                }
                                            }
                                        }}
                                        slotProps={{
                                            textField: { fullWidth: true, sx: { mt: 2 } }
                                        }}
                                    />
                                </LocalizationProvider>
                            )}

                            {endOnIndex === 2 && (
                                <TextField
                                    type="number"
                                    label="Number of Occurrences"
                                    slotProps={{ htmlInput: { min: 1 } }}
                                    onChange={(e) => handleOccurrencesChange(e.target.value)}
                                    sx={{ mt: 2, width: 200 }}
                                    error={error.state}
                                    helperText={error.message}
                                />
                            )}

                            {weeklyEventsVisible && (
                                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Repeat on
                                    </Typography>
                                    <FormGroup row>
                                        {checkBoxes.map((day) => (
                                            <FormControlLabel
                                                key={day.value}
                                                control={
                                                    <Checkbox
                                                        checked={reminderData.daysOfWeek.includes(day.value as dayOfWeekType)}
                                                        onChange={(e) => handleDaysOfWeekChange(day.value, e.target.checked)}
                                                    />
                                                }
                                                label={day.displayValue}
                                            />
                                        ))}
                                    </FormGroup>
                                </Box>
                            )}
                        </Box>
                    )}

                    {error.state && (
                        <FormHelperText error>
                            {error.message}
                        </FormHelperText>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => handleClose(null)}
                    sx={{ flexShrink: 0 }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{ flexShrink: 0 }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReminderEditDialog;
