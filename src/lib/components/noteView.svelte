<script lang="ts" type="module">
	import { onMount } from "svelte";
    import JZZ from 'jzz';

	import { readMidiFile, type MidiFileParseResult } from "$lib/ts/util/notes";
	import { Piano } from "$lib/ts/piano";
	import { PianoRoll } from "$lib/ts/pianoRoll";
	import { PianoKeys } from "$lib/ts/pianoKeys";
    import { PianoSynth } from "$lib/ts/audio/pianoSynth";
	import { MidiNoteOff, MidiNoteOn, canvasScaleFactor } from "$lib/ts/constants/constants";
	import ValueSlider from "$lib/components/ValueSlider.svelte";
	import Button from "$lib/components/Button.svelte";
    import * as Tone from 'tone';
	import Text from "./Text.svelte";
	import ToggleButton from "./ToggleButton.svelte";
	import IconButton from "./IconButton.svelte";
	import Fa from "svelte-fa";
	import { faLightbulb, faLink, faMusic, faVolumeHigh, faVolumeMute, faArrowUpFromBracket, faPlay, faPause, faEye, faEyeSlash, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
	import defaultConfig from "$lib/ts/Config";

    let title: HTMLElement | null;

    let playButtonText: string = "play";
    let playbackTimeText: string = "0";
    let playPianoNotes: boolean = true;
    let pianoRollCanvas: HTMLCanvasElement;
    let pianoKeysCanvas: HTMLCanvasElement;
    let midiFileInput: HTMLInputElement;
    let midiDropZone: HTMLElement;

    let piano = new Piano(5);
    let pianoRoll = new PianoRoll(piano);
    let pianoKeys = new PianoKeys(piano);
    let pianoSynth = new PianoSynth(piano);

    pianoRoll.playNotes = playPianoNotes;
    piano.addOnNoteListener((midi, release) => {
        if (!release) {
            pianoSynth.playNote(midi);
        }
    });

    let audioContext: AudioContext | null = null;
    let midiFile: MidiFileParseResult | null = null;

    const updatePianoKeys = () => {
        pianoKeys.draw();
    }
    
    const onMidiIn = (e: MIDIMessageEvent) => {
        if (e.data[0] === MidiNoteOn || e.data[0] === MidiNoteOff) {
            piano.midiEvent(e);
            pianoSynth.midiEvent(e);
            
            // show pressed keys even when no midi is playing
            updatePianoKeys();
            play();
        }
    }

    const play = () => {   
        if (!pianoRoll.isPlaying() && pianoRoll.hasNotes()) {
            pianoRoll.play(() => {
                playbackTimeText = String((pianoRoll.getTimeMs() / 1000).toPrecision(2)) + "s / " + String((pianoRoll.toTimeMs(midiFile?.length)/1000).toFixed(2)) + "s";
                updatePianoKeys();
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

    const connectMidi = (e: MouseEvent) => {
        JZZ.requestMIDIAccess().then(startMidiListen, midiAccessDenied);
    };


    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0];
        if (file !== undefined) {
            readMidiFile(file, (parsed, res) => {
                midiFile = res;

                pianoRoll.setNotes(parsed);
                pianoRoll.setBpm(res.bpm);
                pianoRoll.setTicksPerBeat(res.ticksPerBeat);
                pianoRoll.draw();

                if (title !== null) {
                    title.innerText = file.name;
                }
            });
        }
    };

    const updateCanvasSize = (c: HTMLCanvasElement) => {
        c.width = c.clientWidth * canvasScaleFactor;
        c.height = c.clientHeight * canvasScaleFactor;
    }

    const _setupAudio = async () => {
        audioContext = new AudioContext();
        audioContext.suspend();
    
        Tone.start();
        const s = new Tone.PolySynth().toDestination();
        pianoSynth.setSynth(s);
    
        console.log("audio setup successful");
    };

    const setupAudio = (e: MouseEvent) => {
        if (audioContext === null) {
            try {
                _setupAudio().then().catch((err) => {
                    console.log(err);
                });
            } catch (err: any) {
                console.log(err)
            } 
        }
    };

    // key resize logic
    let pianoResizing = false;
    let resizeMouseDownY = 0;
    let resizeMouseDownHeight = 0;
    const resize = (e: MouseEvent) => {
        if (pianoResizing)
            pianoKeysCanvas.style.height = (resizeMouseDownHeight + (resizeMouseDownY - e.y)).toString() + "px";
    }
    const resizeMouseDown = (e: MouseEvent) => {
        pianoResizing = true;
        resizeMouseDownY = e.y;
        resizeMouseDownHeight = pianoKeysCanvas.clientHeight;
    }
    const resizeMouseUp = (e: MouseEvent) => {
        pianoResizing = false;
    }

    onMount(async () => {
        title = document.getElementById("header-center");

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
                midiFile = res;

                pianoRoll.setNotes(parsed);
                pianoRoll.setBpm(res.bpm);
                pianoRoll.setTicksPerBeat(res.ticksPerBeat);
                pianoRoll.draw();
            
                console.log(JSON.stringify(res, null, 2));
                if (title !== null) {
                    title.innerText = file.name;
                }
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

        // key resize listeners
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", resizeMouseUp);
    });
    
    const uploadMidi = (e: MouseEvent) => {
        midiFileInput.click();
    }

    const onDragOver = (e: DragEvent) => {
        e.preventDefault();
    }

    const changeSpeedFactor = (factor: number) => {
        pianoRoll.setSpeedFactor(factor);
    }

    const onChangeValue = (value: number) => {
        pianoRoll.setBpm(value);
        pianoRoll.draw();
    }

    const togglePlay = (e: MouseEvent) => {
        if (pianoRoll.isPlaying()) {
            stop();
        } else {
            play();
        }
    };

    const resetToStart = () => {
        piano.reset();
        pianoRoll.reset();
        pianoKeys.draw();
        playbackTimeText = String((pianoRoll.getTimeMs() / 1000).toPrecision(2)) + "s";

        stop();
    }

    const togglePlayingPianoNotes = () => {
        pianoRoll.playNotes = playPianoNotes;
        if (!playPianoNotes) {
            piano.reset();
        }
    };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="notes-wrapper">
    <div id="toolbar">
        <div>
            <IconButton tooltip="connect midi" onClick={connectMidi}>
                <Fa icon={faLink} />
            </IconButton>
            <IconButton tooltip="upload midi" onClick={uploadMidi}>
                <Fa icon={faArrowUpFromBracket} style="margin-left: -0.5px;" />
            </IconButton>
            <IconButton bind:active={$defaultConfig.playNotesOnKeyboard} tooltip="visualize notes">
                {#if $defaultConfig.playNotesOnKeyboard}
                    <Fa icon={faEye} scale={1.1} style="margin-left: -1px;"/>
                {:else}
                    <Fa icon={faEyeSlash} scale={1.1} style="margin-left: -1px;"/>
                {/if}
            </IconButton>
            <IconButton bind:active={$defaultConfig.playNotesSounds} tooltip="play notes" onClick={setupAudio}>
                {#if $defaultConfig.playNotesSounds}
                    <Fa icon={faVolumeHigh} scale={1.1} style="margin-left: -2px;"/>
                {:else}
                    <Fa icon={faVolumeMute} scale={1.1} style="margin-left: -2px;"/>
                {/if}
            </IconButton>
        </div>
        <div>
            <Text bind:content={playbackTimeText} />
            <ValueSlider text="speed" defaultValue={1} delta={0.01} onChange={changeSpeedFactor}/>
            <IconButton tooltip="reset" onClick={resetToStart} style="margin-right: 5px;">
                <Fa icon={faRotateLeft} style="margin-right: -2px;"/>
            </IconButton>
            <!-- <IconButton bind:active={isPlaying} tooltip={isPlaying ? "pause" : "play"} onClick={togglePlay}>
                {#if isPlaying}
                    <Fa icon={faPause} style="margin-right: -1px;"/>
                {:else}
                    <Fa icon={faPlay} style="margin-right: -1px;"/>
                {/if}
            </IconButton> -->
            <Button onClick={togglePlay} bind:text={playButtonText} />
        </div>
    </div>
    <div class="notes">
        <div bind:this={midiDropZone} class="drop-zone" on:drop={onDrop} on:dragover={onDragOver} aria-hidden="true">
            <div>
                Drop MIDI file here
            </div>
        </div>
        <div class="note-shadow"></div>
        <div id="dev-tools" style="display: none;">
            <Button text="setup audio" onClick={setupAudio}/>
            <IconButton tooltip="connect midi" onClick={connectMidi}>
                <Fa icon={faLink} />
            </IconButton>
            <IconButton tooltip="upload midi" onClick={uploadMidi}>
                <Fa icon={faArrowUpFromBracket} />
            </IconButton>
            <input bind:this={midiFileInput} type="file" style="display: none;" accept="audio/midi"/>
            <Button onClick={togglePlay} bind:text={playButtonText} />
            <Button text="reset" onClick={resetToStart} />
            <ToggleButton text="play notes" bind:active={playPianoNotes} onClick={togglePlayingPianoNotes}/>

            <Text bind:content={playbackTimeText} />
            <ValueSlider text="BPM" defaultValue={120} onChange={onChangeValue}/>
            <ValueSlider text="speed" defaultValue={1} delta={0.01} onChange={changeSpeedFactor}/>
        </div>
        <canvas bind:this={pianoRollCanvas} id="notes"></canvas>
    </div>
    <div id="resize-handle" on:mousedown={resizeMouseDown}></div>
    <canvas bind:this={pianoKeysCanvas} id="piano"></canvas>
</div>

<style lang="scss">
    @import './abstracts/variables';

    .notes-wrapper {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        //padding: 25px 0;
        padding: 0 0 25px 0;
        box-sizing: border-box;

        #toolbar {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 50%;
            margin-left: 25%;

            border: 1px solid #d5d5d50c;
            outline: 1px $text-color;
            box-sizing: border-box;
            border-radius: 10px;
            padding: 6px;
            z-index: 3;
            box-shadow: 1px 3px 2px 0px #0000003b;
            backdrop-filter: brightness(90%);

            div {
                display: flex;
                flex-direction: row;
                align-items: center;
            }
        }

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
                // 90% gives the illusion of a padding to the control ribbon and
                // makes the note view look less dense
                background: linear-gradient(0deg, rgba(0,0,0,0) 0%, $background 90%);
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
                width: 200px;
                height: 100%;
                z-index: 2;

                padding: 10px;
                box-sizing: border-box;

                justify-content: center;

                // background-color: black;
                // outline: 1px solid white;
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

    #resize-handle {
        z-index: 2;
        height: 10px;
        margin: -5px 0;
        cursor: ns-resize;
        user-select: none;
    }
</style>