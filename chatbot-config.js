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

/* Teacher UI assets.
   Diletakkan di sini agar index.html lama tidak perlu diubah. */
(() => {
  const base = new URL('.', document.currentScript?.src || location.href);

  if (!document.querySelector('link[data-dm-teacher-ui]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = new URL('teacher.css', base).href;
    style.dataset.dmTeacherUi = '1';
    document.head.appendChild(style);
  }

  if (!document.querySelector('script[data-dm-teacher-ui]')) {
    const script = document.createElement('script');
    script.src = new URL('teacher-ui.js', base).href;
    script.defer = true;
    script.dataset.dmTeacherUi = '1';
    document.head.appendChild(script);
  }
})();
