"use client"

import React, { useEffect, useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import AppSwitch from '../components/AppSwitch';
import AppRadioButtonList from '../components/AppRadioButtonList';
import WatchInfo, { watchInfo, lightDurationType } from '@/api/WatchInfo';

interface LightCardProps {
    autoLightInit: boolean,
    illuminationPeriodInit: lightDurationType,
    onChange: (autoLight: boolean, illuminationPeriod: lightDurationType) => void;
}

const LightCard: React.FC<LightCardProps> = ({ autoLightInit, illuminationPeriodInit, onChange }) => {

    const [autoLight, setAutoLight] = useState<boolean>(autoLightInit);
    const [illuminationPeriod, setIlluminationPeriod] = useState<lightDurationType>(illuminationPeriodInit);

    useEffect(() => {
        setAutoLight(autoLightInit);
        setIlluminationPeriod(illuminationPeriodInit);
    }, [autoLightInit, illuminationPeriodInit]);

    const onAoutoLightChange = (value: boolean) => {
        setAutoLight(value);
        onChange(value, illuminationPeriod);
    }

    const onIlluminationPeriodChange = (index: number) => {
        var value: lightDurationType = watchInfo.shortLightDuration as lightDurationType;
        switch (index) {
            case 0:
                value = watchInfo.shortLightDuration as lightDurationType;
                break
            case 1:
                value = watchInfo.longLightDuration as lightDurationType;
                break
        }

        setIlluminationPeriod(value);
        onChange(autoLight, value);
    }

    const getIlluminationPeriodIndex = (value: lightDurationType) => {
        switch (value) {
            case '1.5s':
            case '2s':
                return 0;

            case '3s':
            case '4s':
                return 1;
            default:
                return 0;
        }
    }

    const shortDuration = watchInfo.shortLightDuration || "2" + 's';
    const longDuration = (watchInfo.longLightDuration || "4" + 's');

    const header = <div className="flex flex-row w-full justify-between items-center pl-4 pr-4">
        <AppText text="Light" variant='h5' />
    </div>

    const body =
        <div className="flex flex-col w-full justify-between items-center gap-4">
            <div className="flex flex-row w-full justify-between items-center">
                <AppText text="Auto Light" variant='h6' />
                <AppSwitch initialValue={autoLight} onChange={onAoutoLightChange} />
            </div>
            <div className="flex flex-row w-full justify-between items-center">
                <AppRadioButtonList label="Illumination Period" selectedIndexInit={getIlluminationPeriodIndex(illuminationPeriod)} name="illiminationPeriod"
                    orientation="horizontal" onChange={onIlluminationPeriodChange} radioButtons={[
                        <AppText key="short" text={shortDuration} variant='paragraph' />,
                        <AppText key="long" text={longDuration} variant='paragraph' />
                    ]} />
            </div>
        </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} />
    );
}

export default LightCard;