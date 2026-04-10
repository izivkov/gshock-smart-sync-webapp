"use client"

import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemIcon, Typography } from "@mui/material";
import AppText from './AppText';
import AppCheckbox from './AppCheckbox';

interface AppCheckboxListProps {
    displayValues: string[];
    label: string;
    selectedSetInit: string[];
    onChange: (selected: string[]) => void;
    className?: string;
}

const AppCheckboxList: React.FC<AppCheckboxListProps> = ({ displayValues, label, onChange, className, selectedSetInit }) => {
    const [selectedSet, setSelectedSet] = useState(new Set<string>(selectedSetInit));

    useEffect(() => {
        setSelectedSet(new Set<string>(selectedSetInit));
    }, [selectedSetInit]);

    const toggleCheckbox = (checked: boolean, index: number) => {
        const newSet = new Set(selectedSet);
        if (checked) {
            newSet.add(displayValues[index]);
        } else {
            newSet.delete(displayValues[index]);
        }
        setSelectedSet(newSet);
        onChange(Array.from(newSet.values()));
    };

    return (
        <div>
            <AppText text={label} variant='h6' />
            <List dense disablePadding className={className}>
                {displayValues.map((displayValue: string, index: number) => (
                    <ListItem key={index} disablePadding>
                        <label
                            htmlFor={displayValue}
                            className="flex w-full cursor-pointer items-center px-1 py-0"
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <AppCheckbox text="" checked={selectedSet.has(displayValue)} index={index} onChange={toggleCheckbox} />
                            </ListItemIcon>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {displayValue}
                            </Typography>
                        </label>
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default AppCheckboxList;