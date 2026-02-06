let audioContext = null;
const dialSounds = [
    'dial_sound_1.mp3',
    'dial_sound_2.mp3',
    'dial_sound_3.mp3',
    'dial_sound_4.mp3',
    'dial_sound_5.mp3',
    'dial_sound_6.mp3',
    'dial_sound_7.mp3',
    'dial_sound_8.mp3',
    'dial_sound_9.mp3'
];
const soundBuffers = {};

async function ensureAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error('Web Audio API is not supported in this browser');
            return null;
        }
    }
    return audioContext;
}

async function loadSound(url) {
    await ensureAudioContext();
    if (!audioContext) return;
    if (soundBuffers[url]) return soundBuffers[url];
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        soundBuffers[url] = audioBuffer;
        return audioBuffer;
    } catch (error) {
        console.error(`Error loading sound: ${url}`, error);
    }
}

function playSound(buffer) {
    if (!audioContext || !buffer) return;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
}

async function playRandomDialSound() {
    const randomSoundUrl = dialSounds[Math.floor(Math.random() * dialSounds.length)];
    const buffer = await loadSound(randomSoundUrl);
    playSound(buffer);
}

let soundsPreloaded = false;
function preloadSounds() {
    if (soundsPreloaded) return;
    dialSounds.forEach(loadSound);
    soundsPreloaded = true;
}

export { loadSound, playSound, playRandomDialSound, preloadSounds, ensureAudioContext };