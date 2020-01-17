import React, { createContext, useContext } from 'react';
import { Strings } from './strings';

export const StringsContext = createContext<Strings | null>(null);

export interface WithStrings {
    strings: Strings;
}

export function withStrings<TProps extends WithStrings>(WrappedComponent: React.ComponentType<TProps>) {
    return (props: Omit<TProps, keyof WithStrings>) => {
        const resources = useContext(StringsContext);
        if (!resources) return null;
        return <WrappedComponent { ...props as any } resources={ resources }/>
    };
}
