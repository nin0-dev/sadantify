/**
 * Modified version of Vendicated's react.mjs
 * @link https://github.com/Vendicated/Vencord/blob/main/scripts/build/inject/react.mjs
 */

export const ExtendifyFragment = /* #__PURE__*/ Symbol.for("react.fragment");
export let ExtendifyCreateElement = (...args) => {
    if (!Extendify) {
        setTimeout(() => ExtendifyCreateElement(...args), 100);
        return;
    }
    return (ExtendifyCreateElement =
        Extendify.Webpack.Common.React.createElement)(...args);
};
