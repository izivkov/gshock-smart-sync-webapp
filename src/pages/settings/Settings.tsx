"use client"

import React, { useEffect, useRef, useState } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Card, 
    Switch, 
    FormControlLabel,
    ToggleButton,
    ToggleButtonGroup,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    IconButton,
    Tooltip,
    alpha
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import LightModeIcon from '@mui/icons-material/LightMode';
import BatterySaverIcon from '@mui/icons-material/BatterySaver';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SyncIcon from '@mui/icons-material/Sync';
import DownloadIcon from '@mui/icons-material/Download';
import WatchIcon from '@mui/icons-material/Watch';
import GShockAPI from '@/api/GShockAPI';
import { dateFormatType, languageType, lightDurationType, timeFormatType } from '@api/WatchInfo';
import { watchInfo } from '@/api/WatchInfo';

interface SettingsData {
    autoLight: boolean;
    buttonTone: boolean;
    dateFormat: dateFormatType;
    language: languageType;
    lightDuration: lightDurationType;
    powerSavingMode: boolean;
    timeAdjustment: boolean;
    timeFormat: timeFormatType;
}

// Reusable setting row component
interface SettingRowProps {
    icon: React.ReactNode;
    label: string;
    description?: string;
    children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, label, description, children }) => (
    <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        py: 2,
        px: 2.5,
        gap: 2,
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
            <Box sx={{ 
                color: '#8B5E3C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#2D1A0E' }}>
                    {label}
                </Typography>
                {description && (
                    <Typography variant="caption" sx={{ color: '#7A5C44' }}>
                        {description}
                    </Typography>
                )}
            </Box>
        </Box>
        <Box sx={{ flexShrink: 0 }}>
            {children}
        </Box>
    </Box>
);

// Modern toggle button group
interface OptionToggleProps {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}

const OptionToggle: React.FC<OptionToggleProps> = ({ value, options, onChange }) => (
    <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, newValue) => newValue && onChange(newValue)}
        size="small"
        sx={{
            '& .MuiToggleButton-root': {
                px: 2,
                py: 0.75,
                fontSize: '0.8125rem',
                fontWeight: 500,
                border: '1px solid rgba(139, 94, 60, 0.2)',
                color: '#7A5C44',
                textTransform: 'none',
                '&.Mui-selected': {
                    bgcolor: '#8B5E3C',
                    color: '#FFFFFF',
                    '&:hover': {
                        bgcolor: '#5C3A1E',
                    },
                },
                '&:hover': {
                    bgcolor: 'rgba(139, 94, 60, 0.08)',
                },
            },
        }}
    >
        {options.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
                {option.label}
            </ToggleButton>
        ))}
    </ToggleButtonGroup>
);

// Modern switch component
interface ModernSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const ModernSwitch: React.FC<ModernSwitchProps> = ({ checked, onChange }) => (
    <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        sx={{
            '& .MuiSwitch-switchBase': {
                '&.Mui-checked': {
                    color: '#8B5E3C',
                    '& + .MuiSwitch-track': {
                        bgcolor: '#8B5E3C',
                        opacity: 1,
                    },
                },
            },
            '& .MuiSwitch-track': {
                borderRadius: 100,
            },
        }}
    />
);

