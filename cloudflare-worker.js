/**
 * DIGITAL MISSION — CLOUDFLARE WORKER
 * Fitur:
 * 1) Chatbot bantuan diskusi siswa
 * 2) Analisis keaktifan chat siswa untuk guru
 * 3) Generator kasus AI + ilustrasi gambar per slide
 *
 * Secret yang dibutuhkan:
 * - GEMINI_API_KEY
 *
 * Variable opsional:
 * - GEMINI_MODEL      default: models/gemini-3.5-flash-lite
 * - ALLOWED_ORIGIN    default: https://zain43ul-afk.github.io
 *
 * Binding yang dibutuhkan:
 * - AI  -> Workers AI binding untuk image generation
 */

function json(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin'
    }
  })
}

function chooseOrigin(request, env) {
  const configured = String(env.ALLOWED_ORIGIN || 'https://zain43ul-afk.github.io').trim()
  const origin = request.headers.get('Origin') || configured
  const allowed = [configured, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']
  return allowed.includes(origin) ? origin : configured
}

function clean(value, max = 2000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, Number(num) || 0))
}

function parseJsonText(raw) {
  const text = String(raw || '').trim()
  if (!text) throw new Error('Respons AI kosong.')
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const source = fenced ? fenced[1].trim() : text
  return JSON.parse(source)
}

function extractText(result) {
  return result?.candidates?.[0]?.content?.parts?.map(part => part?.text || '').join('\n').trim() || ''
}

async function geminiGenerate(env, prompt, options = {}) {
  const apiKey = env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Secret GEMINI_API_KEY belum diatur di Cloudflare Worker.')
  const model = String(env.GEMINI_MODEL || 'models/gemini-3.5-flash-lite').trim()
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      topP: 0.9,
      responseMimeType: options.json ? 'application/json' : 'text/plain'
    }
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const msg = payload?.error?.message || `Gemini gagal (${response.status})`
    throw new Error(msg)
  }
  return extractText(payload)
}

function bytesToDataUrl(bytes, mime = 'image/png') {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return `data:${mime};base64,${btoa(binary)}`
}

async function workersAiImage(env, prompt) {
  if (!env.AI) return ''
  const result = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
    prompt,
    steps: 4,
    seed: Math.floor(Math.random() * 2147483647)
  })

  if (!result) return ''
  if (typeof result?.image === 'string') {
    if (result.image.startsWith('data:image/')) return result.image
    return `data:image/jpeg;charset=utf-8;base64,${result.image}`
  }
  if (result instanceof ArrayBuffer) return bytesToDataUrl(new Uint8Array(result), 'image/jpeg')
  if (result instanceof Uint8Array) return bytesToDataUrl(result, 'image/jpeg')
  if (result?.image instanceof ArrayBuffer) return bytesToDataUrl(new Uint8Array(result.image), 'image/jpeg')
  if (result?.image instanceof Uint8Array) return bytesToDataUrl(result.image, 'image/jpeg')
  if (typeof result === 'string') {
    if (result.startsWith('data:image/')) return result
    return `data:image/jpeg;charset=utf-8;base64,${result}`
  }
  return ''
}

function normalizeSlides(caseItem, slideCount) {
  const rawSlides = Array.isArray(caseItem?.slides) ? caseItem.slides : []
  const slides = []
  for (let i = 0; i < slideCount; i++) {
    const current = rawSlides[i] || {}
    slides.push({
      title: clean(current.title || `Slide ${i + 1}`, 120),
      text: clean(current.text || current.description || 'Belum ada isi slide.', 900),
      imagePrompt: clean(current.imagePrompt || '', 500)
    })
  }
  return slides
}

function normalizeCase(caseItem, idx, cfg) {
  const options = Array.isArray(caseItem?.options) && caseItem.options.length >= 3
    ? caseItem.options.slice(0, 3).map(x => clean(x, 100))
    : ['Pilihan 1', 'Pilihan 2', 'Pilihan 3']

  let correct = caseItem?.correct
  if (correct === null || correct === undefined || correct === '') correct = null
  else correct = clamp(correct, 0, 2)

  return {
    title: clean(caseItem?.title || `Ronde ${idx + 1}`, 140),
    kicker: clean(caseItem?.kicker || cfg.topic || 'Kasus AI', 80),
    text: clean(caseItem?.text || caseItem?.question || 'Diskusikan kasus ini bersama tim.', 500),
    options,
    correct,
    slides: normalizeSlides(caseItem, cfg.slidesPerCase)
  }
}

