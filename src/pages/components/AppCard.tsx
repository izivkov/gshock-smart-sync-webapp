"use client"

import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
} from "@material-tailwind/react";
import { ReactNode } from "react";

import { useState, useEffect } from 'react'

const defaultCustomCardStyle = {
    display: 'inline-block', // Makes the card inline-block
    maxWidth: '80%', // Allows the card to expand up to its parent's width
    margin: 10,
    paddingTop: 30,
    paddingBottom: 6,
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: "2px solid gray",
};

const classNameDefault = "mt-6 w-96"

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

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    return (
        <Card className={className} style={customCardStyle}>
            <div >
                <CardHeader className={classNameHeader}>
                    {header}
                </CardHeader>
            </div>
            <div>
                <CardBody className={classNameBody}>
                    {body}
                </CardBody>
            </div>

            <div>
                <CardFooter className={classNameFooter}>
                    {footer}
                </CardFooter>
            </div>
        </Card>
    );
}

export default AppCard;