"use client"

import React, { useEffect, useRef, useState } from 'react';
import withBottomMenu from '@components/withBottomMenu'
import AppButton from '../components/AppButton';
import ReminderCard from './ReminderCard';
import GShockAPI from '@/api/GShockAPI';
import ReminderData, { monthType, repeatPeriodType } from './ReminderData';
import * as testReminders from '../../testdata/reminders.json';

const Reminders: React.FC = () => {

    const initialized = useRef(false)

    const reminderInit = {
        daysOfWeek: [],
        enabled: false,
        endDate: null,
        startDate: { year: 2000, month: 'JANUARY' as monthType, day: 1 },
        incompatible: false,
        repeatPeriod: 'NEVER' as repeatPeriodType,
        occurrences: 0,
        title: ''
    }
    const initialReminders = Array.from({ length: 5 }, () => ({ ...reminderInit }));
    const [reminders, setReminders] = useState<ReminderData[]>(initialReminders);

    useEffect(() => {
        (async () => {
            if (!initialized.current) {
                initialized.current = true;
                const newReminders = await GShockAPI.getEventsFromWatch();
                // const newReminders = testReminders as ReminderData[];

                setReminders(newReminders);
            }
        })()
    }, [reminders]);

    function sendToWatch(): void {
        console.log(`==========> Sending reminders to watch: ${reminders}`);
        GShockAPI.setEvents(reminders);
    }

    const onChange = (reminder: ReminderData, number: 1 | 2 | 3 | 4 | 5) => {
        if (!initialized.current) {
            return;
        }

        // const newReminders = [...reminders]; // shallow copy does not work
        const newReminders = JSON.parse(JSON.stringify(reminders));

        newReminders[number - 1] = reminder;
        setReminders(newReminders);
        console.log(reminder);
    }

    return (
        <div className='flex flex-col'>
            <div className="inline-block bg-white p-4 gap-4 rounded shadow-lg grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 justify-items-center">
                <ReminderCard number={1} initialReminder={reminders[0]} onChange={onChange} />
                <ReminderCard number={2} initialReminder={reminders[1]} onChange={onChange} />
                <ReminderCard number={3} initialReminder={reminders[2]} onChange={onChange} />
                <ReminderCard number={4} initialReminder={reminders[3]} onChange={onChange} />
                <ReminderCard number={5} initialReminder={reminders[4]} onChange={onChange} />
            </div>
            <div className="flex gap-6 justify-end p-16 mr-10">
                <AppButton label="Send to Watch" onClick={sendToWatch} />
            </div>
        </div>
    );
};

// export some utility functions

export default withBottomMenu(Reminders);