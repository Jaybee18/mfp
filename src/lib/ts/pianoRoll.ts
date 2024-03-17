import { canvasScaleFactor, canvasText, noteHit, secondsPerViewport } from "./constants/constants";
import { highlightDark } from "./constants/constants";
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
    public speedFactor: number = 1;

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
        // const dpi = window.devicePixelRatio;
        // const style_width = getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
        // const style_height = getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
        // const scaleFactor = 10;
        // canvas.setAttribute("width", (Number(style_width) * dpi * scaleFactor).toString());
        // canvas.setAttribute("height", (Number(style_height) * dpi * scaleFactor).toString());
        // canvas.width = width * scaleFactor;
        // canvas.height = height * scaleFactor;
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
                naturals = 0;
                break;
            case 2:
                naturals = 1;
                break;
            case 3:
                naturals = 1;
                break;
            case 4:
                naturals = 2;
                break;
            case 5:
                naturals = 3;
                break;
            case 6:
                naturals = 3;
                break;
            case 7:
                naturals = 4;
                break;
            case 8:
                naturals = 4;
                break;
            case 9:
                naturals = 5;
                break;
            case 10:
                naturals = 5;
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

        //const tickHeight = this.height / this.viewportTicks;
        const bps = this.bpm / 60;
        const tickHeight = this.height / ((secondsPerViewport / bps) * this.ticksPerBeat) / 2;
    
        ctx.clearRect(0, 0, this.width, this.height);

        if (this.notes.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = canvasText;
            ctx.font = "35px Courier New, Courier, monospace";
            ctx.fillStyle = canvasText;
            for (let i = 0; i < (this.time + this.viewportTicks) / this.ticksPerBeat; i++) {
                ctx.moveTo(0, this.height + (this.time * tickHeight) - i * this.ticksPerBeat * tickHeight);
                ctx.lineTo(this.width, this.height + (this.time * tickHeight) - i * this.ticksPerBeat * tickHeight);
                ctx.strokeText(String(i), 10, this.height + (this.time * tickHeight) - i * this.ticksPerBeat * tickHeight + 35);
            }
            ctx.closePath();
            ctx.stroke();
        }

        ctx.fillStyle = highlight;
        const notePaddingFactor = 0.9;

        const highlightedNotes: Note[] = [];
        for (const note of this.notes) {
            // sharp notes should be darker
            if (this.piano.isNoteNatural(note.midiNumber)) {
                ctx.fillStyle = highlight;
            } else {
                ctx.fillStyle = highlightDark;
            }

            const x = this.getNoteX(note.midiNumber);
            const y = this.height - note.startTime * tickHeight + this.time * tickHeight;
            const w = this.getNoteWidth(note.midiNumber)
            const h = note.duration * tickHeight;

            // don't render notes that are not in the current viewport
            if (y - h > this.height)
                continue;
            if (y + h < 0)
                break;

            const padding = (1 - notePaddingFactor) * w;

            if (this.drawNote !== null) {
                this.drawNote(ctx, x, y, w, h, !this.piano.isNoteNatural(note.midiNumber));
            } else {
                //ctx.fillRect(x + padding/2, y, w - padding, h);

                ctx.beginPath();
                ctx.roundRect(x + padding/2, y - h + 1, w - padding, h - 1, 8 * canvasScaleFactor);
                ctx.stroke();
                ctx.fill();
                ctx.closePath();
            }

            if (y - h < this.height && y > this.height) {
                highlightedNotes.push(note);
            }
        }

        ctx.resetTransform();
        highlightedNotes.forEach(note => {
            const x = this.getNoteX(note.midiNumber);
            const y = this.height - note.startTime * tickHeight + this.time;
            const w = this.getNoteWidth(note.midiNumber)
            const h = note.duration * tickHeight;
            const padding = (1 - notePaddingFactor) * w;

            ctx.beginPath();
            const grad = ctx.createRadialGradient(x + w/2, this.height + 20, 0, x + w/2, this.height + 20, 40);
            grad.addColorStop(0.7, noteHit);
            grad.addColorStop(1, "#ffffff00");
            ctx.fillStyle = grad;
            ctx.fillRect(x + w/2 - this.naturalKeyWidth, this.height - h / 2, this.naturalKeyWidth * 2, h / 2);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

        })
        ctx.resetTransform();
    }

    public resize(newWidth: number, newHeight: number) {
        this.width = newWidth;
        this.height = newHeight;
        this.calculateKeyWidths();

        console.log("width: ", this.width);
        console.log("height: ", this.height);
        console.log("tick height: ", this.height / this.viewportTicks);
    }

    public setBpm(bpm: number) {
        this.bpm = bpm;
        
        console.log("bpm: ", this.bpm);
    }

    public setTicksPerBeat(ticks: number) {
        this.ticksPerBeat = ticks;
        this.viewportTicks = secondsPerViewport / (1 / (this.bpm / 60)) * this.ticksPerBeat;

        console.log("ticks per beat: ", this.ticksPerBeat);
        console.log("viewport ticks: ", this.viewportTicks);
        console.log("tick height: ", this.height / this.viewportTicks);
    }

    public isPlaying() {
        return this._isPlaying;
    }

    public tick() {
        //this.time += (this.bpm / 60) * this.ticksPerBeat * ((1000 / pianoRollFps) / 1000);
        const bps = this.bpm / 60;
        const spb = 1 / bps;
        const deltaMs = 1000 / pianoRollFps;
        const deltaBeats = bps * (deltaMs / 1000);
        this.time += deltaBeats * this.ticksPerBeat * this.speedFactor;
    }

    public play(updateCallback?: Function) {
        this._isPlaying = true;

        const intervalTimeout = 1000 / pianoRollFps;
        //const ticksPerUpdate = (this.bpm / 60) * this.ticksPerBeat * ((1000 / pianoRollFps) / 1000);

        const timer = setInterval(() => {
            if (!this.isPlaying()) {
                clearInterval(timer);
                return;
            }
            if (updateCallback !== undefined) {
                updateCallback();
            }
            //this.time += ticksPerUpdate;
            this.tick();
            this.draw();
        }, intervalTimeout);
    }

    public stop() {
        this._isPlaying = false;
    }

    public getTimeMs() {
        const bps = this.bpm / 60; // 2 bps
        const spb = 1 / bps; // 0.5 spb
        const mspb = spb * 1000; // 500 mspb
        const beats = this.time / this.ticksPerBeat; // ticks / ticks/beat = beats
        return beats * mspb;
    }
}