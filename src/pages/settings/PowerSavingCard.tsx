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

    const header = <div className="flex flex-row w-full justify-between items-center pl-4 pr-4">
        <AppText text="Power Saving" variant='h5' />
    </div>

    const body =
        <div className="flex flex-row w-full justify-between items-center">
            <AppText text="Power Saving Mode" variant='paragraph' />
            <AppSwitch initialValue={powerSavings} onChange={onPowerSavingChange} />
        </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} />
    );
}

export default PowerSavingCard;
