"use client"

import React from 'react';
import withBottomMenu from '@components/withBottomMenu'
import AlarmCard from './AlarmCard';
import AppSwitch from '../components/AppSwitch';
import AppButton from '../components/AppButton';

const Alarms: React.FC = () => {
    return (
        <div className='flex flex-col'>
            <div className="inline-block bg-white p-4 gap-4 rounded shadow-lg grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 justify-items-center">
                <AlarmCard number={1} />
                <AlarmCard number={2} />
                <AlarmCard number={3} />
                <AlarmCard number={4} />
                <AlarmCard number={5} />
                <AppSwitch text="Signal (chime)" checked={true} />
            </div>
            <div className="flex gap-6 justify-end p-16 mr-10">
                <AppButton label="Send to Watch" onClick={() => alert("Send to Watch Clicked")} />
            </div>
        </div>
    );
};

export default withBottomMenu(Alarms);