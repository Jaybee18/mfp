<script lang="ts" type="module">
	import { onMount } from "svelte";
    import JZZ from 'jzz';

	import { readMidiFile } from "$lib/ts/notes";
	import { Piano } from "$lib/ts/piano";
	import { PianoRoll } from "$lib/ts/pianoRoll";
	import { PianoKeys } from "$lib/ts/pianoKeys";
    import { PianoSynth } from "$lib/ts/audio/pianoSynth";
	import { canvasScaleFactor } from "$lib/ts/constants/constants";
	import ValueSlider from "$lib/components/ValueSlider.svelte";
	import Button from "$lib/components/Button.svelte";
    
    let playButtonText: string = "play";
    let playbackTime: HTMLElement;
    let pianoRollCanvas: HTMLCanvasElement;
    let pianoKeysCanvas: HTMLCanvasElement;
    let midiFileInput: HTMLInputElement;
    let midiDropZone: HTMLElement;

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
        //requestAnimationFrame(updatePianoKeys);
        updatePianoKeys();
        play();
    }
    
    const play = () => {   
        if (!pianoRoll.isPlaying() && pianoRoll.hasNotes()) {
            pianoRoll.play(() => {
                if (playbackTime !== null) {
                    playbackTime.innerText = String((pianoRoll.getTimeMs() / 1000).toPrecision(2)) + "s";
                }
            });

            playButtonText = "stop";
        }
    }

    const stop = () => {
        pianoRoll.stop();        
        playButtonText = "play";
    };
    
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

        midiFileInput.onchange = (e: Event) => {
            if (e.target === null) return;
            const files = (e.target as HTMLInputElement).files;
            if (files === null) return;
            const file = files[0];
            readMidiFile(file, (parsed, res) => {
                pianoRoll.setNotes(parsed);
                pianoRoll.setBpm(res.bpm);
                pianoRoll.setTicksPerBeat(res.ticksPerBeat);
                pianoRoll.draw();
            
                console.log(JSON.stringify(res, null, 2));
            });
        };

        // show/hide the midi drop hint
        const root = document.getElementsByTagName("html")[0];
        if (midiDropZone !== null) {
            root.ondragenter = (e: DragEvent) => {
                // --- TODO check that the file is actually a midi file ---
                midiDropZone.style.display = "block";
            };
            root.ondragleave = (e: DragEvent) => {
                if ((e.currentTarget as HTMLElement).contains((e.relatedTarget as HTMLElement))) return;
                midiDropZone.style.display = "none";
            };
            root.ondrop = (e: DragEvent) => {
                midiDropZone.style.display = "none";
            }
        }
    });
    
    const uploadMidi = () => {
        midiFileInput.click();
    }

    const onDragOver = (e: DragEvent) => {
        e.preventDefault();
    }

    const changeSpeedFactor = (factor: number) => {
        pianoRoll.speedFactor = factor;
    }

    const onChangeValue = (value: number) => {
        pianoRoll.setBpm(value);
        pianoRoll.draw();
    }

    const togglePlay = () => {
        if (pianoRoll.isPlaying()) {
            stop();
        } else {
            play();
        }
    };
</script>

<div class="notes-wrapper">
    <div class="notes">
        <div bind:this={midiDropZone} class="drop-zone" on:drop={onDrop} on:dragover={onDragOver} aria-hidden="true">
            <div>
                Drop MIDI file here
            </div>
        </div>
        <div class="note-shadow"></div>
        <div id="dev-tools">
            <!-- <Button text="setup audio" onClick={setupAudio}/>
            <Button text="connect midi" onClick={connectMidi}/>
            <Button text="upload midi" onClick={uploadMidi}/> -->
            <Button text="testt"/>
            <input bind:this={midiFileInput} type="file" style="display: none;" accept="audio/midi"/>
            <!-- <Button onClick={togglePlay} bind:text={playButtonText} /> -->
            <div bind:this={playbackTime}></div>
            <ValueSlider text="BPM" defaultValue={120} onChange={onChangeValue}/>
            <ValueSlider text="speed" defaultValue={1} delta={0.01} onChange={changeSpeedFactor}/>
        </div>
        <canvas bind:this={pianoRollCanvas} id="notes"></canvas>
    </div>
    <canvas bind:this={pianoKeysCanvas} id="piano"></canvas>
</div>

<style lang="scss">
    @import './abstracts/variables';

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
                z-index: 1;
                
                display: flex;
                display: none;
                justify-content: center;
                align-items: center;
            }
            
            .note-shadow {
                background: linear-gradient(0deg, rgba(0,0,0,0) 0%, $background 100%);
                width: 100%;
                height: 10%;
                position: absolute;
                z-index: 1;
            }

            #dev-tools {
                position: absolute;
                display: grid;
                grid-template-columns: 100px;
                row-gap: 5px;
                width: 50%;
                height: 100%;
                z-index: 2;

                justify-content: stretch;
            }

            #notes {
                width: 100%;
                height: 100%;
                display: block;
                position: absolute;
            }
        }

        #piano {
            display: block;
            border-radius: 30px;
            height: 200px;

            border: 1px solid $text-color;
            box-sizing: border-box;
        }
    }
</style>