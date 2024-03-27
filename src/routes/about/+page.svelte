<script>
	import ExternalLink from "$lib/components/ExternalLink.svelte";

</script>
<div id="main">
    <h1>About me</h1>
    <br>
    <p>
        I am a software engineering student from Germany.
        
        My passion for music manifests itself in this website and multiple <br>
        other music related projects from my <ExternalLink text="GitHub" link="https://github.com/Jaybee18/"/>,<br>
        as well as multiple VST3 audio plugins.<br>
    </p>
</div>

<style lang="scss">
    @import '../../lib/components/abstracts/variables';

    #main {
        width: 100%;
        height: 100%;

        text-align: center;
        color: $text-color;
        font-family: 'Courier New', Courier, monospace;
    }
</style>