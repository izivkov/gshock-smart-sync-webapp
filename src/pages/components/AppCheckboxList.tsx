"use client"

import React, { Component } from 'react';

import { Checkbox, List, ListItem, ListItemPrefix, Typography } from "@material-tailwind/react";
import AppText from './AppText';
import AppCheckbox from './AppCheckbox';

interface AppCheckboxListProps {
    checkBoxNames: string[];
    label: string;
}

const AppCheckboxList: React.FC<AppCheckboxListProps> = ({ checkBoxNames, label }) => {
    return (
        <div>
            <AppText text={label} variant='paragraph' />
            <List className="flex flex-row inline-block">
                {checkBoxNames.map((checkBoxName, index) => (
                    <ListItem className="p-0" key={index}>
                        <label
                            htmlFor={checkBoxName}
                            className="flex w-full cursor-pointer items-center px-3 py-2"
                        >
                            <ListItemPrefix className="p-0 hover:before:opacity-0">
                                <AppCheckbox text={""} checked={false} />
                                {/* <Checkbox
                                    id={checkBoxName}
                                    ripple={false}
                                    className="hover:before:opacity-0"
                                    containerProps={{
                                        className: "p-0",
                                    }}
                                /> */}
                            </ListItemPrefix>
                            <Typography color="blue-gray" className="font-medium">
                                {checkBoxName}
                            </Typography>
                        </label>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}

export default AppCheckboxList;