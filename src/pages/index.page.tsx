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
import InfoIcon from '@mui/icons-material/Info';

// Import local images directly based on project structure
import dw_b5600 from '../../images/dw-b5600.png';
import ecb_30d from '../../images/ecb_30d.png';
import ga_b2100 from '../../images/ga_b2100.png';
import gw_b5600 from '../../images/gw_b5600.png';

const BOTTOM_NAV_HEIGHT = '80px';

function Home() {
  const router = useRouter();
  const theme = useTheme();
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const navigateToTimePage = useMemo(() => () => router.push('/time/Time'), [router]);
  const navigateToHomePage = useMemo(() => () => router.push('/'), [router]);

  const handleWatchConnectedAndInit = useMemo(() => async () => {
    if (GShockAPI.isFindPhoneButtonPressed()) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        PhoneFinder.ring();
      }
    } else if (GShockAPI.isActionButtonPressed() || GShockAPI.isAutoTimeStarted()) {
      await GShockAPI.setTime();
      // Stay on home screen to represent headless sync
    } else {
      navigateToTimePage();
    }
  }, [navigateToTimePage]);

  const actions: EventAction[] = useMemo(() => [
    { label: "Disconnected", action: navigateToHomePage },
    { label: "WatchInitializationCompleted", action: handleWatchConnectedAndInit },
  ], [navigateToHomePage, handleWatchConnectedAndInit]);

  useEffect(() => {
    if (!navigator.bluetooth) {
      setIsBluetoothSupported(false);
      setDialogOpen(true);
    }
  }, []);

  useEffect(() => {
    progressEvents.runEventActions("Home", actions);
  }, [actions]);

  // Handle explicit component mounts when watch is already initialized
  useEffect(() => {
    // If it's already connected AND initialized, we fall back to normal button logic if they reload Home
    if (connection.isConnected()) {
      if (GShockAPI.isNormalButtonPressed()) navigateToTimePage();
    }
  }, [navigateToTimePage]);

  const handleCloseDialog = () => setDialogOpen(false);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      // '100%' ensures it fits inside your desktop layout's main container, 
      // while '100dvh' fallback ensures mobile height is correct.
      height: { xs: '100dvh', md: '100%' },
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
          variant="h5"
          sx={{ fontWeight: 800, color: 'primary.main', mb: 3, textAlign: 'center' }}
        >
          Get Started
        </Typography>

        {/* Watch Images Row */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: { xs: 2, sm: 3 }, 
          mb: 4, 
          flexWrap: 'wrap' 
        }}>
          {[dw_b5600, ecb_30d, ga_b2100, gw_b5600].map((imgSrc, index) => (
            <Box 
              key={index}
              sx={{ 
                height: { xs: 80, sm: 100, md: 120 }, // Small enough to not push connect button down too far
                display: 'flex'
              }} 
            >
              <img
                src={typeof imgSrc === 'string' ? imgSrc : imgSrc.src as string} 
                alt="Supported Watch"
                style={{ height: '100%', objectFit: 'contain' }}
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <List sx={{ '& .MuiListItem-root': { mb: 2 } }}>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <BluetoothIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Pair Your Watch</Typography>}
                secondary="Click the button at the bottom to start searching."
              />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <WatchIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Watch Mode</Typography>}
                secondary="Hold the LOWER-LEFT button on your G-Shock until it beeps."
              />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AccessTimeIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Configuration</Typography>}
                secondary="Set the time, timer, and alarms instantly."
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Paper elevation={0} sx={{
            p: 2,
            bgcolor: alpha(theme.palette.info.main, 0.08),
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <InfoIcon color="info" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Bluetooth Connection
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  If pairing fails, ensure your browser has Bluetooth permissions enabled and no other app is currently connected to the watch.
                </Typography>
              </Box>
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
        // On mobile (xs), add margin to sit above bottom nav. 
        // On desktop (md), remove margin and add subtle centering.
        mb: { xs: BOTTOM_NAV_HEIGHT, md: 0 },
        pb: { xs: `calc(env(safe-area-inset-bottom) + 8px)`, md: 2 },
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <ConnectButton />
        </Box>
      </Box>

      {/* Browser Support Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Incompatible Browser</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Web Bluetooth is required. Please use Chrome, Edge, or Bluefy on iOS.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined" fullWidth>
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Home;
