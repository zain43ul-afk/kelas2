/**
 * DIGITAL MISSION — CLOUDFLARE WORKER
 * Chatbot siswa + generator kasus AI + analisis keaktifan chat untuk guru.
 *
 * Secret wajib:
 *   GEMINI_API_KEY
 *
 * Variable opsional:
 *   GEMINI_MODEL    contoh: gemini-3.5-flash-lite
 *   ALLOWED_ORIGIN  contoh: https://zain43ul-afk.github.io
 */

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin"
    }
  });
}

function clean(value, max = 1000) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

function chooseOrigin(request, env) {
  const requestOrigin = request.headers.get("Origin") || "";
  const allowed = clean(env.ALLOWED_ORIGIN || "", 300);
  if (!allowed) return requestOrigin || "*";
  return requestOrigin === allowed ? allowed : "";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map(p => p?.text || "").join("\n").trim();
}

function parseJsonText(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  try { return JSON.parse(raw); } catch {}
  const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try { return JSON.parse(stripped); } catch {}
  const first = stripped.indexOf("[");
  const last = stripped.lastIndexOf("]");
  if (first >= 0 && last > first) {
    try { return JSON.parse(stripped.slice(first, last + 1)); } catch {}
  }
  return null;
}

async function geminiGenerate(env, prompt, generationConfig = {}) {
  const model = clean(env.GEMINI_MODEL || "gemini-3.5-flash-lite", 100);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig
    })
  });
  let data = {};
  try { data = await response.json(); } catch {}
  if (!response.ok) {
    const message = clean(data?.error?.message || `Gemini API error ${response.status}`, 500);
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return extractText(data);
}

async function handleStudentChat(body, env, origin) {
  const question = clean(body.question, 600);
  const mode = clean(body.mode, 30);
  const c = body.context || {};
  if (!question) return json({ error: "Pertanyaan kosong." }, 400, origin);

  const context = {
    className: clean(c.className, 40),
    groupName: clean(c.groupName, 60),
    round: Number(c.round || 0),
    missionTitle: clean(c.missionTitle, 180),
    missionText: clean(c.missionText, 5000),
    options: Array.isArray(c.options) ? c.options.slice(0, 6).map(x => clean(x, 180)) : [],
    selectedOption: clean(c.selectedOption, 220),
    groupReason: clean(c.groupReason, 1200),
    role: clean(c.role, 60),
    challenge: clean(c.challenge, 500),
    teamDiscussion: clean(c.teamDiscussion, 3500)
  };

  const prompt = `
Kamu adalah "Asisten Diskusi AI" untuk siswa kelas VIII SMP pada game pembelajaran Informatika bernama Digital Mission.

ATURAN WAJIB:
1. Bimbing proses berpikir dan diskusi, bukan memberikan jawaban akhir yang bisa langsung disalin.
2. Jangan mengatakan pilihan mana yang benar, jangan menyebut nomor opsi jawaban yang benar, dan jangan menulis jawaban tugas lengkap.
3. Jika siswa meminta jawaban langsung, tolak secara singkat lalu berikan petunjuk atau pertanyaan pemantik.
4. Gunakan Bahasa Indonesia sederhana dan sesuai usia SMP.
5. Fokus pada konteks misi yang diberikan.
6. Maksimal sekitar 120 kata.
7. Jika kelompok sudah menulis argumen, bantu menguji logika, bukti, risiko, dan alternatifnya.
8. Jangan meminta data pribadi siswa.

MODE BANTUAN: ${mode || "free"}
KELAS: ${context.className || "VIII"}
KELOMPOK: ${context.groupName || "-"}
RONDE: ${context.round || "-"}
PERAN SISWA: ${context.role || "-"}
JUDUL MISI: ${context.missionTitle || "-"}
KASUS/MISI: ${context.missionText || "-"}
OPSI: ${context.options.length ? context.options.join(" | ") : "-"}
PILIHAN SEMENTARA: ${context.selectedOption || "belum memilih"}
ALASAN/DRAF: ${context.groupReason || "belum ada"}
KARTU TANTANGAN: ${context.challenge || "tidak ada"}
RINGKASAN CHAT TIM TERBARU:
${context.teamDiscussion || "belum ada diskusi tertulis"}

PERTANYAAN SISWA:
${question}

Jawab sebagai fasilitator diskusi. Jangan berikan kunci jawaban.`.trim();

  try {
    const answer = await geminiGenerate(env, prompt, {
      temperature: 0.45,
      maxOutputTokens: 220,
      topP: 0.9
    });
    if (!answer) return json({ error: "Gemini tidak mengembalikan teks." }, 502, origin);
    return json({ answer }, 200, origin);
  } catch (error) {
    return json({ error: clean(error.message || "Gemini gagal merespons.", 500) }, error.status || 502, origin);
  }
}


