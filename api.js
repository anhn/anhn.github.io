// api.js

const TRANSCRIBE_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";

/**
 * Transcribe audio using OpenAI Whisper API
 * @param {Blob} audioBlob - The audio file blob (e.g. from Recorder.js)
 * @param {string} apiKey - OpenAI API key
 * @param {string} language - Language code (e.g., 'no' for Norwegian)
 * @returns {Promise<string>} - The transcribed text
 */
async function transcribeAudio(audioBlob, apiKey, language = "no") {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("model", "whisper-1");
  formData.append("language", language);

  const response = await fetch(TRANSCRIBE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Whisper API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result.text;
}

export const WhisperAPI = {
  transcribeAudio
};
