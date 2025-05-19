function replaceAdd(content: string, find: string, add: string) {
    return content.replace(find, find + add);
}

/**
 * Exposes the webpack module cache.
 */
function exposeModuleCache(content: string) {
    return replaceAdd(
        content,
        "__webpack_require__.m=__webpack_modules__,",
        "__webpack_require__.c=__webpack_module_cache__,"
    );
}

/**
 * Exposes the private iife module that's buried in Spotify's webpack initializer.
 */
function exposePrivateModule(content: string) {
    return replaceAdd(content, "var __webpack_exports__={};(", "__webpack_require__.iife=")
        .replace(
            // Makes the wreq instance accessible to the private module
            ".iife=()",
            ".iife=(__webpack_require__)"
        )
        .replace(
            // Prevents the private iife module from being called.
            // We do this because we want to patch this module, but we can only patch it when our plugins have been initialized.
            // We prevent it from initializing at startup and then initialize it ourselves when we do our webpack patching.
            "})(),__webpack_exports__=",
            "}),__webpack_exports__="
        );
}

let parserPromise: Promise<any>;

async function getParser(): Promise<any> {
    if (parserPromise) {
        return parserPromise;
    }

    return (parserPromise = (async () => {
        const [{ Parser }, classFields, privateMethods] = await Promise.all([
            // @ts-ignore
            import("https://esm.sh/acorn"),
            // @ts-ignore
            import("https://esm.sh/acorn-class-fields").then((m) => m.default),
            // @ts-ignore
            import("https://esm.sh/acorn-private-methods").then((m) => m.default)
        ]);

        return Parser.extend(classFields, privateMethods);
    })());
}

export async function injectExporter() {
    const code: string = arguments[3];

    try {
        const tree = (await getParser()).parse(code, {
            ecmaVersion: "latest"
        });
        const customExport = {};

        for (const element of tree.body[0].body) {
            if (element.type === "FunctionDeclaration") {
                if (element.id && element.id.name) {
                    customExport[`extendifyExport${Object.keys(customExport).length}`] = () =>
                        arguments[4](element.id.name);
                }
            }
        }

        arguments[2].d(arguments[1], customExport);
    } catch (e) {
        console.log(code);
        throw e;
    }
}

function exportAllFunctions(content: string) {
    const regex = /([{,][0-9]+):(\(.*?\))=>{/g;
    return content.replace(regex, (_, prefix, middle) => {
        return `${prefix}${middle}{Extendify.Webpack.injectExporter(...arguments, (v) => eval(v));`;
    });
}

export async function loadScript(name: string) {
    let r = `// Original name: ${name}\n${await (await fetch(name)).text()}`;
    [exposeModuleCache, exposePrivateModule, exportAllFunctions].forEach((f) => (r = f(r)));

    // if (IS_DEV) {
    //     const sourceMap = {
    //         version: 3,
    //         file: name,
    //         sources: [name],
    //         sourcesContent: [r],
    //         names: [],
    //         mappings: ""
    //     };
    //     const encodedMap = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
    //     r += `\n//# sourceMappingURL=data:application/json;base64,${encodedMap}`;
    // }

    const script = document.createElement("script");
    script.src = URL.createObjectURL(new Blob([r], { type: "script/js" }));

    document.body.appendChild(script);
}
