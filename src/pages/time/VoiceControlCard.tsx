import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Collapse, List, ListItem, ListItemText, FormControlLabel, Switch, alpha } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PeachCard from '@/pages/components/PeachCard';
import { voiceDispatcher, VoiceState } from '@/voice/VoiceDispatcher';
import { voiceCommandManager } from '@/voice/VoiceCommandManager';

interface VoiceControlCardProps {
    isConnected: boolean;
}

const VoiceControlCard: React.FC<VoiceControlCardProps> = ({ isConnected }) => {
    const [state, setState] = useState<VoiceState>('idle');
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');
    const [showHelp, setShowHelp] = useState(false);
    const [hasMic, setHasMic] = useState<boolean | null>(null);
    const [isPermissionDenied, setIsPermissionDenied] = useState(false);

    const [isVerbose, setIsVerbose] = useState(() => {
        const saved = localStorage.getItem('voice_verbose');
        return saved !== null ? saved === 'true' : true;
    });

    useEffect(() => {
        localStorage.setItem('voice_verbose', isVerbose.toString());
    }, [isVerbose]);

    useEffect(() => {
        async function checkHardware() {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const micExists = devices.some(device => device.kind === 'audioinput');
                setHasMic(micExists);
            } catch (e) {
                setHasMic(false);
            }
        }
        checkHardware();

        if (navigator.permissions && (navigator.permissions as any).query) {
            (navigator.permissions as any).query({ name: 'microphone' }).then((result: any) => {
                setIsPermissionDenied(result.state === 'denied');
                result.onchange = () => {
                    setIsPermissionDenied(result.state === 'denied');
                };
            }).catch(() => {});
        }

        voiceDispatcher.setOnStateChange((s, t, f) => {
            setState(s);
            if (t !== undefined) setTranscript(t);
            if (f !== undefined) setFeedback(f);

            if (f && f.includes('access denied')) {
                setIsPermissionDenied(true);
            }
        });
    }, []);

    const toggleVoice = () => {
        if (state === 'idle') {
            voiceDispatcher.start(isVerbose);
        } else {
            voiceDispatcher.stop();
        }
    };

    if (!voiceCommandManager.isSupported()) return null;

    const micDisabled = !isConnected || hasMic === false;

    return (
        <PeachCard sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MicIcon sx={{ color: '#8B5E3C', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase' }}>
                        Voice Control
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    {hasMic === false && (
                        <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 600, mr: 1 }}>
                            NO MIC FOUND
                        </Typography>
                    )}
                    {isPermissionDenied && (
                        <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 600, mr: 1 }}>
                            MIC BLOCKED
                        </Typography>
                    )}

                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                checked={isVerbose}
                                onChange={(e) => setIsVerbose(e.target.checked)}
                                sx={{
                                    transform: 'scale(0.7)',
                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#8B5E3C' },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8B5E3C' }
                                }}
                            />
                        }
                        label={<Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#8B5E3C' }}>VERBOSE</Typography>}
                        labelPlacement="start"
                        sx={{ m: 0, mr: -0.5 }}
                    />

                    <IconButton
                        size="small"
                        onClick={toggleVoice}
                        sx={{ color: isPermissionDenied ? '#f44336' : state !== 'idle' ? '#f44336' : '#8B5E3C' }}
                        disabled={micDisabled}
                    >
                        {state !== 'idle' ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" onClick={() => setShowHelp(!showHelp)} sx={{ color: '#8B5E3C' }}>
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            <Collapse in={state !== 'idle' || !!feedback || showHelp || isPermissionDenied}>
                <Box sx={{
                    mt: 1, p: 1.5, borderRadius: '12px',
                    bgcolor: 'rgba(139, 94, 60, 0.05)',
                    border: '1px dashed rgba(139, 94, 60, 0.2)'
                }}>
                    {showHelp ? (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5E3C' }}>VOICE COMMANDS</Typography>
                                <IconButton size="small" onClick={() => setShowHelp(false)}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                            </Box>
                            <List dense disablePadding>
                                {[
                                    '“Set alarm at 7:30 am”', '“Disable all alarms”',
                                    '“Set timer for 5 minutes”', '“Turn on auto light”',
                                    '“Disable power saving”', '“Create reminder”',
                                    '“Reset settings”'
                                ].map(cmd => (
                                    <ListItem key={cmd} disablePadding>
                                        <ListItemText
                                            primary={
                                                <Typography sx={{ fontSize: '0.75rem', color: '#7A5C44' }}>
                                                    {cmd}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    ) : (
                        <>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: (state !== 'idle' || isPermissionDenied) ? '#f44336' : '#8B5E3C', display: 'block', mb: 0.5 }}>
                                {isPermissionDenied ? 'MICROPHONE BLOCKED' :
                                 state === 'listening' ? 'LISTENING...' :
                                 state === 'reminder_title' ? 'SAY REMINDER TITLE...' :
                                 state === 'reminder_date' ? 'SAY START DATE...' :
                                 state === 'reminder_repeat' ? 'SAY REPEAT FREQUENCY...' : 'READY'}
                            </Typography>
                            {isPermissionDenied && (
                                <Typography sx={{ fontSize: '0.75rem', color: '#7A5C44', mb: 1 }}>
                                    Please enable microphone access in your browser settings to use voice commands.
                                </Typography>
                            )}
                            {transcript && (
                                <Typography sx={{ fontSize: '0.85rem', color: '#2D1A0E', fontStyle: 'italic', mb: 1 }}>
                                    "{transcript}"
                                </Typography>
                            )}
                            {feedback && (
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#8B5E3C' }}>
                                    {feedback}
                                </Typography>
                            )}
                        </>
                    )}
                </Box>
            </Collapse>
        </PeachCard>
    );
};

export default VoiceControlCard;
