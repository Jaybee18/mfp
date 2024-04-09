<script lang="ts">
	import { onMount } from "svelte";

    export let showModal: boolean;
    export let onConfirm: () => void = () => {};
    export let onLoad: () => void = () => {};
    export let showConfirm: boolean = true;

    let dialog: HTMLDialogElement;

    const _onConfirm = () => {
        dialog.close();
        onConfirm();
    };

    export function close() {
        dialog.close();
        showModal = false;
    }

    onMount(() => onLoad);

    $: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => (showModal = false)} on:click={() => dialog.close()}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
        <slot name="header" />
        <hr />
        <slot />
        <br />
        <div id="action-buttons">
            <!-- svelte-ignore a11y-autofocus -->
            <button id="cancel" on:click={() => dialog.close()}>cancel</button>
            {#if showConfirm}
                <!-- svelte-ignore a11y-autofocus -->
                <button id="confirm" autofocus on:click={_onConfirm}>confirm</button>
            {/if}
        </div>
    </div>
</dialog>

<style lang="scss">
    @import 'abstracts/variables';

    * {
        font-family: 'Courier New', Courier, monospace;
        color: $text-color;
    }

    dialog {
        max-width: 32em;
		border-radius: 10px;
		border: none;
		padding: 7px;
        box-shadow: 1px 2px 4px 1px #00000096;
        background-color: $background;
        border: 1px solid #ffffff1a;

        &[open] {
            animation: zoom 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        &::backdrop {
            background: rgba(0, 0, 0, 0.4);
        }
        
        &[open]::backdrop {
            animation: fade 0.15s ease-out!important;
        }
    }

    hr {
        border-radius: 10px;
        border-color: rgba(255, 255, 255, 0.538);
        border-width: 1px 0 0 0 ;

        width: calc(100% + 14px);
        margin-left: -7px;
    }
    
    #action-buttons {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        
        * {
            color: transparentize($color: $text-color, $amount: 0.32);
        }

        button {
            padding: 5px;
            transition: color 0.15s, backdrop-filter 0.15s;
            background: none;
            border: none;
            cursor: pointer;
            border-radius: 6px;

            &:hover {
                backdrop-filter: brightness(1.2);
                color: $text-color;
            }
        }
    }

    @keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
    
    @keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
</style>