function normalizeGeneratedCases(parsed, rounds, slidesPerCase) {
  if (!Array.isArray(parsed) || parsed.length < rounds) return null;
  const source = parsed.slice(0, rounds);
  const cases = [];

  for (let i = 0; i < source.length; i++) {
    const item = source[i] || {};
    let slidesRaw = Array.isArray(item.slides) ? item.slides : [];
    let optionsRaw = Array.isArray(item.options) ? item.options : [];

    // Gemini kadang memberi 1 slide/opsi ekstra meskipun prompt meminta jumlah tepat.
    // Ekstra aman dipotong; kekurangan tidak dipaksakan karena bisa merusak isi kasus.
    slidesRaw = slidesRaw.filter(x => clean(x?.text || "", 1200)).slice(0, slidesPerCase);
    optionsRaw = optionsRaw.map(x => clean(x, 240)).filter(Boolean).slice(0, 3);

    if (slidesRaw.length < slidesPerCase || optionsRaw.length < 3) return null;

    const slides = slidesRaw.map((x, j) => ({
      title: clean(x?.title || `Bagian ${j + 1}`, 100),
      text: clean(x?.text || "", 1200)
    }));

    // Jangan terlalu ketat. Yang penting tiap slide benar-benar berisi bacaan.
    if (slides.some(x => x.text.length < 45)) return null;

    let correct = item.correct;
    if (correct === undefined || correct === "") correct = null;
    if (correct !== null) {
      correct = Number(correct);
      if (![0, 1, 2].includes(correct)) return null;
    }

    cases.push({
      title: clean(item.title || `Ronde ${i + 1}`, 160),
      kicker: clean(item.kicker || "Kasus Digital", 80),
      text: clean(item.text || "Diskusikan kasus ini dan tentukan keputusan kelompok.", 700),
      slides,
      options: optionsRaw,
      correct
    });
  }

  return cases;
}

async function repairGeneratedCases(env, rawOutput, rounds, slidesPerCase) {
  const raw = clean(typeof rawOutput === "string" ? rawOutput : JSON.stringify(rawOutput || []), 20000);
  const prompt = `
Perbaiki JSON paket kasus berikut. Jangan mengubah bahasa menjadi Markdown dan jangan menjelaskan apa pun.

SYARAT WAJIB:
- Output HANYA JSON array valid.
- Tepat ${rounds} objek ronde.
- Setiap ronde punya field: title, kicker, text, slides, options, correct.
- Setiap ronde tepat ${slidesPerCase} slide.
- Setiap slide punya title dan text yang berisi bacaan bermakna.
- Setiap ronde tepat 3 opsi.
- correct hanya 0, 1, 2, atau null.
- Pertahankan isi kasus sebisa mungkin, hanya rapikan struktur yang salah atau lengkapi bagian yang kurang.

JSON YANG PERLU DIPERBAIKI:
${raw}
`.trim();

  const repaired = await geminiGenerate(env, prompt, {
    temperature: 0.15,
    maxOutputTokens: 7000,
    topP: 0.8,
    responseMimeType: "application/json"
  });
  return parseJsonText(repaired);
}

