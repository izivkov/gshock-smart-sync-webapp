"use client"

import ConnectButton from '@pages/home/ConnectButton'
import React, { useEffect, useMemo, useState } from 'react'
import { connection } from '@api/Connection';
import { progressEvents } from "@api/ProgressEvents"
import { useRouter } from 'next/navigation';
import { EventAction } from "@api/ProgressEvents";
import GShockAPI from '@/api/GShockAPI';
import { PhoneFinder } from './home/PhoneFinder';

import Typography from '@mui/material/Typography';
import {
  Box, List, ListItem, ListItemIcon, ListItemText,
  Divider, Paper, useTheme, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, alpha
} from '@mui/material';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import WatchIcon from '@mui/icons-material/Watch';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UnsupportedIcon from '@mui/icons-material/Error';
import GitHubIcon from '@mui/icons-material/GitHub';
import SecurityIcon from '@mui/icons-material/Security';

// Import local images directly based on project structure
import dw_b5600 from '../../images/dw-b5600.png';
import ecb_30d from '../../images/ecb_30d.png';
import ga_b2100 from '../../images/ga_b2100.png';
import gw_b5600 from '../../images/gw_b5600.png';

// ─── OS / Platform detection ────────────────────────────────────────────────

type OSType = 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'unknown';

function detectOS(): OSType {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Macintosh|Mac OS X/.test(ua)) return 'macos';
  if (/Win/.test(ua)) return 'windows';
  if (/Linux/.test(ua)) return 'linux';
  return 'unknown';
}

interface BrowserSuggestion {
  name: string;
  note: string;
  url: string;
}

const BROWSER_SUGGESTIONS: Record<OSType, BrowserSuggestion[]> = {
  ios: [
    { name: 'Bluefy', note: 'Purpose-built Web Bluetooth browser for iOS/iPadOS', url: 'https://apps.apple.com/app/bluefy-web-ble-browser/id1492822055' },
    { name: 'WebBLE', note: 'Another Web Bluetooth-capable browser for iOS', url: 'https://apps.apple.com/app/webble/id1193531073' },
  ],
  android: [
    { name: 'Chrome for Android', note: 'Full Web Bluetooth support', url: 'https://play.google.com/store/apps/details?id=com.android.chrome' },
  ],
  macos: [
    { name: 'Google Chrome', note: 'Best Web Bluetooth support on macOS', url: 'https://www.google.com/chrome/' },
    { name: 'Microsoft Edge', note: 'Also supports Web Bluetooth', url: 'https://www.microsoft.com/edge' },
    { name: 'Opera', note: 'Web Bluetooth supported', url: 'https://www.opera.com/' },
  ],
  windows: [
    { name: 'Google Chrome', note: 'Best Web Bluetooth support on Windows', url: 'https://www.google.com/chrome/' },
    { name: 'Microsoft Edge', note: 'Built into Windows, supports Web Bluetooth', url: 'https://www.microsoft.com/edge' },
    { name: 'Opera', note: 'Web Bluetooth supported', url: 'https://www.opera.com/' },
  ],
  linux: [
    { name: 'Google Chrome', note: 'Best Web Bluetooth support on Linux', url: 'https://www.google.com/chrome/' },
    { name: 'Chromium', note: 'Open-source Chrome build, supports Web Bluetooth', url: 'https://www.chromium.org/getting-involved/download-chromium/' },
  ],
  unknown: [
    { name: 'Google Chrome', note: 'Recommended browser for Web Bluetooth', url: 'https://www.google.com/chrome/' },
  ],
};

const OS_LABELS: Record<OSType, string> = {
  ios: 'iOS / iPadOS',
  android: 'Android',
  macos: 'macOS',
  windows: 'Windows',
  linux: 'Linux',
  unknown: 'your platform',
};

// ─── Component ───────────────────────────────────────────────────────────────

