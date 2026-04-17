"use client"

import React, { useEffect, useRef, useState, useContext } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    Switch,
    ToggleButton,
    ToggleButtonGroup,
    Select,
    MenuItem,
    FormControl,
    Divider,
    Snackbar,
    Alert,
    useTheme
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import LightModeIcon from '@mui/icons-material/LightMode';
import BatterySaverIcon from '@mui/icons-material/BatterySaver';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SyncIcon from '@mui/icons-material/Sync';
import SendIcon from '@mui/icons-material/Send';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import GShockAPI from '@/api/GShockAPI';
import { dateFormatType, languageType, lightDurationType, timeFormatType } from '@api/WatchInfo';
import { watchInfo } from '@/api/WatchInfo';
import { ConnectionContext } from '../_app.page';
import ScreenTitle from '../components/ScreenTitle';
import { PEACH_BORDER, PEACH_SHADOW, PEACH_SURFACE } from '../theme/peachCardStyles';
import { getSmartDefaultsForSettings } from './smartDefaults';

const BOTTOM_NAV_HEIGHT = '80px';

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
            <Box sx={{ color: '#8B5E3C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    '&:hover': { bgcolor: '#5C3A1E' },
                },
                '&:hover': { bgcolor: 'rgba(139, 94, 60, 0.08)' },
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
                    '& + .MuiSwitch-track': { bgcolor: '#8B5E3C', opacity: 1 },
                },
            },
            '& .MuiSwitch-track': { borderRadius: 100 },
        }}
    />
);

