import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Slider,
} from '@mui/material';

interface ValueSelectionDialogProps {
    open: boolean;
    title: string;
    label: string;
    initialValue: number;
    range: [number, number];
    unit?: string;
    onClose: () => void;
    onConfirm: (value: number) => void;
}

const ValueSelectionDialog: React.FC<ValueSelectionDialogProps> = ({
    open,
    title,
    label,
    initialValue,
    range,
    unit = "",
    onClose,
    onConfirm,
}) => {
    const [value, setValue] = useState(initialValue);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ py: 2 }}>
                    <Typography gutterBottom sx={{ fontWeight: 600 }}>
                        {label}: {value}{unit}
                    </Typography>
                    <Slider
                        value={value}
                        min={range[0]}
                        max={range[1]}
                        onChange={(_, newValue) => setValue(newValue as number)}
                        valueLabelDisplay="auto"
                        sx={{ mt: 2 }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={() => onConfirm(value)}
                    variant="contained"
                    color="primary"
                >
                    Set
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ValueSelectionDialog;
