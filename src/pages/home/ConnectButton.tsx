

import AppButton from "@components/AppButton";
import { connection } from "@api/Connection";
import test from "@api/test";
import React from "react";
import GShockAPI from "@/api/GShockAPI";

const ConnectButton: React.FC = () => {

    async function connect() {
        await connection.start()
        await GShockAPI.init()

        // await runTest()
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