"use client"

import React, { useEffect, useRef, useState } from 'react';
import withBottomMenu from '@components/withBottomMenu'
import AppButton from '../components/AppButton';
import ReminderCard from './ReminderCard';
import GShockAPI from '@/api/GShockAPI';
import ReminderData, { repeatPeriodType } from './ReminderData';

const Reminders: React.FC = () => {

    const initialized = useRef(false)

    const reminderInit = {
        daysOfWeek: [],
        enabled: false,
        endDate: null,
        startDate: { year: 0, month: '', day: 0 },
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
                setReminders(newReminders);
            }
        })()
    }, [reminders]);

    return (
        <div className='flex flex-col'>
            <div className="inline-block bg-white p-4 gap-4 rounded shadow-lg grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 justify-items-center">
                <ReminderCard number={1} reminder={reminders[0]} />
                <ReminderCard number={2} reminder={reminders[1]} />
                <ReminderCard number={3} reminder={reminders[2]} />
                <ReminderCard number={4} reminder={reminders[3]} />
                <ReminderCard number={5} reminder={reminders[4]} />
            </div>
            <div className="flex gap-6 justify-end p-16 mr-10">
                <AppButton label="Send to Watch" onClick={() => alert("Send to Watch Clicked")} />
            </div>
        </div>
    );
};

export default withBottomMenu(Reminders);