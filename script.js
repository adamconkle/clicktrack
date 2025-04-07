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

// Clean woodblock click (external URL)
const woodblockUrl = "https://s3.amazonaws.com/freecodecamp/drums/Bld_H1.mp3";

// Clean rimshot click (external URL)
const rimshotUrl = "https://s3.amazonaws.com/freecodecamp/drums/Dsc_Oh.mp3";

// Example of how to use them
const playWoodblock = () => {
    const audio = new Audio(woodblockUrl);
    audio.play();
};

const playRimshot = () => {
    const audio = new Audio(rimshotUrl);
    audio.play();
};

async function loadSounds() {
  regularClick = await loadAudioBuffer(woodblockUrl);
  accentClick = await loadAudioBuffer(rimshotUrl);
}

async function loadAudioBuffer(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
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
