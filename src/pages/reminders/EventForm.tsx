import React, { useState } from 'react';
import { TextField, Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { add, format } from 'date-fns';

const EventForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(add(new Date(), { days: 1 }));
    const [repeatType, setRepeatType] = useState('none');
    const [repeatFrequency, setRepeatFrequency] = useState('weekly');
    const [repeatCount, setRepeatCount] = useState(1);

    const handleCreateEvent = () => {
        console.log('Event Details:');
        console.log('Title:', title);
        console.log('Start Date:', format(startDate as Date, 'yyyy-MM-dd'));
        console.log('End Date:', format(endDate as Date, 'yyyy-MM-dd'));
        console.log('Repeating:', repeatType === 'none' ? 'No' : 'Yes');
        console.log('Repeat Frequency:', repeatFrequency);
        console.log('Repeat Count:', repeatCount);
    };

    return (
        <div>
            <TextField
                label="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
                label="Start Date"
                type="date"
                value={format(startDate as Date, 'yyyy-MM-dd')}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <TextField
                label="End Date"
                type="date"
                value={format(endDate as Date, 'yyyy-MM-dd')}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <FormControl>
                <FormLabel>Repeat Event</FormLabel>
                <RadioGroup value={repeatType} onChange={(e) => setRepeatType(e.target.value)}>
                    <FormControlLabel value="none" control={<Radio />} label="No" />
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                </RadioGroup>
            </FormControl>
            {repeatType === 'yes' && (
                <>
                    <FormControl>
                        <FormLabel>Repeat Frequency</FormLabel>
                        <RadioGroup value={repeatFrequency} onChange={(e) => setRepeatFrequency(e.target.value)}>
                            <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                            <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
                            <FormControlLabel value="yearly" control={<Radio />} label="Yearly" />
                        </RadioGroup>
                    </FormControl>
                    <TextField
                        label="Repeat Count"
                        type="number"
                        value={repeatCount}
                        onChange={(e) => setRepeatCount(parseInt(e.target.value, 10))}
                    />
                </>
            )}
            <Button variant="contained" color="primary" onClick={handleCreateEvent}>
                Create Event
            </Button>
        </div>
    );
};

export default EventForm;
