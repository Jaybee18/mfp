import { type Writable, writable, type Subscriber } from "svelte/store";

export type Config = {
    speedFactor: number,
    drawNoteLabels: boolean,
    drawBeatLabels: boolean,
    drawBeatLines: boolean,
    playNotes: boolean,
    stopUntilNotePress: boolean,
    numOctaves: number,
}

let defaultConfig: Writable<Config> = writable({
    speedFactor: 1,
    drawNoteLabels: false,
    drawBeatLabels: false,
    drawBeatLines: true,
    playNotes: false,
    stopUntilNotePress: false,
    numOctaves: 5,
});

export function subscribeToConfig(func: Subscriber<Config>) {
    defaultConfig.subscribe(func);
};

export default defaultConfig;
