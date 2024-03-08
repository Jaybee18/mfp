import JZZ  from 'jzz';

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