# Digital Mission — Kelas 2

## Akses terbuka tanpa Firebase Authentication

Pada halaman utama, pilih **Guru**, lalu masukkan username dan password guru
yang sama dengan versi awal. Form diperiksa di browser, tanpa Firebase
Authentication. Sesi tampilan guru bertahan selama tab yang sama dibuka dan
berakhir saat kembali ke halaman awal. Siswa memilih kelas dan menulis nama lengkap tanpa
password. Tidak ada Firebase Anonymous atau akun Firebase; data tetap
tersinkron melalui Firebase Realtime Database.

Nama dan kelas yang sudah ada ditemukan dari rekaman kelas dan menggunakan UID
lama yang sama. Tim, nilai, Misi Konsep, chat, dan progres Lab Informatika tetap
terhubung. Jika siswa belum ada, aplikasi membuat UID tetap dari kelas dan nama.
Siswa yang sama dapat dibuka di perangkat, browser, atau domain situs lain
dengan memilih kelas dan nama yang sama. Beberapa orang dapat membukanya
bersamaan; perubahan mereka akan memakai rekaman siswa yang sama.

**Siswa dapat masuk kapan saja tanpa menunggu guru membuka dashboard.** Jika
kelas belum ada di database, siswa pertama membuat sesi kelas secara otomatis.
Guru dapat masuk belakangan dengan username dan password seperti biasa untuk
mengatur tim dan ronde. Siswa baru yang masuk setelah tim dibagi akan otomatis
ditempatkan pada tim dengan anggota paling sedikit; ketika pembagian tim masih
berupa pratinjau, ia mendapat penempatan sementara. Guru tetap mengatur kapan
diskusi kelompok dan ronde dimulai.

**Siapa pun yang memiliki alamat situs dapat membuka akun siswa mana pun dan
mengubah progresnya.** Form guru hanya membatasi tampilan pada halaman; aturan
database tetap terbuka, sehingga form tersebut tidak melindungi nilai atau
pengaturan dari orang yang mengakses database secara langsung. Nama dan kelas
berfungsi sebagai pilihan data, bukan bukti identitas.

Jika situs sudah memakai arsip akses terbuka sebelumnya, ganti `index.html`,
`app.js`, `styles.css`, dan `bank-kasus-10.json` di hosting. Hapus berkas
`cloudflare-worker.js` dan `chatbot-config.js` dari hosting bila pernah diunggah.
Kode halaman tidak lagi menghubungi layanan pembuat konten eksternal. Jika
Cloudflare Worker pernah diterbitkan secara terpisah, nonaktifkan deployment
lamanya di Cloudflare. Aturan Firebase tidak berubah dalam pembaruan ini.
Jika situs masih memakai versi awal, lakukan langkah berikut:

1. Unggah semua file dari arsip ini ke hosting situs yang sama, terutama
   `index.html`, `app.js`, `styles.css`, dan `firebase-config.js`.
2. Publikasikan isi `database.rules.json` ke **Firebase Realtime Database → Rules**.
   Mengunggah file rules ke hosting saja tidak mengubah aturan Firebase.
3. Hapus `cloudflare-worker.js` dan `chatbot-config.js` dari hosting lama, serta
   nonaktifkan Cloudflare Worker lama bila masih berjalan.
4. Muat ulang situs pada perangkat guru dan siswa. Hosting tetap perlu alamat
   publik untuk dapat diakses dari perangkat lain; membuka berkas di komputer
   lokal tidak otomatis menerbitkan situs.

Struktur file disederhanakan dengan menggabungkan sumber yang sudah ada.
Versi ini juga memperbarui Diskusi Kasus, voting dan pratinjau TTS Kelompok,
keyboard siswa, serta pemulihan sesi sesuai ketentuan di bawah.

## Diskusi Kasus untuk semua anggota

- Pembagian peran, panduan peran, checklist peran, dan seluruh Alat Tim dihapus.
  Petunjuk Tim serta formulir Bantuan Teman juga dihapus dari permainan ini.
- Semua anggota tim dapat mengisi seluruh kolom jawaban dan mengirim jawaban
  final ketika ronde aktif. Draf masing-masing siswa tersimpan di tabnya sendiri,
  terpisah menurut identitas, kelas aktif, tim, dan ronde.
- Tim tetap mengirim **satu jawaban final per ronde**. Sepakati jawaban lewat
  chat sebelum mengirim. Jika beberapa anggota mengirim bersamaan, transaksi
  Firebase menerima satu jawaban tanpa menimpanya dengan kiriman berikutnya.
- Setelah terkirim, semua anggota melihat jawaban final yang sama dan kolom
  dikunci. Draf tetap tersedia untuk dicoba lagi jika penyimpanan gagal.
- Pembaruan realtime mempertahankan posisi kursor saat siswa sedang mengetik.
- Keaktifan individu menggunakan **70% statistik chat + 30% kualitas kontribusi**,
  tanpa bonus Bantuan Teman atau tugas khusus. Pesan otomatis dari alat versi
  lama tidak dihitung sebagai chat biasa dalam analisis baru. Koreksi manual
  guru dipertahankan ketika analisis dihitung ulang.
