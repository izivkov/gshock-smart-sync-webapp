"use client"

import React, { useEffect, useRef, useState } from 'react';
import withBottomMenu from '@components/withBottomMenu'
import AppButton from '../components/AppButton';
import LocaleCard from './LocaleCard';
import ButtonSoundCard from './ButtonSoundCard';
import LightCard from './LightCard';
import AutoTimeAdjustCard from './AutoTimeAdjustCard';
import PowerSavingCard from './PowerSavingCard';
import GShockAPI from '@/api/GShockAPI';
import * as testSettings from '../../testdata/settings.json';
import { dateFormatType, languageType, lightDurationType, timeFormatType } from '@api/WatchInfo';
import SettingsData from './SettingsData';

const Settings: React.FC = () => {

    const initialized = useRef(false)

    const settingsInit: SettingsData = {
        autoLight: true,
        buttonTone: true,
        dateFormat: "MM:DD",
        language: "English",
        lightDuration: "2s",
        powerSavingMode: true,
        timeAdjustment: true,
        timeFormat: "12h"
    }

    const [settings, setSettings] = useState<SettingsData>(settingsInit);

    useEffect(() => {
        (async () => {
            if (!initialized.current) {
                initialized.current = true;

                const newSettings = await GShockAPI.getSettings();
                // const newSettings = testSettings as SettingsData;
                setSettings(newSettings);
            }
        })()
    }, [settings]);

    const onLocaleChanged = (language: languageType, dateFormat: dateFormatType, timeFormat: timeFormatType) => {

        const newSettings: SettingsData = {
            ...settings,
            language: language,
            dateFormat: dateFormat,
            timeFormat: timeFormat
        }
        setSettings(newSettings);
    }

    const onAutoTimeAdjustChange = (autoTimeAdjust: boolean) => {

        const newSettings: SettingsData = {
            ...settings,
            timeAdjustment: autoTimeAdjust
        }
        setSettings(newSettings);
    }

    const onButtonSoundChange = (buttonSound: boolean) => {

        const newSettings: SettingsData = {
            ...settings,
            buttonTone: buttonSound
        }
        setSettings(newSettings);
    }

    const onIlluminationPeriodChange = (autoLight: boolean, illuminationPeriod: lightDurationType) => {

        const newSettings: SettingsData = {
            ...settings,
            lightDuration: illuminationPeriod,
            autoLight: autoLight
        }

        setSettings(newSettings);
    }

    const onPowerSavingChange = (powerSavingMode: boolean) => {

        const newSettings: SettingsData = {
            ...settings,
            powerSavingMode: powerSavingMode
        }
        setSettings(newSettings);
    }

    const onSave = async () => {
        await GShockAPI.setSettings(settings);
    }

    return (
        <div className='flex flex-col'>
            <div className="inline-block bg-white p-4 gap-4 rounded shadow-lg grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 justify-items-center">
                <LocaleCard languageInit={settings.language} dateFormatInit={settings.dateFormat} timeFormatInit={settings.timeFormat} onChange={onLocaleChanged} />
                <ButtonSoundCard buttonSoundInit={settings.buttonTone} onChange={onButtonSoundChange} />
                <LightCard illuminationPeriodInit={settings.lightDuration} autoLightInit={settings.autoLight} onChange={onIlluminationPeriodChange} />
                <PowerSavingCard powerSavingsInit={settings.powerSavingMode} onChange={onPowerSavingChange} />
                <AutoTimeAdjustCard autoTimeAdjustInit={settings.timeAdjustment} onChange={onAutoTimeAdjustChange} />
            </div>
            <div className="flex gap-6 justify-end p-16 mr-10">
                <AppButton label="Send to Watch" onClick={onSave} />
            </div>
        </div>
    );
};

export default withBottomMenu(Settings);