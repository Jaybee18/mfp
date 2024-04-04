<script lang="ts">
	import { onMount } from "svelte";

    export let text: string;
    export let defaultValue: number | null = null;
    export let value: number = 0;
    export let delta: number = 1;
    export let min: number = 0;
    export let max: number = 1;
    export let onChange: (value: number) => void = () => {};

    let descriptor: HTMLElement;
    let valueElement: HTMLElement;

    let valueChange = false;
    let lastClick: number = Date.now();

    onMount(() => {
        valueElement.onmousedown = (e: MouseEvent) => {
            valueElement.requestPointerLock();

            let tmp = Date.now();
            if (tmp - lastClick < 200 && defaultValue !== null) {
                valueElement.innerText = defaultValue.toString();
            }
            lastClick = tmp;

            valueChange = true;
        };

        valueElement.addEventListener("mousemove", (e: MouseEvent) => {
            if (valueChange) {
                const digits = Math.floor(Math.log10(1 / delta));
                let tmp = Number(valueElement.innerText) - e.movementY * delta;
                value = Math.min(Math.max(tmp, min), max);
                valueElement.innerText = value.toFixed(digits);
                onChange(Number(value));
            }
        });

        valueElement.addEventListener("mouseup", () => {
            valueChange = false;
            document.exitPointerLock();
        })

        if (defaultValue !== null)
            value = defaultValue;
        else
            defaultValue = value;
    });
</script>

<div id="wrapper">
    <p bind:this={descriptor} id="descriptor">
        {text}:
    </p>
    <p bind:this={valueElement} id="value">
        {value}
    </p>
</div>

<style lang="scss">
    @import './abstracts/variables';
    
    p {
        margin: 0;
        color: $text-color;
        font-family: 'Courier New', Courier, monospace;
    }

    #wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-items: center;

        #value {
            margin-left: 3px;
            cursor: ns-resize;
            user-select: none;
        }
    }
</style>