

import React, { useState, useEffect, ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';

const defaultCustomCardStyle = {
    display: 'inline-block',
    maxWidth: '100%',
    margin: 10,
    paddingTop: 30,
    paddingBottom: 6,
    paddingRight: 10,
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: "2px solid gray",
};

const classNameDefault = "mt-6 w-96";

interface AppCardProps {
    className?: string;
    customCardStyle?: React.CSSProperties;
    classNameHeader?: string;
    classNameBody?: string;
    classNameFooter?: string;
    header: ReactNode;
    body: ReactNode;
    footer: ReactNode;
}

const AppCard: React.FC<AppCardProps> = ({ header, body, footer, classNameHeader, classNameBody, classNameFooter, className = classNameDefault, customCardStyle = defaultCustomCardStyle }) => {

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <Card className={className} style={customCardStyle}>
            <Box className={classNameHeader}>
                {header}
            </Box>
            <CardContent className={classNameBody}>
                {body}
            </CardContent>
            <CardActions className={classNameFooter}>
                {footer}
            </CardActions>
        </Card>
    );
}

export default AppCard;