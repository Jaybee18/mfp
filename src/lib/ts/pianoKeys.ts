import { highlight, highlightDark, pianoKeyOutlineWidth, sharpKeyHeightFactor, sharpKeyWidthFactor } from "./constants/constants";
import { midiNumberToNote } from "./util/notes";
import type { Piano } from "./piano";
import { type Config, subscribeToConfig } from "./Config";

export class PianoKeys {

    private piano: Piano;
    private canvas: HTMLCanvasElement | null = null;

    private width: number = 0;
    private height: number = 0;

    private config: Config | null = null;
    
    constructor(piano: Piano) {
        this.piano = piano;

        subscribeToConfig((value) => {
            this.config = value;
        })
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
            if (this.config?.drawNoteLabels) {
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