"use client"

import AppButton from "@components/AppButton";
import { connection } from "@api/Connection";
import React from "react";
import GShockAPI from "@/api/GShockAPI";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const ConnectButton: React.FC = () => {
    const [connecting, setConnecting] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setConnecting(connection.connecting);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    async function connect() {
        if (!navigator.bluetooth) {
            if (!dialogOpen) {
                setDialogOpen(true);
            }
            return;
        }

        await connection.start();
        await GShockAPI.init();
    }

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
                    3. <strong>Check Hardware:</strong> Ensure Bluetooth and <strong>Location Services</strong> (on Android/Windows) are turned ON.<br />
                    4. <strong>Pairing:</strong> Click the "Pair Watch" button and select your device from the browser's pop-up list.
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

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {unsupportedDialog}
            <AppButton
                label={connecting ? "Connecting..." : "Pair Watch"}
                onClick={() => connect()}
                disabled={connecting}
            />
        </div>
    );
};

export default ConnectButton;