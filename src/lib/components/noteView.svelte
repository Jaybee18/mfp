<script lang="ts" type="module">
	import { onDestroy, onMount } from "svelte";
    import JZZ from 'jzz';

	import { MidiNoteOff, MidiNoteOn, canvasScaleFactor } from "$lib/ts/constants/constants";
	import Button from "$lib/components/Button.svelte";
    import * as Tone from 'tone';
	import Text from "./Text.svelte";
	import IconButton from "./IconButton.svelte";
	import Fa from "svelte-fa";
	import { faLink, faVolumeHigh, faVolumeMute, faArrowUpFromBracket, faRotateLeft, faLinkSlash, faMusic } from "@fortawesome/free-solid-svg-icons";
	import defaultConfig from "$lib/ts/Config";
	import { Midi } from "$lib/ts/util/Midi";
	import { piano, pianoKeys, pianoRoll, pianoSampler } from "$lib/ts/util/globals";

    let playButtonText: string = "play";
    let playbackTimeText: string = "";
    let pianoRollCanvas: HTMLCanvasElement;
    let pianoKeysCanvas: HTMLCanvasElement;
    let midiFileInput: HTMLInputElement;
    let midiDropZone: HTMLElement;

    let midiConnected: boolean = false;
    let midiAccess: WebMidi.MIDIAccess | null = null;

    let audioContext: AudioContext | null = null;
    let midi: Midi | null = null;

    const updatePianoKeys = () => {
        pianoKeys.draw();
    }
    
    const onMidiIn = (e: MIDIMessageEvent) => {
        if (e.data[0] === MidiNoteOn || e.data[0] === MidiNoteOff) {
            piano.midiEvent(e);
            pianoSampler.midiEvent(e);
            
            // show pressed keys even when no midi is playing
            updatePianoKeys();
            play();
        }
    }

    const play = () => {   
        if (!pianoRoll.isPlaying() && pianoRoll.hasNotes()) {
            pianoRoll.play(() => {
                if (midi !== null)
                    playbackTimeText = String((pianoRoll.getTimeMs() / 1000).toFixed(1)) + "s / " + String((pianoRoll.toTimeMs(midi.trackLength)/1000).toFixed(1)) + "s";
                updatePianoKeys();
            });

            playButtonText = "stop";
        }
    }

    const stop = () => {
        pianoRoll.stop();        
        playButtonText = "play";
    };
    
    const startMidiListen = (access: WebMidi.MIDIAccess) => {
        midiAccess = access;

        const inputs = access.inputs;

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

    const connectMidi = async (e: MouseEvent) => {
        if (!midiConnected) {
            midiAccess?.inputs.forEach(port => {
                port.open();
            });
            midiConnected = true;
        } else {
            midiAccess?.inputs.forEach(port => {
                port.close();
            });
            midiConnected = false;
        }
    };


    const onDrop = async (e: DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0];
        if (file !== undefined) {
            midi = new Midi();
            await midi.readFile(file);
            applyMidi();
        }
    };

    const updateCanvasSize = (c: HTMLCanvasElement) => {
        c.width = c.clientWidth * canvasScaleFactor;
        c.height = c.clientHeight * canvasScaleFactor;
    }

    const _setupAudio = async () => {
        if (audioContext === null) {
            audioContext = new AudioContext();
            audioContext.suspend();

            piano.addOnNoteListener((midi, release) => {
                if (!release) {
                    pianoSampler.playNote(midi);
                }
            });
            // Tone.start();
            // const s = new Tone.PolySynth().toDestination();
            //pianoSynth.setSynth(s);
        } else {
            audioContext.resume();
        }
    
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

    const applyMidi = () => {
        if (midi === null) return;

        pianoRoll.setNotes(midi);
        pianoRoll.setBpm(midi.bpm);
        pianoRoll.setTicksPerBeat(midi.ticksPerBeat);
        
        resetToStart();
        pianoRoll.draw();
    }

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
        JZZ.requestMIDIAccess().then(startMidiListen, midiAccessDenied);
        
        updateCanvasSize(pianoRollCanvas);
        updateCanvasSize(pianoKeysCanvas);
        
        const observer = new ResizeObserver(() => {
            if (pianoRollCanvas !== null && pianoKeysCanvas !== null) {
                updateCanvasSize(pianoRollCanvas);
                updateCanvasSize(pianoKeysCanvas);
                
                pianoRoll.resize(pianoRollCanvas.width, pianoRollCanvas.height);
                pianoRoll.draw();
                pianoKeys.resize(pianoKeysCanvas.width, pianoKeysCanvas.height);
                pianoKeys.draw();
            }
        });
        observer.observe(pianoRollCanvas);
        observer.observe(pianoKeysCanvas);

        pianoKeys.setCanvas(pianoKeysCanvas);
        pianoKeys.draw();
        
        pianoRoll.setCanvas(pianoRollCanvas);

        midiFileInput.onchange = async (e: Event) => {
            if (e.target === null) return;
            const files = (e.target as HTMLInputElement).files;
            if (files === null) return;
            const file = files[0];

            // hide the midi file drop hint
            hideMidiDropHint();

            midi = new Midi();
            await midi.readFile(file);
            applyMidi();
        };

        // show/hide the midi drop hint
        const root = document.getElementsByTagName("html")[0];
        if (midiDropZone !== null) {
            // root.ondragenter = (e: DragEvent) => {
            //     // --- TODO check that the file is actually a midi file ---
            //     midiDropZone.style.display = "flex";
            // };
            // root.ondragleave = (e: DragEvent) => {
            //     if ((e.currentTarget as HTMLElement).contains((e.relatedTarget as HTMLElement))) return;
            //     midiDropZone.style.display = "none";
            // };
            root.ondrop = (e: DragEvent) => {
                hideMidiDropHint();
            }
        }

        if (pianoRoll.hasNotes()) {
            hideMidiDropHint();
        }

        // key resize listeners
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", resizeMouseUp);
    });

    const hideMidiDropHint = () => {
        midiDropZone.style.display = "none";
    };

    onDestroy(() => {
        stop();
        audioContext?.suspend();
    });

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
        if (midi !== null)
            playbackTimeText = String((pianoRoll.getTimeMs() / 1000).toPrecision(2)) + "s / " + String((pianoRoll.toTimeMs(midi.trackLength)/1000).toFixed(2)) + "s";;

        stop();
    }

    const loadMidiFile = async (path: string) => {
        midiDropZone.style.display = "none";
        
        let file = await fetch(path);
        let blob = await file.blob();
        midi = new Midi();
        await midi.readBlob(blob);
        applyMidi();
    }
