# Digital Mission — Kelas 2

Struktur file disederhanakan dengan menggabungkan sumber yang sudah ada.

| File / folder | Isi |
| --- | --- |
| `index.html` | Halaman utama dan skrip inti yang tetap berada pada posisi pemuatan semula. |
| `app.js` | Modul TTS, antarmuka guru, antarmuka siswa, dan login. |
| `styles.css` | Seluruh CSS statis halaman utama, termasuk CSS yang sebelumnya berada di dalam HTML. |
| `firebase-config.js` | Konfigurasi Firebase. |
| `chatbot-config.js` | Konfigurasi chatbot yang disertakan dalam proyek asli. |
| `cloudflare-worker.js` | Kode Cloudflare Worker. |
| `database.rules.json` | Aturan Firebase Realtime Database. |
| `bank-kasus-10.json` | Bank kasus. |
| `case-images/` | Gambar kasus dan manifest aslinya. |

## Penggabungan

`app.js` memuat isi `crossword.js`, `teacher-ui.js`, `student-ui.js`, lalu
`login-ui.js`, sesuai urutan awal. Pembungkus fungsi setiap modul tetap utuh.

`styles.css` memuat CSS dasar dari HTML, lalu `teacher.css`, `student.css`,
`crossword.css`, `login.css`, dan semua blok CSS tambahan dari HTML sesuai
urutan awal. Penanda komentar menunjukkan asal setiap bagian.

Skrip inti dan skrip tambahan di HTML tetap pada posisinya agar waktu akses
elemen halaman dan cakupan variabelnya tetap sama. CSS di dalam dokumen
latihan tersemat, atribut `style`, serta CSS yang dibuat saat aplikasi berjalan
tetap berada pada sumber aslinya.

Isi modul, aturan CSS, konfigurasi, aturan database, bank kasus, dan gambar
dipertahankan. Perubahan pada HTML hanya mencakup pemindahan blok CSS dan
penggantian referensi file antarmuka yang digabung.

## Pemakaian

Ekstrak arsip, lalu unggah isi folder `kelas2-main` ke lokasi aplikasi seperti
biasa. Tidak diperlukan proses build atau instalasi paket baru. Pastikan
`app.js` dan `styles.css` ikut diunggah bersama `index.html`.

Konfigurasi dan cara menjalankan Firebase serta Cloudflare Worker mengikuti
proyek asli. File CSS dan modul antarmuka lama sudah digantikan oleh dua file
gabungan tersebut.
