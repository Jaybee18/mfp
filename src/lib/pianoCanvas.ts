export const outlineWidth = 2;

export const sharpKeyWidthFactor = 0.5;
export const sharpKeyHeightFactor = 0.6;

export function drawPiano(canvas: HTMLCanvasElement, octaves: number = 7) {
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
    const { width, height } = canvas.getBoundingClientRect();
    
    canvas.width = width;
    canvas.height = height;
    ctx.translate(0.5, 0.5);
    
    const numNaturalKeys = octaves * 7 + 1;
    const naturalKeyWidth = width / numNaturalKeys;
    const sharpKeyWidth = naturalKeyWidth * sharpKeyWidthFactor;

    // natural keys
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < numNaturalKeys; i++) {
        ctx.fillRect(naturalKeyWidth * i, 0, naturalKeyWidth, height);
    }

    // natural key outlines
    ctx.lineWidth = outlineWidth;
    ctx.strokeStyle = "#000"
    for (let i = 0; i < numNaturalKeys; i++) {
        ctx.rect(naturalKeyWidth * i, 0, naturalKeyWidth, height);
    }
    ctx.stroke();

    // sharp keys
    ctx.fillStyle = "#000";
    for (let i = 0; i < numNaturalKeys; i++) {
        if (i % 7 === 2 || i % 7 === 6 || i === numNaturalKeys - 1) continue;
        ctx.fillRect(naturalKeyWidth * i + naturalKeyWidth - sharpKeyWidth / 2, 0, sharpKeyWidth, height * sharpKeyHeightFactor);
    }
}