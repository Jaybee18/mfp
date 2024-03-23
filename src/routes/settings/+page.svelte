<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import ToggleButton from "$lib/components/ToggleButton.svelte";
	import defaultConfig from "$lib/ts/Config";

    let playMidiNoteSoundsText = $defaultConfig.playNotesSounds ? "enabled" : "disabled";
    const playMidiNoteSounds = (e: MouseEvent, v: boolean) => {
        $defaultConfig.playNotesSounds = v;
        playMidiNoteSoundsText = v ? "enabled" : "disabled";
    };

    let visualizeNotesOnKeyboardText = $defaultConfig.playNotesOnKeyboard ? "enabled" : "disabled";
    const visualizeNotesOnKeyboard = (e: MouseEvent, v: boolean) => {
        $defaultConfig.playNotesOnKeyboard = v;
        visualizeNotesOnKeyboardText = v ? "enabled" : "disabled";
    };
</script>
<div id="main">
    <div id="settings-item">
        <p>Play midi note sounds</p>
        <ToggleButton bind:text={playMidiNoteSoundsText} onClick={playMidiNoteSounds} active={$defaultConfig.playNotesSounds}/>
    </div>
    <div id="settings-item">
        <p>Visualize playing notes on keyboard</p>
        <ToggleButton bind:text={visualizeNotesOnKeyboardText} onClick={visualizeNotesOnKeyboard} active={$defaultConfig.playNotesOnKeyboard}/>
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