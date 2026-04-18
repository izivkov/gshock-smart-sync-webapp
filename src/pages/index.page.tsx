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

  // Compute Bluetooth support synchronously on first render so the icon and
  // dialog state are correct immediately — no flicker, no timing race.
  const [isBluetoothSupported] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return true; // SSR: assume supported
    return !!navigator.bluetooth;
  });

  const [detectedOS] = useState<OSType>(() => detectOS());

  // Show the dialog whenever Bluetooth is not supported. We no longer gate
  // behind localStorage so it always appears when the user lands on the page
  // without a supported browser.
  const [showSupportDialog, setShowSupportDialog] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return false;
    return !navigator.bluetooth;
  });

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
        pt: { xs: 2, md: 4 },
        pb: 2
      }}>

        <Typography
          variant="h6"
          sx={{ fontWeight: 800, color: 'primary.main', mb: { xs: 1, md: 3 }, textAlign: 'center' }}
        >
          Get Started
        </Typography>

        {/* Watch Images Row */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: { xs: 1.5, sm: 3 },
          mb: { xs: 2, md: 4 },
          flexWrap: 'wrap'
        }}>
          {[dw_b5600, ecb_30d, ga_b2100, gw_b5600].map((imgSrc, index) => (
            <Box key={index} sx={{ height: { xs: 60, sm: 80, md: 100 }, display: 'flex' }}>
              <img
                src={typeof imgSrc === 'string' ? imgSrc : imgSrc.src as string}
                alt="Supported Watch"
                style={{ height: '100%', objectFit: 'contain' }}
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <List sx={{ '& .MuiListItem-root': { mb: { xs: 1, md: 2 } } }}>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {isBluetoothSupported ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <UnsupportedIcon color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>1. Browser Compatibility</Typography>}
                secondary={
                  <Typography component="span" variant="caption">
                    {isBluetoothSupported
                      ? "Your browser supports Web Bluetooth."
                      : (
                        <>
                          Web Bluetooth is not supported in this browser.{' '}
                          <Box
                            component="span"
                            sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => setShowSupportDialog(true)}
                          >
                            See alternatives
                          </Box>
                        </>
                      )}
                  </Typography>
                }
              />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <BluetoothIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>2. Pair Your Watch</Typography>}
                secondary={<Typography component="span" variant="caption">Select your watch from the browser list.</Typography>}
              />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <WatchIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>3. Watch Mode</Typography>}
                secondary={<Typography component="span" variant="caption">Hold the LOWER-LEFT button until it beeps.</Typography>}
              />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AccessTimeIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>4. Quick Sync</Typography>}
                secondary={<Typography component="span" variant="caption">Manage time, alarms, and settings instantly.</Typography>}
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 0.0, opacity: 0.5 }} />

          {/* Privacy & Open Source Notice */}
          <Paper elevation={0} sx={{
            p: .5,
            bgcolor: alpha(theme.palette.success.main, 0.05),
            borderRadius: 4,
            border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`,
            textAlign: 'center',
            mt: 1,
            mb: 2
          }}>
            <SecurityIcon sx={{ color: 'success.main', fontSize: 36, mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.dark', mb: 1 }}>
              Privacy First & Open Source
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
              Your data never leaves your device. This application runs <strong>entirely in your browser</strong> and communicates directly with your watch via Bluetooth. No data is sent to any server.
            </Typography>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<GitHubIcon />}
              href="https://github.com/izivkov/gshock-smart-sync-webapp"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderRadius: '100px',
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                color: 'text.primary',
                borderColor: 'divider'
              }}
            >
              View Code on GitHub
            </Button>
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