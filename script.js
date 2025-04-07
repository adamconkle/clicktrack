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

// 🎧 Click sounds (simple tones for now)
const highClickBase64 = "https://raw.githubusercontent.com/your-username/your-repo-name/main/sounds/woodblock.mp3";
const lowClickBase64 = "https://raw.githubusercontent.com/your-username/your-repo-name/main/sounds/rimshot.mp3";

async function base64ToBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) buffer[i] = binary.charCodeAt(i);
  return await audioCtx.decodeAudioData(buffer.buffer);
}

let regularClick, accentClick;

async function loadSounds() {
  regularClick = await base64ToBuffer(lowClickBase64);
  accentClick = await base64ToBuffer(highClickBase64);
}

function playClick(accent) {
  const source = audioCtx.createBufferSource();
  source.buffer = accent ? accentClick : regularClick;
  const gain = audioCtx.createGain();
  gain.gain.value = volumeInput.value;
  source.connect(gain).connect(audioCtx.destination);
  source.start();
}

function drawVisuals(beats, activeIndex, isAccent) {
  visuals.innerHTML = "";
  for (let i = 0; i < beats; i++) {
    const box = document.createElement("div");
    box.classList.add("beat-box");
    if (i === activeIndex) {
      box.classList.add("active");
      box.classList.add(isAccent ? "accent" : "regular");
    }
    visuals.appendChild(box);
  }
}

function startClickTrack() {
  if (isPlaying) return;

  const bpm = parseInt(bpmInput.value);
  const beatsPerMeasure = parseInt(beatsPerMeasureInput.value);
  const subdivisions = parseInt(subdivisionInput.value);
  const loopBars = parseInt(loopBarsInput.value);
  const useLoop = loopEnabled.checked;
  const interval = (60000 / bpm) / subdivisions;

  beatCounter = 0;
  subCounter = 0;
  barsPlayed = 0;
  drawVisuals(beatsPerMeasure, 0, true);
  playClick(true);

  intervalId = setInterval(() => {
    const isAccent = subCounter === 0 && beatCounter % beatsPerMeasure === 0;
    playClick(isAccent);
    drawVisuals(beatsPerMeasure, beatCounter % beatsPerMeasure, isAccent);

    subCounter++;
    if (subCounter >= subdivisions) {
      subCounter = 0;
      beatCounter++;
      if (beatCounter % beatsPerMeasure === 0) {
        barsPlayed++;
        if (useLoop && barsPlayed >= loopBars) {
          stopClickTrack();
        }
      }
    }
  }, interval);

  isPlaying = true;
}

function stopClickTrack() {
  clearInterval(intervalId);
  isPlaying = false;
  drawVisuals(0, 0, false);
}

function saveSettings() {
  localStorage.setItem("clicktrack-bpm", bpmInput.value);
  localStorage.setItem("clicktrack-beats", beatsPerMeasureInput.value);
  localStorage.setItem("clicktrack-sub", subdivisionInput.value);
  localStorage.setItem("clicktrack-vol", volumeInput.value);
  localStorage.setItem("clicktrack-loop", loopBarsInput.value);
  localStorage.setItem("clicktrack-loopOn", loopEnabled.checked);
  alert("Settings saved!");
}

function loadSettings() {
  bpmInput.value = localStorage.getItem("clicktrack-bpm") || 120;
  beatsPerMeasureInput.value = localStorage.getItem("clicktrack-beats") || 4;
  subdivisionInput.value = localStorage.getItem("clicktrack-sub") || 1;
  volumeInput.value = localStorage.getItem("clicktrack-vol") || 0.5;
  loopBarsInput.value = localStorage.getItem("clicktrack-loop") || 2;
  loopEnabled.checked = localStorage.getItem("clicktrack-loopOn") === "true";
}

document.getElementById("start").addEventListener("click", () => {
  audioCtx.resume();
  startClickTrack();
});

document.getElementById("stop").addEventListener("click", stopClickTrack);
document.getElementById("save").addEventListener("click", saveSettings);

