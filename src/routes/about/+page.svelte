<script>
	import ExternalLink from "$lib/components/ExternalLink.svelte";

</script>
<div id="main">
    <h1>About me</h1>
    <br>
    <p>
        I am a software engineering student from Germany.<br><br>
        My passion for music manifests itself in this website and multiple <br>
        other music related projects from my <a href="https://github.com/Jaybee18/">GitHub</a>, as well as multiple <br>
        VST3 audio plugins that are not released yet.<br>
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

    p {
        a {
            color: $text-color;
        }
    }
</style>