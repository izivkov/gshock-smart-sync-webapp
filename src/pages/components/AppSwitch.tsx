"use client"

import { Switch as MuiSwitch, Box } from "@mui/material";
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
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 3, alignItems: 'center' }}>
      <AppText text={text ?? ""} />
      <MuiSwitch
        checked={checked}
        onChange={handleChange}
        disableRipple
        size="small"
      />
    </Box>
  );
};

export default AppSwitch;
