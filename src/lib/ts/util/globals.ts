import { Piano } from "../models/piano";
import { PianoKeys } from "../views/pianoKeys";
import { PianoRoll } from "../views/pianoRoll";
// import { PianoSynth } from "../audio/pianoSynth";
import { PianoSampler } from "../audio/pianoSampler";
import { Instrument } from "../audio/Instrument";

export const piano: Piano = new Piano();
export const pianoRoll: PianoRoll = new PianoRoll(piano);
export const pianoKeys: PianoKeys = new PianoKeys(piano);
export const instrument: Instrument = new PianoSampler(piano);

let midiConnected: boolean = false;
export const setMidiConnected = (v: boolean) => midiConnected = v;
export const isMidiConnected = () => midiConnected;

let audioContext: AudioContext | null = null;
export const setAudioContext = (ac: AudioContext) => audioContext = ac;
export const getAudioContext = () => audioContext;
