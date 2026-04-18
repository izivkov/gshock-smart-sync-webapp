"use client"

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Link
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const BrowserSupportDialog: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Perform check after a short delay to ensure hydration is complete
    const checkSupport = () => {
      try {
        const isSupported = typeof navigator !== 'undefined' && !!navigator.bluetooth;
        const hasSeenWarning = localStorage.getItem('has_seen_browser_warning');

        if (!isSupported && !hasSeenWarning) {
          setOpen(true);
        }
      } catch (error) {
        console.error("Browser support check failed:", error);
      }
    };

    checkSupport();
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('has_seen_browser_warning', 'true');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="browser-support-dialog-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: 1,
            maxWidth: 400
          }
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
        <WarningAmberIcon sx={{ fontSize: 32 }} />
        Browser Support
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
          Your browser doesn't support <strong>Web Bluetooth</strong>, which is required to sync with your watch.
        </Typography>
        
        <Box sx={{ 
          bgcolor: 'background.default', 
          p: 2.5, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 800, color: 'primary.main', mb: 1.5 }}>
            Suggested Browsers:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'text.secondary', textTransform: 'uppercase' }}>
                Desktop
              </Typography>
              <Typography variant="body2">Chrome, Edge, or Opera</Typography>
            </Box>
            
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'text.secondary', textTransform: 'uppercase' }}>
                Android
              </Typography>
              <Typography variant="body2">Chrome</Typography>
            </Box>
            
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'text.secondary', textTransform: 'uppercase' }}>
                iOS / iPadOS
              </Typography>
              <Typography variant="body2">
                <Link href="https://apps.apple.com/app/bluefy-web-ble-browser/id1492822232" target="_blank" rel="noopener" sx={{ fontWeight: 600 }}>Bluefy</Link> or <Link href="https://apps.apple.com/app/webble/id1193531073" target="_blank" rel="noopener" sx={{ fontWeight: 600 }}>WebBLE</Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button 
          onClick={handleClose} 
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
  );
}

export default BrowserSupportDialog;
