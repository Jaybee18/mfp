<script lang="ts">
	import { onMount } from "svelte";

    export let text: string;
    export let onClick: (e: MouseEvent, active: boolean) => void = () => {};
    export let active: boolean = true;

    let button: HTMLButtonElement;

    onMount(() => {
        if (active) {
            button.style.backgroundColor = "#ffffff";
        } else {
            button.style.backgroundColor = "#9c9c9c";
        }
    });

    const _onClick = (e: MouseEvent) => {
        active = !active;

        if (active) {
            button.style.backgroundColor = "#ffffff";
        } else {
            button.style.backgroundColor = "#9c9c9c";
        }

        onClick(e, active);
    }
</script>

<button bind:this={button} on:click={_onClick}>
    {text}
</button>

<style lang="scss">
    @import './abstracts/variables';

    button {
        background-color: white;
        outline: 1px solid $text-color;
        outline-offset: 0px;
        border: 1px solid black;
        border-radius: 50px;
        height: 30px;
        margin: 1px;
        min-width: 100px;

        cursor: pointer;

        transition: all 0.1s;
    }

    button:hover {
        box-shadow: 0 0 6px $text-color;
    }

    button:active {
        box-shadow: none;
    }
</style>