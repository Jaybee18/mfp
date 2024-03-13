import { highlight, pianoRollFps, sharpKeyWidthFactor } from "./constants/constants";
import type { Note } from "./notes";
import type { Piano } from "./piano";

export class PianoRoll {
    public width: number = 0;
    public height: number = 0;
    public time: number = 0; // in ticks
    public bpm: number = 120;
    public ticksPerBeat: number = 1;
    public viewportTicks: number = 96 * 50;

    private naturalKeyWidth: number = 0;
    private sharpKeyWidth: number = 0;

    private piano: Piano;
    private canvas: HTMLCanvasElement | null = null;

    private notes: Note[] = [];

    private _isPlaying: boolean = false;

    public drawNote: ((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isSharp: boolean) => void) | null = null;

    constructor(piano: Piano, canvas?: HTMLCanvasElement) {
        this.piano = piano;

        if (canvas !== undefined)
            this.setCanvas(canvas);

        this.calculateKeyWidths();
    }

    private calculateKeyWidths() {
        this.naturalKeyWidth = this.width / this.piano.getNumNaturalKeys();
        this.sharpKeyWidth = this.naturalKeyWidth * sharpKeyWidthFactor;
    }

    public setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const { width, height } = canvas.getBoundingClientRect();
        const dpi = window.devicePixelRatio;
        const style_width = getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
        const style_height = getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
        canvas.setAttribute("width", (Number(style_width) * dpi).toString());
        canvas.setAttribute("height", (Number(style_height) * dpi).toString());
        this.width = width;
        this.height = height;

        this.calculateKeyWidths();
    }

    public setNotes(notes: Note[]) {
        this.notes = notes;
    }

    public hasNotes() {
        return this.notes.length !== 0;
    }

    public deltaTime(ticks: number) {
        this.time += ticks;
    }

    public getNoteWidth(midi: number) {
        return this.piano.isNoteNatural(midi) ? this.naturalKeyWidth : this.sharpKeyWidth;
    }

    public getNoteX(midi: number) {
        let res = 0;
        
        const octaveWidth = this.naturalKeyWidth * 7;
        const relativeIndex = midi - this.piano.getLeftMostMidiKey();
        
        const octaves = Math.floor(relativeIndex / 12);
        res += octaves * octaveWidth;

        const remainder = relativeIndex % 12;

        // calculate the naturals in the remainder
        let naturals = 0;
        switch (remainder) {
            case 0:
                naturals = 0;
                break;
            case 1:
                naturals = 1;
                break;
            case 2:
                naturals = 1;
                break;
            case 3:
                naturals = 2;
                break;
            case 4:
                naturals = 2;
                break;
            case 5:
                naturals = 3;
                break;
            case 6:
                naturals = 4;
                break;
            case 7:
                naturals = 4;
                break;
            case 8:
                naturals = 5;
                break;
            case 9:
                naturals = 5;
                break;
            case 10:
                naturals = 6;
                break;
            case 11:
                naturals = 6;
                break;
            default:
                break;
        }

        res += naturals * this.naturalKeyWidth;

        if (!this.piano.isNoteNatural(midi))
            res += this.naturalKeyWidth - this.sharpKeyWidth/2;

        return res;
    }

    public draw() {
        if (this.canvas === null) return;

        const ctx = this.canvas.getContext("2d");
        if (ctx === null) return;

        const tickHeight = this.height / this.viewportTicks;
    
        ctx.clearRect(0, 0, this.width, this.height);

        ctx.fillStyle = highlight;
        const notePaddingFactor = 0.9;

        for (const note of this.notes) {
            const x = this.getNoteX(note.midiNumber);
            const y = this.height - note.startTime * tickHeight + this.time;
            const w = this.getNoteWidth(note.midiNumber)
            const h = note.duration * tickHeight;

            // don't render notes that are not in the current viewport
            if (y > this.height)
                continue;
            if (y + h < 0)
                break;

            const padding = (1 - notePaddingFactor) * w;

            if (this.drawNote !== null) {
                this.drawNote(ctx, x, y, w, h, !this.piano.isNoteNatural(note.midiNumber));
            } else {
                ctx.fillRect(x + padding/2, y, w - padding, h)
            }
        }
    }

    public resize(newWidth: number, newHeight: number) {
        this.width = newWidth;
        this.height = newHeight;
        this.calculateKeyWidths();
    }

    public setBpm(bpm: number) {
        this.bpm = bpm;
    }

    public setTicksPerBeat(ticks: number) {
        this.ticksPerBeat = ticks;
    }

    public isPlaying() {
        return this._isPlaying;
    }

    public tick() {
        this.time += (this.bpm / 60) * this.ticksPerBeat * ((1000 / pianoRollFps) / 1000);
    }

    public play() {
        this._isPlaying = true;

        const intervalTimeout = 1000 / pianoRollFps;
        const ticksPerUpdate = (this.bpm / 60) * this.ticksPerBeat * ((1000 / pianoRollFps) / 1000);

        const timer = setInterval(() => {
            if (!this.isPlaying()) {
                clearInterval(timer);
                return;
            }
            this.time += ticksPerUpdate;
            this.draw();
        }, intervalTimeout);
    }

    public stop() {
        this._isPlaying = false;
    }
}