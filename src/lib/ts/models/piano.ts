import defaultConfig from "../util/Config";
import { MidiNoteOff, MidiNoteOn, middleCMidiNumber } from "../constants/constants";

// get middle c index relative to octave number (including sharp keys)
function getMiddleCIndex(octaves: number) {
    switch (octaves) {
        case 1:
            return 0
        case 2:
        case 3:
            return 12;
        case 4:
        case 5:
            return 24;
        case 6:
            return 36;
        case 7:
            return 48;
        default:
            return -1;
    }
}

export class Piano {
    private numKeys: number = 0;
    private numOctaves: number = 0;
    private numNaturalKeys: number = 0;
    private middleCIndex: number = 0;
    private leftMostKeyMidi: number = 0;

    private pressedNotes: number[] = [];
    private onNoteListeners: ((midi: number, release: boolean) => void)[] = [];

    private subscribers: (() => void)[] = [];

    constructor() {
        defaultConfig.subscribe((v) => {
            this.numKeys = 12 * v.numOctaves + 1;
            this.numOctaves = v.numOctaves;
            this.numNaturalKeys = 7 * v.numOctaves + 1;
            this.middleCIndex = getMiddleCIndex(v.numOctaves);
            this.leftMostKeyMidi = middleCMidiNumber - this.middleCIndex;

            this.subscribers.forEach(fn => fn());
        });

    }

    public subscribe(fn: () => void) {
        this.subscribers.push(fn);
    }

    public getNumNaturalKeys() {
        return this.numNaturalKeys;
    }

    public getLeftMostMidiKey() {
        return this.leftMostKeyMidi;
    }

    public isNoteNatural(midi: number) {
        const relativeIndex = midi % 12;
        switch (relativeIndex) {
            case 1:
            case 3:
            case 6:
            case 8:
            case 10:
                return false;
            default:
                return true;
        }
    }

    public midiEvent(e: MIDIMessageEvent) {
        if (e.data[0] === MidiNoteOn) {
            this.press(e.data[1]);
        } else if (e.data[0] === MidiNoteOff) {
            this.release(e.data[1]);
        }
    }

    public isNoteDown(midi: number) {
        return this.pressedNotes.indexOf(midi) !== -1;
    }

    public getMidiAtIndex(index: number) {
        return this.leftMostKeyMidi + index;
    }

    public press(midi: number) {
        if (!this.isNoteDown(midi)) {
            this.pressedNotes.push(midi);
            this.onNoteListeners.forEach(listener => listener(midi, false));
        }
    }

    public release(midi: number) {
        if (this.isNoteDown(midi)) {
            this.pressedNotes.splice(this.pressedNotes.indexOf(midi), 1);
            this.onNoteListeners.forEach(listener => listener(midi, true));
        }
    }

    public releaseAll() {
        while (this.pressedNotes.length !== 0) {
            this.release(this.pressedNotes[0]);
        }
    }

    public reset() {
        this.releaseAll();
    }

    public addOnNoteListener(listener: (midi: number, release: boolean) => void) {
        this.onNoteListeners.push(listener);
    }

    public getOctaves() {
        return this.numOctaves;
    }
}