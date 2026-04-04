"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { dayOfWeekType } from "../reminders/ReminderData";
import Typography from "@mui/material/Typography";

interface AppDayOfWeekPickerProps {
  label: string;
  selectedDays: dayOfWeekType[];
  onChange: (selected: dayOfWeekType[]) => void;
  className?: string;
}

const AppDayOfWeekPicker: React.FC<AppDayOfWeekPickerProps> = ({ 
  label, 
  selectedDays, 
  onChange, 
  className 
}) => {
  const [selectedSet, setSelectedSet] = useState<Set<dayOfWeekType>>(new Set(selectedDays));

  useEffect(() => {
    setSelectedSet(new Set(selectedDays));
  }, [selectedDays]);

  const days: { value: dayOfWeekType; label: string }[] = [
    { value: "MONDAY", label: "M" },
    { value: "TUESDAY", label: "T" },
    { value: "WEDNESDAY", label: "W" },
    { value: "THURSDAY", label: "T" },
    { value: "FRIDAY", label: "F" },
    { value: "SATURDAY", label: "S" },
    { value: "SUNDAY", label: "S" },
  ];

  const toggleDay = (day: dayOfWeekType) => {
    const next = new Set(selectedSet);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
    }
    setSelectedSet(next);
    onChange(Array.from(next.values()));
  };

  return (
    <Box className={className} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {days.map((day, index) => {
          const isSelected = selectedSet.has(day.value);
          return (
            <Chip
              key={index}
              label={day.label}
              onClick={() => toggleDay(day.value)}
              color={isSelected ? "primary" : "default"}
              variant={isSelected ? "filled" : "outlined"}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                '& .MuiChip-label': {
                  padding: 0,
                }
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default AppDayOfWeekPicker;
