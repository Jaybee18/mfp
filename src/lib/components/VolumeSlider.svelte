<script lang="ts">
	import { faVolumeHigh, faVolumeMute } from "@fortawesome/free-solid-svg-icons";
	import IconButton from "./IconButton.svelte";
	import Fa from "svelte-fa";
	import defaultConfig, { setVolume } from "$lib/ts/util/Config";

    export let mute = $defaultConfig.volume === 0;
    export let style: string = "";
    let dragging = false;
    let downX = 0;
    let downValue = 0;
    let valueBeforeMute = 0;

    let tooltip: HTMLElement;
    let handle: HTMLElement;

    const _mute = () => {
        if ($defaultConfig.volume !== 0)
            valueBeforeMute = $defaultConfig.volume;
        setVolume($defaultConfig.volume === 0 ? valueBeforeMute : 0);
    }

    const onMouseDown = (e: MouseEvent) => {
        e.preventDefault();

        dragging = true;
        downX = e.x;
        downValue = $defaultConfig.volume;

        handle.classList.add("no-transition");
    };

    const drag = (e: MouseEvent) => {
        if (!dragging) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "1";


        setVolume(clamp(downValue + (e.x - downX) / 100, 0, 1));
    };

    const onMouseUp = () => {
        dragging = false;
        tooltip.style.visibility = "";
        tooltip.style.opacity = "";
        handle.classList.remove("no-transition");
    }

    function clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }
</script>
<svelte:window on:mousemove={drag} on:mouseup={onMouseUp}/>
<div id="wrapper" style={style}>
    <IconButton tooltip={mute ? "unmute" : "mute"} bind:active={mute} onClick={_mute}>
        {#if $defaultConfig.volume}
            <Fa icon={faVolumeHigh} scale={1.1} style="margin-left: -2px;"/>
        {:else}
            <Fa icon={faVolumeMute} scale={1.1} style="margin-left: -2px; filter: brightness(0.5);"/>
        {/if}
    </IconButton>
    <div id="slider" style={$defaultConfig.volume === 0 ? "filter: brightness(0.5);" : ""}>
        <div id="track">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div bind:this={handle} id="handle" on:mousedown={onMouseDown} style={"left: " + ($defaultConfig.volume*100) + "px;"}>
                <span bind:this={tooltip} class="tooltiptext">{Math.round($defaultConfig.volume*100) + "%"}</span>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    @import 'abstracts/variables';

    #wrapper {
        width: fit-content;
        height: 100%;
        position: relative;

        display: flex;
        flex-direction: row;
        align-items: center;

        * {
            transition: filter 0.15s;
        }
    }

    :global(.no-transition) {
        transition: none!important;
    }

    #slider {
        height: 100%;
        width: 100px;
        margin-left: 3px;

        #track {
            position: relative;
            height: 3px;
            border-radius: 4px;
            background: #e5d4ce6e;

            #handle {
                position: absolute;
                top: -3px;
                margin-left: -5px;

                width: 10px;
                height: 10px;
                border-radius: 100%;
                background-color: $text-color;
                cursor: grab;

                transition: left 0.2s;
            }
        }
    }

    // tooltip
    .tooltiptext {
        visibility: hidden;
        background-color: #555555;
        color: #ffffff;
        text-align: center;
        border-radius: 6px;
        padding: 5px;
        position: absolute;
        z-index: 4;
        bottom: 200%;
        left: -115%;
        opacity: 0;
        width: fit-content;
        transition: opacity 0.3s;
        pointer-events: none;
        user-select: none;
        text-wrap: nowrap;
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
    }

    .tooltiptext::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #555555 transparent transparent transparent;
    }
    
    #handle:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
        transition-delay: 0.7s;
    }
</style>