import type { SxProps, Theme } from "@mui/material/styles";

/** Warm peach surfaces aligned with Android companion screenshots */
export const PEACH_SURFACE = "#FCEEE6";
export const PEACH_BORDER = "1px solid rgba(139, 94, 60, 0.1)";
export const PEACH_SHADOW = "0 2px 12px rgba(139, 94, 60, 0.1)";

export const peachCardSx: SxProps<Theme> = {
    bgcolor: PEACH_SURFACE,
    borderRadius: "20px",
    border: PEACH_BORDER,
    boxShadow: PEACH_SHADOW,
};

export const peachCardCompactSx: SxProps<Theme> = {
    ...peachCardSx,
    borderRadius: "18px",
};
