<div id="main">
    <h1>About mfp</h1>
    <p>
        mfp is a website where people with midi controllers (keyboards also in the future) can practice<br>
        online for free with a handy visualization of the notes in a musical piece.
        <br>
        <br>
        The visualization is well known from YouTube videos or sites like <a href="https://musescore.com" target="_blank">musescore</a><br>
        and can help people learn how to play the piano without having to be able to read music sheets yet.<br>
        It also provides handy settings like playback speed or "wait-for-note-press" to slow down the<br>
        track or wait for the user to input the notes before continuing playback.
        <br>
        <br>
        The midi-player can also be used to play midi files or as a simple piano sampler.
    </p>
    <h1>About me</h1>
    <p>
        I am a software engineering student from Germany.<br><br>
        My passion for music manifests itself in this website and multiple <br>
        other music related projects from my <a href="https://github.com/Jaybee18/">GitHub</a>, as well as multiple <br>
        VST3 audio plugins that are not released yet.<br>
    </p>
    <h2>Credits</h2>
    <p>
        Thanks to Michelangelo Nottoli for the <a href="https://iconduck.com/sets/fontaudio-icon-library">Fontaudio Icon Set</a><br>
        Thanks to <a href="https://theremin.music.uiowa.edu">University of Iowa Electronic Music Studios</a> for the free high quality audio samples
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