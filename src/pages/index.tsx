"use client"

import WatchImage from '@pages/home/WatchImage'
import ConnectButton from '@pages/home/ConnectButton'
import CopyToClipboardComponent from '@components/CopyToClipboardComponent'
import React, { useEffect } from 'react'
import { progressEvents } from "@api/ProgressEvents"
import { useRouter } from 'next/navigation';

import {
  Typography,
} from "@material-tailwind/react";
import AppCard from '../pages/components/AppCard'

function Home() {

  const router = useRouter();

  const navigateToTimePage = () => {
    router.push('/time/Time');
  };

  const navigateToHomePage = () => {
    router.push('/');
  };

  const bluetoothSettingUrl = "chrome://settings/content/bluetoothScanning"

  const header = <WatchImage
    imageSource={{ url: 'https://www.casio.com/content/dam/casio/product-info/locales/intl/en/timepiece/product/watch/G/GW/GWB/GW-B5600BC-1B/assets/GW-B5600BC-1B_Seq1.png.transform/main-visual-pc/image.png' }}
    name={'G Shock GW-B5600BC-1B'}
    width={200} />

  useEffect(() => {
    (() => {
      progressEvents.subscriber.start(WatchImage.name, (event) => {
        switch (event) {
          case null:
          case undefined:
            return

          case progressEvents.get("Disconnected"):
            console.log(`Received [Connected] event`);
            navigateToHomePage();
            break;

          case progressEvents.get("Connected"):
            console.log(`Received [Disconnected] event`);
            navigateToTimePage();
            break;
        }
      }, (error: any): any => {
        console.log("Got error on subscribe:", error);
        error.stack && console.error(error.stack);
      })
    })()
  }, [])

  const textBody =
    <div>
      <Typography color="gray" >
        1. Enable Bluetooth in your browser using this URL:
        <br />
        {bluetoothSettingUrl}
      </Typography>
      <CopyToClipboardComponent textToCopy={bluetoothSettingUrl} />
      <Typography color="gray">
        <br />
        2. After Pressing the [Pair Watch] button below, you will see a box searching for Blowtooth devices.
        < br /> <br />
        3. To configure your watch, long - press the LOWER-LEFT button on your watch and it should appear in the list of devices. Select it and press the [Pair] button.
        < br /> <br />
        4. ...or Short - press the LOWER-RIGHT button on your watch to set time
        < br /> <br />
      </Typography>
      <Typography color="gray">
        <i><b>Note:</b> Only Chrome browsers on Windows, Mac and Linux are currently supported.</i>
        <br /><br />
      </Typography>
    </div>

  const footer = <ConnectButton />

  return (
    <main className="flex min-h-screen flex-col justify-between p-24">
      <AppCard header={header} body={textBody} footer={footer} />
    </main >
  )
}

export default Home;