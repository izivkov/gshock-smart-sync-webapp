"use client"

import { Typography } from "@material-tailwind/react";
import { useEffect, useState } from "react";

interface TextProps {
  text: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'lead' | 'paragraph';
  disabled?: boolean
}

const AppText: React.FC<TextProps> = ({ text, variant = 'lead', disabled }) => {
  const [textValue, setTextValue] = useState(text);

  useEffect(() => {
    setTextValue(text);
  }, [text]);

  return (
    <Typography disabled={disabled} variant={variant}>{textValue}</Typography>
  )
}

export default AppText;
