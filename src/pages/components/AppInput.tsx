"use client"

import { Input } from "@material-tailwind/react";

interface AppInputProps {
  label?: string;
  type?: string;
  onChange?: (e: any) => void;
}

const AppInput: React.FC<AppInputProps> = ({ label, type, onChange }) => {
  return (
    <div className="w-72">
      <Input type={type} label={label} onChange={onChange}></Input>
    </div>
  )
}

export default AppInput;
