"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import LocaleCard from './LocaleCard';
import ButtonSoundCard from './ButtonSoundCard';
import LightCard from './LightCard';
import AutoTimeAdjustCard from './AutoTimeAdjustCard';
import PowerSavingCard from './PowerSavingCard';
import GShockAPI from '@/api/GShockAPI';
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
                setSettings(newSettings);
            }
        })()
    }, [settings]);

    const updateSettings = (partial: Partial<SettingsData>) => {
        setSettings(prev => ({ ...prev, ...partial }));
    };

    const onLocaleChanged = (language: languageType, dateFormat: dateFormatType, timeFormat: timeFormatType) => {
        updateSettings({ language, dateFormat, timeFormat });
    }

    const onAutoTimeAdjustChange = (autoTimeAdjust: boolean) => {
        updateSettings({ timeAdjustment: autoTimeAdjust });
    }

    const onButtonSoundChange = (buttonSound: boolean) => {
        updateSettings({ buttonTone: buttonSound });
    }

    const onIlluminationPeriodChange = (autoLight: boolean, illuminationPeriod: lightDurationType) => {
        updateSettings({ lightDuration: illuminationPeriod, autoLight });
    }

    const onPowerSavingChange = (powerSavingMode: boolean) => {
        updateSettings({ powerSavingMode });
    }

    const onAutoFill = async () => {
        const newSettings = await GShockAPI.getSettings();
        setSettings(newSettings);
    }

    const onSave = async () => {
        await GShockAPI.setSettings(settings);
    }

    return (
        <Box sx={{ pt: 3, pb: 10, maxWidth: 500, mx: 'auto', width: '100%' }}>
            {/* Page title */}
            <Typography
                variant="h5"
                align="center"
                sx={{ mb: 2.5, fontWeight: 500, color: 'text.primary', letterSpacing: 0.2 }}
            >
                Settings
            </Typography>

            {/* Settings cards stacked vertically */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: 1 }}>
                <LocaleCard
                    languageInit={settings.language}
                    dateFormatInit={settings.dateFormat}
                    timeFormatInit={settings.timeFormat}
                    onChange={onLocaleChanged}
                />
                <ButtonSoundCard buttonSoundInit={settings.buttonTone} onChange={onButtonSoundChange} />
                <LightCard illuminationPeriodInit={settings.lightDuration} autoLightInit={settings.autoLight} onChange={onIlluminationPeriodChange} />
                <PowerSavingCard powerSavingsInit={settings.powerSavingMode} onChange={onPowerSavingChange} />
                <AutoTimeAdjustCard autoTimeAdjustInit={settings.timeAdjustment} onChange={onAutoTimeAdjustChange} />
            </Box>

            {/* Bottom action buttons — matching Android */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, px: 2 }}>
                <Button variant="outlined" onClick={onAutoFill}>
                    Auto Fill Values
                </Button>
                <Button variant="outlined" onClick={onSave}>
                    Send to Watch
                </Button>
            </Box>
        </Box>
    );
};

export default Settings;