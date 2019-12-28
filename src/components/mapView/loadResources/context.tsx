import { Resources } from './loaders';
import React, { createContext, useContext } from 'react';

export const ResourcesContext = createContext<Resources | null>(null);

export interface WithResources {
    resources: Resources;
}

export function withResources<TProps extends WithResources>(WrappedComponent: React.ComponentType<TProps>) {
    return (props: Omit<TProps, keyof WithResources>) => {
        const resources = useContext(ResourcesContext);
        if (!resources) return null;
        return <WrappedComponent { ...props as any } resources={ resources }/>
    };
}
