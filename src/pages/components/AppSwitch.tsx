"use client"

import { Switch } from "@material-tailwind/react";
import { useState } from "react";

interface AppSwitchProps {
  checked: boolean;
}

const AppSwitch: React.FC<AppSwitchProps> = ({ checked }) => {

  const [switchState, setSwitchState] = useState(checked); // Set to true for checked or false for unchecked

  const toggleSwitch = () => {
    setSwitchState(!switchState); // Toggle the state when the Switch is clicked.
  };

  return (
    <Switch checked={switchState} onChange={toggleSwitch}
      ripple={false}
      className="h-full w-full checked:bg-[purple]"
      containerProps={{
        className: "w-11 h-6",
      }}
      circleProps={{
        className: "before:hidden left-0.5 border-none",
      }} />
  )
}

export default AppSwitch;
