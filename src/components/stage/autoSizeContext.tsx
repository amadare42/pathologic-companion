import React, { useContext } from 'react';
import { Size } from 'react-virtualized';

export const AutosizeContext = React.createContext<Size>({ width: 0, height: 0 });

export interface WithSize {
    size: Size;
}

export function withSize<TProps extends WithSize>(WrappedComponent: React.ComponentType<TProps>) {
    return (props: Omit<TProps, keyof WithSize>) => {
        const size = useContext(AutosizeContext);
        if (!size) return null;
        return <WrappedComponent { ...props as any } size={ size }/>
    }
}
