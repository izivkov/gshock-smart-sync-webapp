"use client"

import { Select } from "@material-tailwind/react";
import { Option } from "@material-tailwind/react";
import { useEffect, useState } from "react";

interface AppSelectProps {
  label?: string
  value?: string
  items: string[]
  className?: string
  onSelected: (e: any) => void
}

const AppSelect: React.FC<AppSelectProps> = ({ label, items, value, className, onSelected }) => {

  const [selectedOption, setSelectedOption] = useState(value); // Set the initial selected option
  useEffect(() => {
    setSelectedOption(value);
  })

  const handleChange = (e: any) => {
    setSelectedOption(e);
    onSelected(e);
    console.log(`handleChange: ${e}`)
  };

  return (
    <Select variant="outlined" onChange={handleChange} className={className} label={label} value={selectedOption}>
      {items.map((item, index) => (
        <Option key={index} value={item}>{item}</Option>
      ))}
    </Select>
  )
}

export default AppSelect;
