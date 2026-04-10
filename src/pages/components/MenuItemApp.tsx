"use client"

import { useRouter } from 'next/router';
import { Typography } from '@mui/material';

interface MenuItemProps {
    title: string;
    description: string;
    icon: any;
}

const MenuItemApp: React.FC<MenuItemProps> = ({ title, description, icon }) => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center p-2 rounded-xl transition-all hover:bg-white/10 text-white">
            <div className="text-2xl mb-1 opacity-90">
                {icon}
            </div>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                {title}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.625rem', textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
                {description}
            </Typography>
        </div>
    );
};

export default MenuItemApp;
