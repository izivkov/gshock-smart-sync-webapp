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

    const header = <div className="flex flex-row w-full justify-between items-center pl-4 pr-4">
        <AppText text="Auto Time Adjustment" variant='h5' />
    </div>

    const body =
        <div className="flex flex-row w-full justify-between items-center">
            <AppText text="Time Adjustment" variant='paragraph' />
            <AppSwitch initialValue={autoTimeAdjust} onChange={onAutoTimeAdjustChange} />
        </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} />
    );
}

export default AutoTimeAdjustCard;