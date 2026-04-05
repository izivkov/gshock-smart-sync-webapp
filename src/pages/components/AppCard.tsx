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
        <Card className={`${className}`} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {header && (
                <>
                    <Box className={`${classNameHeader}`} sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'center' }}>
                        {header}
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(139,94,60,0.10)' }} />
                </>
            )}
            <CardContent className={`${classNameBody}`} sx={{ px: 3, py: 2, flexGrow: 1, '&:last-child': { pb: 2 } }}>
                {body}
            </CardContent>
            {footer && (
                <>
                    <Divider sx={{ mx: 2, borderColor: 'rgba(139,94,60,0.10)' }} />
                    <CardActions className={`${classNameFooter}`} sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'center' }}>
                        {footer}
                    </CardActions>
                </>
            )}
        </Card>
    );
}

export default AppCard;