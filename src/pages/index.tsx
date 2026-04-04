"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/router';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Import from absolute paths to be safe on this branch
import WatchImage from './home/WatchImage';
import ConnectButton from './home/ConnectButton';
import CopyToClipboardComponent from './components/CopyToClipboardComponent';
import AppCard from './components/AppCard';

import { progressEvents } from "../api/ProgressEvents";

const Home: React.FC = () => {
  const router = useRouter();

  const navigateToTimePage = () => {
    router.push('/time/Time').catch(console.error);
  };

  const navigateToHomePage = () => {
    router.push('/').catch(console.error);
  };

  const bluetoothSettingUrl = "chrome://settings/content/bluetoothScanning";

  const header = (
    <WatchImage
      imageSource={{ url: 'https://www.casio.com/content/dam/casio/product-info/locales/intl/en/timepiece/product/watch/G/GW/GWB/GW-B5600BC-1B/assets/GW-B5600BC-1B_Seq1.png.transform/main-visual-pc/image.png' }}
      name={'G Shock GW-B5600BC-1B'}
      width={220}
      height={320}
    />
  );

  useEffect(() => {
    const actions = [
      { label: "Disconnected", action: navigateToHomePage },
      { label: "Connected", action: navigateToTimePage },
    ];
    progressEvents.runEventActions("WatchImage", actions);
  }, []);

  const textBody = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body1" color="text.secondary">
        1. Enable Bluetooth in your browser using this URL:
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, wordBreak: 'break-all', flex: 1 }}>
          {bluetoothSettingUrl}
        </Typography>
        <CopyToClipboardComponent textToCopy={bluetoothSettingUrl} />
      </Box>

      <Typography variant="body1" color="text.secondary">
        2. Press the <strong>[Pair Watch]</strong> button below to start searching.
      </Typography>

      <Typography variant="body1" color="text.secondary">
        3. Long-press the <strong>LOWER-LEFT</strong> button on your watch until it appears in the device list.
      </Typography>

      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 1 }}>
        Note: Only Chrome browsers on Windows, Mac, and Linux are currently supported.
      </Typography>
    </Box>
  );

  const footer = (
    <Box sx={{ mt: 2 }}>
      <ConnectButton />
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 2,
      bgcolor: '#f8fafc' // slate-50
    }}>
      <AppCard 
        header="Testing Header" 
        body="Testing Body" 
        footer="Testing Footer" 
        className="w-full max-w-md"
      />
    </Box>
  );
};

export default Home;