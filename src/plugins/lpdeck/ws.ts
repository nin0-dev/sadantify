import { Logger } from "@utils/logger";
import { playback, player } from "@webpack/common";
import { Repeat } from "@webpack/types";

export class ReconnectableWebSocket {
    readonly url: string;
    readonly retryInterval: number;
    private reconnectLoopId: number;
    private forceDisconnect: boolean;
    socket: WebSocket | null;
    logger: Logger;

    constructor() {
        this.url = "ws://127.0.0.1:7542";
        this.retryInterval = 5000;
        this.reconnectLoopId = -1;
        this.forceDisconnect = false;
        this.socket = null;
        this.logger = new Logger("Lpdeck WS");
    }

    connect() {
        this.logger.info(`Attempting to connect to ${this.url}`);
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            this.logger.info("WebSocket connection established");
            this.socket?.send(
                JSON.stringify({
                    target: "spotify",
                    type: "target"
                })
            );
            this.sendPlayerData();
            if (this.reconnectLoopId !== -1) {
                clearInterval(this.reconnectLoopId);
                this.reconnectLoopId = -1;
            }
        };
        this.socket.onmessage = async (msg: MessageEvent<string>) => {
            await this.handleCommand(msg.data.toLowerCase());
        };
        this.socket.onclose = () => {
            if (!this.forceDisconnect) {
                this.logger.warn("WebSocket closed. Reconnecting...");
                if (this.reconnectLoopId === -1) {
                    this.reconnectLoopId = setInterval(() => this.connect(), this.retryInterval) as unknown as number;
                }
            }
            this.forceDisconnect = false;
        };
        this.socket.onerror = () => {
            this.logger.error("WebSocket error. Reconnecting...");
            this.socket?.close();
        };
    }

    disconnect() {
        this.forceDisconnect = true;
        this.socket?.close();
        this.logger.info("Disconnected WebSocket");
    }

    async handleCommand(command: string) {
        this.logger.info("Got command: " + command);

        switch (command) {
            case "toggle_play":
                player.getState().isPaused ? await player.resume() : await player.pause();
                break;
            case "previous":
                if (player.getState().positionAsOfTimestamp > 5 * 1000) {
                    await player.seekTo(0);
                } else {
                    await player.skipToPrevious();
                }
                break;
            case "next":
                await player.skipToNext();
                break;
            case "toggle_shuffle":
                await player.setShuffle(!player.getState().shuffle);
                break;
            case "toggle_repeat":
                await player.setRepeat(player.getState().repeat === Repeat.SONG ? Repeat.CONTEXT : Repeat.SONG);
                break;
            case "lower_volume":
                playback.setVolume(Math.max((await playback.getVolume()) - 0.05));
                break;
            case "increase_volume":
                playback.setVolume(Math.min(1, (await playback.getVolume()) + 0.05));
                break;
        }

        this.sendPlayerData();
    }

    sendPlayerData() {
        if (!this.socket || this.socket?.readyState !== WebSocket.OPEN || !player.getState()) {
            return;
        }
        this.socket?.send(
            JSON.stringify({
                target: "spotify",
                type: "sync",
                data: {
                    playing: !player.getState().isPaused,
                    shuffle: player.getState().shuffle,
                    repeat: player.getState().repeat === 2
                }
            })
        );
    }
}