async function handleGenerateCases(body, env, origin) {
  const g = body.generation || {};
  const topic = clean(g.topic || "Keamanan dan etika digital", 120);
  const skill = clean(g.skill || "campuran", 120);
  const difficulty = clean(g.difficulty || "sedang", 40);
  const classLevel = clean(g.classLevel || "kelas VIII SMP/MTs", 80);
  const length = clean(g.length || "sedang sekitar 50-70 kata per slide", 100);
  const setting = clean(g.setting || "campuran situasi sekolah, rumah, grup chat, media sosial, dan game", 160);
  const questionStyle = clean(g.questionStyle || "campuran", 140);
  const teacherNote = clean(g.teacherNote || "", 500);
  const rounds = Math.round(clamp(g.rounds || 5, 3, 7));
  const slidesPerCase = Math.round(clamp(g.slidesPerCase || 3, 3, 5));
  const nonce = clean(g.nonce || Date.now(), 80);

  const prompt = `
Kamu membuat paket studi kasus untuk game diskusi kelompok Informatika bernama Digital Mission.

TARGET:
- Peserta: ${classLevel}
- Jumlah ronde: tepat ${rounds}
- Setiap kasus: tepat ${slidesPerCase} slide bacaan
- Panjang setiap slide: ${length}
- Topik utama: ${topic}
- Fokus: ${skill}
- Tingkat kesulitan: ${difficulty}
- Gaya situasi: ${setting}
- Model keputusan: ${questionStyle}
- Catatan guru: ${teacherNote || "tidak ada"}
- Penanda variasi: ${nonce}

ATURAN KONTEN:
1. Buat kasus yang realistis, dekat dengan kehidupan siswa kelas VIII, dan berbeda satu sama lain.
2. Jangan mengulang kasus umum dengan susunan yang sama. Variasikan tokoh, situasi, aplikasi, konflik, dan jenis keputusan.
3. Setiap kasus harus berupa bacaan naratif, bukan hanya 1-2 kalimat.
4. Bagi informasi ke ${slidesPerCase} slide. Setiap slide harus memiliki judul singkat dan paragraf yang cukup untuk dibaca serta dianalisis siswa.
5. Slide awal memberi latar/peristiwa. Slide tengah menambah konteks atau petunjuk. Slide terakhir mengarahkan siswa pada hal yang perlu dipikirkan, tetapi JANGAN membocorkan jawaban benar.
6. field "text" adalah pertanyaan/keputusan utama untuk kelompok, bukan salinan seluruh bacaan.
7. Berikan tepat 3 opsi jawaban. Opsi harus masuk akal sehingga siswa perlu berdiskusi, bukan dua opsi jelas konyol.
8. Untuk soal yang memiliki jawaban paling tepat, "correct" adalah indeks 0, 1, atau 2. Untuk ronde debat yang memang tidak memiliki satu jawaban tunggal, "correct" boleh null.
9. Maksimal satu ronde debat tanpa jawaban tunggal dalam satu paket.
10. Gunakan Bahasa Indonesia sederhana, alami, dan sesuai usia. Hindari istilah akademik yang berat.
11. Jangan memasukkan informasi pribadi nyata, konten seksual, kekerasan grafis, perjudian, narkoba, atau instruksi tindakan berbahaya.
12. Jangan menulis HTML atau Markdown di nilai JSON.

Keluarkan HANYA JSON array valid dengan tepat ${rounds} objek. Format setiap objek harus seperti ini:
[
  {
    "title":"Ronde 1 — judul singkat",
    "kicker":"tema singkat",
    "text":"pertanyaan utama yang harus diputuskan kelompok",
    "slides":[
      {"title":"judul slide", "text":"paragraf bacaan"}
    ],
    "options":["opsi 1","opsi 2","opsi 3"],
    "correct":1
  }
]
Pastikan jumlah slides pada SETIAP objek tepat ${slidesPerCase}.`.trim();

  try {
    const answer = await geminiGenerate(env, prompt, {
      temperature: 0.72,
      maxOutputTokens: 7000,
      topP: 0.9,
      responseMimeType: "application/json"
    });

    let parsed = parseJsonText(answer);
    let cases = normalizeGeneratedCases(parsed, rounds, slidesPerCase);
    let repaired = false;

    // Jika Gemini meleset dari struktur (mis. ronde 3 hanya 2 slide),
    // Worker memperbaiki otomatis sekali sehingga guru tidak perlu terus menekan Generate ulang.
    if (!cases) {
      parsed = await repairGeneratedCases(env, parsed || answer, rounds, slidesPerCase);
      cases = normalizeGeneratedCases(parsed, rounds, slidesPerCase);
      repaired = true;
    }

    if (!cases) {
      return json({
        error: "Gemini belum berhasil menyusun struktur kasus yang valid setelah perbaikan otomatis. Silakan Generate sekali lagi."
      }, 502, origin);
    }

    return json({ cases, repaired }, 200, origin);
  } catch (error) {
    return json({ error: clean(error.message || "Generator kasus AI gagal.", 500) }, error.status || 502, origin);
  }
}

