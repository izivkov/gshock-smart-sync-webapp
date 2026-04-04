import React, { useEffect, useState, useMemo } from 'react';
import AppDialog from '../components/AppDialog';
import AppDatePicker from '../components/AppDatePicker';
import AppSelect from '../components/AppSelect';
import ReminderData, { dayOfWeekType, repeatPeriodType } from './ReminderData';
import AppDialogButton from '../components/AppDialogButton';
import AppRadioButtonList from '../components/AppRadioButtonList';
import AppText from '../components/AppText';
import AppInput from '../components/AppInput';
import AppDayOfWeekPicker from '../components/AppDayOfWeekPicker';
import { fromDayJsDate, toDayJsDate, calculateEndDateFromOccurences } from './ReminderUtils';
import { Dayjs } from 'dayjs';
import { 
    InfoOutlined, 
    UpdateOutlined, 
    EventRepeatOutlined,
    NotificationImportantOutlined
} from '@mui/icons-material';
import { Box, Typography, Paper, Divider } from '@mui/material';

interface ReminderEditDialogProps {
    open: boolean;
    handleClose: (returnData: any) => void;
    startDate: Dayjs;
    initReminderData: ReminderData;
}

const ReminderEditDialog: React.FC<ReminderEditDialogProps> = ({ open, handleClose, startDate, initReminderData }) => {
    const [reminderData, setReminderData] = useState<ReminderData>(initReminderData);
    const [endOnIndex, setOnIndex] = useState(0);
    const [error, setError] = useState({ state: false, message: "" });
    const [dialogOpen, setDialogOpen] = useState(open);

    useEffect(() => {
        setDialogOpen(open);
    }, [open]);

    useEffect(() => {
        setReminderData(initReminderData);
        // Determine endOnIndex based on existing data
        const start = toDayJsDate(initReminderData.startDate);
        const end = toDayJsDate(initReminderData.endDate);
        
        if (initReminderData.occurrences > 0) {
            setOnIndex(2); // After occurrences
        } else if (initReminderData.endDate && !end.isSame(start)) {
            setOnIndex(1); // On specific date
        } else {
            setOnIndex(0); // Never
        }
    }, [initReminderData]);

    const frequencyOptions: { value: repeatPeriodType; label: string }[] = [
        { value: "NEVER", label: "Does not repeat" },
        { value: "DAILY", label: "Daily" },
        { value: "WEEKLY", label: "Weekly" },
        { value: "MONTHLY", label: "Monthly" },
        { value: "YEARLY", label: "Yearly" }
    ];

    const currentFrequencyLabel = useMemo(() => 
        frequencyOptions.find(f => f.value === reminderData.repeatPeriod)?.label || "Does not repeat",
    [reminderData.repeatPeriod]);

    const handleUpdate = (updates: Partial<ReminderData>) => {
        setReminderData(prev => ({ ...prev, ...updates }));
    };

    const handleSave = () => {
        let finalData = { ...reminderData };
        
        if (!finalData.title?.trim()) {
            finalData.title = "No Title";
        }

        // Calculate final end date based on termination selection
        if (endOnIndex === 0) { // Never
            finalData.endDate = finalData.startDate;
            finalData.occurrences = 0;
        } else if (endOnIndex === 2 && finalData.occurrences > 0) { // After X times
            const calculatedEnd = calculateEndDateFromOccurences(
                finalData.occurrences,
                finalData.startDate,
                finalData.repeatPeriod,
                finalData.daysOfWeek
            );
            finalData.endDate = calculatedEnd;
        }

        handleClose(finalData);
    };

    const sectionHeader = (icon: React.ReactNode, title: string) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
            {icon}
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}>
                {title}
            </Typography>
        </Box>
    );

    return (
        <AppDialog open={dialogOpen} onClose={() => handleClose(null)} title="Edit Reminder">
            <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                {/* General Info Section */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    {sectionHeader(<InfoOutlined fontSize="small" />, "General Info")}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <AppInput 
                            label='Title' 
                            size="lg" 
                            initialValue={reminderData.title} 
                            onChange={(val) => handleUpdate({ title: val })} 
                        />
                        <AppSelect 
                            label='Frequency' 
                            value={currentFrequencyLabel} 
                            items={frequencyOptions.map(f => f.label)} 
                            onSelected={(lbl) => {
                                const val = frequencyOptions.find(f => f.label === lbl)?.value || "NEVER";
                                handleUpdate({ repeatPeriod: val });
                            }} 
                        />
                    </Box>
                </Paper>

                <Divider />

                {/* Frequency Details Section */}
                {reminderData.repeatPeriod !== "NEVER" && (
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.04)', borderRadius: 2, border: '1px solid', borderColor: 'rgba(33, 150, 243, 0.1)' }}>
                        {sectionHeader(<UpdateOutlined fontSize="small" />, "Frequency & Timeline")}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            <AppDatePicker 
                                open={open} 
                                label='Start Date' 
                                initialDate={toDayJsDate(reminderData.startDate)} 
                                onDateSelected={date => handleUpdate({ startDate: fromDayJsDate(date) })} 
                            />
                            
                            {reminderData.repeatPeriod === "WEEKLY" && (
                                <AppDayOfWeekPicker 
                                    label="Repeat on"
                                    selectedDays={reminderData.daysOfWeek}
                                    onChange={(days) => handleUpdate({ daysOfWeek: days })}
                                />
                            )}
                        </Box>
                    </Paper>
                )}

                {/* Termination Section */}
                {reminderData.repeatPeriod !== "NEVER" && (
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(255, 152, 0, 0.04)', borderRadius: 2, border: '1px solid', borderColor: 'rgba(255, 152, 0, 0.1)' }}>
                        {sectionHeader(<EventRepeatOutlined fontSize="small" />, "Termination")}
                        <Box sx={{ mt: 1 }}>
                            <AppRadioButtonList 
                                selectedIndexInit={endOnIndex} 
                                name="endsOn" 
                                label='Ends' 
                                orientation="vertical" 
                                onChange={(idx) => setOnIndex(idx)} 
                                radioButtons={[
                                    <AppText key="never" text="Never (Continuous)" variant='paragraph' />,
                                    <Box key="on" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AppText text="On Date" variant='paragraph' />
                                        <AppDatePicker 
                                            disabled={endOnIndex !== 1} 
                                            label={""} 
                                            onDateSelected={(date) => handleUpdate({ endDate: fromDayJsDate(date) })} 
                                            initialDate={toDayJsDate(reminderData.endDate || reminderData.startDate)} 
                                            open={false} 
                                        />
                                    </Box>,
                                    <Box key="after" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AppText text="After" variant='paragraph' />
                                        <Box sx={{ width: 80 }}>
                                            <AppInput 
                                                disabled={endOnIndex !== 2} 
                                                type="number" 
                                                label='' 
                                                onChange={(val) => handleUpdate({ occurrences: parseInt(val) || 0 })} 
                                                initialValue={reminderData.occurrences.toString()}
                                            />
                                        </Box>
                                        <AppText text="times" variant='paragraph' />
                                    </Box>
                                ]} 
                            />
                        </Box>
                    </Paper>
                )}

                {error.state && (
                    <Box sx={{ p: 1, bgcolor: 'error.lighter', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotificationImportantOutlined color="error" fontSize="small" />
                        <Typography variant="caption" color="error">{error.message}</Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <AppDialogButton label="Cancel" onClick={() => handleClose(null)} />
                    <AppDialogButton label="Save Reminder" onClick={handleSave} />
                </Box>
            </Box>
        </AppDialog>
    );
};

export default ReminderEditDialog;
