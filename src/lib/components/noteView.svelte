<script lang="ts">
	import { onMount } from "svelte";
    import JZZ from 'jzz';

    import './noteView.css';
	import { readMidiFile } from "$lib/notes";
	import { Piano } from "$lib/piano";
	import { PianoRoll } from "$lib/pianoRollCanvas";
	import { PianoKeys } from "$lib/pianoKeys";
    
    const piano = new Piano(5);
    const pianoRoll = new PianoRoll(piano);
    const pianoKeys = new PianoKeys(piano);

    const onMidiIn = (e: MIDIMessageEvent) => {
        piano.midiEvent(e);

        if (!pianoRoll.isPlaying()) {
            pianoRoll.play();
            requestAnimationFrame(update);
        }
    }

    const startMidiListen = (midiAcess: WebMidi.MIDIAccess) => {
        const inputs = midiAcess.inputs;
        
        console.log(inputs.values());
        console.log(inputs.keys());
        inputs.forEach(port => {
            console.log(port);
            port.onmidimessage = onMidiIn;
        })
    };

    const midiAccessDenied = () => {
        console.log("midi access denied");
    }

    JZZ.requestMIDIAccess().then(startMidiListen, midiAccessDenied);

    async function update() {
        pianoRoll.tick();
        pianoRoll.draw();
        pianoKeys.draw();
        if (pianoRoll.isPlaying())
            requestAnimationFrame(update);
    }

    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        onDragLeave(e);
        const file = e.dataTransfer?.files[0];
        if (file !== undefined) {
            readMidiFile(file, (parsed) => {
                pianoRoll.setNotes(parsed);
                pianoRoll.draw();
            });
        }
    };

    onMount(() => {
        const pianoRollCanvas = document.getElementById("notes") as HTMLCanvasElement;
        const pianoKeysCanvas = document.getElementById("piano") as HTMLCanvasElement;

        const observer = new ResizeObserver((entries) => {
            pianoRollCanvas.width = pianoRollCanvas.clientWidth;
            pianoRollCanvas.height = pianoRollCanvas.clientHeight;

            pianoKeysCanvas.width = pianoKeysCanvas.clientWidth;
            pianoKeysCanvas.height = pianoKeysCanvas.clientHeight;

            pianoRoll.resize(pianoRollCanvas.width, pianoRollCanvas.height);
            pianoRoll.draw();
            pianoKeys.resize(pianoKeysCanvas.width, pianoKeysCanvas.height);
            pianoKeys.draw();
        });
        observer.observe(pianoRollCanvas);
        observer.observe(pianoKeysCanvas);

        pianoRoll.setCanvas(pianoRollCanvas);

        pianoKeys.setCanvas(pianoKeysCanvas);
        pianoKeys.draw();
    });

    // show/hide the midi drop hint
    const onDragEnter = (e: DragEvent) => {
        (e.target as HTMLElement).style.opacity = "1";
    };
    const onDragLeave = (e: DragEvent) => {
        (e.target as HTMLElement).style.opacity = "0";
    };

    const onDragOver = (e: DragEvent) => {
        e.preventDefault();
    }
</script>

<div class="notes-wrapper">
    <div class="notes">
        <div class="drop-zone" on:drop={onDrop} on:dragover={onDragOver} on:dragenter={onDragEnter} on:dragleave={onDragLeave} aria-hidden="true">
            <div>
                Drop MIDI file here
            </div>
        </div>
        <canvas id="notes"></canvas>
    </div>
    <canvas id="piano" class="keys"></canvas>
</div>