"use client"

import AppButton from "@components/AppButton";
import { connection } from "@api/Connection";
import test from "@api/test";
import React, { useState } from "react";
import GShockAPI from "@/api/GShockAPI";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const ConnectButton: React.FC = () => {
    const [dialogOpen, setDialogOpen] = useState(false);

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
                    3. <strong>Check Hardware:</strong> Ensure Bluetooth and <strong>Location Services</strong> (on Android/Windows) are turned <strong>ON</strong>.<br />
                    4. <strong>Pairing:</strong> Click the "Connect" button on the site and select your device from the browser’s pop-up list.
                </Typography>

                <Typography variant="body2" color="textSecondary">
                    <strong>Note:</strong> Only <strong>Bluetooth Low Energy (BLE)</strong> devices are supported. Ensure the device isn't already paired with another app.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog} color="primary">Close</Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <div className="flex w-max gap-4">
            {unsupportedDialog}
            <AppButton label="Pair Watch" onClick={() => connect()} />
        </div>
    );
};

export default ConnectButton;