- Skor tim tetap maksimal 100: 60 kualitas jawaban, 20 partisipasi,
  10 kecepatan, dan 10 bonus guru. Partisipasi berasal dari chat yang bermakna
  atau pengiriman jawaban final. Rumus nilai final dan impor nilai tetap memakai
  rumus yang sudah ada.
- Kolom peran dan bonus alat dihapus dari laporan. Hasil analisis yang sudah
  tersimpan tetap dipertahankan; analisis baru memakai skema tanpa bonus alat.

Chat kelompok, kartu kejutan, timer, pengaturan guru, TTS, dan Lab Informatika
tetap tersedia. Untuk akses terbuka, gunakan aturan Firebase dalam arsip ini.

## Keyboard siswa

Saat mode siswa aktif, tombol berikut diblokir di seluruh permainan, termasuk
semua latihan Lab Informatika yang berjalan di dalam iframe:

- Esc; F1–F4 dan F6–F12; Print Screen, Scroll Lock, dan Pause.
- Alt, Windows/Meta, dan tombol menu konteks, termasuk kombinasinya.
- Insert, Delete, Home, End, Page Up, Page Down, dan tombol panah.
- Seluruh numpad, termasuk Num Lock, operator, dan Enter pada numpad.

F5 tetap dapat memuat ulang halaman. Huruf, angka baris atas, Enter utama,
Backspace, Tab, Shift, Ctrl, dan spasi tetap dapat digunakan. Pembatasan tidak
berlaku pada halaman awal atau tampilan guru.

Browser yang mendukung Keyboard Lock dapat meminta izin saat fullscreen.
Jika tidak didukung atau izin ditolak, pemblokiran event keyboard tetap aktif.
Website tidak dapat menjamin pemblokiran pintasan sistem seperti Alt+Tab,
Ctrl+Alt+Delete, atau jalur keluar darurat browser. Jika fullscreen terlepas,
overlay yang sudah ada tetap menahan permainan sampai fullscreen diaktifkan.

## Masuk kembali sebagai siswa

Pilih **kelas dan tulis nama lengkap yang sama** dari perangkat mana pun. Siswa yang sudah
terdaftar dapat langsung melanjutkan setelah pembagian tim atau ronde dimulai.
Tab yang dimuat ulang juga mengingat pilihan siswa selama sesi browser itu;
di perangkat baru siswa mengetiknya kembali. Permainan terakhir dapat dipilih
lagi jika masih dibuka guru. Siswa baru dapat bergabung saat pengumpulan,
pratinjau tim, atau setelah tim dibuka; jika tim tersedia, penempatannya
dilakukan otomatis.

Rekaman lama yang sempat menunggu Reset Perangkat dapat dibuka kembali tanpa
reset. Tombol Reset Perangkat di dashboard guru sudah dihapus.

## File untuk pembaruan ini

Unggah isi arsip ini, lalu terapkan **database.rules.json** pada Firebase jika
beralih dari versi yang masih memakai autentikasi. Hapus berkas Worker dan
konfigurasi chatbot lama dari hosting. Firebase Realtime Database tetap dipakai
untuk menyimpan sesi, hasil, dan progres seluruh permainan.

## Pilihan tampilan pratinjau TTS

Di bagian atas **Pratinjau Papan TTS** tersedia dua tombol:

- **Tampilan Guru**: tampilan awal dengan seluruh jawaban dan daftar pertanyaan,
  seperti sebelumnya.
- **Tampilan Siswa**: hanya papan dengan jawaban yang sudah terbuka, termasuk
  Bantuan Awal dan huruf persilangan, sesuai papan yang dilihat siswa. Kotak
  lainnya tetap kosong. Daftar pertanyaan guru disembunyikan dari pratinjau ini.

Pratinjau mengikuti pembaruan jawaban kelas secara realtime. Pilihan tampilan
tetap aktif selama halaman terbuka. Tombol ini hanya mengubah pratinjau guru,
tanpa mengganti sesi, nilai, atau permainan siswa.

## Jumlah kata dan bantuan TTS

- Guru memilih tepat **10, 20, atau 30 kata** sebelum membuat papan. Setiap
  papan berisi **50% kata umum dan 50% istilah komputer** dengan petunjuk
  langsung. Bank baru berisi 59 kata sehari-hari dan 46 istilah komputer;
  tingkat Mudah (kelas VIII) menjadi pilihan awal dan memakai kata maksimal
  tujuh huruf. Tema memberi judul pada papan.
- Setiap tim memiliki **tiga bantuan bersama** dalam satu permainan: petunjuk
  tambahan, huruf pertama dan terakhir, serta pola sebagian huruf. Satu jenis
  bantuan dapat dipakai sekali pada soal aktif yang belum terjawab. Tim bebas
  menggunakan ketiganya pada satu soal atau membaginya ke beberapa soal.
- Petunjuk tambahan diambil dari teks yang ditulis di bank lokal. Untuk kata
  pada puzzle lama yang tidak ada di bank, aplikasi memberi dua huruf pertama
  sebagai petunjuk tambahan. Dua bantuan lainnya membuka huruf dan pola secara
  langsung. Petunjuk tambahan lama yang tersimpan pada puzzle diabaikan.
