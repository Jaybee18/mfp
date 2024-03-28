import type { Piano } from '../piano';
import { midiNumberToNote } from '../util/notes';
import { MidiNoteOff, MidiNoteOn } from '../constants/constants';

export class PianoSampler {

    private piano: Piano;

    constructor(piano: Piano) {
        this.piano = piano;
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
        }, true);
        new Audio("samples/mp3/" + noteName + ".mp3").play();
    }
}