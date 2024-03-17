<script lang="ts">
	import { onMount } from "svelte";

    export let text: string;
    export let defaultValue: number = 0;
    export let delta: number = 1;
    export let onChange: (value: number) => void = () => {};

    let descriptor: HTMLElement;
    let value: HTMLElement;

    let valueChange = false;
    let lastClick: number = Date.now();

    onMount(() => {
        value.onmousedown = (e: MouseEvent) => {
            value.requestPointerLock();

            let tmp = Date.now();
            if (tmp - lastClick < 200) {
                console.log("double click");
                value.innerText = defaultValue.toString();
            }
            lastClick = tmp;

            valueChange = true;
        };

        value.addEventListener("mousemove", (e: MouseEvent) => {
            if (valueChange) {
                const digits = Math.floor(Math.log10(1 / delta));
                const newValue = (Number(value.innerText) - e.movementY * delta).toFixed(digits);
                value.innerText = String(newValue);
                onChange(Number(newValue));
            }
        });

        value.addEventListener("mouseup", () => {
            valueChange = false;
            onChange(Number(value.innerText));
            document.exitPointerLock();
        })
    });
</script>

<div id="wrapper">
    <p bind:this={descriptor} id="descriptor">
        {text}:
    </p>
    <p bind:this={value} id="value">
        {defaultValue}
    </p>
</div>

<!-- <style lang="scss">
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
</style> -->