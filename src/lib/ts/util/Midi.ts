import { MIDI, MidiParser, type MIDIEventData, MIDIEventType } from "./midiParser";

export class Midi {
    private _trackCount: number = 0;
    private _trackLength: number = 0;
    private _bpm: number = 0;
    private _timeDivision: number = 0;
    private _formatType: number = 0;
    private _ticksPerBeat: number = 0;

    private _tracks: Note[][] = [];

    constructor() {}

    public async readBlob(blob: Blob) {
        const midiFileParser = new MidiParser();
        const tmp = midiFileParser.parse(new Uint8Array(await blob.arrayBuffer()));
        if (!tmp) return;
        this.read(tmp as MIDI);
    }

    public async readFile(file: File) {
        if (file === undefined) return;
        const midiFileParser = new MidiParser();
        const tmp = midiFileParser.parse(new Uint8Array(await file.arrayBuffer()));
        if (!tmp) return;
        this.read(tmp as MIDI);
    }

    private async read(midi: MIDI) {
        
        if (!midi) {
            console.log("failed to parse midi");
            return;
        }

        const res = parseMidi(midi.track);

        this._trackCount = midi.tracks;
        this._trackLength = getTrackLength(res);
        this._bpm = midi.bpm;
        if (typeof midi.timeDivision === "number")
            this._timeDivision = midi.timeDivision as number;
        this._formatType = midi.formatType;
        this._tracks.push(res);
        if (typeof midi.timeDivision === "number")
            this._ticksPerBeat = midi.timeDivision as number;

        console.log(this)
    }

    public getTracks() {
        return this._tracks;
    }

    public getTrack(index: number) {
        if (index >= 0 && index < this._tracks.length)
            return this._tracks[index];
        return [];
    }

    public get trackCount(): number {
        return this._trackCount;
    }

    public get trackLength(): number {
        return this._trackLength;
    }

    public get bpm(): number {
        return this._bpm;
    }

    public get timeDivision(): number {
        return this._timeDivision;
    }

    public get formatType(): number {
        return this._formatType;
    }

    public get ticksPerBeat(): number {
        return this._ticksPerBeat;
    }
}

export type Note = {
    midiNumber: number,
    duration: number, // in ticks
    startTime: number, // in ticks

    _isDown: boolean, // always false
}

function parseMidi(tracks: Array<{event: MIDIEventData[]}>): Note[] {
    const track = tracks[0];
    const res: Note[] = [];

    const getLastNote = (midiNumber: number): Note | null => {
        if (res.length == 0) return null;
        for (let i = res.length - 1; i >= 0; i--) {
            if (res[i].midiNumber == midiNumber) return res[i];
        }
        return null;
    }

    // further parse the midi data to add duration information
    let time = 0;
    track.event.forEach(event => {
        if (event.type !== MIDIEventType.NoteOn && event.type !== MIDIEventType.NoteOff) return;

        const lastNote = getLastNote(event.data[0]);

        time += event.deltaTime;

        if (lastNote === null || !lastNote._isDown) {
            res.push({
                midiNumber: event.data[0],
                duration: -1,
                startTime: time,
                _isDown: true,
            });
        } else if (lastNote._isDown) {
            lastNote._isDown = false;
            lastNote.duration = time - lastNote.startTime;
        } else {
            console.log("not good");
        }
    });

    return res;
}

function getTrackLength(track: Note[]) {
    let latestNote = track[0];
    track.forEach(note => {
        if (note.startTime > latestNote.startTime) latestNote = note;
    });
    return latestNote.startTime + latestNote.duration;
}
