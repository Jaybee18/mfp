<script lang="ts">
	import PopUp from "./PopUp.svelte";

    export let showModal: boolean = false;
    export let midiAccess: WebMidi.MIDIAccess;
    export let onChoice: (device: WebMidi.MIDIInput) => void = (device: WebMidi.MIDIInput) => {};

    let popUp: PopUp;

    let devices: WebMidi.MIDIInput[] = [];

    function _onChoice(device: WebMidi.MIDIInput) {
        onChoice(device);
        popUp.close();
    }

    function loadMidiDevices() {
        devices = [];
        midiAccess.inputs.forEach(input => {
            devices.push(input);
        });
    }

    $: showModal && loadMidiDevices();
</script>

<PopUp bind:this={popUp} bind:showModal onConfirm={() => console.log("penis")} showConfirm={false}>
    <div slot="header" style="width: 100%; display: flex; justify-content: center;">
        <div style="margin: 0; font-weight: 100;">
            Pick MIDI device
        </div>
    </div>
    <div id="midi-device-list" style="width: 250px; display: flex; justify-content: center; align-items: center;">
        {#each devices as device, index}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="midi-device-item" on:click={() => _onChoice(device)}>
                {device.name}
            </div>
            {#if index !== devices.length - 1}
                <div class="seperator" />
            {/if}
        {/each}
    </div>
</PopUp>

<style lang="scss">
    @import './abstracts/variables';

    // midi device selection pop up
    #midi-device-list {
        display: flex;
        flex-direction: column;

        .seperator {
            height: 1px;
            width: 95%;
            align-self: center;
            background-color: transparentize($color: $text-color, $amount: 0.9);
            margin: 5px 0;
        }

        .midi-device-item {
            display: flex;
            align-items: center;
            width: 100%;
            height: 45px;
            border-radius: 7px;
            padding: 5px 10px;
            box-sizing: border-box;
            user-select: none;
            cursor: pointer;
            transition: backdrop-filter 0.15s;
            color: transparentize($color: $text-color, $amount: 0.15);

            &:hover {
                backdrop-filter: brightness(1.2);
                color: $text-color;
            }
        }
    }
</style>