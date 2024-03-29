import { type Writable, writable, type Subscriber } from "svelte/store";

export type Config = {
    speedFactor: number,
    drawNoteLabels: boolean,
    drawBeatLabels: boolean,
    drawBeatLines: boolean,
    virtualPiano: boolean,
    stopUntilNotePress: boolean,
    numOctaves: number,
}

let defaultConfig: Writable<Config> = writable({
    speedFactor: 1,
    drawNoteLabels: false,
    drawBeatLabels: false,
    drawBeatLines: true,
    virtualPiano: false,
    stopUntilNotePress: false,
    numOctaves: 5,
});

export function setSpeedFactor(factor: number): boolean {
    if (factor <= 0 || factor > 15) return false;

    defaultConfig.update(v => {
        v.speedFactor = factor;
        return v;
    });

    return true;
}

export function setDrawNoteLabels(draw: boolean): boolean {
    defaultConfig.update(v => {
        v.drawNoteLabels = draw;
        return v;
    });

    return true;
}

export function setDrawBeatLabels(draw: boolean): boolean {
    defaultConfig.update(v => {
        v.drawBeatLabels = draw;
        return v;
    });

    return true;
}

export function setDrawBeatLines(draw: boolean): boolean {
    defaultConfig.update(v => {
        v.drawBeatLines = draw;
        return v;
    });

    return true;
}

export function setVirtualPiano(enabled: boolean): boolean {
    defaultConfig.update(v => {
        v.virtualPiano = enabled;
        return v;
    });

    return true;
}

export function setWaitForNotePress(enabled: boolean): boolean {
    defaultConfig.update(v => {
        v.stopUntilNotePress = enabled;
        return v;
    });

    return true;
}

export function setNumOctaves(num: number): boolean {
    if (num < 1 || num > 7) return false;

    defaultConfig.update(v => {
        v.numOctaves = num;
        return v;
    });

    return true;
}

export default defaultConfig;