function Home() {
  const router = useRouter();
  const theme = useTheme();

  const [isBluetoothSupported, setIsBluetoothSupported] = useState<boolean>(true);
  const [detectedOS, setDetectedOS] = useState<OSType>('unknown');
  const [showSupportDialog, setShowSupportDialog] = useState<boolean>(false);

  useEffect(() => {
    const supported = typeof navigator !== 'undefined' && !!navigator.bluetooth;
    setIsBluetoothSupported(supported);
    setDetectedOS(detectOS());

    if (!supported) {
      setShowSupportDialog(true);
    }
  }, []);

  const handleCloseSupportDialog = () => setShowSupportDialog(false);

  const navigateToTimePage = useMemo(() => () => router.push('/time/Time'), [router]);
  const navigateToHomePage = useMemo(() => () => router.push('/'), [router]);

  const handleWatchConnectedAndInit = useMemo(() => async () => {
    if (GShockAPI.isFindPhoneButtonPressed()) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) PhoneFinder.ring();
    } else if (GShockAPI.isActionButtonPressed() || GShockAPI.isAutoTimeStarted()) {
      await GShockAPI.setTime();
    } else {
      navigateToTimePage();
    }
  }, [navigateToTimePage]);

  const actions: EventAction[] = useMemo(() => [
    { label: "Disconnected", action: navigateToHomePage },
    { label: "WatchInitializationCompleted", action: handleWatchConnectedAndInit },
  ], [navigateToHomePage, handleWatchConnectedAndInit]);

  useEffect(() => {
    progressEvents.runEventActions("Home", actions);
    return () => {
      progressEvents.stop("Home");
    };
  }, [actions]);

  useEffect(() => {
    if (connection.isConnected()) {
      if (GShockAPI.isNormalButtonPressed()) navigateToTimePage();
    }
  }, [navigateToTimePage]);

  const suggestions = BROWSER_SUGGESTIONS[detectedOS];
  const osLabel = OS_LABELS[detectedOS];

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      width: '100%',
      overflow: 'hidden',
      bgcolor: 'background.default',
      position: 'relative'
    }}>

      {/* 1. SCROLLABLE CONTENT */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        px: { xs: 2, sm: 4, md: 6 },
        pt: { xs: 1, md: 4 },
        pb: 1
      }}>

        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Watch Images Row - Modernized */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: { xs: 1, md: 4 }
          }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 2, sm: 4 },
              mb: 2,
              flexWrap: 'wrap',
              opacity: 0.8,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.05))'
            }}>
              {[dw_b5600, ecb_30d, ga_b2100, gw_b5600].map((imgSrc, index) => (
                <Box key={index} sx={{
                  height: { xs: 30, sm: 70, md: 90 },
                  display: 'flex',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.1) rotate(5deg)' }
                }}>
                  <img
                    src={typeof imgSrc === 'string' ? imgSrc : imgSrc.src as string}
                    alt="Supported Watch"
                    style={{ height: '100%', objectFit: 'contain' }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Main Title with Gradient */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              mb: 0,
              fontSize: { xs: '1.75rem', md: '2.125rem' },
              letterSpacing: '-0.02em'
            }}
          >
            Connect Your Watch
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: { xs: 1, md: 4 }, fontWeight: 500, fontSize: { xs: '0.95rem', md: '1rem' } }}
          >
            Follow these simple steps to sync your G-Shock.
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: { xs: 1, md: 2 },
            mb: { xs: 1, md: 4 }
          }}>
            {/* Step 1: Compatibility */}
            <Paper elevation={0} sx={{
              p: { xs: 1.5, md: 3 },
              borderRadius: 4,
              bgcolor: alpha(isBluetoothSupported ? theme.palette.success.main : theme.palette.error.main, 0.04),
              border: `1px solid ${alpha(isBluetoothSupported ? theme.palette.success.main : theme.palette.error.main, 0.1)}`,
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}`
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, md: 2 } }}>
                <Box sx={{ 
                  p: 0.75, 
                  borderRadius: 1.5, 
                  bgcolor: alpha(isBluetoothSupported ? theme.palette.success.main : theme.palette.error.main, 0.1),
                  mr: 1,
                  display: 'flex'
                }}>
                  {isBluetoothSupported ? (
                    <CheckCircleIcon color="success" sx={{ fontSize: { xs: 18, md: 24 } }} />
                  ) : (
                    <UnsupportedIcon color="error" sx={{ fontSize: { xs: 18, md: 24 } }} />
                  )}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1rem' } }}>
                  1. Browser Check
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.4, fontSize: { xs: '0.9rem', md: '0.875rem' } }}>
                {isBluetoothSupported
                  ? "Your browser is ready to sync with your watch!"
                  : "Web Bluetooth is not supported in this browser."}
              </Typography>
              {!isBluetoothSupported && (
                <Button
                  size="small"
                  onClick={() => setShowSupportDialog(true)}
                  sx={{ mt: 1, fontWeight: 700, alignSelf: 'flex-start', fontSize: '0.75rem' }}
                >
                  Solutions
                </Button>
              )}
            </Paper>

            {/* Step 2: Pair */}
            <Paper elevation={0} sx={{
              p: { xs: 1.5, md: 3 },
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}`
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, md: 2 } }}>
                <Box sx={{
                  p: 0.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  mr: 1,
                  display: 'flex'
                }}>
                  <BluetoothIcon color="primary" sx={{ fontSize: { xs: 18, md: 24 } }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1rem' } }}>
                  2. Initiate Pairing
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.4, fontSize: { xs: '0.9rem', md: '0.875rem' } }}>
                Press <strong>[Pair Watch]</strong>. Hold the <strong>LOWER-LEFT</strong> button on your watch until it beeps twice.
              </Typography>
            </Paper>

            {/* Step 3: Watch Settings */}
            <Paper elevation={0} sx={{
              p: { xs: 1.5, md: 3 },
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}`
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, md: 2 } }}>
                <Box sx={{
                  p: 0.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  mr: 1,
                  display: 'flex'
                }}>
                  <WatchIcon color="primary" sx={{ fontSize: { xs: 18, md: 24 } }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1rem' } }}>
                  3. Watch Mode
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.4, fontSize: { xs: '0.9rem', md: '0.875rem' } }}>
                For watch settings and time sync, hold the <strong>LOWER-LEFT</strong> button until it beeps twice.
              </Typography>
            </Paper>

            {/* Step 4: Quick Sync */}
            <Paper elevation={0} sx={{
              p: { xs: 1.5, md: 3 },
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}`
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, md: 2 } }}>
                <Box sx={{
                  p: 0.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  mr: 1,
                  display: 'flex'
                }}>
                  <AccessTimeIcon color="primary" sx={{ fontSize: { xs: 18, md: 24 } }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1rem' } }}>
                  4. Fast Time Sync
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.4, fontSize: { xs: '0.9rem', md: '0.875rem' } }}>
                Short-press the <strong>LOWER-RIGHT</strong> button while pairing for a quick time update.
              </Typography>
            </Paper>
          </Box>

          {/* Privacy & Trust Banner */}
          <Paper elevation={0} sx={{
            p: { xs: 1.5, md: 3 },
            bgcolor: alpha(theme.palette.success.main, 0.02),
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            mb: { xs: 1, md: 4 }
          }}>
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              opacity: 0.05,
              transform: 'rotate(15deg)'
            }}>
              <SecurityIcon sx={{ fontSize: 120, color: 'success.main' }} />
            </Box>

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: 'success.dark', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <SecurityIcon sx={{ fontSize: 24 }} />
                Privacy & Security
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 3, md: 3 }, maxWidth: 500, mx: 'auto', lineHeight: 1.6, fontSize: { xs: '0.9rem', md: '0.875rem' } }}>
                Your privacy is built-in. This application runs <strong>locally</strong> in your browser. Data never leaves your device.
              </Typography>
              <Button
                variant="outlined"
                color="success"
                size="medium"
                startIcon={<GitHubIcon sx={{ fontSize: { xs: 16, md: 18 } }} />}
                href="https://github.com/izivkov/gshock-smart-sync-webapp"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderRadius: '100px',
                  textTransform: 'none',
                  fontWeight: 800,
                  px: { xs: 2, md: 4 },
                  py: 0.5,
                  fontSize: { xs: '0.6rem', md: '0.875rem' },
                  borderWidth: 1,
                  '&:hover': { borderWidth: 1 }
                }}
              >
                Source Code
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* 2. RESPONSIVE ACTION AREA */}
      <Box sx={{
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        zIndex: 10,
        pb: { xs: `calc(env(safe-area-inset-bottom) + 8px)`, md: 2 },
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <ConnectButton />
        </Box>
      </Box>

      {/* ── Browser Support Dialog ─────────────────────────────────────────── */}
      <Dialog
        open={showSupportDialog}
        onClose={handleCloseSupportDialog}
        aria-labelledby="browser-support-dialog-title"
        slotProps={{
          paper: {
            sx: { borderRadius: 4, p: 1, maxWidth: 420 }
          }
        }}
      >
        <DialogTitle id="browser-support-dialog-title" sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontWeight: 800,
          color: 'warning.dark'
        }}>
          <UnsupportedIcon sx={{ fontSize: 32, color: 'error.main' }} />
          Browser Not Supported
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2.5, fontWeight: 500 }}>
            Your current browser doesn't support <strong>Web Bluetooth</strong>, which is required to sync with your watch.
          </Typography>

          <Box sx={{
            bgcolor: 'background.default',
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 800, color: 'primary.main', mb: 1.5 }}>
              Recommended for {osLabel}:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {suggestions.map((s) => (
                <Box key={s.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.note}</Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 700, fontSize: '0.75rem' }}
                  >
                    Get it
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={handleCloseSupportDialog}
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              borderRadius: 100,
              py: 1.5,
              fontWeight: 800,
              boxShadow: 'none',
              '&:hover': { boxShadow: '0 4px 12px rgba(139, 94, 60, 0.2)' }
            }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default Home;