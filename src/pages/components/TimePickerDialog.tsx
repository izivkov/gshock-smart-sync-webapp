import React from 'react';
import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import TimePicker from '@components/TimePicker';
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
                <TimePicker initialTime={initialTime} onTimeSelected={time => handleClose(time)} />
            </DialogContent>
        </Dialog>
    );
};

export default TimePickerDialog;