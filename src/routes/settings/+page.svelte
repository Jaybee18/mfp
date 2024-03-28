<script lang="ts">
	import ToggleButton from "$lib/components/ToggleButton.svelte";
    import ValueSlider from '$lib/components/ValueSlider.svelte';
	import defaultConfig from "$lib/ts/Config";
</script>
<div id="main">
    <div id="settings-item">
        <p>Automatically let the virtual piano play the midi notes</p>
        <ToggleButton text={$defaultConfig.playNotes ? "enabled" : "disabled"} bind:active={$defaultConfig.playNotes}/>
    </div>
    <!-- <div id="settings-item">
        <p>Number of octaves in virtual keyboard</p>
        <ValueSlider text="octaves" bind:defaultValue={$defaultConfig.numOctaves} onChange={v => $defaultConfig.numOctaves = v}/>
    </div> -->
    <div id="settings-item">
        <p>Wait until notes are played</p>
        <ToggleButton text={$defaultConfig.stopUntilNotePress ? "enabled" : "disabled"} bind:active={$defaultConfig.stopUntilNotePress}/>
    </div>
    <div id="settings-item">
        <p>Note labels on piano keys</p>
        <ToggleButton text={$defaultConfig.drawNoteLabels ? "enabled" : "disabled"} bind:active={$defaultConfig.drawNoteLabels}/>
    </div>
</div>

<style lang="scss">
    @import '../../lib/components/abstracts/variables';

    #main {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;

        #settings-item {
            padding: 10px;
            
            display: flex;
            justify-content: space-between;
            align-items: center;

            p {
                margin: 0;
                color: $text-color;
                font-family: 'Courier New', Courier, monospace;
            }
        }
    }
</style>