"use client"

import React, { useEffect, useRef, useState } from 'react';
import withBottomMenu from '@components/withBottomMenu'
import AlarmCard, { Alarm } from './AlarmCard';
import AppSwitch from '@components/AppSwitch';
import AppButton from '@components/AppButton';
import GShockAPI from '@/api/GShockAPI';
import dayjs, { Dayjs } from 'dayjs';

const Alarms: React.FC = () => {

    const formattedString = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const initialized = useRef(false)
    const [alarms, setAlarms] = useState<{
        hour: number, minute: number, hourlyChime: boolean, enabled: boolean // Alarm
    }[]>([
        { hour: 0, minute: 0, hourlyChime: false, enabled: false },
        { hour: 0, minute: 0, hourlyChime: false, enabled: false },
        { hour: 0, minute: 0, hourlyChime: false, enabled: false },
        { hour: 0, minute: 0, hourlyChime: false, enabled: false },
        { hour: 0, minute: 0, hourlyChime: false, enabled: false },
    ]);

    useEffect(() => {
        (async () => {
            if (!initialized.current) {
                initialized.current = true;

                const newAlarms = await GShockAPI.getAlarms();
                setAlarms(newAlarms);
            }
        })()
    }, [alarms]);


    if (!alarms || alarms.length === 0) {
        return <div>No alarms</div>;
    }
    return (
        <div className='flex flex-col'>
            <div className="inline-block bg-white p-4 gap-4 rounded shadow-lg grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 justify-items-center">
                {alarms.map((alarm, index) => (
                    <AlarmCard key={index} number={(index + 1) as 1 | 2 | 3 | 4 | 5} alarm={alarm} />
                ))}

                <AppSwitch text="Signal (chime)" checked={true} />
            </div>
            <div className="flex gap-6 justify-end p-16 mr-10">
                <AppButton label="Send to Watch" onClick={() => alert("Send to Watch Clicked")} />
            </div>
        </div >
    );
};

export default withBottomMenu(Alarms);
