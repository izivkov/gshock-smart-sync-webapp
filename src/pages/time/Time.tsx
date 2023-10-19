"use client"

import React from 'react';
import withBottomMenu from '@components/withBottomMenu'
import TimeCard from './TimeCard';
import TimerCard from './TimerCard';

const Time: React.FC = () => {

    return (
        <div className="flex flex-row">
            <TimeCard />
            <TimerCard />
        </div >
    );
};

export default withBottomMenu(Time);