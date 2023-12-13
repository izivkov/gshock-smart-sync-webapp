"use client"

import React, { useEffect, useState } from 'react';
import AppCard from "@components/AppCard";
import AppText from "@components/AppText";
import AppRadioButtonList from '@components/AppRadioButtonList';
import AppSelect from '@components/AppSelect';
import { dateFormatType, languageType, timeFormatType } from '@/api/WatchInfo';

interface LocaleCardProps {
    languageInit: languageType,
    dateFormatInit: dateFormatType,
    timeFormatInit: timeFormatType,
    onChange: (language: languageType, dateFormat: dateFormatType, timeFormat: timeFormatType) => void
}

const LocaleCard: React.FC<LocaleCardProps> = ({ languageInit, dateFormatInit, timeFormatInit, onChange }) => {

    const [language, setLanguage] = useState<languageType>(languageInit);
    const [dateFormat, setDateFormat] = useState<dateFormatType>(dateFormatInit);
    const [timeFormat, setTimeFormat] = useState<timeFormatType>(timeFormatInit);

    useEffect(() => {
        setLanguage(languageInit);
        setDateFormat(dateFormatInit);
        setTimeFormat(timeFormatInit);
    }, [languageInit, dateFormatInit, timeFormatInit]);

    const header = <div className="flex flex-row w-full justify-between items-center pl-4 pr-4">
        <AppText text="Locale" variant='h5' />
    </div>

    const languageOptions: languageType[] = [
        'English', 'French', 'German', 'Italian', 'Spanish', 'Russian'
    ]

    const onlanguageSelected = (value: languageType) => {
        onChange(value, dateFormat, timeFormat);
    }

    const getTimeFormatIndex = (value: timeFormatType) => {
        switch (value) {
            case '12h':
                return 0;
            case '24h':
                return 1;
            default:
                return 0;
        }
    }

    const getDateFormatIndex = (value: dateFormatType) => {
        switch (value) {
            case 'MM:DD':
                return 0;
            case 'DD:MM':
                return 1;
            default:
                return 0;
        }
    }
    const onTimeFormatChange = (index: number) => {
        var value: timeFormatType = '12h';
        switch (index) {
            case 0:
                value = '12h';
                break
            case 1:
                value = '24h';
                break
        }
        onChange(language, dateFormat, value);
    }

    const onDateFormatChange = (index: number) => {
        var value: dateFormatType = 'MM:DD';
        switch (index) {
            case 0:
                value = 'MM:DD';
                break
            case 1:
                value = 'DD:MM';
                break
        }
        onChange(language, value, timeFormat);
    }

    const body =
        <div className="flex flex-col w-full justify-between items-center">
            <div className='flex flex-col w-full justify-between'>
                <AppRadioButtonList selectedIndexInit={getTimeFormatIndex(timeFormat)} label='Time Format' name="timeFormat" orientation="horizontal" onChange={onTimeFormatChange} radioButtons={[
                    <AppText text="12h" variant='paragraph' />,
                    <AppText text="24h" variant='paragraph' />
                ]} />
                <AppRadioButtonList selectedIndexInit={getDateFormatIndex(dateFormat)} label='Date Format' name="dateFormat" orientation="horizontal" onChange={onDateFormatChange} radioButtons={[
                    <AppText text="MM:DD" variant='paragraph' />,
                    <AppText text="DD:MM" variant='paragraph' />
                ]} />
                <div className="flex flex-row w-full justify-between items-center pt-4 gap-4">
                    <AppText text="Language" variant='h6' />
                    <AppSelect label='Language' value={language} items={languageOptions} className="w-full" onSelected={onlanguageSelected} />
                </div>
            </div>
        </div>

    const footer = <></>

    return (
        <AppCard header={header} body={body} footer={footer} className="mt-10" classNameHeader="w-96 h-10 flex flex-row text-center items-center"
            classNameBody="bg-white" classNameFooter="bg-gray-400 w-96 h-0 pt-0 p-0" />
    );
}

export default LocaleCard;