let audioCtx;
let regularClick, accentClick;
let isPlaying = false;
let intervalId;

const bpmInput = document.getElementById("bpm");
const beatsPerMeasureInput = document.getElementById("beatsPerMeasure");
const subdivisionInput = document.getElementById("subdivision");
const volumeInput = document.getElementById("volume");
const loopBarsInput = document.getElementById("loopBars");
const loopEnabled = document.getElementById("loopEnabled");
const visuals = document.getElementById("visuals");
const flash = document.getElementById("flash");

// Base64-encoded woodblock click (replace with actual base64 data)
const woodblockBase64 = "data:audio/mp3;base64,SUQzBAAAAAAAI1Nvbm..."; // Replace with full base64 string for the woodblock click sound

// Base64-encoded rimshot click (replace with actual base64 data)
const rimshotBase64 = "data:audio/mp3;base64,SUQzBAAAAAAAI1Nvbm..."; // Replace with full base64 string for the rimshot click sound

// Function to load audio buffers from base64 data
async function loadAudioBuffer(base64) {
  const response = await fetch(base64);
  const arrayBuffer = await response.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}

// Load the sounds on page load or on button click
async function loadSounds() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  try {
    regularClick = await loadAudioBuffer(woodblockBase64);
    accentClick = await loadAudioBuffer(rimshotBase64);
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

document.getElementById('tapTempo').addEventListener('click', () => {
  // Add tap tempo functionality here
  console.log("Tap tempo functionality goes here");
});
