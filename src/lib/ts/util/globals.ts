import { Piano } from "../piano";
import { PianoKeys } from "../pianoKeys";
import { PianoRoll } from "../pianoRoll";
import { PianoSynth } from "../audio/pianoSynth";

export const piano: Piano = new Piano(5);
export const pianoRoll: PianoRoll = new PianoRoll(piano);
export const pianoKeys: PianoKeys = new PianoKeys(piano);
export const pianoSynth: PianoSynth = new PianoSynth(piano);