"use client"

import React from 'react';
import withBottomMenu from '@components/withBottomMenu'
import AppButton from '../components/AppButton';
import ReminderCard from './ReminderCard';

const Reminders: React.FC = () => {
    return (
        <div className='flex flex-col'>
            <div className="inline-block bg-white p-4 gap-4 rounded shadow-lg grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 justify-items-center">
                <ReminderCard number={1} />
                <ReminderCard number={2} />
                <ReminderCard number={3} />
                <ReminderCard number={4} />
                <ReminderCard number={5} />
            </div>
            <div className="flex gap-6 justify-end p-16 mr-10">
                <AppButton label="Send to Watch" onClick={() => alert("Send to Watch Clicked")} />
            </div>
        </div>
    );
};

export default withBottomMenu(Reminders);