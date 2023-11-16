"use client"

import { Switch } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import AppText from "./AppText";

interface AppSwitchProps {
  text?: string;
  checked: boolean;
}

const AppSwitch: React.FC<AppSwitchProps> = ({ text, checked }) => {

  const [switchState, setSwitchState] = useState<boolean>(checked); // Set to true for checked or false for unchecked

  useEffect(() => {
    setSwitchState(checked);
  }, [checked]);

  const toggleSwitch = () => {
    setSwitchState(!switchState); // Toggle the state when the Switch is clicked.
  };

  return (
    <div className="flex flex-row justify-between gap-6 items-center">
      <AppText text={text ? text : ""} />
      <Switch
        checked={switchState}
        onChange={toggleSwitch}
        ripple={false}
        className="h-full w-full checked:bg-[purple]"
        containerProps={{
          className: "w-11 h-6",
        }}
        circleProps={{
          className: "before:hidden left-0.5 border-none",
        }} />
    </div >
  )
}

export default AppSwitch;