async function handleActivityEvaluation(body, env, origin) {
  const e = body.evaluation || {};
  const round = Number(e.round || 0);
  const missionTitle = clean(e.missionTitle, 200);
  const missionText = clean(e.missionText, 5000);
  const students = Array.isArray(e.students) ? e.students.slice(0, 12) : [];
  const transcript = Array.isArray(e.transcript) ? e.transcript.slice(-120) : [];

  if (!students.length) return json({ error: "Data siswa untuk analisis kosong." }, 400, origin);

  const safeStudents = students.map(s => ({
    studentId: clean(s.studentId, 30),
    roleName: clean(s.roleName, 120),
    roleTask: clean(s.roleTask, 300),
    stats: {
      totalMessages: clamp(s?.stats?.totalMessages, 0, 500),
      meaningfulMessages: clamp(s?.stats?.meaningfulMessages, 0, 500),
      shortMessages: clamp(s?.stats?.shortMessages, 0, 500),
      duplicateMessages: clamp(s?.stats?.duplicateMessages, 0, 500),
      wordCount: clamp(s?.stats?.wordCount, 0, 10000),
      responseMessages: clamp(s?.stats?.responseMessages, 0, 500),
      activeMinuteBuckets: clamp(s?.stats?.activeMinuteBuckets, 0, 120),
      objectiveScore: clamp(s?.stats?.objectiveScore, 0, 100)
    }
  })).filter(s => /^student_\d+$/i.test(s.studentId));

  const validIds = new Set(safeStudents.map(s => s.studentId));
  const safeTranscript = transcript.map(m => ({
    studentId: clean(m.studentId, 30),
    text: clean(m.text, 450)
  })).filter(m => validIds.has(m.studentId) && m.text);

  const prompt = `
Kamu menilai KEAKTIFAN TERTULIS dalam chat diskusi kelompok siswa kelas VIII SMP.
Nama asli tidak diberikan. Setiap siswa hanya dikenali dengan ID anonim seperti student_01.

PENTING:
- Nilai ini hanya berdasarkan bukti pada chat yang diberikan, bukan keaktifan lisan di kelas.
- Jangan memberi nilai tinggi hanya karena jumlah pesan banyak.
- Pesan "iya", "oke", "setuju", pengulangan, spam, atau pesan pendek tanpa substansi harus bernilai rendah.
- Perhatikan kualitas kontribusi: relevansi, alasan, solusi, respons terhadap anggota lain, pertanyaan yang memajukan diskusi, dan konsistensi.
- Data peran siswa disertakan sebagai konteks. Periksa apakah kontribusi tertulis selaras dengan tugas perannya, tetapi jangan menghukum siswa hanya karena membantu tugas anggota lain.
- Jangan mengarang kontribusi yang tidak terlihat pada transkrip.

RUBRIK AI (total 100):
1. Relevansi terhadap kasus: 0–25
2. Kualitas alasan/argumentasi: 0–25
3. Kontribusi pada pemecahan masalah: 0–20
4. Respons/interaksi terhadap ide anggota lain: 0–15
5. Inisiatif bertanya/memberi ide: 0–10
6. Konsistensi kontribusi: 0–5

RONDE: ${round || "-"}
MISI: ${missionTitle || "-"}
KASUS: ${missionText || "-"}

STATISTIK OBJEKTIF PER SISWA:
${JSON.stringify(safeStudents)}

TRANSKRIP CHAT ANONIM:
${JSON.stringify(safeTranscript)}

Keluarkan HANYA JSON array valid. Satu objek untuk setiap studentId dengan format tepat:
[
  {
    "studentId":"student_01",
    "relevance":0,
    "argumentation":0,
    "problemSolving":0,
    "interaction":0,
    "initiative":0,
    "consistency":0,
    "aiScore":0,
    "note":"catatan ringkas berbasis bukti chat",
    "strengths":["maksimal 3 kekuatan singkat"],
    "improvement":"satu saran perbaikan singkat"
  }
]

Batas skor aspek harus sesuai maksimum rubrik. aiScore harus sama dengan jumlah enam aspek. Jika siswa tidak menulis pesan, beri aiScore 0.`.trim();

  try {
    const answer = await geminiGenerate(env, prompt, {
      temperature: 0.1,
      maxOutputTokens: 1800,
      topP: 0.8,
      responseMimeType: "application/json"
    });
    const parsed = parseJsonText(answer);
    if (!Array.isArray(parsed)) return json({ error: "Format hasil penilaian Gemini tidak valid. Coba analisis ulang." }, 502, origin);

    const resultMap = new Map();
    for (const item of parsed) {
      const studentId = clean(item?.studentId, 30);
      if (!validIds.has(studentId)) continue;
      const relevance = clamp(item.relevance, 0, 25);
      const argumentation = clamp(item.argumentation, 0, 25);
      const problemSolving = clamp(item.problemSolving, 0, 20);
      const interaction = clamp(item.interaction, 0, 15);
      const initiative = clamp(item.initiative, 0, 10);
      const consistency = clamp(item.consistency, 0, 5);
      const aiScore = Math.round(relevance + argumentation + problemSolving + interaction + initiative + consistency);
      resultMap.set(studentId, {
        studentId,
        relevance,
        argumentation,
        problemSolving,
        interaction,
        initiative,
        consistency,
        aiScore,
        note: clean(item.note, 500),
        strengths: Array.isArray(item.strengths) ? item.strengths.slice(0, 3).map(x => clean(x, 160)).filter(Boolean) : [],
        improvement: clean(item.improvement, 300)
      });
    }

    const results = safeStudents.map(s => resultMap.get(s.studentId) || {
      studentId: s.studentId,
      relevance: 0,
      argumentation: 0,
      problemSolving: 0,
      interaction: 0,
      initiative: 0,
      consistency: 0,
      aiScore: 0,
      note: s.stats.totalMessages ? "Gemini belum mengembalikan penilaian untuk siswa ini." : "Tidak ada kontribusi tertulis pada chat.",
      strengths: [],
      improvement: "Guru dapat menilai kontribusi lisan secara terpisah."
    });

    return json({ results }, 200, origin);
  } catch (error) {
    return json({ error: clean(error.message || "Analisis Gemini gagal.", 500) }, error.status || 502, origin);
  }
}

export default {
  async fetch(request, env) {
    const origin = chooseOrigin(request, env);
    if (!origin) return new Response("Forbidden", { status: 403 });

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin"
        }
      });
    }

    if (request.method === "GET") {
      return json({ status: "ok", message: "Digital Mission AI aktif." }, 200, origin);
    }
    if (request.method !== "POST") return json({ error: "Gunakan metode POST." }, 405, origin);
    if (!env.GEMINI_API_KEY) return json({ error: "GEMINI_API_KEY belum disimpan sebagai Secret di Cloudflare." }, 500, origin);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "Body JSON tidak valid." }, 400, origin); }

    const mode = clean(body.mode, 40);
    if (mode === "generate_cases") {
      return handleGenerateCases(body, env, origin);
    }
    if (mode === "evaluate_activity") {
      return handleActivityEvaluation(body, env, origin);
    }
    return handleStudentChat(body, env, origin);
  }
};
