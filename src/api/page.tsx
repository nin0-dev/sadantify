import { Renderable } from "@utils/types";
import { findComponentByCode } from "@webpack";
import { platform } from "@webpack/common";

const pages = new Map<string, Renderable>();

export const _injectPages = (children: React.ReactNode[]) => {
    const Route = findComponentByCode(
        /^function [\w$]+\([\w$]+\)\{\(0,[\w$]+\.[\w$]+\)\(\!1\)\}$/
    );
    for (const [path, Element] of pages) {
        children.push(
            <Route
                key={path.replaceAll("/", "_")}
                path={path}
                element={<Element />}
            />
        );
    }
    return children;
};

export const addPage = (route: string, renderable: Renderable) =>
    pages.set(route, renderable);
export const removePage = (route: string) => pages.delete(route);
export const isCustomPage = (
    route: string = platform.getHistory().location.pathname
) => pages.has(route);
