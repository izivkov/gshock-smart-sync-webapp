"use client"

import { Switch as MuiSwitch } from "@mui/material";
import { useEffect, useState } from "react";
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setChecked(isChecked);
    if (onChange) onChange(isChecked);
  };

  return (
    <div className="flex flex-row justify-between gap-6 items-center">
      <AppText text={text ?? ""} />
      <MuiSwitch
        checked={checked}
        onChange={handleChange}
        disableRipple
        size="small"
      />
    </div>
  );
};

export default AppSwitch;
