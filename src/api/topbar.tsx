import { Renderable } from "@utils/types";

const topbarElements = new Map<string, Renderable>();

export const _injectTopbarElements = (children: React.ReactNode[]) => {
    for (const [id, Element] of topbarElements) {
        children.push(
            <Element data-plugin={id} />
        );
    }
    return children;
};

export const addTopbarElement = (id: string, renderable: Renderable) => topbarElements.set(id, renderable);
export const removeTopbarElement = (id: string) => topbarElements.delete(id);
