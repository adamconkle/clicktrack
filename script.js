let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let intervalId;
let isPlaying = false;
let beatCounter = 0;
let subCounter = 0;
let barsPlayed = 0;
let tapTimes = [];

const bpmInput = document.getElementById("bpm");
const beatsPerMeasureInput = document.getElementById("beatsPerMeasure");
const subdivisionInput = document.getElementById("subdivision");
const volumeInput = document.getElementById("volume");
const loopBarsInput = document.getElementById("loopBars");
const loopEnabled = document.getElementById("loopEnabled");
const visuals = document.getElementById("visuals");
const flash = document.getElementById("flash");

// Clean woodblock click
const woodblockBase64 = "https://s3.amazonaws.com/freecodecamp/drums/Bld_H1.mp3";
// Clean rimshot click (accent)
const rimshotBase64 = "UklGRhYAAABXQVZFZm10IBAAAAABAAEAIlYAABFzAAACABAAZGF0YQAAAAA=";

async function base64ToBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) buffer[i] = binary.charCodeAt(i);
  return await audioCtx.decodeAudioData(buffer.buffer);
}

let regularClick, accentClick;

async function loadSounds() {
  regularClick = await base64ToBuffer(woodblockBase64);
  accentClick = await base64ToBuffer(rimshotBase64);
}

function playClick(accent) {
  const source = audioCtx.createBufferSource();
  source.buffer = accent ? accentClick : regularClick;

  const gain = audioCtx.createGain();
  gain.gain.value = volumeInput.value / 100; // Ensure volume is between 0 and 1

  source.connect(gain);
  gain.connect(audioCtx.destination); // Connect to the audio context destination

  source.start();
}

document.getElementById('startButton').addEventListener('click', async () => {
  await loadSounds();
  playClick(false);  // Example: Play regular click when button is pressed
});
