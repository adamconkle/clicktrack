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
    const visuals = document.getElementById("visuals");

    const highClickBase64 = "UklGRigAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="; // rimshot-ish short tick
    const lowClickBase64 = "UklGRigAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";  // woodblock-ish short tick

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
            if (barsPlayed >= loopBars) {
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
      alert("Settings saved!");
    }

    function loadSettings() {
      bpmInput.value = localStorage.getItem("clicktrack-bpm") || 120;
      beatsPerMeasureInput.value = localStorage.getItem("clicktrack-beats") || 4;
      subdivisionInput.value = localStorage.getItem("clicktrack-sub") || 1;
      volumeInput.value = localStorage.getItem("clicktrack-vol") || 0.5;
      loopBarsInput.value = localStorage.getItem("clicktrack-loop") || 2;
    }

    document.getElementById("start").addEventListener("click", () => {
      audioCtx.resume();
      startClickTrack();
    });

    document.getElementById("stop").addEventListener("click", stopClickTrack);
    document.getElementById("save").addEventListener("click", saveSettings);

    // Tap tempo logic
    document.getElementById("tapTempo").addEventListener("click", () => {
      const now = Date.now();
      tapTimes.push(now);

      // Keep only the last 5 taps
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
