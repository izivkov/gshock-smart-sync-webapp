import React from 'react';
import { Dayjs } from 'dayjs';
import AppDialog from '../components/AppDialog';
import AppDatePicker from '../components/AppDatePicker';
import AppSelect from '../components/AppSelect';
import AppButton from '../components/AppButton';
import { DialogHeader } from '@material-tailwind/react';

interface ReminderEditDialogProps {
    open: boolean;
    handleClose: (date: any) => void;
    initialDate: Dayjs;
}

const ReminderEditDialog: React.FC<ReminderEditDialogProps> = ({ open, handleClose, initialDate }) => {

    return (
        <div>
            <AppDialog open={open} onClose={handleClose} title="Edit Reminder">

                <AppSelect label='Frequency' value='Does not repeat' items={['Does not repeat', 'Weekly', 'Monthly', 'Yearly']} />
                <AppDatePicker initialDate={initialDate} onTimeSelected={date => handleClose(date)} />
            </AppDialog>
        </div >
    );
};

export default ReminderEditDialog;