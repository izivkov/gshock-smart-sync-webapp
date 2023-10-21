"use client"

import React from 'react';
import withBottomMenu from '@components/withBottomMenu'
import EventForm from './EventForm';

const Reminders: React.FC = () => {
    return (
        <div>
            <div className="flex min-h-screen flex-col justify-between p-24">
                <h2>Reminders Page</h2>
                <EventForm />
            </div>
        </div>
    );
};

export default withBottomMenu(Reminders);