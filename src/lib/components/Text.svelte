<script lang="ts">
    export let content: string = "";
</script>

<div>
    {content}
</div>

<style lang="scss">
    @import './abstracts/variables';

    div {
        color: $text-color;
        font-family: 'Courier New', Courier, monospace;
    }
</style>