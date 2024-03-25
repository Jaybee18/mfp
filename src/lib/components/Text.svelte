<script lang="ts">
    export let content: string = "";
    export let style: string = "";
</script>

<div style={style}>
    {content}
</div>

<style lang="scss">
    @import './abstracts/variables';

    div {
        color: $text-color;
        font-family: 'Courier New', Courier, monospace;
    }
</style>