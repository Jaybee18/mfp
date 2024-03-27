import { Piano } from "../piano";
import { PianoKeys } from "../pianoKeys";
import { PianoRoll } from "../pianoRoll";
import { PianoSynth } from "../audio/pianoSynth";
import { PianoSampler } from "../audio/pianoSampler";

export const piano: Piano = new Piano();
export const pianoRoll: PianoRoll = new PianoRoll(piano);
export const pianoKeys: PianoKeys = new PianoKeys(piano);
//export const pianoSynth: PianoSynth = new PianoSynth(piano);
export const pianoSampler: PianoSampler = new PianoSampler(piano);