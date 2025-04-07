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
