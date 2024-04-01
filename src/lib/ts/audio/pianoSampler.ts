import type { Piano } from '../models/piano';
import { MidiNoteOff, MidiNoteOn } from '../constants/constants';
import { midiNumberToNote } from '../util/Midi';
import { Instrument } from './Instrument';
import defaultConfig from '../util/Config';

export class PianoSampler extends Instrument {

    private piano: Piano;
    private volume: number = 0;

    constructor(piano: Piano) {
        super();

        this.piano = piano;

        defaultConfig.subscribe(v => {
            this.volume = v.volume;
        });
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

        const audio = new Audio("samples/mp3/" + noteName + ".mp3");
        audio.volume = this.volume;
        audio.play();
    }
}