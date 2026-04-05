"use client"

import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation';
import { alpha, useTheme } from '@mui/material/styles'; // Use official alpha
import Typography from '@mui/material/Typography';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Paper } from '@mui/material';

// Icons
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import SettingsIcon from '@mui/icons-material/Settings';
import WatchIcon from '@mui/icons-material/Watch';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';

// Absolute/Project Imports
import WatchImage from '@pages/home/WatchImage'
import ConnectButton from '@pages/home/ConnectButton'
import CopyToClipboardComponent from '@components/CopyToClipboardComponent'
import AppCard from '../pages/components/AppCard'
import { progressEvents, EventAction } from "@api/ProgressEvents"

function Home() {
  const router = useRouter();
  const theme = useTheme();

  const navigateToTimePage = useMemo(() => () => {
    router.push('/time/Time');
  }, [router]);

  const navigateToHomePage = useMemo(() => () => {
    router.push('/');
  }, [router]);

  const bluetoothSettingUrl = "chrome://settings/content/bluetoothDevices"
  const experimentalFlagsUrl = "chrome://flags/#enable-experimental-web-platform-features"

  const actions: EventAction[] = useMemo(() => [
    { label: "Disconnected", action: navigateToHomePage },
    { label: "Connected", action: navigateToTimePage },
  ], [navigateToHomePage, navigateToTimePage]);

  useEffect(() => {
    // Safer to use a string literal if WatchImage is a dynamic/memo component
    progressEvents.runEventActions("WatchImage", actions);
  }, [actions]);

  const header = (
    <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
      <WatchImage
        imageSource={{ url: 'https://www.casio.com/content/dam/casio/product-info/locales/intl/en/timepiece/product/watch/G/GW/GWB/GW-B5600BC-1B/assets/GW-B5600BC-1B_Seq1.png.transform/main-visual-pc/image.png' }}
        name={'G Shock GW-B5600BC-1B'}
        width={200}
      />
    </Box>
  );

  const textBody = (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        Quick Setup
      </Typography>

      <List sx={{ '& .MuiListItem-root': { mb: 2 } }}>
        <ListItem disableGutters alignItems="flex-start">
          <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
            <SettingsIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                1. Enable Web Bluetooth
              </Typography>
            }
            // ✅ This fixes the TypeScript error AND the "nested div" HTML error
            secondaryTypographyProps={{ component: 'div' }}
            secondary={
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Ensure Bluetooth is enabled in your browser settings:
                </Typography>

                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1,
                  gap: 1,
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                  p: 1,
                  borderRadius: 1
                }}>
                  <code style={{ flexGrow: 1, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {bluetoothSettingUrl}
                  </code>
                  <CopyToClipboardComponent textToCopy={bluetoothSettingUrl} />
                </Box>

                {/* Linux Warning Box */}
                <Box sx={{
                  mt: 2,
                  p: 1.5,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  borderLeft: `4px solid ${theme.palette.error.main}`,
                  borderRadius: 1
                }}>
                  {/* ✅ Use component="div" here too since it contains a Box */}
                  <Typography variant="caption" color="error" component="div">
                    <strong>Linux Users:</strong> You may need to enable experimental features:
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                      <code style={{ flexGrow: 1, fontSize: '0.75rem' }}>
                        {experimentalFlagsUrl}
                      </code>
                      <CopyToClipboardComponent textToCopy={experimentalFlagsUrl} />
                    </Box>
                  </Typography>
                </Box>
              </Box>
            }
          />
        </ListItem>

        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <BluetoothIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>2. Pair Your Watch</Typography>}
            secondary="Press 'Pair Watch' below. A Bluetooth search box will appear."
          />
        </ListItem>

        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <WatchIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>3. Connect/Configure</Typography>}
            secondary="Long-press LOWER-LEFT button on your watch. Select it when it appears."
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 4 }} />

      <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
          <InfoIcon fontSize="small" color="info" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Compatibility</Typography>
            <Typography variant="caption" color="textSecondary">
              Currently supports <strong>Chrome, Edge, and Opera</strong>.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
      <AppCard header={header} body={textBody} footer={<ConnectButton />} />
    </Box>
  );
}

export default Home;
