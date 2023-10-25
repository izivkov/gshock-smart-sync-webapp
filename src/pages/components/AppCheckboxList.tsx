"use client"

import React, { Component } from 'react';

import { Checkbox, List, ListItem, ListItemPrefix, Typography } from "@material-tailwind/react";

interface AppCheckboxListProps {
    checkBoxNames: string[];
}

const AppCheckboxList: React.FC<AppCheckboxListProps> = ({ checkBoxNames }) => {
    return (
        <List className="flex-row">
            {checkBoxNames.map((checkBoxName, index) => (
                <ListItem className="p-0" key={index}>
                    <label
                        htmlFor={checkBoxName}
                        className="flex w-full cursor-pointer items-center px-3 py-2"
                    >
                        <ListItemPrefix className="mr-3">
                            <Checkbox
                                id={checkBoxName}
                                ripple={false}
                                className="hover:before:opacity-0"
                                containerProps={{
                                    className: "p-0",
                                }}
                            />
                        </ListItemPrefix>
                        <Typography color="blue-gray" className="font-medium">
                            {checkBoxName}
                        </Typography>
                    </label>
                </ListItem>
            ))}

        </List>
    )
}

export default AppCheckboxList;