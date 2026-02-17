"use client"

import React, { useState, useEffect, ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';
import { Divider } from '@mui/material';

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
        <Card className={`${className}`} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box className={`${classNameHeader}`} sx={{ p: 4, display: 'flex', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.02)' }}>
                {header}
            </Box>
            <Divider />
            <CardContent className={`${classNameBody}`} sx={{ p: 4, flexGrow: 1 }}>
                {body}
            </CardContent>
            {footer && (
                <>
                    <Divider sx={{ mx: 2 }} />
                    <CardActions className={`${classNameFooter}`} sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                        {footer}
                    </CardActions>
                </>
            )}
        </Card>
    );
}

export default AppCard;