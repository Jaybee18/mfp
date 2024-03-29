export abstract class Instrument {
    public abstract midiEvent(e: MIDIMessageEvent): void;
    public abstract playNote(midi: number): void;
}