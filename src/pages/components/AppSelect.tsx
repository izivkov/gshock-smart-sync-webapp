"use client"

import { Select as MuiSelect, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useEffect, useState } from "react";

interface AppSelectProps {
  label?: string;
  value?: string;
  items: string[];
  className?: string;
  onSelected: (e: any) => void;
}

const AppSelect: React.FC<AppSelectProps> = ({ label, items, value, className, onSelected }) => {
  const [selectedOption, setSelectedOption] = useState(value ?? '');

  useEffect(() => {
    setSelectedOption(value ?? '');
  }, [value]);

  const handleChange = (e: any) => {
    setSelectedOption(e.target.value);
    onSelected(e.target.value);
  };

  return (
    <FormControl size="small" className={className} sx={{ minWidth: 120 }}>
      {label && <InputLabel>{label}</InputLabel>}
      <MuiSelect value={selectedOption} onChange={handleChange} label={label}>
        {items.map((item, index) => (
          <MenuItem key={index} value={item}>{item}</MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

export default AppSelect;
