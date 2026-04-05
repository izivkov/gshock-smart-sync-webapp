"use client"

import React, { useEffect, useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import AppSwitch from '../components/AppSwitch';

interface AutoTimeAdjustCardProps {
    autoTimeAdjustInit: boolean,
    onChange: (autoTimeAdjust: boolean) => void;
}

const AutoTimeAdjustCard: React.FC<AutoTimeAdjustCardProps> = ({ autoTimeAdjustInit, onChange }) => {

    const [autoTimeAdjust, setAutoTimeAdjust] = useState<boolean>(autoTimeAdjustInit);

    useEffect(() => {
        setAutoTimeAdjust(autoTimeAdjustInit);
    }, [autoTimeAdjustInit]);

    const onAutoTimeAdjustChange = (value: boolean): void => {
        setAutoTimeAdjust(value);
        onChange(value);
    }

    const body =
        <div className="flex flex-row w-full justify-between items-center py-1.5 px-4 bg-white rounded-xl">
            <AppText text="Auto Time Adjustment" variant='h6' />
            <AppSwitch initialValue={autoTimeAdjust} onChange={onAutoTimeAdjustChange} />
        </div>

    return (
        <AppCard header={<></>} body={body} footer={<></>} />
    );
}

export default AutoTimeAdjustCard;