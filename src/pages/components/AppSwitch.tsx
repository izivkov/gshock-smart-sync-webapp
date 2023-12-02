"use client"

import { Switch } from "@material-tailwind/react";
import { useEffect, useRef, useState } from "react";
import AppText from "./AppText";

interface AppSwitchProps {
  text?: string;
  initialValue: boolean;
  onChange: (checked: boolean) => void;
}

const AppSwitch: React.FC<AppSwitchProps> = ({ text, initialValue, onChange }) => {

  const [checked, setChecked] = useState<boolean>(initialValue);

  useEffect(() => {
    setChecked(initialValue);
  }, [initialValue]);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setChecked(isChecked);
    // Pass back the state to the parent component
    if (onChange) {
      onChange(isChecked);
    }
  };

  return (
    <div className="flex flex-row justify-between gap-6 items-center">
      <AppText text={text ? text : ""} />
      <Switch
        checked={checked}
        onChange={handleSwitchChange}
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
