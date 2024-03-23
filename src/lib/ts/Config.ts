import { type Writable, writable } from "svelte/store";

type Config = {
    speedFactor: number,
    drawNoteLabels: boolean,
    drawBeatLabels: boolean,
    drawBeatLines: boolean,
    playNotesSounds: boolean,
    playNotesOnKeyboard: boolean,
}

let defaultConfig: Writable<Config> = writable({
    speedFactor: 1,
    drawNoteLabels: false,
    drawBeatLabels: false,
    drawBeatLines: true,
    playNotesSounds: false,
    playNotesOnKeyboard: true
});
defaultConfig.subscribe((v) => {
    console.log("config value changed!", v);
})
export default defaultConfig;
