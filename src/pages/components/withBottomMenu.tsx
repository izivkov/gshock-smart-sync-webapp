// withBottomMenu.tsx
import React from 'react';
import BottomMenuApp from './BottomMenuApp';

const withBottomMenu = (WrappedComponent: React.ComponentType) => {

    const ComponentWithMenu = (props: any) => {
        return (
            <div>
                <WrappedComponent {...props} />
                <BottomMenuApp {...props} />
            </div>
        );
    };
    ComponentWithMenu.displayName = `withBottomMenu(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return ComponentWithMenu;
};

export default withBottomMenu;