document.getElementById("tapTempo").addEventListener("click", () => {
  const now = Date.now();
  tapTimes.push(now);
  if (tapTimes.length > 5) tapTimes.shift();

  if (tapTimes.length >= 2) {
    const intervals = [];
    for (let i = 1; i < tapTimes.length; i++) {
      intervals.push(tapTimes[i] - tapTimes[i - 1]);
    }
    const avg = intervals.reduce((a, b) => a + b) / intervals.length;
    const bpm = Math.round(60000 / avg);
    bpmInput.value = bpm;
  }
});

loadSettings();
loadSounds();

---------

let audioCtx;
let regularClick, accentClick;
let isPlaying = false;
let intervalId;

let lastTapTime = 0;  // Variable to store the last tap time
let tapCount = 0;     // Count the number of taps

const bpmInput = document.getElementById("bpm");
const beatsPerMeasureInput = document.getElementById("beatsPerMeasure");
const subdivisionInput = document.getElementById("subdivision");
const volumeInput = document.getElementById("volume");
const loopBarsInput = document.getElementById("loopBars");
const loopEnabled = document.getElementById("loopEnabled");
const visuals = document.getElementById("visuals");
const flash = document.getElementById("flash");

// URL for the MP3 file hosted on GitHub
const woodblockUrl = "https://raw.githubusercontent.com/your-username/your-repo-name/main/sounds/woodblock.mp3"; // Replace with your actual URL
const rimshotUrl = "https://raw.githubusercontent.com/your-username/your-repo-name/main/sounds/rimshot.mp3"; // Replace with your actual URL

// Function to load audio buffers from a URL
async function loadAudioBuffer(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}

// Load the sounds on page load or on button click
async function loadSounds() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  try {
    regularClick = await loadAudioBuffer(woodblockUrl);
    accentClick = await loadAudioBuffer(rimshotUrl);
    console.log("Sounds loaded successfully");
  } catch (error) {
    console.error("Error loading sounds:", error);
  }
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
  gain.gain.value = volumeInput.value; // Volume between 0 and 1

  source.connect(gain);
  gain.connect(audioCtx.destination);

  source.start();
}

// Function to start the click track
function startClickTrack() {
  if (!isPlaying) {
    isPlaying = true;
    playClick(false);  // Play regular click when track starts

    intervalId = setInterval(() => {
      playClick(false); // Play regular click
    }, (60 / bpmInput.value) * 1000); // Adjust interval based on BPM
  }
}

// Function to stop the click track
function stopClickTrack() {
  if (isPlaying) {
    clearInterval(intervalId); // Stop the interval
    isPlaying = false;
    console.log("Click track stopped");
  }
}

// Tap tempo functionality
function tapTempoFunction() {
  const currentTime = Date.now();  // Get the current time in milliseconds
  const timeDiff = currentTime - lastTapTime;  // Time difference between taps

  if (timeDiff > 0 && timeDiff < 2000) { // Avoid too long intervals
    tapCount++;

    const newBpm = Math.round(60000 / timeDiff);  // Calculate BPM from the time difference
    bpmInput.value = newBpm;  // Update the BPM input field with the new value
    console.log(`New BPM: ${newBpm}`);
  }

  lastTapTime = currentTime;  // Store the current time for the next tap
}

// Add event listeners to buttons
document.getElementById('start').addEventListener('click', async () => {
  console.log("Start button clicked");
  await loadSounds();  // Load sounds when start is clicked

  // Allow AudioContext to start with user interaction
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  startClickTrack(); // Start the click track
});

document.getElementById('stop').addEventListener('click', () => {
  console.log("Stop button clicked");
  stopClickTrack(); // Stop the click track
});

document.getElementById('save').addEventListener('click', () => {
  // You can add save settings logic here (e.g., saving to localStorage)
  console.log("Settings saved");
});

// Tap tempo button logic
document.getElementById('tapTempo').addEventListener('click', tapTempoFunction);
