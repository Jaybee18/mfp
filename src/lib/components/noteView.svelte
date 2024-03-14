<script lang="ts" type="module">
	import { onMount } from "svelte";
    import JZZ from 'jzz';

	import { readMidiFile } from "$lib/ts/notes";
	import { Piano } from "$lib/ts/piano";
	import { PianoRoll } from "$lib/ts/pianoRoll";
	import { PianoKeys } from "$lib/ts/pianoKeys";
    import { PianoSynth } from "$lib/ts/audio/pianoSynth";
    
    let piano = new Piano(5);
    let pianoRoll = new PianoRoll(piano);
    let pianoKeys = new PianoKeys(piano);
    let pianoSynth = new PianoSynth(piano);

    let audioContext;

    const updatePianoKeys = () => {
        pianoKeys.draw();
    }
    
    const onMidiIn = (e: MIDIMessageEvent) => {
        piano.midiEvent(e);
        pianoSynth.midiEvent(e);
        
        // show pressed keys even when no midi is playing
        requestAnimationFrame(updatePianoKeys);
        
        if (!pianoRoll.isPlaying() && pianoRoll.hasNotes()) {
            pianoRoll.play();
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

    const connectMidi = () => {
        JZZ.requestMIDIAccess().then(startMidiListen, midiAccessDenied);
    };


    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        onDragLeave(e);
        const file = e.dataTransfer?.files[0];
        if (file !== undefined) {
            readMidiFile(file, (parsed, ticksPerBeat, bpm) => {
                pianoRoll.setNotes(parsed);
                pianoRoll.setBpm(bpm);
                pianoRoll.setTicksPerBeat(ticksPerBeat);
                pianoRoll.draw();
            });
        }
    };

    const updateCanvasSize = (c: HTMLCanvasElement) => {
        c.width = c.clientWidth;
        c.height = c.clientHeight;
    }

    const setupAudio = async (e: MouseEvent) => {
        audioContext = new AudioContext();
        audioContext.suspend();

        const Tone = await import('tone');
        Tone.start();
        const s = new Tone.PolySynth().toDestination();
        pianoSynth.setSynth(s);

        console.log("audio setup successful")!
    };

    onMount(async () => {
        const pianoRollCanvas = document.getElementById("notes") as HTMLCanvasElement;
        const pianoKeysCanvas = document.getElementById("piano") as HTMLCanvasElement;

        updateCanvasSize(pianoRollCanvas);
        updateCanvasSize(pianoKeysCanvas);

        const observer = new ResizeObserver((entries) => {
            updateCanvasSize(pianoRollCanvas);
            updateCanvasSize(pianoKeysCanvas);

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
        <div class="note-shadow"></div>
        <button on:click={setupAudio} style="position: absolute; width: 100px; height: 50px;">setup audio</button>
        <button on:click={connectMidi} style="position: absolute; top: 55px; width: 100px; height: 50px;">connect midi</button>
        <canvas id="notes"></canvas>
    </div>
    <canvas id="piano" class="keys"></canvas>
</div>