import type { Piano } from '../models/piano';
import { MidiNoteOff, MidiNoteOn } from '../constants/constants';
import { midiNumberToNote } from '../util/Midi';
import { Instrument } from './Instrument';
import defaultConfig from '../util/Config';
import { Howl } from 'howler';

export class PianoSampler extends Instrument {

    private piano: Piano;
    private volume: number = 0;

    private octaves: number = 0;
    private sound: {[name: string] : Howl} = {};

    constructor(piano: Piano) {
        super();

        this.piano = piano;
        this.octaves = this.piano.getOctaves();

        this.reloadSamples();

        defaultConfig.subscribe(v => {
            this.volume = v.volume;
            
            if (this.octaves !== this.piano.getOctaves())
                this.reloadSamples();
        });
    }

    public reloadSamples() {
        for (let i = 0; i < this.piano.getOctaves()*12 + 1; i++) {
            const noteName = midiNumberToNote(this.piano.getMidiAtIndex(i), undefined, true);
            if (["C0", "Db0", "D0", "Eb0", "E0", "F0", "Gb0", "G0", "Ab0"].indexOf(noteName) !== -1) continue;
            this.sound[noteName] = new Howl({src: ["samples/mp3/" + noteName + ".mp3"]});
        }
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

        this.sound[noteName].volume(this.volume);
        this.sound[noteName].play();
    }
}