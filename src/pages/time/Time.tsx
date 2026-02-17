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
        <div className="flex flex-col items-center justify-center p-4 md:p-8 min-h-[calc(100vh-80px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center w-full max-w-7xl">
                <TimeCard />
                <TimerCard />
                <WatchNameCard />
                <HomeTimeCard />
                <ConditionCard />
            </div>
        </div >
    );
};

export default withBottomMenu(Time);