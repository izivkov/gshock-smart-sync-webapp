"use client"

import React, { useEffect, useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import AppRadioButtonList from '../components/AppRadioButtonList';

interface LocaleCardProps {
}

const LocaleCard: React.FC<LocaleCardProps> = ({ }) => {

    const header = <div className="flex flex-row w-full justify-between items-center pl-4 pr-4">
        <AppText text="Locale" variant='h5' />
    </div>

    const body =
        <div className="flex flex-col w-full justify-between items-center">
            <div className='flex flex-col w-full justify-between items-center'>
                <AppRadioButtonList checkedIndex={1} label='Time Format' className="flex flex-row w-full justify-between items-center" onChange={() => { }} radioButtons={[
                    <AppText text="12h" variant='paragraph' />,
                    <AppText text="24h" variant='paragraph' />
                ]} />
                <AppRadioButtonList checkedIndex={0} label='Date Format' className="flex flex-row w-full justify-between items-center" onChange={() => { }} radioButtons={[
                    <AppText text="MM:DD" variant='paragraph' />,
                    <AppText text="DD:MM" variant='paragraph' />
                ]} />
            </div>
        </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="w-96 h-10 flex flex-row text-center items-center"
            classNameBody="bg-white" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default LocaleCard;