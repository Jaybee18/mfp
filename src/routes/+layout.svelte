<script lang="ts">
    import ExternalLink from '$lib/components/ExternalLink.svelte';
    import { dev } from '$app/environment';
    import { inject } from '@vercel/analytics';
	import { onMount } from 'svelte';
	import { setAudioContext } from '$lib/ts/util/globals';
    
    inject({ mode: dev ? 'development' : 'production' });

    onMount(() => {
        setAudioContext(new AudioContext());
    });
</script>

<div class="main">
    <header>
        <div>
            <h1 style="display: flex; flex-direction: row;">
                <a href="/">mfp</a>
                <span style="font-size: 15px; margin-left: 8px; margin-top: 4px; font-weight: 100; text-wrap: nowrap;">
                    | piano learning online
                </span>
            </h1>
            <div id="routes">
                <a href="/">home</a>
                <a href="/about">about</a>
                <a href="/settings">settings</a>
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
    }

    a {
        color: $text-color;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
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

        #routes {
            display: flex;
            flex-direction: row;
            align-items: center;

            a {
                margin: 0 5px;
            }
        }

    }
</style>