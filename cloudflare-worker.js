/**
 * DIGITAL MISSION — CLOUDFLARE WORKER
 * Fitur:
 * 1) Chatbot bantuan diskusi siswa
 * 2) Analisis keaktifan chat siswa untuk guru
 * 3) Generator kasus AI + ilustrasi gambar per slide
 *
 * Secret yang dibutuhkan:
 * - GEMINI_API_KEY (opsional; dipakai generator kasus, dengan fallback Workers AI)
 *
 * Variable opsional:
 * - GEMINI_MODEL      default: models/gemini-3.5-flash-lite
 * - TEXT_MODEL        default: @cf/meta/llama-3.1-8b-instruct-fast
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
  let source = fenced ? fenced[1].trim() : text
  try {
    return JSON.parse(source)
  } catch (_) {
    // Beberapa model menambahkan satu kalimat sebelum/sesudah JSON.
    // Ambil objek/array JSON terluar agar respons tetap dapat dipakai.
    const objStart = source.indexOf('{'), objEnd = source.lastIndexOf('}')
    const arrStart = source.indexOf('['), arrEnd = source.lastIndexOf(']')
    if (objStart >= 0 && objEnd > objStart) return JSON.parse(source.slice(objStart, objEnd + 1))
    if (arrStart >= 0 && arrEnd > arrStart) return JSON.parse(source.slice(arrStart, arrEnd + 1))
    throw _
  }
}

function extractText(result) {
  return result?.candidates?.[0]?.content?.parts?.map(part => part?.text || '').join('\n').trim() || ''
}

function extractWorkersAiText(result) {
  if (!result) return ''
  if (typeof result === 'string') return result.trim()
  if (typeof result?.response === 'string') return result.response.trim()
  if (typeof result?.text === 'string') return result.text.trim()
  if (typeof result?.result?.response === 'string') return result.result.response.trim()
  return ''
}

async function workersAiText(env, prompt, options = {}) {
  if (!env.AI) throw new Error('Workers AI binding AI belum tersedia.')

  const configured = String(env.TEXT_MODEL || '').trim()
  const models = [
    configured,
    '@cf/meta/llama-3.1-8b-instruct-fast'
  ].filter((value, index, arr) => value && arr.indexOf(value) === index)

  let lastError = null

  for (const model of models) {
    try {
      const result = await env.AI.run(model, {
        prompt,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 1800
      })
      const text = extractWorkersAiText(result)
      if (!text) throw new Error('Workers AI tidak mengembalikan teks.')
      return text
    } catch (err) {
      lastError = err
      console.warn(`Workers AI model ${model} gagal:`, err?.message || String(err))
    }
  }

  throw new Error(
    `Workers AI gagal. Pastikan TEXT_MODEL menggunakan model aktif. Detail: ${
      lastError?.message || String(lastError || 'unknown error')
    }`
  )
}

async function workersAiJson(env, prompt, options = {}) {
  const raw = await workersAiText(env, prompt, options)
  return parseJsonText(raw)
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
    steps: 4
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
  return {
    title: clean(caseItem?.title || `Ronde ${idx + 1}`, 140),
    kicker: clean(caseItem?.kicker || cfg.topic || 'Kasus AI', 80),
    text: clean(caseItem?.text || caseItem?.question || 'Diskusikan kasus ini bersama tim dan tuliskan jawaban uraian.', 500),
    options: [],
    correct: null,
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
  const rounds = clamp(cfg.rounds || 5, 2, 5)
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
      "text": "pertanyaan uraian kelompok utama",
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
- Slide terakhir menutup dengan tugas/pertanyaan URAIAN yang mendorong diskusi tim.
- JANGAN membuat pilihan ganda, opsi A/B/C, atau kunci jawaban.
- Pertanyaan utama harus dapat dijawab dengan keputusan, alasan, bukti dari kasus, risiko, dan solusi.
- Gunakan bahasa Indonesia yang mudah dipahami siswa kelas VIII.
- Hindari jawaban terlalu panjang.`

  let parsed
  try {
    const raw = await geminiGenerate(env, prompt, { json: true, temperature: 0.8 })
    parsed = parseJsonText(raw)
  } catch (geminiError) {
    // Fallback penting: Gemini kadang menolak IP egress Cloudflare dengan
    // "User location is not supported for the API use". Generator tetap
    // dapat bekerja melalui Workers AI binding.
    const fallbackPrompt = `${prompt}\n\nPENTING: keluarkan hanya JSON valid tanpa markdown atau komentar.`
    parsed = await workersAiJson(env, fallbackPrompt, { temperature: 0.55, maxTokens: 6500 })
  }
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

async function handleGenerateImage(body, env, origin) {
  if (!env.AI) return json({ error: 'Workers AI binding AI belum tersedia.' }, 500, origin)

  const image = body?.image || {}
  const prompt = clean(
    image.prompt ||
    `Ilustrasi edukatif semi realistis untuk siswa SMP. Tema: ${clean(image.topic || 'Informatika', 100)}. Judul kasus: ${clean(image.caseTitle || 'Kasus digital', 140)}. Judul slide: ${clean(image.slideTitle || 'Situasi', 120)}. Isi slide: ${clean(image.slideText || '', 900)}. Tampilkan situasi yang relevan, aman untuk sekolah, komposisi jelas, tanpa teks besar dan tanpa watermark.`,
    800
  )
  if (!prompt) return json({ error: 'Prompt gambar kosong.' }, 400, origin)

  let lastError = null
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const imageUrl = await workersAiImage(env, prompt)
      if (!imageUrl || !imageUrl.startsWith('data:image/')) {
        throw new Error('Workers AI tidak mengembalikan gambar yang valid.')
      }
      return json({ ok: true, imageUrl }, 200, origin)
    } catch (err) {
      lastError = err
    }
  }

  return json({ error: clean(lastError?.message || 'Gagal membuat ilustrasi.', 300) }, 500, origin)
}


async function handleGenerateSurpriseCards(body, env, origin) {
  const g = body?.generation || {}
  const groups = Array.isArray(g.groups) ? g.groups.slice(0, 20) : []
  if (!groups.length) return json({ error: 'Daftar kelompok kosong.' }, 400, origin)

  const missionTitle = clean(g.missionTitle || `Ronde ${g.round || ''}`, 180)
  const missionText = clean(g.missionText || '', 5000)

  const prompt = `Anda membuat "Kartu Kejutan" untuk game diskusi Informatika kelas VIII.
Kartu Kejutan BUKAN pertanyaan baru yang terpisah. Kartu harus berupa PERKEMBANGAN BARU
yang logis dan sangat berkaitan dengan kasus yang sedang dikerjakan, sehingga siswa harus
meninjau atau menyesuaikan jawaban awal mereka.

KASUS SAAT INI
Judul: ${missionTitle}
Isi lengkap:
${missionText}

KELOMPOK
${groups.map((x, i) => `${i + 1}. ${clean(x.groupId, 80)} | ${clean(x.groupName, 100)}`).join('\n')}

Buat tepat ${groups.length} kartu, satu untuk setiap groupId.

Keluarkan JSON murni:
{
  "cards": [
    {
      "groupId": "id kelompok persis seperti input",
      "id": "slug-singkat",
      "title": "judul perkembangan baru",
      "condition": "1-3 kalimat kondisi baru yang konkret dan menyebut unsur/tokoh/kejadian dari kasus",
      "instruction": "1 kalimat tentang apa yang sekarang harus dipertimbangkan dalam jawaban"
    }
  ]
}

ATURAN KETAT:
- Setiap kartu harus terkait langsung dengan kasus di atas, bukan kondisi generik.
- Kondisi harus terasa seperti informasi/kejadian baru setelah kasus awal berlangsung.
- Gunakan tokoh, platform, tindakan, barang, akun, data, atau pihak yang memang relevan dengan kasus.
- Jangan mengubah kasus menjadi topik lain.
- Jangan memberi jawaban final kepada siswa.
- Jangan membuat pilihan ganda.
- Setiap kelompok harus mendapat perkembangan yang BERBEDA secara substantif.
- Kondisi harus realistis untuk siswa SMP/MTs dan aman.
- Kondisi harus cukup penting sehingga jawaban awal mungkin perlu diperbaiki, diprioritaskan ulang, atau diberi alasan tambahan.
- groupId pada output wajib sama persis dengan input.`

  const parsed = await workersAiJson(env, `${prompt}\n\nKeluarkan hanya JSON valid tanpa markdown.`, {
    temperature: 0.7,
    maxTokens: 4200
  })

  const raw = Array.isArray(parsed?.cards) ? parsed.cards : []
  const allowed = new Set(groups.map(x => String(x.groupId || '')))
  const cards = []
  const seen = new Set()

  for (const item of raw) {
    const groupId = String(item?.groupId || '')
    if (!allowed.has(groupId) || seen.has(groupId)) continue
    const condition = clean(item?.condition || '', 700)
    if (!condition) continue
    cards.push({
      groupId,
      id: clean(item?.id || `card-${cards.length + 1}`, 80),
      title: clean(item?.title || 'Perkembangan Baru', 120),
      condition,
      instruction: clean(item?.instruction || 'Sesuaikan jawaban dengan perkembangan baru ini.', 500)
    })
    seen.add(groupId)
  }

  if (cards.length !== groups.length) {
    return json({
      error: `AI hanya menghasilkan ${cards.length}/${groups.length} kartu yang valid. Silakan coba lagi.`
    }, 502, origin)
  }

  return json({ ok: true, cards }, 200, origin)
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

  const parsed = await workersAiJson(env, `${prompt}\n\nKeluarkan hanya JSON valid tanpa markdown.`, { temperature: 0.2, maxTokens: 3200 })
  const results = Array.isArray(parsed?.results) ? parsed.results : []
  return json({ results }, 200, origin)
}

async function handleValidateRoleTask(body, env, origin) {
  const v = body?.validation || {}
  const contribution = clean(v.contribution || '', 1200)
  if (!contribution) return json({ valid: false, score: 0, feedback: 'Kontribusi kosong.' }, 200, origin)

  const prompt = `Anda adalah validator kontribusi tugas role untuk game diskusi siswa kelas VIII SMP/MTs.
Nilai apakah kontribusi siswa BENAR-BENAR relevan dengan kasus dan memenuhi tugas perannya.

Judul kasus: ${clean(v.missionTitle || '-', 160)}
Isi kasus: ${clean(v.missionText || '-', 2200)}
Peran siswa: ${clean(v.roleName || '-', 100)}
Tugas peran: ${clean(v.taskLabel || v.roleTask || '-', 180)}
Pilihan/keputusan tim bila ada: ${clean(v.selectedOption || v.teamDecision || '-', 180)}
Kartu Kejutan / kondisi tambahan kelompok: ${clean(v.challenge || '-', 700)}
Kontribusi siswa: ${contribution}
Ringkasan diskusi tim: ${clean(v.teamDiscussion || '-', 2800)}

Kembalikan JSON murni:
{"valid":true,"score":0,"feedback":"..."}

Rubrik umum 0-100:
- relevansi langsung dengan kasus 30 poin
- benar-benar menjalankan tugas role 25 poin
- spesifik, logis, dan punya makna 25 poin
- jelas dan membantu tim 20 poin

KHUSUS task writer-draft / writer-submit:
- kesesuaian dengan kasus awal: 25 poin
- respons terhadap Kartu Kejutan/kondisi terbaru (jika ada): 35 poin
- kualitas alasan, bukti, risiko, dan hubungan sebab-akibat: 25 poin
- kejelasan serta kelayakan tindakan/solusi: 15 poin

Aturan ketat:
- valid hanya jika score >= 70.
- tolak teks acak, spam, pengulangan, candaan tak relevan, jawaban generik yang bisa dipakai untuk kasus apa pun, atau sekadar menyalin judul tugas.
- untuk fakta, fakta/petunjuk harus berasal dari atau masuk akal berdasarkan kasus.
- untuk risiko, harus menyebut risiko/akibat/pihak terdampak.
- untuk solusi, harus menyebut tindakan dan alasan/manfaatnya.
- untuk pertanyaan penguji, harus berupa pertanyaan/sanggahan yang menguji argumen tim.
- untuk draft/jawaban akhir, nilai sebagai JAWABAN URAIAN, bukan pilihan ganda. Jawaban harus menyatakan keputusan/tindakan, alasan, dan bukti atau pertimbangan dari kasus.
- jika terdapat Kartu Kejutan/kondisi tambahan dan task adalah writer-draft atau writer-submit, jawaban WAJIB menyesuaikan kondisi TERBARU tersebut secara nyata. Jika kondisi terbaru diabaikan, batasi score maksimal 60 dan nyatakan valid=false.
- jangan menuntut siswa menyebut kata "Kartu Kejutan"; yang dinilai adalah apakah isi jawabannya benar-benar menanggapi perkembangan baru.
- untuk tugas risiko, solusi, atau pertanyaan penguji, gunakan kondisi tambahan sebagai konteks bila relevan.
- feedback singkat, ramah, dan memberi petunjuk perbaikan bila gagal.`

  const parsed = await workersAiJson(env, `${prompt}\n\nKeluarkan hanya JSON valid tanpa markdown.`, { temperature: 0.1, maxTokens: 700 })
  const score = clamp(parsed?.score || 0, 0, 100)
  return json({
    valid: score >= 70 && parsed?.valid !== false,
    score: Math.round(score),
    feedback: clean(parsed?.feedback || (score >= 70 ? 'Kontribusi relevan dan sesuai tugas.' : 'Kontribusi belum cukup relevan dengan kasus dan tugas peran.'), 260)
  }, 200, origin)
}

async function handleValidatePeerHelp(body, env, origin) {
  const v = body?.validation || {}
  const helpText = clean(v.helpText || '', 1200)
  if (!helpText) return json({ valid: false, score: 0, feedback: 'Bantuan kosong.' }, 200, origin)

  const prompt = `Anda menilai kualitas bantuan antarsiswa dalam diskusi kelas VIII.
Seorang siswa mengaku belum memahami peran/tugasnya. Nilai apakah bantuan temannya benar-benar membantu pemahaman TANPA mengambil alih pekerjaan atau sekadar memberi jawaban akhir.

Kasus: ${clean(v.missionTitle || '-', 160)}
Isi kasus: ${clean(v.missionText || '-', 2200)}
Peran siswa yang meminta bantuan: ${clean(v.requesterRole || '-', 120)}
Tugas siswa tersebut: ${clean(v.requesterTask || '-', 220)}
Pertanyaan/kebingungan: ${clean(v.requestQuestion || '-', 500)}
Peran pemberi bantuan: ${clean(v.helperRole || '-', 120)}
Bantuan yang diberikan: ${helpText}

Kembalikan JSON murni:
{"valid":true,"score":0,"feedback":"..."}

Skor AI maksimal 9 poin:
- sesuai dengan kebingungan teman: 0-3
- penjelasan jelas dan mudah dipahami: 0-2
- memberi petunjuk konkret yang bisa dilakukan: 0-2
- membantu teman berpikir/mengerjakan sendiri, bukan mengambil alih: 0-2

Aturan:
- valid minimal 6/9.
- tolak candaan, spam, teks tidak relevan, perintah kosong seperti 'kerjakan saja', atau bantuan yang hanya membocorkan jawaban akhir tanpa penjelasan.
- jangan beri poin konfirmasi penerima di sini; itu ditambahkan frontend setelah penerima menekan bahwa bantuan bermanfaat.
- feedback maksimal 2 kalimat.`

  const parsed = await workersAiJson(env, `${prompt}\n\nKeluarkan hanya JSON valid tanpa markdown.`, { temperature: 0.1, maxTokens: 700 })
  const score = clamp(parsed?.score || 0, 0, 9)
  return json({
    valid: score >= 6 && parsed?.valid !== false,
    score: Math.round(score),
    feedback: clean(parsed?.feedback || (score >= 6 ? 'Bantuan relevan dan membantu teman memahami tugas.' : 'Bantuan belum cukup menjelaskan tugas teman.'), 260)
  }, 200, origin)
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

  const answer = await workersAiText(env, prompt, { temperature: 0.45, maxTokens: 650 })
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
      if (mode === 'generate_image') return await handleGenerateImage(body, env, origin)
      if (mode === 'generate_surprise_cards') return await handleGenerateSurpriseCards(body, env, origin)
      if (mode === 'evaluate_activity') return await handleActivityEvaluation(body, env, origin)
      if (mode === 'validate_role_task') return await handleValidateRoleTask(body, env, origin)
      if (mode === 'validate_peer_help') return await handleValidatePeerHelp(body, env, origin)
      return await handleStudentChat(body, env, origin)
    } catch (err) {
      return json({ error: clean(err?.message || String(err), 500) }, 500, origin)
    }
  }
}