- Bantuan yang sudah dipakai dan sisa jatah terlihat oleh semua anggota tim
  secara realtime, termasuk saat berganti perangkat. Guru melihat sisa bantuan
  tiap tim pada dashboard. Siswa menekan **Bantuan** pada header TTS untuk
  membuka tiga tombol bantuan. Saat TTS dimulai ulang, setiap tim mendapat tiga
  bantuan baru. Bantuan tidak mengurangi poin.
- Panel chat TTS memiliki tinggi terbatas dan kursor gulir sendiri. Pesan baru
  tidak memperpanjang halaman; jika siswa sedang membaca pesan lama, posisi
  gulirnya dipertahankan.

## Voting TTS Kelompok

- Anggota cukup memilih **Setuju** atau **Tidak Setuju**, tanpa mengisi alasan.
- Pengusul otomatis dihitung Setuju, seperti alur sebelumnya.
- Setelah seluruh anggota lainnya memilih Setuju, sistem memeriksa jawaban
  otomatis. Jawaban benar langsung terbuka di papan semua tim.
- Jika ada anggota yang belum memilih atau memilih Tidak Setuju, pemeriksaan
  otomatis menunggu. Anggota dapat memperbarui pilihannya.
- Jawaban salah tidak dibuka. Tim dapat mengajukan jawaban baru, dengan aturan
  percobaan dan poin yang sama seperti sebelumnya.
- Voting divalidasi terhadap usulan yang sedang aktif. Pemrosesan bersamaan
  tidak boleh menghitung percobaan atau poin dua kali.
- Penyimpanan jawaban memakai UID rekaman siswa dari kelas dan nama yang ditulis.

| File / folder | Isi |
| --- | --- |
| `index.html` | Halaman utama dan skrip inti yang tetap berada pada posisi pemuatan semula. |
| `app.js` | Modul TTS, antarmuka guru, antarmuka siswa, dan login. |
| `styles.css` | Seluruh CSS statis halaman utama, termasuk CSS yang sebelumnya berada di dalam HTML. |
| `firebase-config.js` | Konfigurasi Firebase. |
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

Di luar perubahan akses terbuka, bank kasus dan gambar dipertahankan. Penjelasan
voting di halaman disesuaikan dan versi referensi aset diperbarui agar browser
memuat kode terbaru.

## Pemakaian

Ekstrak arsip, lalu unggah isi folder `kelas2-main` ke lokasi aplikasi seperti
biasa. Tidak diperlukan proses build atau instalasi paket baru. Pastikan
`app.js` dan `styles.css` ikut diunggah bersama `index.html`.

Firebase tetap diperlukan untuk pembaruan sesi dan progres secara realtime.
File CSS dan modul antarmuka lama sudah digantikan oleh dua file gabungan tersebut.

## Misi Konsep Informatika — permainan keempat

Slot **Menyusul** diganti menjadi **Misi Konsep** tanpa mengubah algoritma Diskusi Kasus, TTS Kelompok, atau Lab Informatika.

- Materi: **Struktur Bilangan** (biner, oktal, desimal, heksadesimal), **Struktur Data**, dan **Algoritma**.
- Setiap siswa menerima **20 misi individual**: 7 Struktur Bilangan, 7 Struktur Data, dan 6 Algoritma.
- Tiap misi terdiri dari penjelasan visual/animatif singkat, lalu soal ABCD dengan distraktor yang sengaja mirip.
- Paket ditentukan secara deterministik dari identitas siswa dan versi sesi. Karena itu urutan, angka, dan variasi soal berbeda antar siswa tetapi tetap konsisten ketika siswa masuk kembali.
- Nilai setiap jawaban benar adalah 5 poin, sehingga nilai maksimum 100.
- Progres disimpan pada `rooms/<kelas>/students/<uid>/conceptProgress`; publikasikan aturan Firebase terbaru dari arsip ini agar akses tanpa autentikasi bekerja.
- Guru dapat membuka/jeda sesi, melihat progres dan nilai secara realtime, melihat daftar 20 misi tiap siswa, mereset satu siswa, atau mengacak ulang seluruh paket. Reset Misi Konsep tidak menghapus progres tiga permainan lain.
- Revisi bank soal v2 dibuat lebih ramah kelas VII: angka lebih kecil, istilah dijelaskan lewat analogi sehari-hari, animasi 4 langkah lebih lambat, contoh dibuat lebih jelas, dan siswa dapat kembali melihat penjelasan sebelum menjawab.
- `concept-game.js` merupakan modul terpisah agar logika permainan lama tetap terisolasi.
- Struktur Bilangan pada Misi Konsep dibuat deskriptif-konseptual: siswa memahami fungsi biner, oktal, desimal, dan heksadesimal melalui konteks sehari-hari tanpa soal konversi, perhitungan nilai, atau hafalan tabel simbol.

Saat memperbarui situs, unggah **index.html**, **styles.css**, **concept-game.js**, dan file lama lainnya dalam folder yang sama.
