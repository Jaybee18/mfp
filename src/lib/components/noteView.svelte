<script lang="ts" type="module">
	import { onMount } from "svelte";
    import JZZ from 'jzz';

	import { readMidiFile } from "$lib/ts/notes";
	import { Piano } from "$lib/ts/piano";
	import { PianoRoll } from "$lib/ts/pianoRoll";
	import { PianoKeys } from "$lib/ts/pianoKeys";
    import { PianoSynth } from "$lib/ts/audio/pianoSynth";
	import { canvasScaleFactor } from "$lib/ts/constants/constants";
    
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
        play();
    }
    
    const play = () => {  
        const timeDiv = document.getElementById("playback-time");      
        if (!pianoRoll.isPlaying() && pianoRoll.hasNotes()) {
            pianoRoll.play(() => {
                if (timeDiv !== null) {
                    timeDiv.innerText = String((pianoRoll.getTimeMs() / 1000).toPrecision(2)) + "s";
                }
            });
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
            readMidiFile(file, (parsed, res) => {
                pianoRoll.setNotes(parsed);
                pianoRoll.setBpm(res.bpm);
                pianoRoll.setTicksPerBeat(res.ticksPerBeat);
                pianoRoll.draw();
            });
        }
    };

    const updateCanvasSize = (c: HTMLCanvasElement) => {
        c.width = c.clientWidth * canvasScaleFactor;
        c.height = c.clientHeight * canvasScaleFactor;
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

        pianoKeys.setCanvas(pianoKeysCanvas);
        pianoKeys.draw();
        
        pianoRoll.setCanvas(pianoRollCanvas);


        const inputField = document.getElementById("midiFileInput");
        if (inputField !== null) {
            inputField.onchange = (e: Event) => {
                if (e.target === null) return;
                const files = (e.target as HTMLInputElement).files;
                if (files === null) return;
                const file = files[0];
                readMidiFile(file, (parsed, res) => {
                    pianoRoll.setNotes(parsed);
                    pianoRoll.setBpm(res.bpm);
                    pianoRoll.setTicksPerBeat(res.ticksPerBeat);
                    pianoRoll.draw();
                
                    const fileInfoDiv = document.getElementById("file-info");
                    if (fileInfoDiv !== null) {
                        fileInfoDiv.innerText = JSON.stringify(res, null, 2);
                    }
                });
            }
        }
    });
    
    const uploadMidi = () => {
        const inputField = document.getElementById("midiFileInput");
        inputField?.click();
    }

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
        <button on:click={uploadMidi} style="position: absolute; top: 110px; width: 100px; height: 50px;">upload midi<input id="midiFileInput" type="file" style="display: none;" accept="audio/midi"/></button>
        <button on:click={play} style="position: absolute; top: 165px; width: 100px; height: 50px;">play</button>
        <div id="file-info"></div>
        <div id="playback-time"></div>
        <canvas id="notes"></canvas>
    </div>
    <canvas id="piano"></canvas>
</div>

<style lang="scss">
    @import 'abstracts/variables';

    .notes-wrapper {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 50px 0;
        box-sizing: border-box;

        .notes {
            max-width: 100%;
            width: 100%;
            flex: 1;
            position: relative;

            .drop-zone {
                position: absolute;
                background-color: #4aaaa333;
                width: 100%;
                height: 100%;
                border-radius: 20px;
                border: 2px dashed black;
                box-sizing: border-box;
                
                display: flex;
                display: none;
                justify-content: center;
                align-items: center;
            
                opacity: 0;
            }
            
            .note-shadow {
                background: linear-gradient(0deg, rgba(0,0,0,0) 0%, $background 100%);
                width: 100%;
                height: 10%;
                position: absolute;
            }

            #notes {
                width: 100%;
                height: 100%;
                display: block;
                position: absolute;
                z-index: -1;
            }

            #file-info {
                position: absolute;
                left: 50%;
                width: 50%;
                height: 50%;
            }

            #playback-time {
                position: absolute;
                left: 50%;
                top: 55%;
            }
        }

        #piano {
            display: block;
            border-radius: 30px;
            height: 200px;
        }
    }
</style>