<script lang="ts">
	import { onLoad } from "$lib/noteView";
	import { onMount } from "svelte";

    import './noteView.css';

    onMount(() => {
        console.log(window);
        onLoad();
    });
</script>

<div class="notes-wrapper">
    <!--<div class="drop-zone" on:drop={onDrop} on:dragover={onDragOver} aria-hidden="true">
        <div>
            Drop MIDI file here
        </div>
    </div>-->
    <div class="notes" id="notes"></div>
    <canvas class="keys"></canvas>
</div>