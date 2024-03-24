import JZZ from 'jzz';
import { Accidental, Dot, Formatter, Modifier, RenderContext, Renderer, Stave, StaveModifier, StaveNote, Voice } from 'vexflow';
import { MidiParser, MIDI, type MIDIEventData, MIDIEventType } from './util/midiParser';
import { Vex } from 'vexflow';

const midiParser = new MidiParser();

// const onMidiIn = (ev: WebMidi.MIDIMessageEvent) => {
//     //console.log(ev);

//     recordedNotes.push(midiToNoteName(ev.data[1]));

//     loadNotes();
// };







// --- midi file drop zone ---
function ticksToMs(bpm: number, ticks: number) {
    return 60000 / (bpm / ticks);
}
type MidiNote = {
    key: number, // midi number of key
    deltaTime: number, // time since last note
    duration: number | null, // duration in ticks
    velocity: number,

    _start: number, // start of the note in ticks
    _isDown: boolean, // don't use this; it will always be true
}
export function onDrop(ev: DragEvent) {
    ev.preventDefault();
    const file = ev.dataTransfer?.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const midiArray = midiParser.parse(e.target?.result);

        if (midiArray instanceof MIDI) {
            const track = midiArray?.track[0]; // read the first track
            const data = track.event; // read the events on the first track

            const notes: MidiNote[] = [];
            const getLastNoteIndex = (midiNote: number) => {
                for (let i = notes.length - 1; i >= 0; i--) {
                    if (notes[i].key == midiNote) {
                        return i;
                    }
                }
                return -1;
            }
            let time = 0; // in ticks
            data.forEach((v: MIDIEventData) => {
                if (v !== undefined) {
                    let note: MidiNote;
                    time += v.deltaTime;
                    if (v.type == MIDIEventType.NoteOn) {
                        note = {
                            key: v.data[0],
                            deltaTime: v.deltaTime,
                            duration: null,
                            velocity: v.data[1],
                            _start: time,
                            _isDown: true,
                        }
                        notes.push(note);
                    } else if (v.type == MIDIEventType.NoteOff) {
                        note = notes[getLastNoteIndex(v.data[0])];
                        note._isDown = false;
                        note.duration = time - note._start;
                    }
                    console.log(v.type)
                }
            });

            // ---
            const sheet = new NoteSheet("notes");
            notes.forEach(note => {
                console.log(midiNumberToNote(note.key), " for ", note.duration, " ticks, at ", note._start);
                if (note.duration !== null)
                    sheet.addNote(note.key, note.duration);
            })
            sheet.draw();
        }
    }
    if (file !== undefined) {
        reader.readAsDataURL(file);
    }
}

export function onDragOver(ev: DragEvent) {
    ev.preventDefault();
}

// ---

type Note = {
    key: string,
    duration: number, // in ticks
}
class NoteSheet {
    private context: RenderContext;
    private notes: Note[][] = [];

    constructor(elementId: string) {
        const canvas = document.getElementById(elementId) as HTMLDivElement;
        const renderer = new Renderer(canvas, Renderer.Backends.SVG);
    
        // Configure the rendering context.
        renderer.resize(500, 500);
        this.context = renderer.getContext();
        this.context.setFont('Arial', 10);
    }

    // note = midi value of note
    // duration = duration of the note in ticks
    addNote(note: number | string, duration: number, attachToLast?: boolean) {
        if (typeof note == "number") {
            note = midiNumberToNote(note, (note, octave) => {
                return note + "/" + octave;
            });
        }

        const n: Note = {
            key: note,
            duration: duration
        }

        if (attachToLast) {
            if (this.notes.length == 0) this.notes.push([]);

            this.notes[this.notes.length-1].push(n);
        }
        else
            this.notes.push([n]);
    }

    // returns base duration in ticks
    private baseDurationFromTicks(ticks: number) {
        let base = 96;
        while (base > 0) {
            //if (base / 2 < ticks) return Math.floor(96 / (base / 2));
            if (base / 2 < ticks) return base / 2;
            base /= 2;
        }
        return 0;
    }

    // returns the duration type of a note like 1: whole, 2: half, 4: quarter
    private ticksToNoteDuration(ticks: number) {
        return Math.floor(96 / ticks);
    }

