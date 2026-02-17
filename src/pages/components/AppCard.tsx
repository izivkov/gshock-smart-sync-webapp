"use client"

import React, { useState, useEffect, ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';

interface AppCardProps {
    className?: string;
    classNameHeader?: string;
    classNameBody?: string;
    classNameFooter?: string;
    header: ReactNode;
    body: ReactNode;
    footer: ReactNode;
}

const AppCard: React.FC<AppCardProps> = ({ header, body, footer, classNameHeader, classNameBody, classNameFooter, className = "mt-6 w-full max-w-lg" }) => {

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <Card className={`${className} glass-card overflow-hidden`} sx={{ background: 'transparent', boxShadow: 'none', border: 'none' }}>
            <Box className={`${classNameHeader} p-8 flex justify-center bg-white/10`}>
                {header}
            </Box>
            <CardContent className={`${classNameBody} p-8`}>
                {body}
            </CardContent>
            <CardActions className={`${classNameFooter} p-8 pt-0 flex justify-center`}>
                {footer}
            </CardActions>
        </Card>
    );
}

export default AppCard;