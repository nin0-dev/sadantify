/**
 * Copy of Vendicated's react.ts
 * @link https://github.com/Vendicated/Vencord/blob/main/src/webpack/common/react.ts
 */

import { findByPropsLazy, waitFor } from "../webpack";

export let React: typeof import("react");
export let useState: typeof React.useState;
export let useEffect: typeof React.useEffect;
export let useLayoutEffect: typeof React.useLayoutEffect;
export let useMemo: typeof React.useMemo;
export let useRef: typeof React.useRef;
export let useReducer: typeof React.useReducer;
export let useCallback: typeof React.useCallback;

export const ReactDOM: typeof import("react-dom") &
    typeof import("react-dom/client") = findByPropsLazy(
    "createPortal",
    "render"
);

waitFor("useState", (m) => {
    React = m;
    ({
        useEffect,
        useState,
        useLayoutEffect,
        useMemo,
        useRef,
        useReducer,
        useCallback
    } = React);
});
