"use client"

import WatchImage from '@pages/home/WatchImage'
import ConnectButton from '@pages/home/ConnectButton'
import CopyToClipboardComponent from '@components/CopyToClipboardComponent'
import React, { useEffect } from 'react'
import { progressEvents } from "@api/ProgressEvents"
import { useRouter } from 'next/navigation';
import { EventAction } from "@api/ProgressEvents";

import Typography from '@mui/material/Typography';
import AppCard from '../pages/components/AppCard'
import GShockAPI from '@/api/GShockAPI'
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Link, Paper } from '@mui/material';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import SettingsIcon from '@mui/icons-material/Settings';
import WatchIcon from '@mui/icons-material/Watch';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import ChromeReaderModeIcon from '@mui/icons-material/ChromeReaderMode';

function Home() {

  const router = useRouter();

  const navigateToTimePage = () => {
    router.push('/time/Time');
  };

  const navigateToHomePage = () => {
    router.push('/');
  };

  const bluetoothSettingUrl = "chrome://settings/content/bluetoothDevices"
  const experimentalFlagsUrl = "chrome://flags/#enable-experimental-web-platform-features"

  const header = <WatchImage
    imageSource={{ url: 'https://www.casio.com/content/dam/casio/product-info/locales/intl/en/timepiece/product/watch/G/GW/GWB/GW-B5600BC-1B/assets/GW-B5600BC-1B_Seq1.png.transform/main-visual-pc/image.png' }}
    name={'G Shock GW-B5600BC-1B'}
    width={200} />

  const actions: EventAction[] = [
    { label: "Disconnected", action: navigateToHomePage },
    { label: "Connected", action: navigateToTimePage },
  ]

  useEffect(() => {
    progressEvents.runEventActions(WatchImage.name, actions);
  }, []);

  const textBody =
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Quick Setup
      </Typography>

      <List>
        <ListItem disableGutters>
          <ListItemIcon>
            <SettingsIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="1. Enable Web Bluetooth"
            secondary={
              <>
                Ensure Bluetooth is enabled in your browser settings:
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                  <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {bluetoothSettingUrl}
                  </code>
                  <CopyToClipboardComponent textToCopy={bluetoothSettingUrl} />
                </Box>
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  <strong>Linux Users:</strong> You may need to enable experimental features if Bluetooth is not detected:
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                    <code style={{ background: 'rgba(255,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      {experimentalFlagsUrl}
                    </code>
                    <CopyToClipboardComponent textToCopy={experimentalFlagsUrl} />
                  </Box>
                </Typography>
              </>
            }
          />
        </ListItem>

        <ListItem disableGutters>
          <ListItemIcon>
            <BluetoothIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="2. Pair Your Watch"
            secondary="Press 'Pair Watch' below. A Bluetooth search box will appear."
          />
        </ListItem>

        <ListItem disableGutters>
          <ListItemIcon>
            <WatchIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="3. Connect/Configure"
            secondary="Long-press LOWER-LEFT button on your watch. Select it when it appears and press 'Pair'."
          />
        </ListItem>

        <ListItem disableGutters>
          <ListItemIcon>
            <AccessTimeIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="4. Sync Time"
            secondary="...or short-press LOWER-RIGHT button to just sync time."
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 3 }} />

      <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
          <InfoIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'medium' }}>
              Browser Compatibility
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Currently supports <strong>Chrome, Edge, and Opera</strong> on Windows, Mac, and Linux.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>

  const footer = <ConnectButton />

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <AppCard header={header} body={textBody} footer={footer} />
    </main >
  )
}

export default Home;