const Settings: React.FC = () => {
    const theme = useTheme();
    const initialized = useRef(false);
    const { isConnected } = useContext(ConnectionContext);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const [settings, setSettings] = useState<SettingsData>({
        autoLight: true,
        buttonTone: true,
        dateFormat: "MM:DD",
        language: "English",
        lightDuration: "2s",
        powerSavingMode: true,
        timeAdjustment: true,
        timeFormat: "12h"
    });

    useEffect(() => {
        (async () => {
            if (!initialized.current) {
                initialized.current = true;
                try {
                    const newSettings = await GShockAPI.getSettings();
                    setSettings(newSettings);
                } catch (e) {
                    console.error("Failed to fetch settings", e);
                }
            }
        })();
    }, []);

    const updateSettings = (partial: Partial<SettingsData>) => {
        setSettings(prev => ({ ...prev, ...partial }));
    };

    const applySmartDefaults = async () => {
        try {
            const patch = await getSmartDefaultsForSettings(settings);
            setSettings((prev) => ({ ...prev, ...patch }));
            setSnackbarMessage('Applied Auto Fill');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch {
            setSnackbarMessage('Could not apply Auto Fill');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const onSave = async () => {
        try {
            await GShockAPI.setSettings(settings);
            setSnackbarMessage('Settings sent to watch');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Failed to send settings');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const languageOptions: languageType[] = ['English', 'French', 'German', 'Italian', 'Spanish', 'Russian'];
    const shortDuration = watchInfo.shortLightDuration || "2s";
    const longDuration = watchInfo.longLightDuration || "4s";

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            width: '100%',
            overflow: 'hidden',
            bgcolor: 'background.default'
        }}>
            {/* 1. SCROLLABLE CONTENT AREA */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                px: { xs: 1.5, sm: 3, md: 4 },
                pt: 2,
                pb: 2
            }}>
                <Box sx={{ maxWidth: 600, mx: 'auto', width: '100%' }}>
                    <ScreenTitle title="Settings" />

                    {/* Time & Date Section */}
                    <Card sx={{ mb: 2, borderRadius: '20px', overflow: 'hidden', bgcolor: PEACH_SURFACE, border: PEACH_BORDER, boxShadow: PEACH_SHADOW, p: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase', px: 2.5, pt: 1, display: 'block' }}>
                            Time & Date
                        </Typography>
                        <SettingRow icon={<AccessTimeIcon sx={{ fontSize: 22 }} />} label="Time Format">
                            <OptionToggle
                                value={settings.timeFormat}
                                options={[{ value: '12h', label: '12h' }, { value: '24h', label: '24h' }]}
                                onChange={(value) => updateSettings({ timeFormat: value as timeFormatType })}
                            />
                        </SettingRow>
                        {watchInfo.hasDateFormat && (
                            <>
                                <Divider sx={{ mx: 2, borderColor: 'rgba(139, 94, 60, 0.08)' }} />
                                <SettingRow icon={<LanguageIcon sx={{ fontSize: 22 }} />} label="Date Format">
                                    <OptionToggle
                                        value={settings.dateFormat}
                                        options={[{ value: 'MM:DD', label: 'MM:DD' }, { value: 'DD:MM', label: 'DD:MM' }]}
                                        onChange={(value) => updateSettings({ dateFormat: value as dateFormatType })}
                                    />
                                </SettingRow>
                            </>
                        )}
                        {watchInfo.weekLanguageSupported && (
                            <>
                                <Divider sx={{ mx: 2, borderColor: 'rgba(139, 94, 60, 0.08)' }} />
                                <SettingRow icon={<LanguageIcon sx={{ fontSize: 22 }} />} label="Language">
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <Select
                                            value={settings.language}
                                            onChange={(e) => updateSettings({ language: e.target.value as languageType })}
                                            sx={{ fontSize: '0.875rem', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 94, 60, 0.3)' } }}
                                        >
                                            {languageOptions.map((lang) => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </SettingRow>
                            </>
                        )}
                    </Card>
 
                    {/* Display & Sound Section */}
                    <Card sx={{ mb: 1, borderRadius: '20px', overflow: 'hidden', bgcolor: PEACH_SURFACE, border: PEACH_BORDER, boxShadow: PEACH_SHADOW, p: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase', px: 2.5, pt: 1, display: 'block' }}>
                            Display & Sound
                        </Typography>
                        <SettingRow icon={settings.buttonTone ? <VolumeUpIcon sx={{ fontSize: 22 }} /> : <VolumeOffIcon sx={{ fontSize: 22 }} />} label="Button Sound" description="Play tone on button press">
                            <ModernSwitch checked={settings.buttonTone} onChange={(checked) => updateSettings({ buttonTone: checked })} />
                        </SettingRow>
                        {watchInfo.hasAutoLight && (
                            <>
                                <Divider sx={{ mx: 2, borderColor: 'rgba(139, 94, 60, 0.08)' }} />
                                <SettingRow icon={<LightModeIcon sx={{ fontSize: 22 }} />} label="Auto Light" description="Light on wrist rotation">
                                    <ModernSwitch checked={settings.autoLight} onChange={(checked) => updateSettings({ autoLight: checked })} />
                                </SettingRow>
                                <Divider sx={{ mx: 2, borderColor: 'rgba(139, 94, 60, 0.08)' }} />
                                <SettingRow icon={<LightModeIcon sx={{ fontSize: 22 }} />} label="Light Duration">
                                    <OptionToggle
                                        value={settings.lightDuration}
                                        options={[{ value: shortDuration, label: shortDuration }, { value: longDuration, label: longDuration }]}
                                        onChange={(value) => updateSettings({ lightDuration: value as lightDurationType })}
                                    />
                                </SettingRow>
                            </>
                        )}
                    </Card>
 
                    {/* Power & Sync Section */}
                    <Card sx={{ mb: 2, borderRadius: '20px', overflow: 'hidden', bgcolor: PEACH_SURFACE, border: PEACH_BORDER, boxShadow: PEACH_SHADOW, p: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase', px: 2.5, pt: 1, display: 'block' }}>
                            Power & Sync
                        </Typography>
                        {watchInfo.hasPowerSavingMode && (
                            <SettingRow icon={<BatterySaverIcon sx={{ fontSize: 22 }} />} label="Power Saving" description="Reduce battery consumption">
                                <ModernSwitch checked={settings.powerSavingMode} onChange={(checked) => updateSettings({ powerSavingMode: checked })} />
                            </SettingRow>
                        )}
                        <Divider sx={{ mx: 2, borderColor: 'rgba(139, 94, 60, 0.08)' }} />
                        <SettingRow icon={<SyncIcon sx={{ fontSize: 22 }} />} label="Auto Time Sync" description="Sync time automatically">
                            <ModernSwitch checked={settings.timeAdjustment} onChange={(checked) => updateSettings({ timeAdjustment: checked })} />
                        </SettingRow>
                    </Card>

                    <Box sx={{ height: 40 }} />
                </Box>
            </Box>

            {/* 2. FIXED BOTTOM BUTTON AREA */}
            <Box sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                pb: { xs: `calc(env(safe-area-inset-bottom) + 8px)`, md: 2 },
                zIndex: 10,
                boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'center',
                gap: 2
            }}>
                <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 600 }}>
                    <Button
                        variant="outlined"
                        onClick={applySmartDefaults}
                        startIcon={<AutoFixHighIcon />}
                        fullWidth
                        sx={{
                            borderColor: 'rgba(139, 94, 60, 0.3)',
                            color: '#8B5E3C',
                            borderRadius: 100,
                            textTransform: 'none',
                            fontWeight: 500,
                            py: 1.2
                        }}
                    >
                        Auto Fill
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onSave}
                        startIcon={<SendIcon />}
                        fullWidth
                        sx={{
                            bgcolor: '#8B5E3C',
                            borderRadius: 100,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(139, 94, 60, 0.25)',
                            '&:hover': { bgcolor: '#5C3A1E' },
                            py: 1.2
                        }}
                    >
                        Send to Watch
                    </Button>
                </Box>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Settings;