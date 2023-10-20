"use client"

import React from 'react';
import withBottomMenu from '@components/withBottomMenu'
import AlarmCard from './AlarmCard';

const Alarms: React.FC = () => {
    return (
        <div>
            <div className="flex min-h-screen flex-col  p-24">
                <AlarmCard number={1} />
                <AlarmCard number={2} />
                <AlarmCard number={3} />
                <AlarmCard number={4} />
                <AlarmCard number={5} />
            </div>
        </div>
    );
};

export default withBottomMenu(Alarms);