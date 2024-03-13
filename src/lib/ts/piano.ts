import { MidiNoteOff, MidiNoteOn, middleCMidiNumber } from "./constants/constants";

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
    public octaves: number;
    
    private numKeys: number;
    private numNaturalKeys: number;
    private middleCIndex: number;
    private leftMostKeyMidi: number;

    private pressedNotes: number[] = [];

    constructor(octaves: number) {
        this.octaves = octaves;

        this.numKeys = 12 * octaves + 1;
        this.numNaturalKeys = 7 * octaves + 1;
        this.middleCIndex = getMiddleCIndex(this.octaves);
        this.leftMostKeyMidi = middleCMidiNumber - this.middleCIndex;
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
            this.pressedNotes.push(e.data[1]);
        } else if (e.data[0] === MidiNoteOff) {
            this.pressedNotes.splice(this.pressedNotes.indexOf(e.data[1]), 1);
        }
    }

    public isNoteDown(midi: number) {
        return this.pressedNotes.indexOf(midi) !== -1;
    }

    public getMidiAtIndex(index: number) {
        return this.leftMostKeyMidi + index;
    }
}