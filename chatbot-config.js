/*
  DIGITAL MISSION — CHATBOT CONFIG
  Cloudflare Worker sudah dihubungkan.

  Jangan taruh GEMINI_API_KEY di file ini.
  API key tetap disimpan sebagai Secret di Cloudflare Worker.
*/
window.DIGITAL_MISSION_AI_CONFIG = {
  workerUrl: "https://digital-mission-ai.zain43ul.workers.dev",
  maxRequestsPerRound: 1
};
