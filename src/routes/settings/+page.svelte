<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import ToggleButton from "$lib/components/ToggleButton.svelte";
	import defaultConfig from "$lib/ts/Config";

    let playMidiNoteText = $defaultConfig.playNotes ? "enabled" : "disabled";
    const playMidiNoteSounds = (e: MouseEvent, v: boolean) => {
        $defaultConfig.playNotes = v;
        playMidiNoteText = v ? "enabled" : "disabled";
    };

    let stopUntilNotePlayText = $defaultConfig.stopUntilNotePress ? "enabled" : "disabled";
    const stopUntilNotePlay = (e: MouseEvent, v: boolean) => {
        $defaultConfig.stopUntilNotePress = v;
        stopUntilNotePlayText = v ? "enabled" : "disabled";
    };

    let noteLabelsText = $defaultConfig.drawNoteLabels ? "enabled" : "disabled";
    const noteLabels = (e: MouseEvent, v: boolean) => {
        $defaultConfig.drawNoteLabels = v;
        noteLabelsText = v ? "enabled" : "disabled";
    };

</script>
<div id="main">
    <div id="settings-item">
        <p>Automatically let the virtual piano play the midi notes</p>
        <ToggleButton bind:text={playMidiNoteText} onClick={playMidiNoteSounds} active={$defaultConfig.playNotes}/>
    </div>
    <div id="settings-item">
        <p>Wait until notes are played</p>
        <ToggleButton bind:text={stopUntilNotePlayText} onClick={stopUntilNotePlay} active={$defaultConfig.stopUntilNotePress}/>
    </div>
    <div id="settings-item">
        <p>Note labels on piano keys</p>
        <ToggleButton bind:text={noteLabelsText} onClick={noteLabels} active={$defaultConfig.drawNoteLabels}/>
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