    private drawStave(notes: Note[], x: number, y: number, w: number, h: number, start?: boolean) {
        const stave = new Stave(x, y, w);
        if (start) {
            stave.addClef("treble");
            stave.addTimeSignature("4/4");
        }
        stave.setContext(this.context);
        stave.draw();

        const formatter = new Formatter();

        console.log("---");
        const voice = new Voice();
        notes.forEach(v => {
            console.log("adding ", v.duration, " // ", this.baseDurationFromTicks(v.duration).toString());
            const baseDuration = this.baseDurationFromTicks(v.duration);
            const tickRemainder = v.duration - baseDuration;
            
            const staveNote = new StaveNote({
                keys: [v.key],
                duration: this.ticksToNoteDuration(this.baseDurationFromTicks(v.duration)).toString()
            })
            
            voice.addTickable(staveNote);

            if (tickRemainder > 0) {
                if (tickRemainder == baseDuration / 2) {
                    staveNote.addModifier(new Dot());
                } else {
                    voice.addTickable(new StaveNote({
                        keys: [v.key],
                        duration: this.ticksToNoteDuration(tickRemainder).toString()
                    }))
                }
            }

        })
        formatter.formatToStave([voice], stave);
        voice.draw(this.context, stave);
    }

    draw() {
        const ticksPerStave = 96;

        const staveWidth = 300;

        let staveCount = 0;

        let ticks = 0;
        const staveNotes = [];
        for (let i = 0; i < this.notes.length || staveCount >= 3; i++) {
            const note = this.notes[i][0];
            if (ticks + note.duration > ticksPerStave) {
                this.drawStave(staveNotes, staveCount * staveWidth, 20, staveWidth, 150, staveCount == 0);
                i--;
                ticks = 0;
                staveCount++;
            } else {
                staveNotes.push(note);
                ticks += note.duration;
            }
        }





        // const stave = new Stave(20, 20, 300);
        // stave.addClef("treble");
        // stave.addTimeSignature("4/4");
        // stave.setContext(this.context);
        // stave.draw();

        // const voice = new Voice({
        //     num_beats: 4,
        //     beat_value: 4
        // });
        // voice.addTickables(this.notes.slice(0, 8).map(v => v[0]));
        // console.log(voice.getTickables());
        // const formatter = new Formatter();
        // formatter.joinVoices([voice]);

        // formatter.formatToStave([voice], stave);

        // voice.draw(this.context, stave);
    }
}

// export function loadNotes() {
//     return;
//     // const vf = new Factory({
//     //     renderer: { elementId: 'notes', width: 500, height: 150 },
//     // });

//     // let stave1 = system
//     //     .addStave({
//     //     voices: [
//     //         score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
//     //         score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
//     //     ],
//     //     })
//     //     .addClef('treble')
//     //     .addTimeSignature('4/4');
    
//     // system.addConnector();

//     // let stave2 = system.addStave({
//     //     voices: [
//     //         score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
//     //         score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
//     //     ],
//     //     });

//     // vf.draw();

//     const canvas = document.getElementById("notes") as HTMLDivElement;
//     const renderer = new Renderer(canvas, Renderer.Backends.SVG);

//     // Configure the rendering context.
//     renderer.resize(500, 500);
//     const context = renderer.getContext();
//     context.setFont('Arial', 10);

//     const VF = Vex.Flow;

//     const stave = new VF.Stave(20, 20, 200);
//     stave.addClef("treble");
//     stave.addTimeSignature("4/4");
//     stave.setContext(context);
//     stave.draw();
    
//     // const notes = [
//     //     // A quarter-note C.
//     //     new VF.StaveNote({clef: "treble", keys: ["c/4"], duration: "q" }),
      
//     //     // A quarter-note D.
//     //     new VF.StaveNote({clef: "treble", keys: ["d/4"], duration: "q" }),
      
//     //     // A quarter-note rest. Note that the key (b/4) specifies the vertical
//     //     // position of the rest.
//     //     new VF.StaveNote({clef: "treble", keys: ["b/4"], duration: "qr" }),
      
//     //     // A C-Major chord.
//     //     new VF.StaveNote({clef: "treble", keys: ["c/4", "e/4", "g/4"], duration: "q" })
//     //   ];
//     const notes: Tickable[] = [];
//     recordedNotes.forEach((v) => {
//         const note = new VF.StaveNote({
//             clef: "treble",
//             keys: [v],
//             duration: "8",
//         });
//         notes.push(note);
//     });
      
//       // Create a voice in 4/4 and add above notes
//       const voice = new VF.Voice({num_beats: 4,  beat_value: 4});
//       voice.addTickables(notes);
      
//       // Format and justify the notes to 400 pixels.
//       const formatter = new VF.Formatter().joinVoices([voice]).format([voice], 100);
      
//       console.log(formatter);

//       // Render voice
//       voice.draw(context, stave);
// }