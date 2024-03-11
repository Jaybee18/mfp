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

function parseMidi(binaryString: string | ArrayBuffer | null | undefined) {
    const parsed = MidiFile(binaryString);
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

export function readMidiFile(file: File, onsuccess: (notes: Note[]) => void) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = e.target?.result;

        const parsed = parseMidi(data);

        onsuccess(parsed);
    }
    if (file !== undefined)
        reader.readAsBinaryString(file);
}