</script>

<div class="notes-wrapper">
    <div id="toolbar">
        <div>
            <IconButton tooltip="upload midi file" onClick={() => midiFileInput.click()}>
                <Fa icon={faArrowUpFromBracket} style="margin-left: -0.5px;" />
                <input bind:this={midiFileInput} type="file" style="display: none;" accept="audio/midi"/>
            </IconButton>
            <IconButton tooltip={midiConnected ? "disconnect midi controller" : "connect midi controller"} onClick={connectMidi}>
                {#if midiConnected}
                    <svg height="256" width="256" xmlns="http://www.w3.org/2000/svg" style="overflow: visible; scale: 0.09;"><g fill-rule="evenodd"><path d="m128 193.901c-13.606 0-21.823 9.814-23.434 22.258-42.192-8.369-68.566-43.509-68.566-88.159 0-50.81 41.19-92 92-92s92 41.19 92 92c0 44.21-25.713 77.476-67.501 86.16-1.346-8.684-11.008-20.259-24.499-20.259zm-.244-18.45c16.601 0 29.657 10.87 32.244 17.732 31.34-6.861 42.826-42.019 42.826-65.183 0-40.149-36.718-76-74.826-76s-75.313 35.851-75.313 76c0 35.28 21.881 61.702 43.313 66.628 2.095-10.012 15.155-19.178 31.756-19.178z"/><circle cx="80" cy="125" r="11"/><circle cx="95" cy="92" r="11"/><circle cx="128" cy="79" r="11"/><circle cx="161" cy="92" r="11"/><circle cx="174" cy="124" r="11"/></g></svg>
                {:else}
                    <svg height="256" width="256" xmlns="http://www.w3.org/2000/svg" style="overflow: visible; scale: 0.09;filter: brightness(0.5);"><g fill-rule="evenodd"><path d="m128 193.901c-13.606 0-21.823 9.814-23.434 22.258-42.192-8.369-68.566-43.509-68.566-88.159 0-50.81 41.19-92 92-92s92 41.19 92 92c0 44.21-25.713 77.476-67.501 86.16-1.346-8.684-11.008-20.259-24.499-20.259zm-.244-18.45c16.601 0 29.657 10.87 32.244 17.732 31.34-6.861 42.826-42.019 42.826-65.183 0-40.149-36.718-76-74.826-76s-75.313 35.851-75.313 76c0 35.28 21.881 61.702 43.313 66.628 2.095-10.012 15.155-19.178 31.756-19.178z"/><circle cx="80" cy="125" r="11"/><circle cx="95" cy="92" r="11"/><circle cx="128" cy="79" r="11"/><circle cx="161" cy="92" r="11"/><circle cx="174" cy="124" r="11"/></g></svg>
                {/if}
            </IconButton>
            <IconButton bind:active={$defaultConfig.playNotes} tooltip="play notes" onClick={setupAudio}>
                {#if $defaultConfig.playNotes}
                    <Fa icon={faVolumeHigh} scale={1.1} style="margin-left: -2px;"/>
                {:else}
                    <Fa icon={faVolumeMute} scale={1.1} style="margin-left: -2px; filter: brightness(0.5);"/>
                {/if}
            </IconButton>
        </div>
        <div>
            <Text bind:content={playbackTimeText} style={"margin-right: 5px;"}/>
            <!-- <ValueSlider text="speed" defaultValue={1} delta={0.01} onChange={changeSpeedFactor}/> -->
            <IconButton tooltip="reset" onClick={resetToStart} style="margin-right: 5px;">
                <Fa icon={faRotateLeft}/>
            </IconButton>
            <Button onClick={togglePlay} bind:text={playButtonText} />
        </div>
    </div>
    <div class="notes">
        <div class="drop-zone" on:drop={onDrop} on:dragover|preventDefault>
            <div id="wrapper" bind:this={midiDropZone}>
                <div id="drop-hint">
                    <p><span style="text-decoration: underline; cursor: pointer;" on:click={() => midiFileInput.click()}>upload</span> a midi file</p>
                    <p style="margin-top: 10px;">or select one of the sample songs:</p>
                    <p style="text-decoration: underline; cursor: pointer;" on:click={() => {loadMidiFile("fuer_elise.mid");}}>Für Elise</p>
                    <p style="text-decoration: underline; cursor: pointer;" on:click={() => {loadMidiFile("never_gonna_give_you_up.mid");}}>Never gonna give you up</p>
                </div>
            </div>
        </div>
        <div class="note-fade-in"></div>
        <!-- <div id="dev-tools" style="display: none;">
            <Text bind:content={playbackTimeText} />
            <ValueSlider text="BPM" defaultValue={120} onChange={onChangeValue}/>
            <ValueSlider text="speed" defaultValue={1} delta={0.01} onChange={changeSpeedFactor}/>
        </div> -->
        <canvas bind:this={pianoRollCanvas} id="notes"></canvas>
    </div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
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
        padding: 0 0 25px 0;
        box-sizing: border-box;

        #toolbar {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 60%;
            margin-left: 20%;

            border: 1px solid #d5d5d50c;
            outline: 1px $text-color;
            box-sizing: border-box;
            border-radius: 10px;
            padding: 6px;
            z-index: 3;
            box-shadow: 1px 3px 2px 0px #0000003b;
            backdrop-filter: brightness(95%);

            div {
                display: flex;
                flex-direction: row;
                align-items: center;

                svg {
                    fill: $text-color;
                }
            }
        }

        .notes {
            max-width: 100%;
            width: 100%;
            flex: 1;
            position: relative;

            .drop-zone {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 20px;
                box-sizing: border-box;
                z-index: 2;
                
                display: flex;
                justify-content: center;
                align-items: center;

                #wrapper {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    color: $text-color;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 14px;

                    #drop-hint {
                        flex: 1;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        color: #000000da;

                        p {
                            color: $text-color;
                            margin: 0;
                        }
                    }
                }
            }
            
            .note-fade-in {
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