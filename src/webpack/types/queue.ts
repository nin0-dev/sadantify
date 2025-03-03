import { Song } from "@webpack/types";

export interface QueueState {
    current: Song;
    nextUp: Song[];
    queued: Song[];
}

export enum QueueAction {
    ADD = "add",
    REMOVE = "remove",
    CLEAR = "clear",
    INSERT = "insert",
    REORDER = "reorder"
}
