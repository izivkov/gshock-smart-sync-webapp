"use client"

import AppButton from "@components/AppButton";
import { connection } from "@api/Connection";
import { watchInfo } from "@/api/WatchInfo";
import test from "@api/test";
import React from "react";

const ConnectButton: React.FC = () => {

    const connect = () => {
        connection.start().then(() => {
            // watchInfo.setNameAndModel(connection.name)
        })
    }

    const processData = (data: any) => {
        console.log(`in callbackdata: data: ${data}`)
    }

    async function runTest() {
        await connection.start()
        test.run()
    }

    return (
        <div className="flex w-max gap-4">
            <AppButton label="Pair Watch" onClick={() => connect()} />
        </div >
    )
}

export default ConnectButton;