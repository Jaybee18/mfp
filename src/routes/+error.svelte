<script lang="ts">
    import { page } from "$app/stores";
</script>

<div>
    <h1>Oh no! Error! </h1><br>
    <p>{$page.status}: {$page.error?.message}</p>
    <p id="home-link">Go <a href="/">home</a></p>
</div>

<style lang="scss">
    @import '../lib/components/abstracts/variables';

    * {
        color: $text-color;
        font-family: 'Courier New', Courier, monospace;
    }

    p, h1 {
        margin: 0;
    }

    h1 {
        font-size: 40px;
    }

    p {
        font-size: 20px;
    }

    div {
        height: 100%;
        padding-left: 2%;

        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    #home-link {
        font-size: 15px;
        margin-top: 40px;
    }
</style>