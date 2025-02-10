import { access } from "fs/promises";
import { constants } from "fs";

export async function exists(path) {
    return await access(path, constants.F_OK).then(() => true).catch(() => false);
}
