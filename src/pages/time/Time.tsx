"use client"

import React from 'react';
import withBottomMenu from '@components/withBottomMenu'
import TimeCard from './TimeCard';
import TimerCard from './TimerCard';
import HomeTimeCard from './HomeTimeCard';
import ConditionCard from './ConditionCard';
import WatchNameCard from './WatchNameCard';

const Time: React.FC = () => {

    return (
        <div className="inline-block bg-white p-4 gap-4 rounded shadow-lg grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 justify-items-center">
            <TimeCard />
            <TimerCard />
            <WatchNameCard />
            <HomeTimeCard />
            <ConditionCard />
        </div >
    );
};

export default withBottomMenu(Time);