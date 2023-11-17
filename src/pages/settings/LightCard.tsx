"use client"

import React, { useEffect, useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import AppSwitch from '../components/AppSwitch';
import AppRadioButton from '../components/AppRadioButton';
import AppRadioButtonList from '../components/AppRadioButtonList';

interface LightCardProps {
}

const LightCard: React.FC<LightCardProps> = ({ }) => {

    const header = <div className="flex flex-row w-full justify-between items-center pl-4 pr-4">
        <AppText text="Light" variant='h5' />
    </div>

    const body =
        <div className="flex flex-col w-full justify-between items-center gap-4">
            <div className="flex flex-row w-full justify-between items-center">
                <AppText text="Auto Light" variant='h6' />
                <AppSwitch checked={true} onChange={() => { }} />
            </div>
            <div className="flex flex-row w-full justify-between items-center">
                <AppRadioButtonList label="Illumination Period" checkedIndex={1} name="iliminationPeriod" orientation="horizontal" onChange={() => { }} radioButtons={[
                    <AppText text="12h" variant='paragraph' />,
                    <AppText text="24h" variant='paragraph' />
                ]} />
            </div>
        </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="w-96 h-10 flex flex-row text-center items-center"
            classNameBody="bg-white" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default LightCard;