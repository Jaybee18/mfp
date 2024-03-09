import JZZ  from 'jzz';
import { Factory, EasyScore, System, Renderer, Stave } from 'vexflow';

const onMidiIn = (ev: WebMidi.MIDIMessageEvent) => {
    console.log(ev);
};

const startMidiListen = (midiAcess: WebMidi.MIDIAccess) => {
    const inputs = midiAcess.inputs;

    console.log(inputs.values());
    console.log(inputs.keys());

    inputs.forEach(port => {
        console.log(port);
        port.onmidimessage = onMidiIn;
    })
};

const midiAccessDenied = () => {
    console.log("midi access denied");
}

JZZ.requestMIDIAccess().then(startMidiListen, midiAccessDenied);

// ---
export function loadNotes() {
    const vf = new Factory({
        renderer: { elementId: 'notes', width: 500, height: 150 },
    });

    const score = vf.EasyScore();
    const system = vf.System();

    // let stave1 = system
    //     .addStave({
    //     voices: [
    //         score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
    //         score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
    //     ],
    //     })
    //     .addClef('treble')
    //     .addTimeSignature('4/4');
    
    // system.addConnector();

    // let stave2 = system.addStave({
    //     voices: [
    //         score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
    //         score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
    //     ],
    //     });

    // vf.draw();

    let canvas = document.getElementById("notes") as HTMLDivElement;
    const renderer = new Renderer(canvas, Renderer.Backends.SVG);

    // Configure the rendering context.
    renderer.resize(500, 500);
    const context = renderer.getContext();
    context.setFont('Arial', 10);

    // Create a stave of width 400 at position 10, 40.
    const stave = new Stave(10, 40, 400);

    // Add a clef and time signature.
    stave.addClef('treble').addTimeSignature('4/4');

    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();
}