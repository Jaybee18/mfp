import type { Piano } from '../models/piano';
import { MidiNoteOff, MidiNoteOn } from '../constants/constants';
import { type PolySynth } from 'tone';
import { midiNumberToNote } from '../util/Midi';
import { Instrument } from './Instrument';

export class PianoSynth extends Instrument {

    private synth: PolySynth | null = null;
    private piano: Piano;

    constructor(piano: Piano) {
        super();

        this.piano = piano;
    }

    public setSynth(synth: PolySynth) {
        this.synth = synth;
    }

    public midiEvent(e: MIDIMessageEvent) {
        if (e.data[0] === MidiNoteOn) {
            this.playNote(e.data[1]);
        } else if (e.data[0] === MidiNoteOff) {
            //this.releaseNote(e.data[1]);
        }
    }

    public playNote(midi: number) {
        const noteName = midiNumberToNote(midi, (n, o) => {
            return n + o;
        })

        this.synth?.triggerAttackRelease(noteName, "8n");
    }
}