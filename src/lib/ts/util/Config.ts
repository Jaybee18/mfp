import { type Writable, writable } from "svelte/store";

export type Config = {
    speedFactor: number,
    drawNoteLabels: boolean,
    drawBeatLabels: boolean,
    drawBeatLines: boolean,
    virtualPiano: boolean,
    stopUntilNotePress: boolean,
    numOctaves: number,
    volume: number,
}

const defaultConfig: Writable<Config> = writable({
    speedFactor: 1,
    drawNoteLabels: false,
    drawBeatLabels: false,
    drawBeatLines: true,
    virtualPiano: false,
    stopUntilNotePress: true,
    numOctaves: 4,
    volume: 0.5,
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

export function setVolume(volume: number): boolean {
    if (volume < 0 || volume > 1) return false;

    defaultConfig.update(v => {
        v.volume = volume;
        return v;
    });

    return true;
}

export default defaultConfig;
