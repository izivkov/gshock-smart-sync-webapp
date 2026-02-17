"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Box, Grid, Typography, Fab } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
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

    const onSave = async () => {
        await GShockAPI.setSettings(settings);
    }

    return (
        <Box sx={{ py: 4, position: 'relative' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Settings
            </Typography>

            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <LocaleCard
                        languageInit={settings.language}
                        dateFormatInit={settings.dateFormat}
                        timeFormatInit={settings.timeFormat}
                        onChange={onLocaleChanged}
                    />
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ButtonSoundCard buttonSoundInit={settings.buttonTone} onChange={onButtonSoundChange} />
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <LightCard illuminationPeriodInit={settings.lightDuration} autoLightInit={settings.autoLight} onChange={onIlluminationPeriodChange} />
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <PowerSavingCard powerSavingsInit={settings.powerSavingMode} onChange={onPowerSavingChange} />
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <AutoTimeAdjustCard autoTimeAdjustInit={settings.timeAdjustment} onChange={onAutoTimeAdjustChange} />
                </Grid>
            </Grid>

            <Fab
                color="primary"
                aria-label="save"
                onClick={onSave}
                sx={{
                    position: 'fixed',
                    bottom: { xs: 90, md: 32 },
                    right: 32,
                    boxShadow: 4
                }}
            >
                <SaveIcon />
            </Fab>
        </Box>
    );
};

export default Settings;