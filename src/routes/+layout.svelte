<script lang="ts">
    import ExternalLink from '$lib/components/ExternalLink.svelte';
</script>

<div class="main">
    <header>
        <div>
            <h1>
                mfp
            </h1>
            <div id="header-center">
                Never Gonna Give You Up - Rick Astly
            </div>
            <div>
                placeholder
            </div>
        </div>
    </header>
    <div class="content">
        <slot></slot>
    </div>
    <footer>
        <div>
            <div>
                &copy 2024 Jan Bessler
            </div>
            <div>
                <ExternalLink link="https://github.com/Jaybee18/mfp" text="GitHub"/>
                <ExternalLink link="https://www.instagram.com/jaybes.mg/" text="Instagram"/>
                <ExternalLink link="https://twitter.com/JanBessler" text="X"/>
            </div>
        </div>
    </footer>
</div>

<style lang="scss">
    @import '../lib/components/abstracts/variables';

    // cant set the body background color in the main html file
    :global(body) {
        background-color: $background;
    }

    .main {
    width: 70%;
    height: 100%;
    display: flex;
    flex-direction: column;

    background-color: $background;
    }

    .content {
        flex: 1;
        overflow: hidden;
    }

    footer {
        height: 100px;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;

        color: $text-color;
        font-family: 'Courier New', Courier, monospace;

        div {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
    }

    header {
        height: 100px;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;

        color: $text-color;
        font-family: 'Courier New', Courier, monospace;

        * {
            margin: 0;
        }

        div {
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            * {
                display: flex;
                flex-direction: column;
                justify-content: center;
            }

            #header-center {
                flex: 1;
            
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
            }
        }

    }
</style>