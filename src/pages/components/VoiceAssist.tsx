import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Fab,
    Dialog,
    DialogContent,
    Typography,
    Box,
    IconButton,
    CircularProgress,
    alpha,
    useTheme
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CloseIcon from '@mui/icons-material/Close';
import { VoiceDispatcher } from '@/voice/VoiceDispatcher';
import { progressEvents } from '@/api/ProgressEvents';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const VoiceAssist: React.FC = () => {
    const theme = useTheme();
    const [isListening, setIsListening] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');

    const recognitionRef = useRef<any>(null);
    const dispatcherRef = useRef<VoiceDispatcher | null>(null);

    const startListening = useCallback(() => {
        if (!SpeechRecognition) {
            setFeedback("Speech recognition is not supported in this browser.");
            setShowDialog(true);
            return;
        }

        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setTranscript('Listening...');
            };

            recognitionRef.current.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                if (dispatcherRef.current) {
                    dispatcherRef.current.dispatch(text);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                if (event.error !== 'no-speech') {
                    setFeedback(`Error: ${event.error}`);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        try {
            recognitionRef.current.start();
            setShowDialog(true);
            setFeedback('');
        } catch (e) {
            console.warn("Recognition already started");
        }
    }, []);

    useEffect(() => {
        dispatcherRef.current = new VoiceDispatcher(() => {
            // Callback to listen again for multi-step conversations
            setTimeout(startListening, 500);
        });

        const feedbackAction = {
            label: "VoiceFeedback",
            action: () => {
                const msg = progressEvents.getPayload("VoiceFeedback");
                setFeedback(msg);
            }
        };
        progressEvents.runEventActions("VoiceAssistUI", [feedbackAction]);

        return () => {
            progressEvents.stop("VoiceAssistUI");
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [startListening]);

    const handleClose = () => {
        setShowDialog(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    return (
        <>
            <Fab
                color="primary"
                aria-label="voice assistant"
                onClick={startListening}
                sx={{
                    position: 'fixed',
                    bottom: { xs: 92, md: 24 },
                    left: 24,
                    zIndex: 1100,
                    bgcolor: '#8B5E3C',
                    '&:hover': { bgcolor: '#5C3A1E' },
                    boxShadow: '0 4px 12px rgba(139, 94, 60, 0.3)'
                }}
            >
                <MicIcon />
            </Fab>

            <Dialog
                open={showDialog}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '24px',
                            bgcolor: '#FCEEE6',
                            minWidth: { xs: '90%', sm: 400 },
                            p: 1
                        }
                    }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <DialogContent sx={{ textAlign: 'center', pb: 4 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                        {isListening && (
                            <CircularProgress
                                size={80}
                                sx={{
                                    position: 'absolute',
                                    top: -10,
                                    left: -10,
                                    color: alpha('#8B5E3C', 0.2),
                                }}
                            />
                        )}
                        <Box sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: isListening ? '#8B5E3C' : alpha('#8B5E3C', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isListening ? 'white' : '#8B5E3C',
                            transition: 'all 0.3s ease'
                        }}>
                            {isListening ? <MicIcon fontSize="large" /> : <MicOffIcon fontSize="large" />}
                        </Box>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2D1A0E' }}>
                        {isListening ? "Listening..." : "I'm Listening"}
                    </Typography>

                    <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 3, color: '#7A5C44', minHeight: '1.5em' }}>
                        {transcript ? `"${transcript}"` : "Try saying 'Set alarm for 8 AM'"}
                    </Typography>

                    {feedback && (
                        <Box sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: 'white',
                            borderRadius: '16px',
                            border: '1px solid rgba(139, 94, 60, 0.1)'
                        }}>
                            <Typography variant="body2" sx={{ color: '#8B5E3C', fontWeight: 600 }}>
                                {feedback}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