async function generateCaseImages(cases, cfg, env) {
  if (!cfg.withImages) return cases
  for (const item of cases) {
    for (const slide of item.slides) {
      const prompt = clean(
        slide.imagePrompt ||
        `Ilustrasi edukatif semi realistis untuk siswa SMP. Tema: ${cfg.topic}. Judul kasus: ${item.title}. Judul slide: ${slide.title}. Isi slide: ${slide.text}. Tampilkan situasi yang relevan, rapi, aman untuk sekolah, tanpa teks besar atau watermark.`,
        700
      )
      try {
        slide.imageUrl = await workersAiImage(env, prompt)
      } catch (err) {
        slide.imageUrl = ''
        slide.imageError = clean(err?.message || 'Gagal membuat gambar', 160)
      }
    }
  }
  return cases
}

async function handleGenerateCases(body, env, origin) {
  const cfg = body?.generation || {}
  const rounds = clamp(cfg.rounds || 5, 3, 7)
  const slidesPerCase = clamp(cfg.slidesPerCase || 3, 3, 5)
  const prompt = `Anda adalah penyusun materi diskusi Informatika SMP/MTs.
Buat ${rounds} kasus diskusi kelas VIII bertema "${clean(cfg.topic || 'Keamanan dan etika digital', 100)}".

Kebutuhan:
- Fokus kasus: ${clean(cfg.skill || 'campuran', 50)}
- Tingkat kesulitan: ${clean(cfg.difficulty || 'sedang', 30)}
- Jumlah slide per kasus: ${slidesPerCase}
- Panjang isi tiap slide: ${clean(cfg.length || 'sekitar 50-70 kata per slide', 120)}
- Setting: ${clean(cfg.setting || 'campuran', 60)}
- Gaya pertanyaan: ${clean(cfg.questionStyle || 'campuran', 60)}
- Catatan guru: ${clean(cfg.teacherNote || '-', 300)}
- Level: ${clean(cfg.classLevel || 'kelas VIII SMP/MTs', 60)}

Formatkan jawaban sebagai JSON murni tanpa markdown dengan bentuk:
{
  "cases": [
    {
      "title": "...",
      "kicker": "...",
      "text": "pertanyaan kelompok utama",
      "options": ["pilihan A", "pilihan B", "pilihan C"],
      "correct": 0,
      "slides": [
        {"title":"...","text":"...","imagePrompt":"..."}
      ]
    }
  ]
}

Aturan penting:
- Setiap kasus harus punya tepat ${slidesPerCase} slide.
- Slide 1 memaparkan latar kejadian.
- Slide tengah memuat detail, dilema, data, atau sudut pandang berbeda.
- Slide terakhir menutup dengan tugas/pertanyaan yang mendorong diskusi tim.
- Gunakan bahasa Indonesia yang mudah dipahami siswa kelas VIII.
- Hindari jawaban terlalu panjang.
- Boleh ada correct = null jika cocok untuk debat atau penilaian guru.`

  const raw = await geminiGenerate(env, prompt, { json: true, temperature: 0.8 })
  const parsed = parseJsonText(raw)
  const list = Array.isArray(parsed?.cases) ? parsed.cases : []
  if (!list.length) throw new Error('Gemini tidak menghasilkan daftar kasus.')

  const normalizedCfg = {
    topic: clean(cfg.topic || 'Keamanan dan etika digital', 100),
    slidesPerCase,
    withImages: cfg.withImages !== false
  }
  let cases = list.slice(0, rounds).map((item, idx) => normalizeCase(item, idx, normalizedCfg))

  while (cases.length < rounds) {
    cases.push(normalizeCase({}, cases.length, normalizedCfg))
  }

  cases = await generateCaseImages(cases, normalizedCfg, env)
  return json({ ok: true, cases }, 200, origin)
}

