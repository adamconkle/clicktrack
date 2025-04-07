let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let regularClick, accentClick;
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

// Function to load audio buffers
async function loadAudioBuffer(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}

// Load the sounds on page load or on button click
async function loadSounds() {
  regularClick = await loadAudioBuffer(woodblockUrl);
  accentClick = await loadAudioBuffer(rimshotUrl);
}

// Play the regular or accent click sound
function playClick(accent) {
  if (!audioCtx || !regularClick || !accentClick) {
    console.error("Audio context or sounds not loaded yet");
    return;
  }

  const source = audioCtx.createBufferSource();
  source.buffer = accent ? accentClick : regularClick;

  const gain = audioCtx.createGain();
  gain.gain.value = volumeInput.value / 100; // Volume between 0 and 1

  source.connect(gain);
  gain.connect(audioCtx.destination);

  source.start();
}

// Add event listeners to buttons
document.getElementById('start').addEventListener('click', async () => {
  await loadSounds();  // Load sounds when start is clicked
  playClick(false);  // Play regular click when start is pressed
});

document.getElementById('stop').addEventListener('click', () => {
  // Stop the current track (you can add stop logic here)
  if (intervalId) {
    clearInterval(intervalId);
    isPlaying = false;
  }
});

document.getElementById('save').addEventListener('click', () => {
  // You can add save settings logic here (e.g., saving to localStorage)
  console.log("Settings saved");
});

document.getElementById('tapTempo').addEventListener('click', () => {
  // Add tap tempo functionality here
  console.log("Tap tempo functionality goes here");
});
