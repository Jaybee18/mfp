/* eslint-disable @typescript-eslint/no-explicit-any */
import { MidiFile } from "./midi-file-parser";

export type Note = {
    midiNumber: number,
    duration: number, // in ticks
    startTime: number, // in ticks

    _isDown: boolean, // always true
}

type MidiEvent = {
    channel: number,
    deltaTime: number,
    noteNumber: number,
    subtype: string,
    type: string,
    velocity: number,
}

type MidiFile = {
    header: {
        formatType: any,
        trackCount: any,
        ticksPerBeat: any,
        timeDivision: any,
        bpm: any,
    };
    tracks: never[][];
}

function parseMidi(parsed: MidiFile) {
    
    console.log(parsed);

    const track: MidiEvent[] = parsed.tracks[0];
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
    track.forEach(event => {
        if (event.subtype !== "noteOn" && event.subtype !== "noteOff") return;

        const lastNote = getLastNote(event.noteNumber);

        time += event.deltaTime;

        if (lastNote === null || !lastNote._isDown) {
            res.push({
                midiNumber: event.noteNumber,
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

export type MidiFileParseResult = {
    ticksPerBeat: number,
    bpm: number,
    trackCount: number,
    timeDivision: number,
    formatType: string,
    length: number, // in ticks
}

export function readMidiFile(file: File, onsuccess: (notes: Note[], res: MidiFileParseResult) => void) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = e.target?.result;

        const midifile = MidiFile(data);
        
        const parsed = parseMidi(midifile);

        const res: MidiFileParseResult = {
            ticksPerBeat: midifile.header.ticksPerBeat,
            bpm: midifile.header.bpm,
            trackCount: midifile.header.trackCount,
            timeDivision: midifile.header.timeDivision,
            formatType: midifile.header.formatType,
            length: getTrackLength(parsed),
        }

        onsuccess(parsed, res);
    }
    if (file !== undefined)
        reader.readAsBinaryString(file);
}

export function midiNumberToNote(midi: number, _format?: (note: string, octave: number) => string) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octaves = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8];

    const octave = Math.floor(midi / 12) - 1;

    if (!(octave in octaves)) {
        console.error("octave ", octave, " not found in valid octaves ", octaves);
        return "";
    }

    if (midi < 0 || midi > 127) {
        console.error("note ", midi, " out of range for 0-127");
        return "";
    }

    const note = notes[midi % 12];

    if (_format !== undefined) {
        return _format(note, octave);
    }

    return note + octave;
}