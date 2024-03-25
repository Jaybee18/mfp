import { type Writable, writable, type Subscriber } from "svelte/store";

export type Config = {
    speedFactor: number,
    drawNoteLabels: boolean,
    drawBeatLabels: boolean,
    drawBeatLines: boolean,
    playNotes: boolean,
    stopUntilNotePress: boolean,
}

let defaultConfig: Writable<Config> = writable({
    speedFactor: 1,
    drawNoteLabels: false,
    drawBeatLabels: false,
    drawBeatLines: true,
    playNotes: false,
    stopUntilNotePress: false,
});

export function subscribeToConfig(func: Subscriber<Config>) {
    defaultConfig.subscribe(func);
};

export default defaultConfig;
