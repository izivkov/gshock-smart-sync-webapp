import React from 'react';
import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import AppTimePicker from '@/pages/components/AppTimePicker';
import { Dayjs } from 'dayjs';

interface TimePickerDialogProps {
    open: boolean;
    handleClose: (time: any) => void;
    initialTime: Dayjs;
}

const TimePickerDialog: React.FC<TimePickerDialogProps> = ({ open, handleClose, initialTime }) => {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Select Time</DialogTitle>
            <DialogContent>
                <AppTimePicker initialTime={initialTime} onTimeSelected={time => handleClose(time)} onCancel={() => handleClose(null)} />
            </DialogContent>
        </Dialog>
    );
};

export default TimePickerDialog;