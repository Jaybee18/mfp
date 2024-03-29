import { highlight, highlightDark, pianoKeyOutlineWidth, sharpKeyHeightFactor, sharpKeyWidthFactor } from "../constants/constants";
import type { Piano } from "../models/piano";
import defaultConfig from "../util/Config";
import { midiNumberToNote } from "../util/Midi";

export class PianoKeys {

    private piano: Piano;
    private canvas: HTMLCanvasElement | null = null;

    private width: number = 0;
    private height: number = 0;
    
    private drawNoteLabels: boolean = false;

    constructor(piano: Piano) {
        this.piano = piano;

        defaultConfig.subscribe(v => {
            this.drawNoteLabels = v.drawNoteLabels;
        });
    }

    public setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const { width, height } = canvas.getBoundingClientRect();
        this.width = width;
        this.height = height;
    }

    public resize(newWidth: number, newHeight: number) {
        this.width = newWidth;
        this.height = newHeight;
    }

    public draw() {
        if (this.canvas === null) return;
        const ctx = this.canvas.getContext("2d");
        if (ctx === null) return;
        const { width, height } = this.canvas.getBoundingClientRect();
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        const numNaturalKeys = this.piano.getOctaves() * 7 + 1;
        const naturalKeyWidth = width / numNaturalKeys;
        const sharpKeyWidth = naturalKeyWidth * sharpKeyWidthFactor;
    
        // natural keys
        let absoluteIndex = 0;
        for (let i = 0; i < numNaturalKeys; i++) {
            if (this.piano.isNoteDown(this.piano.getMidiAtIndex(absoluteIndex))) {
                ctx.fillStyle = highlight; //"#aaffaa";
            } else {
                ctx.fillStyle = "#fff";
            }

            ctx.fillRect(naturalKeyWidth * i, 0, naturalKeyWidth, height);

            // key label
            if (this.drawNoteLabels) {
                ctx.fillStyle = "#000000";
                ctx.font = Math.floor(naturalKeyWidth*0.6).toString() + "px Courier New, Courier, monospace";
                ctx.fillText(midiNumberToNote(this.piano.getMidiAtIndex(absoluteIndex)), naturalKeyWidth * i + 3.5, height - 5, naturalKeyWidth);
            }

            if (i % 7 === 2 || i % 7 === 6 || i === numNaturalKeys - 1) {
                absoluteIndex++;
            } else {
                absoluteIndex += 2;
            }
        }
    
        // natural key outlines
        ctx.lineWidth = pianoKeyOutlineWidth;
        ctx.strokeStyle = "#000"
        for (let i = 0; i < numNaturalKeys; i++) {
            ctx.strokeRect(naturalKeyWidth * i, 0, naturalKeyWidth, height);
        }
    
        // sharp keys
        absoluteIndex = 1;
        for (let i = 0; i < numNaturalKeys; i++) {
            if (this.piano.isNoteDown(this.piano.getMidiAtIndex(absoluteIndex))) {
                ctx.fillStyle = highlightDark; //"#aaffaa";
            } else {
                ctx.fillStyle = "#000";
            }
            
            if (i % 7 === 2 || i % 7 === 6 || i === numNaturalKeys - 1) {
                absoluteIndex++;
                continue;
            }
            
            ctx.fillRect(naturalKeyWidth * i + naturalKeyWidth - sharpKeyWidth / 2, 0, sharpKeyWidth, height * sharpKeyHeightFactor);
            absoluteIndex += 2;
        }

        // sharp key outlines
        ctx.lineWidth = pianoKeyOutlineWidth;
        ctx.strokeStyle = "#000"
        for (let i = 0; i < numNaturalKeys; i++) {
            if (i % 7 === 2 || i % 7 === 6 || i === numNaturalKeys - 1) continue;
            ctx.strokeRect(naturalKeyWidth * i + naturalKeyWidth - sharpKeyWidth / 2, 0, sharpKeyWidth, height * sharpKeyHeightFactor);
        }
    }
}

function getKeyboardKeyForMidi(midi: number): string {
    const remainder = midi % 12;
    const letters = ["a", "w", "s", "e", "d", "f", "t", "g", "z", "h", "u", "j"];
    return letters[remainder];
}