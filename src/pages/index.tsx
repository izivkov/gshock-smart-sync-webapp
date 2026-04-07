"use client"

import WatchImage from '@pages/home/WatchImage'
import ConnectButton from '@pages/home/ConnectButton'
import React, { useEffect, useMemo, useState } from 'react'
import { progressEvents } from "@api/ProgressEvents"
import { useRouter } from 'next/navigation';
import { EventAction } from "@api/ProgressEvents";

import Typography from '@mui/material/Typography';
import AppCard from '../pages/components/AppCard'
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Paper, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import WatchIcon from '@mui/icons-material/Watch';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import AppDialog from './components/AppDialog';

function Home() {
  const router = useRouter();
  const theme = useTheme();
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const navigateToTimePage = useMemo(() => () => {
    router.push('/time/Time');
  }, [router]);

  const navigateToHomePage = useMemo(() => () => {
    router.push('/');
  }, [router]);

  const header = (
    <Box sx={{ py: 2 }}>
      <WatchImage
        imageSource={{ url: 'https://shockbase.org/pics2/5600/GW-B5600/GW-B5600BC-1B.png' }}
        name={'G Shock GW-B5600BC-1B'}
        width={200}
      />
    </Box>
  );

  const actions: EventAction[] = useMemo(() => [
    { label: "Disconnected", action: navigateToHomePage },
    { label: "Connected", action: navigateToTimePage },
  ], [navigateToHomePage, navigateToTimePage]);

  useEffect(() => {
    if (!navigator.bluetooth) {
      setIsBluetoothSupported(false);
      setDialogOpen(true);
    }
  }, []);

  // Listen for connection events
  useEffect(() => {
    progressEvents.runEventActions("Home", actions);
  }, [actions]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const unsupportedDialog = (
    <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
      <DialogTitle>Bluetooth Not Supported</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          To use this application, your browser must support Web Bluetooth. Please follow the steps below to ensure compatibility:
        </Typography>

        <Typography variant="h6" gutterBottom>1. Supported Browsers</Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Desktop:</strong> Google Chrome, Microsoft Edge, and Opera (Windows, macOS, Linux).<br />
          <strong>Mobile:</strong> Chrome for Android; <strong>Bluefy</strong> or <strong>WebBLE</strong> for iOS/iPadOS.<br />
          <strong>Unsupported:</strong> Safari and Firefox.
        </Typography>

        <Typography variant="h6" gutterBottom>2. Quick Setup Instructions</Typography>
        <Typography variant="body2" gutterBottom>
          1. <strong>Enable Flags:</strong> Navigate to <code>chrome://flags</code> (or <code>edge://flags</code>), search for <strong>#web-bluetooth</strong>, and set it to <strong>Enabled</strong>. Restart the browser.<br />
          2. <strong>Grant Permissions:</strong> Go to <strong>Settings &gt; Privacy &gt; Site Settings &gt; Bluetooth devices</strong> and toggle on <strong>"Sites can ask to connect"</strong>.<br />
          3. <strong>Check Hardware:</strong> Ensure Bluetooth and <strong>Location Services</strong> (on Android/Windows) are turned <strong>ON</strong>.<br />
          4. <strong>Pairing:</strong> Click the "Pair Watch" button and select your device from the browser’s pop-up list.
        </Typography>

        <Typography variant="body2" color="textSecondary">
          <strong>Note:</strong> Ensure the device isn't already paired with another app.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );

  const textBody = (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        Get Started
      </Typography>

      <List sx={{ '& .MuiListItem-root': { mb: 2 } }}>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <BluetoothIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Pair Your Watch</Typography>}
            secondary="Press 'Pair Watch' below. A Bluetooth search dialog will appear."
          />
        </ListItem>

        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <WatchIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Activate Watch Mode</Typography>}
            secondary="Long-press the LOWER-LEFT button on your watch, then select it from the list and press 'Pair'."
          />
        </ListItem>

        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <AccessTimeIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Sync or Configure</Typography>}
            secondary="After connecting, manage time, alarms, events, and settings."
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 3 }} />

      <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
          <InfoIcon fontSize="small" color="info" />
          <Box>
            <Typography variant="body2" color="textPrimary" sx={{ fontWeight: 600 }}>
              Browser Configuration Required
            </Typography>
            <Typography variant="caption" color="textSecondary">
              If this is your first time, click 'Pair Watch' and follow the browser setup instructions in the dialog that appears.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );

  const footer = <ConnectButton />

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: { xs: 'flex-start', md: 'center' },
      px: { xs: 2, md: 4 },
      py: { xs: 3, md: 4 },
      minHeight: { md: '100vh' }
    }}>
      {unsupportedDialog}
      <AppCard header={header} body={textBody} footer={footer} />
    </Box>
  )
}

function alpha(color: string, value: number) {
  return `${color}${Math.floor(value * 255).toString(16).padStart(2, '0')}`;
}

export default Home;
