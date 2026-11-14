import React from 'react';
import { WatchFeatureManager, FeatureId, CardId } from '@/utils/WatchFeatureManager';
import { useSessionState } from '@/session/useSessionState';
import { Box, Card, Typography, alpha } from '@mui/material';
import { PEACH_BORDER, PEACH_SHADOW, PEACH_SURFACE } from '../theme/peachCardStyles';

export const useWatchFeatures = () => {
    // Feature support depends on the connected model: re-evaluate whenever the session reports a change.
    const { watch, isSetupComplete, phase } = useSessionState();
    const refresh = `${watch.name}|${watch.model}|${isSetupComplete}|${phase.kind}`;

    const isFeatureSupported = React.useCallback((id: FeatureId | CardId) => WatchFeatureManager.isFeatureSupported(id), [refresh]);
    const isCardSupported = React.useCallback((id: CardId) => WatchFeatureManager.isCardSupported(id), [refresh]);

    return React.useMemo(() => ({
        isFeatureSupported,
        isCardSupported,
    }), [isFeatureSupported, isCardSupported]);
};

interface WatchFeatureProps {
    id: FeatureId | CardId;
    children: React.ReactNode;
}

export const WatchFeature: React.FC<WatchFeatureProps> = ({ id, children }) => {
    const { isFeatureSupported } = useWatchFeatures();

    if (!isFeatureSupported(id)) {
        return null;
    }

    return <>{children}</>;
};

interface WatchAppCardProps {
    id: CardId;
    title?: string;
    children: React.ReactNode;
}

export const WatchAppCard: React.FC<WatchAppCardProps> = ({ id, title, children }) => {
    const { isCardSupported } = useWatchFeatures();
    const isSupported = isCardSupported(id);

    return (
        <Card sx={{
            mb: 2,
            borderRadius: '20px',
            overflow: 'hidden',
            bgcolor: PEACH_SURFACE,
            border: PEACH_BORDER,
            boxShadow: PEACH_SHADOW,
            p: 1,
            position: 'relative',
            opacity: isSupported ? 1 : 0.6,
            minHeight: isSupported ? 'auto' : 120
        }}>
            {title && (
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B5E3C', textTransform: 'uppercase', px: 2.5, pt: 1, display: 'block' }}>
                    {title}
                </Typography>
            )}

            {isSupported ? (
                children
            ) : (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 80,
                    color: alpha('#8B5E3C', 0.5)
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>N/A</Typography>
                </Box>
            )}
        </Card>
    );
};
