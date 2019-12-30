declare module 'react-textfit' {
    export interface Props {
        mode?: 'single' | 'multi';
        forceSingleModeWidth?: boolean;
        min?: number;
        max?: number;
        throttle?: number;
        onReady?: () => void;
        children: string;
    }
    export default class TextFit extends React.Component<Props> {

    }
}