const Settings: React.FC = () => {
    const initialized = useRef(false);
    const settingsInit: SettingsData = {
        autoLight: true,
        buttonTone: true,
        dateFormat: "MM:DD",
        language: "English",
        lightDuration: "2s",
        powerSavingMode: true,
        timeAdjustment: true,
        timeFormat: "12h"
    };

    const [settings, setSettings] = useState<SettingsData>(settingsInit);

    useEffect(() => {
        (async () => {
            if (!initialized.current) {
                initialized.current = true;
                const newSettings = await GShockAPI.getSettings();
                setSettings(newSettings);
            }
        })();
    }, [settings]);

    const updateSettings = (partial: Partial<SettingsData>) => {
        setSettings(prev => ({ ...prev, ...partial }));
    };

    const onAutoFill = async () => {
        const newSettings = await GShockAPI.getSettings();
        setSettings(newSettings);
    };

    const onSave = async () => {
        await GShockAPI.setSettings(settings);
    };

    const languageOptions: languageType[] = [
        'English', 'French', 'German', 'Italian', 'Spanish', 'Russian'
    ];

    const shortDuration = watchInfo.shortLightDuration || "2s";
    const longDuration = watchInfo.longLightDuration || "4s";

    return (
        <Box sx={{ 
            px: { xs: 2, md: 4 },
            pt: { xs: 2, md: 4 }, 
            pb: { xs: 12, md: 4 }, 
            maxWidth: { xs: '100%', md: 600 }, 
            mx: 'auto', 
            width: '100%' 
        }}>
            {/* Header */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 3 
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <WatchIcon sx={{ color: '#8B5E3C', fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#2D1A0E' }}>
                        Settings
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Load from watch">
                        <IconButton 
                            onClick={onAutoFill}
                            sx={{ 
                                bgcolor: 'rgba(139, 94, 60, 0.08)',
                                '&:hover': { bgcolor: 'rgba(139, 94, 60, 0.16)' },
                            }}
                        >
                            <DownloadIcon sx={{ color: '#8B5E3C', fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Send to watch">
                        <IconButton 
                            onClick={onSave}
                            sx={{ 
                                bgcolor: '#8B5E3C',
                                '&:hover': { bgcolor: '#5C3A1E' },
                            }}
                        >
                            <SyncIcon sx={{ color: '#FFFFFF', fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Time & Date Section */}
            <Card sx={{ 
                mb: 2, 
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(139, 94, 60, 0.08)',
                overflow: 'hidden',
            }}>
                <Box sx={{ 
                    px: 2.5, 
                    py: 1.5, 
                    bgcolor: 'rgba(139, 94, 60, 0.04)',
                    borderBottom: '1px solid rgba(139, 94, 60, 0.08)',
                }}>
                    <Typography variant="overline" sx={{ color: '#7A5C44', fontWeight: 600, letterSpacing: 1 }}>
                        Time & Date
                    </Typography>
                </Box>
                
                <SettingRow 
                    icon={<AccessTimeIcon sx={{ fontSize: 22 }} />} 
                    label="Time Format"
                >
                    <OptionToggle
                        value={settings.timeFormat}
                        options={[
                            { value: '12h', label: '12h' },
                            { value: '24h', label: '24h' },
                        ]}
                        onChange={(value) => updateSettings({ timeFormat: value as timeFormatType })}
                    />
                </SettingRow>
                
                <Divider sx={{ mx: 2, borderColor: 'rgba(139, 94, 60, 0.08)' }} />
                
                <SettingRow 
                    icon={<LanguageIcon sx={{ fontSize: 22 }} />} 
                    label="Date Format"
                >
                    <OptionToggle
                        value={settings.dateFormat}
                        options={[
                            { value: 'MM:DD', label: 'MM:DD' },
                            { value: 'DD:MM', label: 'DD:MM' },
                        ]}
                        onChange={(value) => updateSettings({ dateFormat: value as dateFormatType })}
                    />
                </SettingRow>
                
                <Divider sx={{ mx: 2, borderColor: 'rgba(139, 94, 60, 0.08)' }} />
                
                <SettingRow 
                    icon={<LanguageIcon sx={{ fontSize: 22 }} />} 
                    label="Language"
                >
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            value={settings.language}
                            onChange={(e) => updateSettings({ language: e.target.value as languageType })}
                            sx={{
                                fontSize: '0.875rem',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(139, 94, 60, 0.3)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8B5E3C',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8B5E3C',
                                },
                            }}
                        >
                            {languageOptions.map((lang) => (
                                <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </SettingRow>
            </Card>

            {/* Display & Sound Section */}
            <Card sx={{ 
                mb: 2, 
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(139, 94, 60, 0.08)',
                overflow: 'hidden',
            }}>
                <Box sx={{ 
                    px: 2.5, 
                    py: 1.5, 
                    bgcolor: 'rgba(139, 94, 60, 0.04)',
                    borderBottom: '1px solid rgba(139, 94, 60, 0.08)',
                }}>
                    <Typography variant="overline" sx={{ color: '#7A5C44', fontWeight: 600, letterSpacing: 1 }}>
                        Display & Sound
                    </Typography>
                </Box>
                
                <SettingRow 
                    icon={settings.buttonTone ? <VolumeUpIcon sx={{ fontSize: 22 }} /> : <VolumeOffIcon sx={{ fontSize: 22 }} />} 
                    label="Button Sound"
                    description="Play tone on button press"
                >
                    <ModernSwitch
                        checked={settings.buttonTone}
                        onChange={(checked) => updateSettings({ buttonTone: checked })}
                    />
                </SettingRow>
                
                <Divider sx={{ mx: 2, borderColor: 'rgba(139, 94, 60, 0.08)' }} />
                
                <SettingRow 
                    icon={<LightModeIcon sx={{ fontSize: 22 }} />} 
                    label="Auto Light"
                    description="Light on wrist rotation"
                >
                    <ModernSwitch
                        checked={settings.autoLight}
                        onChange={(checked) => updateSettings({ autoLight: checked })}
                    />
                </SettingRow>
                
                <Divider sx={{ mx: 2, borderColor: 'rgba(139, 94, 60, 0.08)' }} />
                
                <SettingRow 
                    icon={<LightModeIcon sx={{ fontSize: 22 }} />} 
                    label="Light Duration"
                >
                    <OptionToggle
                        value={settings.lightDuration}
                        options={[
                            { value: shortDuration, label: shortDuration },
                            { value: longDuration, label: longDuration },
                        ]}
                        onChange={(value) => updateSettings({ lightDuration: value as lightDurationType })}
                    />
                </SettingRow>
            </Card>

            {/* Power & Sync Section */}
            <Card sx={{ 
                mb: 2, 
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(139, 94, 60, 0.08)',
                overflow: 'hidden',
            }}>
                <Box sx={{ 
                    px: 2.5, 
                    py: 1.5, 
                    bgcolor: 'rgba(139, 94, 60, 0.04)',
                    borderBottom: '1px solid rgba(139, 94, 60, 0.08)',
                }}>
                    <Typography variant="overline" sx={{ color: '#7A5C44', fontWeight: 600, letterSpacing: 1 }}>
                        Power & Sync
                    </Typography>
                </Box>
                
                <SettingRow 
                    icon={<BatterySaverIcon sx={{ fontSize: 22 }} />} 
                    label="Power Saving"
                    description="Reduce battery consumption"
                >
                    <ModernSwitch
                        checked={settings.powerSavingMode}
                        onChange={(checked) => updateSettings({ powerSavingMode: checked })}
                    />
                </SettingRow>
                
                <Divider sx={{ mx: 2, borderColor: 'rgba(139, 94, 60, 0.08)' }} />
                
                <SettingRow 
                    icon={<SyncIcon sx={{ fontSize: 22 }} />} 
                    label="Auto Time Sync"
                    description="Sync time automatically"
                >
                    <ModernSwitch
                        checked={settings.timeAdjustment}
                        onChange={(checked) => updateSettings({ timeAdjustment: checked })}
                    />
                </SettingRow>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mt: 3,
                justifyContent: 'center',
            }}>
                <Button 
                    variant="outlined" 
                    onClick={onAutoFill}
                    startIcon={<DownloadIcon />}
                    sx={{
                        borderColor: 'rgba(139, 94, 60, 0.3)',
                        color: '#8B5E3C',
                        borderRadius: 100,
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                            borderColor: '#8B5E3C',
                            bgcolor: 'rgba(139, 94, 60, 0.08)',
                        },
                    }}
                >
                    Load from Watch
                </Button>
                <Button 
                    variant="contained" 
                    onClick={onSave}
                    startIcon={<SyncIcon />}
                    sx={{
                        bgcolor: '#8B5E3C',
                        borderRadius: 100,
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 500,
                        boxShadow: '0 2px 8px rgba(139, 94, 60, 0.25)',
                        '&:hover': {
                            bgcolor: '#5C3A1E',
                        },
                    }}
                >
                    Send to Watch
                </Button>
            </Box>
        </Box>
    );
};

export default Settings;
