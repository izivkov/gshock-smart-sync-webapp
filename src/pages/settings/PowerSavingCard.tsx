"use client"

import React, { useEffect, useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import AppSwitch from '../components/AppSwitch';

interface PowerSavingCardProps {
    powerSavingsInit: boolean,
    onChange: (powerSavings: boolean) => void;
}

const PowerSavingCard: React.FC<PowerSavingCardProps> = ({ powerSavingsInit, onChange }) => {

    const [powerSavings, setPowerSavings] = useState<boolean>(powerSavingsInit);

    useEffect(() => {
        setPowerSavings(powerSavingsInit);
    }, [powerSavingsInit]);

    const onPowerSavingChange = (value: boolean): void => {
        setPowerSavings(value);
        onChange(value);
    }

    const body =
        <div className="flex flex-row w-full justify-between items-center py-1.5 px-4 bg-white rounded-xl">
            <AppText text="Power Saving" variant='h6' />
            <AppSwitch initialValue={powerSavings} onChange={onPowerSavingChange} />
        </div>

    return (
        <AppCard header={<></>} body={body} footer={<></>} />
    );
}

export default PowerSavingCard;
