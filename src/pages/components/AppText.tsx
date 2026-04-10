"use client"

import { Typography } from "@mui/material";
import { useEffect, useState } from "react";

interface TextProps {
  text: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline';
  disabled?: boolean;
  className?: string;
}

const AppText: React.FC<TextProps> = ({ text, variant = 'body1', disabled, className }) => {
  const [textValue, setTextValue] = useState(text);

  useEffect(() => {
    setTextValue(text);
  }, [text]);

  return (
    <Typography
      variant={variant}
      className={className}
      sx={{ fontWeight: 500, color: 'inherit', opacity: disabled ? 0.5 : 1 }}
    >
      {textValue}
    </Typography>
  )
}

export default AppText;
