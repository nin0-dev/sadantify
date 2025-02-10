/**
 * Copy of Vendicated's checkNodeVersion.js
 * @link https://github.com/Vendicated/Vencord/blob/main/scripts/checkNodeVersion.js
 */

if (Number(process.versions.node.split(".")[0]) < 18) {
    throw `Your node version (${process.version}) is too old, please update to v18 or higher https://nodejs.org/en/download/`;
}
