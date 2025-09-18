// recorder-ui.js
import { AudioRecorder } from './recorder.js';
import { WhisperAPI } from './api.js';

const RecorderUI = (function () {
  let recorder = null;
  let animationId = null;
  let recording = false;
  let context, analyser, source, dataArray;

  const rmsThreshold = 0.05; // Voice activity trigger level
  const canvas = document.getElementById("rmsCanvas");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("startRecord");
  const stopButton = document.getElementById("stopRecord");
  const statusText = document.getElementById("recordStatus");
  const resultText = document.getElementById("transcriptResult");
  const apiKeyInput = document.getElementById("openaiApiKey");

  function setupAudioVisualizer(stream) {
    context = new AudioContext();
    analyser = context.createAnalyser();
    source = context.createMediaStreamSource(stream);
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.fftSize);
  }

  function getRMS(buffer) {
    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
      const val = (buffer[i] - 128) / 128.0;
      sumSquares += val * val;
    }
    return Math.sqrt(sumSquares / buffer.length);
  }

  function drawVisualizer() {
    analyser.getByteTimeDomainData(dataArray);
    const rms = getRMS(dataArray);

    // Clear and draw RMS bar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barHeight = rms * canvas.height * 2;
    ctx.fillStyle = rms > rmsThreshold ? "#00ff00" : "#888";
    ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

    // Auto-start/stop logic
    if (!recording && rms > rmsThreshold) {
      console.log("Voice detected. Auto-start recording.");
      startRecording();
    }

    if (recording && rms < rmsThreshold) {
      console.log("Silence detected. Auto-stop recording.");
      stopRecording();
    }

    animationId = requestAnimationFrame(drawVisualizer);
  }

  async function startRecording() {
    if (recording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = new Recorder(stream);
      await recorder.start();

      setupAudioVisualizer(stream);
      drawVisualizer();

      recording = true;
      statusText.textContent = "🎙️ Lytter … snakk nå!";
    } catch (err) {
      console.error("Mic error:", err);
      statusText.textContent = "Mic error. Check permission.";
    }
  }

  async function stopRecording() {
    if (!recording) return;

    const blob = await recorder.stop();
    cancelAnimationFrame(animationId);
    recording = false;
    statusText.textContent = "⏹️ Opptak ferdig. Transkriberer …";

    try {
      const apiKey = apiKeyInput.value;
      const transcript = await WhisperAPI.transcribeAudio(blob, apiKey, "no");
      resultText.textContent = transcript;
      statusText.textContent = "✅ Transkripsjon fullført.";
    } catch (err) {
      console.error("Whisper error:", err);
      statusText.textContent = `❌ Feil ved transkripsjon: ${err.message}`;
    }
  }

  function manualStart() {
    statusText.textContent = "🔍 Starter lytting …";
    startRecording();
  }

  function manualStop() {
    statusText.textContent = "⏹️ Stopper opptak …";
    stopRecording();
  }

  function bindUIEvents() {
    startButton.addEventListener("click", manualStart);
    stopButton.addEventListener("click", manualStop);
  }

  function init() {
    bindUIEvents();
    console.log("Recorder UI initialized.");
  }

  return {
    init
  };
})();

