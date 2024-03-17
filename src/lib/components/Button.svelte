<script lang="ts">
    export let text: string;
    export let onClick: (e: MouseEvent) => void = () => {};
</script>

<button on:click={onClick}>
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