async function handleActivityEvaluation(body, env, origin) {
  const evaluation = body?.evaluation || {}
  const students = Array.isArray(evaluation.students) ? evaluation.students : []
  const transcript = Array.isArray(evaluation.transcript) ? evaluation.transcript : []
  if (!students.length) return json({ results: [] }, 200, origin)

  const prompt = `Anda membantu guru menilai keaktifan chat diskusi siswa.
Gunakan bahasa Indonesia.
Jangan sebut nama asli siswa, hanya studentId.

Judul ronde: ${clean(evaluation.missionTitle || `Ronde ${evaluation.round || ''}`, 120)}
Ringkasan kasus: ${clean(evaluation.missionText || '-', 1200)}

Daftar siswa:
${students.map(s => `- ${s.studentId} | peran: ${clean(s.roleName, 40)} | tugas: ${clean(s.roleTask, 120)} | statistik objektif: ${JSON.stringify(s.stats || {})}`).join('\n')}

Transkrip chat:
${transcript.map(t => `${t.studentId}: ${clean(t.text, 300)}`).join('\n')}

Keluarkan JSON murni:
{
  "results": [
    {
      "studentId": "student_01",
      "aiScore": 0,
      "note": "catatan singkat 1 kalimat",
      "strengths": ["...", "..."],
      "improvement": "saran singkat"
    }
  ]
}

Aturan:
- aiScore 0-100.
- Perhatikan relevansi isi, partisipasi, tanggapan ke teman, dan kedalaman kontribusi.
- Jika kontribusi sangat sedikit, beri skor rendah dan catatan jujur.`

  const raw = await geminiGenerate(env, prompt, { json: true, temperature: 0.3 })
  const parsed = parseJsonText(raw)
  const results = Array.isArray(parsed?.results) ? parsed.results : []
  return json({ results }, 200, origin)
}

async function handleStudentChat(body, env, origin) {
  const question = clean(body?.question || '', 1000)
  if (!question) return json({ error: 'Pertanyaan tidak boleh kosong.' }, 400, origin)
  const ctx = body?.context || {}
  const prompt = `Anda adalah Asisten Diskusi AI untuk siswa kelas VIII.
Jawab ringkas, membantu, dan tidak membocorkan jawaban akhir.
Tujuan Anda memberi petunjuk, pertanyaan pemantik, atau uji argumen.

Mode bantuan: ${clean(body?.mode || 'free', 40)}
Nama tim: ${clean(ctx.groupName || '-', 60)}
Ronde: ${clean(ctx.round || '-', 20)}
Judul kasus: ${clean(ctx.missionTitle || '-', 120)}
Ringkasan kasus: ${clean(ctx.missionText || '-', 1200)}
Pilihan jawaban: ${Array.isArray(ctx.options) ? ctx.options.map(x => clean(x, 120)).join(' | ') : '-'}
Peran pengguna: ${clean(ctx.role || '-', 60)}
Diskusi tim terakhir:\n${clean(ctx.teamDiscussion || '-', 2500)}
Draft alasan tim: ${clean(ctx.groupReason || '-', 1200)}

Pertanyaan siswa: ${question}

Aturan jawaban:
- Maksimal sekitar 180 kata.
- Jangan memberi jawaban final secara langsung.
- Fokus pada langkah berpikir, cek risiko, dan pertanyaan lanjutan.`

  const answer = await geminiGenerate(env, prompt, { temperature: 0.5 })
  return json({ answer }, 200, origin)
}

export default {
  async fetch(request, env) {
    const origin = chooseOrigin(request, env)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Vary': 'Origin'
        }
      })
    }

    if (request.method !== 'POST') {
      return json({ status: 'ok', message: 'Digital Mission AI aktif. Gunakan POST dari web.' }, 200, origin)
    }

    try {
      const body = await request.json()
      const mode = clean(body?.mode || '', 40)
      if (mode === 'generate_cases') return await handleGenerateCases(body, env, origin)
      if (mode === 'evaluate_activity') return await handleActivityEvaluation(body, env, origin)
      return await handleStudentChat(body, env, origin)
    } catch (err) {
      return json({ error: clean(err?.message || String(err), 500) }, 500, origin)
    }
  }
}
