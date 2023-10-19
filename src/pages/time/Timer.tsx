"use client"

import React from 'react';
import withBottomMenu from '@components/withBottomMenu'
import TimerCard from './TimerCard';

const Timer: React.FC = () => {

    return (
        <div>
            <TimerCard />
        </div>
    );
};

export default withBottomMenu(Timer);