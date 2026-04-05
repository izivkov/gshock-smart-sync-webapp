"use client"

// components/BottomNavigationMenu.js
import { useRouter } from 'next/router';
import { Card, Typography } from '@material-tailwind/react';

interface MenuItemProps {
    title: string;
    description: string;
    icon: any
}

const MenuItemApp: React.FC<MenuItemProps> = ({ title, description, icon }) => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center p-2 rounded-xl transition-all hover:bg-white/10 text-white">
            <div className="text-2xl mb-1 opacity-90">
                {icon}
            </div>
            <Typography variant="h6" className="font-bold text-sm">
                {title}
            </Typography>
            <Typography variant="caption" className="opacity-60 text-[10px] text-center hidden md:block">
                {description}
            </Typography>
        </div>
    );
};

export default MenuItemApp;
