import React, { Component } from 'react';

export type Story<StateKey extends string> = {
    [key in StateKey]: (set: (key: StateKey) => void) => React.ReactNode
}



export function storyBoard<StateKey extends string>(story: Story<StateKey>) {

}
