// logic.js
import { AudioRecorder } from './recorder.js';
import { WhisperAPI } from './api.js';
import { RecorderUI } from './recorder-ui.js';

const AppLogic = (function () {
  let recorder = null;

  // DOM elements
  const canvas = document.getElementById("rmsCanvas");
  const startBtn = document.getElementById("startRecord");
  const stopBtn = document.getElementById("stopRecord");
  const transcriptBox = document.getElementById("transcriptResult");
  const statusText = document.getElementById("recordStatus");
  const apiKeyInput = document.getElementById("openaiApiKey");

  function updateStatus(text) {
    statusText.textContent = text;
  }

  async function startRecording() {
    updateStatus("🎙️ Starter opptak …");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = new AudioRecorder(stream);
      await recorder.start();

      RecorderUI.visualize(stream, canvas, stopRecording); // auto stop via RMS
      updateStatus("🎧 Opptak pågår … snakk nå!");
    } catch (err) {
      console.error("🎤 Mic error:", err);
      updateStatus("❌ Kunne ikke starte mikrofon. Sjekk tillatelser.");
    }
  }

  async function stopRecording() {
    if (!recorder) return;

    updateStatus("⏹️ Stopper opptak og transkriberer …");
    const audioBlob = await recorder.stop();

    try {
      const apiKey = apiKeyInput.value;
      const transcript = await WhisperAPI.transcribeAudio(audioBlob, apiKey, "no");
      transcriptBox.textContent = transcript;
      updateStatus("✅ Transkripsjon fullført.");
    } catch (err) {
      console.error("Transkripsjonsfeil:", err);
      updateStatus(`❌ Feil: ${err.message}`);
    }
  }

  function bindEvents() {
    startBtn.addEventListener("click", startRecording);
    stopBtn.addEventListener("click", stopRecording);
  }

  function init() {
    bindEvents();
    updateStatus("🟢 Klar. Trykk 'Start opptak' for å begynne.");
    console.log("App initialized.");
  }

  return {
    init
  };
})();

