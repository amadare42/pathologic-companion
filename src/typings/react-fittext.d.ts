declare module '@kennethormandy/react-fittext' {
    export interface Props {
        compressor?: number;
        minFontSize?: number;
        maxFontSize?: number;
        debounce?: number;
        defaultFontSize?: number;
        vertical?: boolean;
        children: string;
    }
    export default class FitText extends React.Component<Props> {

    }
}
