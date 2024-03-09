<!--test

inländische waren-politik enforcen-->

<script lang="ts">
    import "$lib/noteView";
	import { loadNotes } from "$lib/noteView";
	import { onMount } from "svelte";

    import './noteView.css';

    onMount(() => {
        loadNotes();
    })
</script>

<div class="notes-wrapper">
    <div class="notes" id="notes"></div>
    <canvas class="keys"></canvas>
</div>