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
        <div >
            <Card
                shadow={false}
                className="border border-blue-gray-50 py-4 px-5 shadow-xl shadow-transparent transition-all hover:-translate-y-4 hover:border-blue-gray-100/60 hover:shadow-blue-gray-900/5"
            >
                <Typography variant="h5" color="blue-gray" className="mb-3 flex items-center gap-3">
                    {icon}
                    {title}
                </Typography>
                <Typography color="blue-gray" className="font-normal opacity-70">
                    {description}
                </Typography>
            </Card>
        </div>
    );
};

export default MenuItemApp;
