// withBottomMenu.tsx
import React from 'react';
import BottomMenuApp from './BottomMenuApp';

const withBottomMenu = (WrappedComponent: React.ComponentType) => {

    return (props: any) => {
        return (
            <div>
                <WrappedComponent {...props} />
                <BottomMenuApp {...props} />
            </div>
        );
    };
};

export default withBottomMenu;
