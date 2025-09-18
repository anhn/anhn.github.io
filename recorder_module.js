// recorder.js (modular with auto-record, RMS visualization, and OpenAI transcription)
export class AudioRecorder {
    constructor({ onRms, onTranscript, openaiApiKey }) {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.audioContext = null;
        this.analyser = null;
        this.sourceNode = null;
        this.rmsCallback = onRms;
        this.transcriptCallback = onTranscript;
        this.apiKey = openaiApiKey;
        this.recording = false;
        this.autoStopTimer = null;
    }

    async init() {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
        this.sourceNode.connect(this.analyser);
        this.analyser.fftSize = 1024;

        this.monitorRms();
    }

    monitorRms() {
        const buffer = new Uint8Array(this.analyser.frequencyBinCount);

        const loop = () => {
            this.analyser.getByteTimeDomainData(buffer);
            const rms = Math.sqrt(buffer.reduce((acc, val) => acc + (val - 128) ** 2, 0) / buffer.length) / 128;

            if (this.rmsCallback) this.rmsCallback(rms);

            if (!this.recording && rms > 0.08) {
                this.start();
            } else if (this.recording && rms < 0.04) {
                // wait 1.5s before stopping to avoid cutting off too early
                clearTimeout(this.autoStopTimer);
                this.autoStopTimer = setTimeout(() => {
                    this.stop();
                }, 1500);
            }
            requestAnimationFrame(loop);
        };
        loop();
    }

    start() {
        if (this.recording) return;
        this.recording = true;
        this.audioChunks = [];

        this.mediaRecorder = new MediaRecorder(this.stream);
        this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);

        this.mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            const transcript = await this.transcribe(audioBlob);
            if (this.transcriptCallback) this.transcriptCallback(transcript);
        };

        this.mediaRecorder.start();
    }

    stop() {
        if (!this.recording) return;
        this.recording = false;
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
    }

    async transcribe(blob) {
        const formData = new FormData();
        formData.append('file', blob, 'speech.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'no');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.apiKey}`
            },
            body: formData
        });

        if (!response.ok) {
            console.error('Transcription failed:', await response.text());
            return '';
        }

        const json = await response.json();
        return json.text || '';
    }
}