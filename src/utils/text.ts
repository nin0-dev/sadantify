export const textToTitle = (text: string) =>
    text
        .split(/(?=[A-Z])/)
        .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
