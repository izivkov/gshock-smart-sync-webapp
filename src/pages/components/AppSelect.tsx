"use client"

import { Select } from "@material-tailwind/react";
import { Option } from "@material-tailwind/react";

interface AppSelectProps {
  label?: string
  value?: string
  items: string[];
}

const AppSelect: React.FC<AppSelectProps> = ({ label, items, value }) => {
  return (
    <Select variant="outlined" label={label}>
      {items.map((item, index) => (
        <Option>{item}</Option>
      ))}
    </Select>
  )
}

export default AppSelect;
