import urllib.request
import pydub

notes = [
    "A0",
    "Bb0",
    "B0",
    "C1",
    "Db1",
    "D1",
    "Eb1",
    "E1",
    "F1",
    "Gb1",
    "G1",
    "Ab1",
    "A1",
    "Bb1",
    "B1",
    "C2",
    "Db2",
    "D2",
    "Eb2",
    "E2",
    "F2",
    "Gb2",
    "G2",
    "Ab2",
    "A2",
    "Bb2",
    "B2",
    "C3",
    "Db3",
    "D3",
    "Eb3",
    "E3",
    "F3",
    "Gb3",
    "G3",
    "Ab3",
    "A3",
    "Bb3",
    "B3",
    "C4",
    "Db4",
    "D4",
    "Eb4",
    "E4",
    "F4",
    "Gb4",
    "G4",
    "Ab4",
    "A4",
    "Bb4",
    "B4",
    "C5",
    "Db5",
    "D5",
    "Eb5",
    "E5",
    "F5",
    "Gb5",
    "G5",
    "Ab5",
    "A5",
    "Bb5",
    "B5",
    "C6",
    "Db6",
    "D6",
    "Eb6",
    "E6",
    "F6",
    "Gb6",
    "G6",
    "Ab6",
    "A6",
    "Bb6",
    "B6",
    "C7",
    "Db7",
    "D7",
    "Eb7",
    "E7",
    "F7",
    "Gb7",
    "G7",
    "Ab7",
    "A7",
    "Bb7",
    "B7",
    "C8",
]

# https://stackoverflow.com/questions/29547218/remove-silence-at-the-beginning-and-at-the-end-of-wave-files-with-pydub
def detect_leading_silence(sound, silence_threshold=-30.0, chunk_size=10):
    '''
    sound is a pydub.AudioSegment
    silence_threshold in dB
    chunk_size in ms

    iterate over chunks until you find the first one with sound
    '''
    trim_ms = 0 # ms

    assert chunk_size > 0 # to avoid infinite loop
    while sound[trim_ms:trim_ms+chunk_size].dBFS < silence_threshold and trim_ms < len(sound):
        trim_ms += chunk_size

    return trim_ms

download = False
convert = True
file_length = 2000
for note in notes:
    if download:
        urllib.request.urlretrieve(f"https://theremin.music.uiowa.edu/sound%20files/MIS/Piano_Other/piano/Piano.ff.{note}.aiff", f"./static/samples/aiff/{note}.aiff")

    if convert:
        aiff_audio: pydub.AudioSegment = pydub.AudioSegment.from_file(f"./static/samples/aiff/{note}.aiff", format="aiff");
        start_trim = detect_leading_silence(aiff_audio)
        end_trim = start_trim + file_length # in ms
        trimmed_aiff_audio = aiff_audio[start_trim:end_trim]
        faded_trimmed_aiff_audio = trimmed_aiff_audio.fade_out(file_length//2)
        
        faded_trimmed_aiff_audio.export(f"./static/samples/mp3/{note}.mp3", format="mp3", bitrate="64k")

