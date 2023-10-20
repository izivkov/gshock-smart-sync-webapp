"use client"

import React from 'react';
import withBottomMenu from '@components/withBottomMenu'
import AlarmCard from './AlarmCard';

const Alarms: React.FC = () => {
    return (
        <div>
            <div className="inline-block bg-white p-4 gap-4 rounded shadow-lg grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 justify-items-center">
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