declare module 'fitty'{

    export interface Options
    { minSize: number
        ; maxSize: number
        ; multiLine: boolean
        ; observeMutations:
            { subtree?: boolean
                ; childList?: boolean
                ; characterData?: boolean
            }
    }
    export interface Fitted
    { fit: () => void
        ; unsubscribe: () => void
        ; element: HTMLElement
    }
    export interface Fitty
    { ( el: string | HTMLElement , opts?: Partial<Options> ): Fitted
        ; observeWindow: boolean
        ; observeWindowDelay: number
        ; fitAll: () => void
    }

    export const fitty:Fitty
    export default fitty
}
