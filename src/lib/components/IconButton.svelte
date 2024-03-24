<script lang="ts">
    export let onClick: (e: MouseEvent, v: boolean) => void = () => {};
    export let active: boolean = true;
    export let tooltip: string = "";
    export let style: string = "";

    const _onClick = (e: MouseEvent) => {
        active = !active;
        onClick(e, active);
    }
</script>

<button id="icon-button" on:click={_onClick} style={style}>
    {#if tooltip !== ""}
        <span class="tooltiptext">{tooltip}</span>
    {/if}
    <slot />
</button>

<style lang="scss">
    @import './abstracts/variables';

    #icon-button {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        padding: 5px;
        width: 35px;
        height: 35px;

        color: $text-color;
        cursor: pointer;

        border: none;
        background-color: transparent;

        transition: color 0.1s, background-color 0.2s;

        &:hover {
            background-color: transparentize($color: #ffffff, $amount: 0.8);
            color: white;
        }
    }

    .tooltiptext {
        visibility: hidden;
        background-color: #555555;
        color: #ffffff;
        text-align: center;
        border-radius: 6px;
        padding: 5px;
        position: absolute;
        z-index: 4;
        bottom: 125%;
        opacity: 0;
        width: fit-content;
        transition: opacity 0.3s;
        pointer-events: none;
        user-select: none;
        text-wrap: nowrap;
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
    
    #icon-button:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
        transition-delay: 0.7s;
    }
</style>