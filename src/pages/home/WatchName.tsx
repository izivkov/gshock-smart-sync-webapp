"use client"

import { progressEvents } from "@api/ProgressEvents"
import React, { useState, useEffect } from 'react';


const WatchName: React.FC = () => {


    const [name, setName] = useState('');

    useEffect(() => {
        (() => {
            progressEvents.subscriber.start(WatchName.name, (event) => {

                switch (event) {
                    case null:
                    case undefined:
                        setName("Undefined");
                        return

                    case progressEvents.get("DeviceName"):
                        const name = progressEvents.getPayload("DeviceName");
                        if (name !== null) {
                            setName(name);
                            console.log(`Received eventDevice name: ${name}`);
                        }

                        break;
                }
            }, (error: any): any => {
                console.log("Got error on subscribe:", error);
                error.stack && console.error(error.stack);
            });
        })()
    }, [])

    return (
        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0">
            <h2>
                {name}
            </h2>
        </div>
    )
}

export default WatchName;