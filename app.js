/* ===== crossword.js ===== */
/* DIGITAL MISSION — TTS Kelompok v4
   Semua anggota tim setara dan dapat mengajukan usulan.
   Usulan ditanggapi anggota lain dengan Setuju/Tidak Setuju tanpa kolom alasan.
   Setelah semua anggota setuju, jawaban diperiksa dan dibuka otomatis jika benar.
   Papan TTS bersifat bersama antartim: jawaban benar dari satu tim langsung terbuka untuk semua tim.
   Satu jawaban pembuka otomatis ditampilkan saat permainan dimulai sebagai Bantuan Awal.
   Bank kata dan petunjuk ditulis langsung; grid disusun dengan algoritma crossword lokal.
   Tiap tim mempunyai tiga bantuan yang dipakai bersama pada soal yang dipilih.
*/
(function(){
  'use strict';

  const FALLBACK=[
    ['PASSWORD','Kombinasi karakter rahasia untuk melindungi akses ke akun.','Dibuat kuat agar orang lain sulit menebaknya saat mencoba masuk ke akun.'],
    ['PHISHING','Penipuan melalui pesan atau tautan palsu untuk memperoleh data pribadi.','Pesan yang mendesakmu mengisi sandi di situs tiruan adalah contohnya.'],
    ['PRIVASI','Hak untuk mengendalikan informasi pribadi agar tidak digunakan sembarangan.','Tanyakan izin sebelum mengunggah foto teman untuk menghormatinya.'],
    ['MALWARE','Perangkat lunak berbahaya yang dirancang untuk mengganggu sistem.','Dapat masuk melalui berkas atau aplikasi mencurigakan.'],
    ['FIREWALL','Pelindung jaringan yang menyaring lalu lintas masuk dan keluar.','Bayangkan penjaga gerbang yang memilih koneksi mana yang boleh lewat.'],
    ['BROWSER','Aplikasi untuk membuka dan menjelajahi halaman web.','Contoh yang sering dipakai adalah Chrome atau Firefox.'],
    ['INTERNET','Jaringan global yang menghubungkan perangkat di seluruh dunia.','Melalui jaringan ini, kamu dapat membuka situs dari negara lain.'],
    ['ENKRIPSI','Proses mengubah data agar sulit dibaca tanpa kunci.','Isi pesan dibuat seperti kode rahasia saat dikirim.'],
    ['VERIFIKASI','Proses memeriksa kebenaran identitas atau informasi.','Lakukan sebelum mempercayai kabar yang baru diterima.'],
    ['ANTIVIRUS','Program untuk mendeteksi dan menangani perangkat lunak berbahaya.','Aplikasi pelindung perangkat yang sering memindai ancaman.'],
    ['BACKUP','Salinan cadangan data untuk mengurangi risiko kehilangan.','Simpan salinan tugas di tempat lain agar tetap ada saat perangkat rusak.'],
    ['LOGIN','Proses masuk ke akun menggunakan identitas pengguna.','Biasanya dilakukan dengan mengisi nama pengguna dan sandi.'],
    ['AKUN','Identitas pengguna untuk mengakses sebuah layanan digital.','Satu orang bisa memiliki beberapa di layanan yang berbeda.'],
    ['VIRUS','Program berbahaya yang dapat menggandakan diri.','Salah satu jenis ancaman yang dapat menyebar di perangkat.'],
    ['SPAM','Pesan digital massal yang tidak diinginkan penerima.','Sering muncul berulang kali di kotak masuk.'],
    ['COOKIE','Data kecil yang disimpan browser untuk mengingat kunjungan situs.','Dapat membantu situs mengingat pilihanmu saat dibuka kembali.'],
    ['BLOKIR','Tindakan membatasi akun, kontak, atau akses.','Bisa dilakukan pada pengirim pesan yang terus mengganggu.'],
    ['LAPOR','Menyampaikan kejadian berbahaya kepada pihak yang bertanggung jawab.','Lakukan kepada guru atau pengelola saat menemukan perundungan daring.'],
    ['DATA','Informasi yang dapat disimpan, diproses, atau dikirim.','Angka nilai dan nama siswa adalah contohnya.'],
    ['AMAN','Kondisi ketika risiko terhadap data atau perangkat terkendali.','Kondisi yang diharapkan setelah perlindungan diterapkan.'],
    ['SANDI','Rahasia yang dipakai untuk membuktikan hak akses akun.','Jangan memberikannya kepada orang lain meskipun mengaku teman.'],
    ['TAUTAN','Alamat yang dapat ditekan untuk membuka sumber lain.','Periksa alamat tujuan sebelum mengkliknya.'],
    ['HOAKS','Informasi palsu yang disebarkan seolah-olah benar.','Periksa sumber sebelum ikut membagikannya.'],
    ['JEJAKDIGITAL','Rekaman aktivitas saat menggunakan layanan digital.','Komentar lama dan riwayat unggahan dapat menjadi bagiannya.'],
    ['KEAMANAN','Upaya melindungi data dan perangkat dari ancaman.','Berhubungan dengan pencegahan pencurian akun.'],
    ['IDENTITAS','Keterangan yang menunjukkan siapa seseorang.','Nama dan foto profil dapat menjadi bagian darinya.'],
    ['PROFIL','Halaman yang memuat informasi tentang seorang pengguna.','Biasanya berisi nama tampilan dan foto.'],
    ['EMAIL','Layanan mengirim surat secara elektronik.','Alamatnya biasanya memakai tanda @.'],
    ['PESAN','Informasi yang dikirim seseorang kepada penerima.','Bisa berbentuk teks dalam aplikasi percakapan.'],
    ['UNGGAH','Mengirim berkas dari perangkat ke layanan daring.','Gerakannya dari komputermu menuju situs.'],
    ['UNDUH','Mengambil berkas dari layanan daring ke perangkat.','Gerakannya dari situs menuju komputermu.'],
    ['BERKAS','Satuan data yang tersimpan dengan nama tertentu.','Foto dan dokumen di komputer tersimpan sebagai ini.'],
    ['FOLDER','Tempat mengelompokkan berkas di perangkat.','Mirip map untuk menyimpan dokumen di komputer.'],
    ['DOKUMEN','Berkas yang memuat tulisan, gambar, atau informasi.','Tugas yang ditulis di pengolah kata termasuk jenis ini.'],
    ['LAMPIRAN','Berkas tambahan yang disertakan bersama pesan.','Periksa dahulu sebelum membuka berkas dari pengirim asing.'],
    ['KAMERA','Alat untuk mengambil foto atau video.','Sering terpasang pada ponsel dan laptop.'],
    ['MIKROFON','Alat untuk memasukkan suara ke perangkat.','Dipakai saat merekam audio atau rapat daring.'],
    ['KOMPUTER','Perangkat elektronik yang mengolah masukan menjadi keluaran.','Dapat digunakan untuk mengetik, berhitung, dan membuat presentasi.'],
    ['LAPTOP','Komputer portabel yang bisa dilipat.','Memiliki layar dan papan ketik dalam satu perangkat.'],
    ['PONSEL','Perangkat genggam untuk berkomunikasi dan menjalankan aplikasi.','Dapat dipakai menelepon serta mengakses situs.'],
    ['APLIKASI','Perangkat lunak untuk mengerjakan tugas tertentu.','Contohnya pengolah kata, permainan, dan pemutar musik.'],
    ['PROGRAM','Kumpulan perintah yang dijalankan komputer.','Dibuat dengan menulis kode dan menjalankannya.'],
    ['KODE','Rangkaian instruksi yang ditulis dalam bahasa pemrograman.','Ditulis oleh pembuat aplikasi agar perangkat melakukan tugas.'],
    ['ALGORITMA','Urutan langkah logis untuk menyelesaikan masalah.','Seperti resep yang menjelaskan langkah demi langkah.'],
    ['LOGIKA','Cara berpikir runtut untuk menarik kesimpulan.','Dipakai saat menyusun langkah pemecahan masalah.'],
    ['URUTAN','Susunan langkah berdasarkan posisi atau waktu.','Dalam algoritma, langkah pertama dikerjakan sebelum langkah berikutnya.'],
    ['KONDISI','Syarat yang menentukan cabang tindakan pada algoritma.','Kata jika sering dipakai untuk menuliskannya.'],
    ['PERULANGAN','Menjalankan suatu langkah berkali-kali.','Berguna agar instruksi yang sama tidak perlu ditulis berulang.'],
    ['VARIABEL','Nama untuk menyimpan nilai yang bisa berubah dalam program.','Bayangkan kotak bernama yang isinya dapat diganti.'],
    ['INPUT','Data yang dimasukkan agar dapat diproses komputer.','Mengetik angka di papan ketik menghasilkan jenis data ini.'],
    ['OUTPUT','Hasil yang dikeluarkan komputer setelah memproses data.','Tampilan di layar atau hasil cetak dapat menjadi contohnya.'],
    ['PROSES','Tahap mengolah masukan untuk menghasilkan keluaran.','Terjadi di antara langkah memasukkan data dan melihat hasil.'],
    ['MEMORI','Komponen yang menyimpan data sementara saat perangkat bekerja.','Program yang sedang berjalan memerlukan ruang di sini.'],
    ['JARINGAN','Hubungan beberapa perangkat agar dapat bertukar data.','Komputer di ruang lab dapat saling terhubung melaluinya.'],
    ['SERVER','Komputer yang menyediakan layanan untuk perangkat lain.','Situs yang dikunjungi banyak orang memakai perangkat penyedia ini.'],
    ['DOMAIN','Nama yang mudah diingat untuk mengakses suatu situs.','Berakhir dengan bagian seperti .id atau .com.'],
    ['SITUS','Kumpulan halaman yang dapat dikunjungi melalui web.','Alamatnya dapat diketik pada aplikasi penjelajah.'],
    ['WIFI','Teknologi jaringan nirkabel untuk menghubungkan perangkat.','Ikonnya sering tampak di bagian atas ponsel.'],
    ['ROUTER','Perangkat pengarah lalu lintas data dalam jaringan.','Kotak jaringan di rumah sering memiliki beberapa antena.'],
    ['HOTSPOT','Fitur berbagi koneksi internet dari satu perangkat.','Ponsel dapat mengaktifkannya untuk perangkat teman.'],
    ['TOKEN','Kode atau bukti akses yang digunakan untuk mengonfirmasi tindakan.','Bisa dikirim sementara saat memeriksa proses masuk.'],
    ['KODEQR','Kode berpola kotak yang dibaca kamera.','Sering dipindai untuk membuka tautan atau melihat menu.'],
    ['SEL','Kotak pada perpotongan baris dan kolom di spreadsheet.','A1 menunjukkan salah satu letaknya.'],
    ['BARIS','Deretan kotak mendatar dalam tabel.','Di spreadsheet biasanya diberi nomor 1, 2, 3.'],
    ['KOLOM','Deretan kotak tegak dalam tabel.','Di spreadsheet biasanya diberi huruf A, B, C.'],
    ['RUMUS','Perintah hitung yang ditulis di sel spreadsheet.','Sering dimulai dengan tanda sama dengan.'],
    ['TABEL','Susunan data dalam baris dan kolom.','Nilai siswa dapat disajikan dalam bentuk ini.'],
    ['GRAFIK','Gambaran visual yang memperlihatkan perbandingan data.','Batang atau garis dapat dipakai untuk menampilkannya.'],
    ['FILTER','Fitur untuk menampilkan hanya data yang memenuhi syarat.','Pakai ketika ingin melihat siswa dari satu kelas saja.'],
    ['SORTIR','Mengurutkan data berdasarkan aturan tertentu.','Misalnya mengurutkan nilai dari yang terbesar.'],
    ['TOTAL','Hasil penjumlahan seluruh nilai yang dihitung.','Didapat setelah semua angka dijumlahkan.'],
    ['RATARATA','Nilai yang diperoleh dari jumlah data dibagi banyaknya data.','Hasilnya menggambarkan kecenderungan suatu kumpulan nilai.'],
    ['FUNGSI','Perintah siap pakai pada spreadsheet untuk menghitung data.','Contoh jenisnya adalah perintah penjumlahan otomatis.'],
    ['SPREADSHEET','Aplikasi atau lembar untuk mengolah data berbentuk sel.','Excel dan Google Sheets termasuk contohnya.'],
    ['ETIKA','Pedoman berperilaku baik saat menggunakan teknologi.','Berkaitan dengan menghormati orang lain di dunia digital.'],
    ['IZIN','Persetujuan sebelum memakai milik atau informasi orang lain.','Mintalah sebelum mengunggah foto teman.'],
    ['SUMBER','Asal informasi yang perlu diperiksa kredibilitasnya.','Cari siapa yang pertama membuat suatu berita.'],
    ['FAKTA','Pernyataan yang dapat diperiksa berdasarkan bukti.','Berbeda dari pendapat pribadi.'],
    ['OPINI','Pandangan seseorang yang bisa berbeda dengan orang lain.','Berbeda dari peristiwa yang bisa dibuktikan langsung.'],
    ['BUKTI','Hal yang mendukung kebenaran suatu pernyataan.','Cari sebelum menyimpulkan kabar viral itu benar.'],
    ['KONTEN','Isi yang dibagikan melalui media digital.','Bisa berupa tulisan, foto, atau video.'],
    ['KOMENTAR','Tanggapan tertulis pada sebuah unggahan.','Bisa menyenangkan atau justru menyakiti pembuat unggahan.'],
    ['KORBAN','Orang yang mengalami kerugian akibat perbuatan orang lain.','Perlu dilindungi saat terjadi perundungan daring.'],
    ['DEEPFAKE','Video atau suara hasil suntingan digital yang meniru seseorang.','Wajah seseorang tampak mengatakan hal yang tidak pernah ia ucapkan.'],
    ['REKAYASA','Perubahan buatan pada gambar, suara, atau informasi.','Video yang diedit dapat mengubah kesan penonton.'],
    ['VIRAL','Keadaan ketika suatu unggahan tersebar sangat luas.','Banyak orang membagikannya dalam waktu singkat.'],
    ['PERSETUJUAN','Penerimaan dari orang yang terdampak sebelum bertindak.','Sebelum membagikan foto teman, mintalah hal ini terlebih dahulu.']
  ];
  // Soal baru memakai kata sehari-hari dan istilah komputer yang akrab bagi kelas VIII.
  // FALLBACK tetap tersedia untuk petunjuk pada papan lama yang tersimpan di kelas.
  const GENERAL_BANK=[
    ['BUKU','Kumpulan halaman untuk dibaca atau ditulis.','Kamu membukanya saat membaca cerita atau mencatat pelajaran.'],
    ['PENA','Alat tulis yang berisi tinta.','Alat ini biasanya tidak perlu diraut.'],
    ['PENSIL','Alat tulis yang ujungnya dapat diraut.','Tulisan dari alat ini bisa dihapus dengan penghapus.'],
    ['MEJA','Perabot yang permukaannya dipakai untuk menulis.','Buku diletakkan di atas perabot ini.'],
    ['KURSI','Perabot yang digunakan untuk duduk.','Letaknya sering berdekatan dengan meja.'],
    ['TAS','Tempat membawa buku dan alat sekolah.','Biasanya dibawa di punggung saat berangkat sekolah.'],
    ['SEPATU','Alas kaki yang dipakai saat berangkat sekolah.','Dipakai bersama kaus kaki.'],
    ['KELAS','Ruang tempat siswa mengikuti pelajaran.','Guru mengajar di ruang ini.'],
    ['GURU','Orang yang mengajar di sekolah.','Ia menjelaskan materi di depan kelas.'],
    ['SISWA','Orang yang belajar di sekolah.','Ia mengerjakan tugas yang diberikan guru.'],
    ['SEKOLAH','Tempat siswa belajar bersama guru.','Memiliki ruang kelas dan halaman.'],
    ['TEMAN','Orang yang belajar atau bermain bersamamu.','Kamu dapat berdiskusi dengannya di kelas.'],
    ['RUMAH','Bangunan tempat keluarga tinggal.','Tempat kamu pulang setelah sekolah.'],
    ['PINTU','Bagian rumah yang dibuka untuk keluar masuk.','Kamu membukanya sebelum masuk ruangan.'],
    ['JENDELA','Bagian dinding yang dapat dibuka agar udara dan cahaya masuk.','Biasanya memiliki kaca di sisi ruangan.'],
    ['PAGI','Waktu setelah matahari terbit.','Saat ini banyak siswa berangkat ke sekolah.'],
    ['SIANG','Waktu ketika matahari berada tinggi di langit.','Datang setelah pagi dan sebelum sore.'],
    ['SORE','Waktu menjelang matahari terbenam.','Datang setelah siang dan sebelum malam.'],
    ['MALAM','Waktu setelah matahari terbenam.','Langit biasanya gelap pada waktu ini.'],
    ['BULAN','Benda langit yang terlihat terang pada malam hari.','Bentuknya bisa tampak sabit atau purnama.'],
    ['BINTANG','Titik cahaya di langit malam.','Jumlahnya terlihat banyak ketika langit cerah.'],
    ['HUJAN','Tetes air yang turun dari awan.','Saat turun, kamu mungkin memakai payung.'],
    ['AWAN','Gumpalan putih atau kelabu di langit.','Darinya dapat turun hujan.'],
    ['AIR','Cairan bening yang biasa diminum.','Kamu memerlukannya saat haus.'],
    ['POHON','Tumbuhan besar yang memiliki batang dan cabang.','Dapat memberi tempat berteduh.'],
    ['BUNGA','Bagian tanaman yang sering berwarna-warni.','Mawar adalah salah satu contohnya.'],
    ['DAUN','Bagian tanaman yang biasanya berwarna hijau.','Tumbuh di ranting pohon.'],
    ['BUAH','Bagian tanaman yang sering dimakan dan memiliki biji.','Mangga dan pisang adalah contohnya.'],
    ['MANGGA','Buah yang dagingnya kuning saat matang.','Buah ini sering dibuat jus dan rasanya manis.'],
    ['PISANG','Buah panjang berkulit kuning saat matang.','Kulitnya dikupas sebelum dimakan.'],
    ['KUCING','Hewan peliharaan yang berbunyi meong.','Hewan ini suka mengejar tikus.'],
    ['AYAM','Hewan berkaki dua yang berkokok atau bertelur.','Anaknya disebut anak ayam.'],
    ['IKAN','Hewan yang hidup dan berenang di air.','Bernapas menggunakan insang.'],
    ['BURUNG','Hewan bersayap yang memiliki paruh.','Banyak jenisnya dapat terbang.'],
    ['KEPALA','Bagian tubuh yang berada di atas leher.','Di bagian ini ada mata, hidung, dan mulut.'],
    ['TANGAN','Bagian tubuh yang dipakai untuk memegang pensil.','Memiliki jari untuk menggenggam.'],
    ['KAKI','Bagian tubuh yang dipakai untuk berjalan.','Dipakai untuk melangkah dan menendang bola.'],
    ['MATA','Bagian tubuh yang dipakai untuk melihat.','Kamu menutupnya saat tidur.'],
    ['TELINGA','Bagian tubuh yang dipakai untuk mendengar.','Letaknya di kanan dan kiri kepala.'],
    ['HIDUNG','Bagian wajah yang dipakai untuk mencium bau.','Letaknya di antara kedua mata dan mulut.'],
    ['JALAN','Tempat orang atau kendaraan melintas.','Kamu menyeberangnya di tempat yang aman.'],
    ['MOBIL','Kendaraan beroda empat yang berjalan di jalan raya.','Memiliki kemudi dan tempat duduk.'],
    ['SEPEDA','Kendaraan beroda dua yang dikayuh.','Kamu menggerakkan pedal untuk menjalankannya.'],
    ['PASAR','Tempat banyak penjual dan pembeli bertemu.','Di sini orang dapat membeli sayur dan buah.'],
    ['TOKO','Tempat membeli barang dari penjual.','Contohnya tempat membeli buku atau alat tulis.'],
    ['UANG','Alat pembayaran saat membeli barang.','Bisa berbentuk kertas atau koin.'],
    ['MAKAN','Kegiatan memasukkan makanan ke mulut.','Dilakukan saat lapar.'],
    ['MINUM','Kegiatan memasukkan air atau cairan ke mulut.','Dilakukan saat haus.'],
    ['TIDUR','Kegiatan beristirahat dengan memejamkan mata.','Biasanya dilakukan pada malam hari.'],
    ['BELAJAR','Kegiatan memahami pelajaran atau berlatih.','Siswa melakukannya di sekolah dan di rumah.'],
    ['MENULIS','Kegiatan membuat huruf atau kalimat.','Dilakukan menggunakan pena atau pensil.'],
    ['MEMBACA','Kegiatan memahami tulisan pada buku.','Matamu mengikuti huruf dan kata.'],
    ['MERAH','Warna bendera Indonesia pada bagian atas.','Warna ini sering dipakai untuk tanda berhenti.'],
    ['BIRU','Warna yang sering dipakai untuk menggambarkan langit cerah.','Warna ini terlihat pada laut di banyak gambar.'],
    ['HIJAU','Warna yang sering terlihat pada daun.','Campuran warna biru dan kuning menghasilkan warna ini.'],
    ['PANAS','Keadaan saat suhu terasa tinggi.','Kebalikan dari dingin.'],
    ['DINGIN','Keadaan saat suhu terasa rendah.','Kebalikan dari panas.'],
    ['NASI','Makanan pokok yang dibuat dari beras.','Sering dimakan bersama lauk.'],
    ['ROTI','Makanan yang dibuat dari tepung dan dipanggang.','Sering diberi selai untuk sarapan.']
  ];
  const COMPUTER_WORDS=new Set('BROWSER INTERNET LOGIN AKUN VIRUS DATA SANDI TAUTAN EMAIL UNGGAH UNDUH BERKAS FOLDER DOKUMEN LAMPIRAN KAMERA MIKROFON KOMPUTER LAPTOP PONSEL APLIKASI PROGRAM KODE ALGORITMA INPUT OUTPUT JARINGAN SITUS WIFI HOTSPOT KODEQR SEL BARIS KOLOM RUMUS TABEL GRAFIK FILTER SORTIR TOTAL FUNGSI PROFIL PESAN KEAMANAN BACKUP PROSES'.split(' '));
  const COMPUTER_BANK=FALLBACK.filter(([answer])=>COMPUTER_WORDS.has(answer));
  const LOCAL_HELP_BY_ANSWER=new Map([...FALLBACK,...GENERAL_BANK].map(([answer,,help])=>[answer,help]));

  let chatRef=null,chatGroup='',chatMessages={};
  let proposalDraft='';
  let busyGenerate=false,busyAction=false,busySubmit=false,autoResolveBusy=false,autoFinishGuard=false;
  let teacherPreviewMode='teacher';
  const staleEntryCleanup=new Set();
  const TEAM_COLORS=['#ef4444','#eab308','#3b82f6','#22c55e','#8b5cf6','#f97316'];
  const HINT_KINDS=[['extra','Petunjuk tambahan'],['edges','Huruf tepi'],['pattern','Pola huruf']];
  let busyHint=false;

  const bridge=()=>window.DMCrosswordBridge||{};
  const el=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const db=()=>bridge().getDb?.();
  const room=()=>bridge().getRoomState?.()||null;
  const user=()=>bridge().getCurrentUser?.()||null;
  const student=()=>bridge().getStudent?.()||null;
  const students=()=>bridge().getStudents?.()||{};
  const groups=()=>bridge().getGroups?.()||{};
  const code=()=>bridge().getCurrentCode?.()||'kelas-aktif';
  const now=()=>bridge().serverNow?.()||Date.now();
  const roomBase=()=>`rooms/${code()}`;
  const cw=()=>room()?.crossword||{};

  function sharedSolved(){return cw().globalSolved||{}}
  function ownerInfo(record){
    if(!record)return {name:'',color:'#94a3b8',starter:false};
    if(record.source==='starter')return {name:'Bantuan Awal',color:'#94a3b8',starter:true};
    const idx=Number(record.colorIndex);
    const gid=record.teamId||'';
    const g=groups()[gid]||{};
    const safeIdx=Number.isFinite(idx)&&idx>=0?idx:Number(g.colorIndex||0);
    return {name:record.teamName||g.name||'Tim',color:TEAM_COLORS[((safeIdx%TEAM_COLORS.length)+TEAM_COLORS.length)%TEAM_COLORS.length],starter:false};
  }
  function ownerBadgeHtml(record){
    const info=ownerInfo(record);if(!info.name)return '';
    return `<span class="cw-owner-badge ${info.starter?'starter':''}" style="--cw-owner:${info.color}"><i></i>${esc(info.name)}</span>`;
  }
  function ownerDotHtml(record){
    if(!record)return '';
    const info=ownerInfo(record);
    return `<i class="cw-owner-dot ${info.starter?'starter':''}" style="--cw-owner:${info.color}" title="${esc(info.name)}"></i>`;
  }
  function sharedLegendHtml(){
    const records=Object.values(sharedSolved());
    if(!records.length)return '';
    const uniq=[];const seen=new Set();
    records.forEach(r=>{const key=r?.source==='starter'?'starter':`team:${r?.teamId||r?.teamName||''}`;if(!seen.has(key)){seen.add(key);uniq.push(r)}});
    return `<div class="cw-answer-legend"><span>Penanda jawaban</span>${uniq.map(ownerBadgeHtml).join('')}</div>`;
  }
  function pickStarterEntry(puzzle){
    const list=entriesArray(puzzle);if(!list.length)return null;
    const occupancy=new Map();
    list.forEach(e=>{for(let i=0;i<e.answer.length;i++){const r=e.row+(e.direction==='V'?i:0),c=e.col+(e.direction==='H'?i:0),k=cellKey(r,c);occupancy.set(k,(occupancy.get(k)||0)+1)}});
    return list.slice().sort((a,b)=>{
      const cross=e=>{let n=0;for(let i=0;i<e.answer.length;i++){const r=e.row+(e.direction==='V'?i:0),c=e.col+(e.direction==='H'?i:0);if((occupancy.get(cellKey(r,c))||0)>1)n++}return n};
      const ca=cross(a),cb=cross(b);if(cb!==ca)return cb-ca;
      const pa=(a.answer.length>=4&&a.answer.length<=9)?1:0,pb=(b.answer.length>=4&&b.answer.length<=9)?1:0;if(pb!==pa)return pb-pa;
      return a.answer.length-b.answer.length;
    })[0]||list[0];
  }

  function normalizeWord(v){
    return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,16);
  }
  function normalizeCandidates(raw){
    const list=Array.isArray(raw)?raw:[];
    const seen=new Set();
    return list.map((x,i)=>{
      const answer=normalizeWord(x?.answer||x?.word||x?.jawaban||'');
      const clue=String(x?.clue||x?.hint||x?.petunjuk||'').replace(/\s+/g,' ').trim().slice(0,220);
      // Bantuan diambil dari bank lokal atau pola huruf yang dihitung dari jawaban.
      return {answer,clue,category:x?.category||'',id:`w${i+1}`};
    }).filter(x=>x.answer.length>=3&&x.answer.length<=16&&x.clue&& !seen.has(x.answer) && seen.add(x.answer));
  }
  function shuffled(arr){
    const out=arr.slice();
    for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
    return out;
  }
  const cellKey=(r,c)=>`${r},${c}`;

  function boundsFor(entries,extra=null){
    const all=extra?[...entries,extra]:entries;
    if(!all.length)return {minR:0,maxR:0,minC:0,maxC:0,w:1,h:1,area:1};
    let minR=Infinity,maxR=-Infinity,minC=Infinity,maxC=-Infinity;
    all.forEach(e=>{
      const endR=e.row+(e.direction==='V'?e.answer.length-1:0);
      const endC=e.col+(e.direction==='H'?e.answer.length-1:0);
      minR=Math.min(minR,e.row,endR);maxR=Math.max(maxR,e.row,endR);
      minC=Math.min(minC,e.col,endC);maxC=Math.max(maxC,e.col,endC);
    });
    const w=maxC-minC+1,h=maxR-minR+1;
    return {minR,maxR,minC,maxC,w,h,area:w*h};
  }

  function makeCellMap(entries){
    const map=new Map();
    entries.forEach(e=>{
      for(let i=0;i<e.answer.length;i++){
        const r=e.row+(e.direction==='V'?i:0),c=e.col+(e.direction==='H'?i:0),k=cellKey(r,c);
        let x=map.get(k);if(!x)x={char:e.answer[i],dirs:new Set(),entryIds:[]};
        x.char=e.answer[i];x.dirs.add(e.direction);x.entryIds.push(e.id);map.set(k,x);
      }
    });
    return map;
  }

  function validatePlacement(word,row,col,direction,entries,map=makeCellMap(entries)){
    let crosses=0;
    for(let i=0;i<word.length;i++){
      const r=row+(direction==='V'?i:0),c=col+(direction==='H'?i:0),k=cellKey(r,c),existing=map.get(k);
      if(existing){
        if(existing.char!==word[i]||existing.dirs.has(direction))return null;
        crosses++;
      }else{
        const sideA=direction==='H'?cellKey(r-1,c):cellKey(r,c-1);
        const sideB=direction==='H'?cellKey(r+1,c):cellKey(r,c+1);
        if(map.has(sideA)||map.has(sideB))return null;
      }
    }
    const before=direction==='H'?cellKey(row,col-1):cellKey(row-1,col);
    const after=direction==='H'?cellKey(row,col+word.length):cellKey(row+word.length,col);
    if(map.has(before)||map.has(after))return null;
    if(entries.length&&crosses===0)return null;
    const candidate={answer:word,row,col,direction};
    const b=boundsFor(entries,candidate);
    if(b.w>32||b.h>32)return null;
    const compactPenalty=b.area*.20+Math.abs(b.w-b.h)*.8;
    return {crosses,bounds:b,score:crosses*120-compactPenalty};
  }

  function candidatePlacements(item,entries,map=makeCellMap(entries)){
    if(!entries.length)return [{row:0,col:0,direction:'H',crosses:0,score:0}];
    const found=[];
    for(const [k,cell] of map.entries()){
      const [r,c]=k.split(',').map(Number);
      for(let wi=0;wi<item.answer.length;wi++){
        if(item.answer[wi]!==cell.char)continue;
        ['H','V'].forEach(direction=>{
          if(cell.dirs.has(direction))return;
          const row=r-(direction==='V'?wi:0),col=c-(direction==='H'?wi:0);
          const valid=validatePlacement(item.answer,row,col,direction,entries,map);
          if(valid)found.push({row,col,direction,...valid});
        });
      }
    }
    found.sort((a,b)=>b.score-a.score);
    return found.slice(0,20);
  }

  function layoutAttempt(pool,target,balanced=false){
    if(!pool.length)return [];
    const half=target/2,counts={general:0,computer:0};
    let remaining=pool.slice();
    const top=remaining.slice().sort((a,b)=>b.answer.length-a.answer.length).slice(0,Math.min(6,remaining.length));
    const first=top[Math.floor(Math.random()*top.length)];
    let entries=[{...first,id:first.id,row:0,col:0,direction:'H'}];
    if(balanced)counts[first.category]++;
    remaining=remaining.filter(x=>x!==first);
    while(entries.length<target&&remaining.length){
      const candidates=[],map=makeCellMap(entries);
      for(const item of remaining){
        if(balanced&&counts[item.category]>=half)continue;
        const placements=candidatePlacements(item,entries,map);
        if(placements.length){
          const p=placements[Math.floor(Math.random()*Math.min(3,placements.length))];
          const balanceBonus=balanced?(half-counts[item.category])*4:0;
          candidates.push({item,p,score:p.score+item.answer.length*.6+balanceBonus+Math.random()*4});
        }
      }
      if(!candidates.length)break;
      candidates.sort((a,b)=>b.score-a.score);
      const chosen=candidates[0];
      entries.push({...chosen.item,row:chosen.p.row,col:chosen.p.col,direction:chosen.p.direction});
      if(balanced)counts[chosen.item.category]++;
      remaining=remaining.filter(x=>x!==chosen.item);
    }
    return entries;
  }

  function finalizePuzzle(entries,title,topic){
    if(!entries.length)throw new Error('Tidak ada kata yang dapat ditempatkan.');
    const b=boundsFor(entries),rowShift=-b.minR,colShift=-b.minC;
    entries=entries.map(e=>({...e,row:e.row+rowShift,col:e.col+colShift}));
    const startMap=new Map(),ordered=entries.slice().sort((a,b)=>a.row-b.row||a.col-b.col||(a.direction==='H'?-1:1));let n=0;
    ordered.forEach(e=>{const k=cellKey(e.row,e.col);if(!startMap.has(k))startMap.set(k,++n);e.number=startMap.get(k)});
    const byId={};ordered.forEach((e,i)=>{byId[e.id]={...e,order:i}});
    const bb=boundsFor(ordered);
    return {id:`cw-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,title:title||'TTS Kelompok',topic:topic||'Informatika',rows:bb.h,cols:bb.w,entries:byId,createdAt:Date.now()};
  }

  function buildPuzzle(candidates,target,title,topic,options={}){
    const pool=normalizeCandidates(candidates);
    if(pool.length<target)throw new Error(`Bank hanya berisi ${pool.length} kata berbeda; butuh ${target} kata.`);
    const balanced=!!options.balanced;
    if(balanced&&(!Number.isInteger(target/2)||['general','computer'].some(type=>pool.filter(item=>item.category===type).length<target/2)))throw new Error('Bank kata umum dan komputer belum cukup untuk papan seimbang.');
    let best=[];let bestScore=-Infinity;
    const tries=balanced?130:90;
    for(let t=0;t<tries;t++){
      const source=t%3===0?shuffled(pool):pool.slice();
      const entries=layoutAttempt(source,target,balanced);
      const b=boundsFor(entries);
      const occupied=new Set(),crossings=new Set();
      for(const e of entries)for(let i=0;i<e.answer.length;i++){
        const key=cellKey(e.row+(e.direction==='V'?i:0),e.col+(e.direction==='H'?i:0));
        if(occupied.has(key))crossings.add(key);else occupied.add(key);
      }
      const score=entries.length*1000-b.area+crossings.size*3;
      if(score>bestScore){bestScore=score;best=entries}
      if(best.length>=target&&b.area<Math.max(250,target*18))break;
    }
    if(best.length<target)throw new Error(`Baru ${best.length}/${target} kata yang saling berpotongan. Coba buat TTS kembali.`);
    best=best.slice(0,target);
    if(balanced&&['general','computer'].some(type=>best.filter(entry=>entry.category===type).length!==target/2))throw new Error('Komposisi kata TTS belum seimbang. Coba buat TTS kembali.');
    return finalizePuzzle(best,title,topic);
  }

  function entriesArray(puzzle=cw().puzzle){return puzzle?.entries?Object.values(puzzle.entries).sort((a,b)=>Number(a.order||0)-Number(b.order||0)):[]}

  function boardData(puzzle,team=null,revealAll=false){
    const rows=Number(puzzle?.rows||0),cols=Number(puzzle?.cols||0),entries=entriesArray(puzzle),map=new Map(),solved=sharedSolved();
    entries.forEach(e=>{
      for(let i=0;i<e.answer.length;i++){
        const r=e.row+(e.direction==='V'?i:0),c=e.col+(e.direction==='H'?i:0),k=cellKey(r,c);
        let x=map.get(k)||{char:e.answer[i],entryIds:[],starts:[],number:null};
        x.char=e.answer[i];x.entryIds.push(e.id);if(i===0){x.number=e.number;x.starts.push(e.id)}map.set(k,x);
      }
    });
    const active=team?.activeEntryId||'';
    const cells=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const x=map.get(cellKey(r,c));
      if(!x){cells.push({blank:true,r,c});continue}
      const solvedIds=x.entryIds.filter(id=>solved[id]);
      const anySolved=solvedIds.length>0;
      const startOwnerId=x.starts.find(id=>solved[id]);
      const selectId=x.entryIds.find(id=>!solved[id])||'';
      cells.push({...x,r,c,blank:false,letter:revealAll||anySolved?x.char:'',active:x.entryIds.includes(active)&&!solved[active],solved:anySolved,selectId,owner:startOwnerId?solved[startOwnerId]:null});
    }
    return {rows,cols,cells};
  }

  function boardHtml(puzzle,team=null,revealAll=false,interactive=false){
    if(!puzzle?.entries)return '<div class="cw-board-empty">Belum ada papan TTS. Generate TTS terlebih dahulu.</div>';
    const data=boardData(puzzle,team,revealAll);
    const board=`<div class="cw-board-wrap"><div class="cw-board" style="grid-template-columns:repeat(${data.cols},var(--cw-cell))">${data.cells.map(c=>{if(c.blank)return '<span class="cw-cell blank"></span>';const inner=`${c.number?`<i class="cw-num">${c.number}</i>`:''}<span>${esc(c.letter||'')}</span>${ownerDotHtml(c.owner)}`;return interactive&&c.selectId?`<button type="button" class="cw-cell ${c.active?'active':''} ${c.solved?'solved':''} selectable" onclick="window.DMCrossword.activateEntry('${esc(c.selectId)}')">${inner}</button>`:`<span class="cw-cell ${c.active?'active':''} ${c.solved?'solved':''}">${inner}</span>`}).join('')}</div></div>`;
    return revealAll?board:`${board}${sharedLegendHtml()}`;
  }


  function teacherCluePreviewHtml(puzzle){
    const list=entriesArray(puzzle);
    if(!list.length)return '';

    const renderGroup=(direction,label)=>{
      const items=list
        .filter(e=>e.direction===direction)
        .sort((a,b)=>Number(a.number||0)-Number(b.number||0));

      if(!items.length)return '';

      return `<section class="cw-teacher-clue-group">
        <div class="cw-teacher-clue-group-head">
          <strong>${esc(label)}</strong>
          <span>${items.length} pertanyaan</span>
        </div>
        <div class="cw-teacher-clue-list">
          ${items.map(e=>`
            <article class="cw-teacher-clue-item">
              <span class="cw-teacher-clue-number">${Number(e.number||0)}</span>
              <div class="cw-teacher-clue-text">
                <p>${esc(e.clue||'Petunjuk belum tersedia.')}</p>
                <small>${String(e.answer||'').length} huruf</small>
              </div>
            </article>`).join('')}
        </div>
      </section>`;
    };

    return `<div class="cw-teacher-clues">
      <div class="cw-teacher-clues-title">
        <div>
          <strong>Pertanyaan TTS</strong>
          <span>Daftar petunjuk yang sesuai dengan nomor pada papan.</span>
        </div>
        <span class="cw-teacher-clues-count">${list.length} soal</span>
      </div>
      <div class="cw-teacher-clues-grid">
        ${renderGroup('H','Mendatar')}
        ${renderGroup('V','Menurun')}
      </div>
    </div>`;
  }

  function teacherNotice(text,type=''){
    const host=el('cwTeacherNotice');if(!host)return;host.className=`cw-notice ${type}`;host.textContent=text||'';
  }

  async function generateTeacherPuzzle(){
    if(busyGenerate||!bridge().isHost?.())return;
    const topic=(el('cwTopic')?.value||'Keamanan digital').trim();
    const difficulty=el('cwDifficulty')?.value||'mudah';
    const selectedCount=Number(el('cwWordCount')?.value||10);
    const target=[10,20,30].includes(selectedCount)?selectedCount:10;
    const duration=Math.max(20,Math.min(60,Number(el('cwDuration')?.value||30)));
    const consensus=el('cwConsensus')?.value||'all';
    busyGenerate=true;if(el('cwGenerateBtn'))el('cwGenerateBtn').disabled=true;
    teacherNotice('Menyusun papan TTS dari bank kata lokal…','warn');
    try{
      const maxLength=difficulty==='mudah'?7:difficulty==='sedang'?8:16;
      const bank=[...GENERAL_BANK.map(([answer,clue])=>({answer,clue,category:'general'})),...COMPUTER_BANK.map(([answer,clue])=>({answer,clue,category:'computer'}))].filter(item=>item.answer.length<=maxLength);
      const puzzle=buildPuzzle(shuffled(bank),target,`TTS ${topic}`,topic,{balanced:true});
      const actual=entriesArray(puzzle).length;
      await db().ref(`${roomBase()}/crossword`).set({
        config:{topic,difficulty,targetWords:target,durationMinutes:duration,consensus,title:puzzle.title,generatedAt:now()},
        puzzle,
        state:{status:'ready',startedAt:0,endsAt:0,finishedAt:0},
        globalSolved:null,
        teams:null
      });
      teacherNotice(`TTS siap: ${actual/2} kata umum dan ${actual/2} kata komputer. Periksa pratinjau lalu tekan Mulai TTS.`,'good');
    }catch(err){teacherNotice(err.message||String(err),'bad')}
    finally{busyGenerate=false;if(el('cwGenerateBtn'))el('cwGenerateBtn').disabled=false}
  }

  async function prepareTeams(){
    const count=Math.max(2,Math.min(6,Number(el('cwGroupCount')?.value||4)));
    try{await bridge().shuffleTeams?.(count);teacherNotice('Pembagian tim diacak. Periksa hasil lalu tekan Masukkan Siswa.','good')}catch(err){teacherNotice(err.message||String(err),'bad')}
  }
  async function releaseTeams(){try{await bridge().releaseTeams?.();teacherNotice('Tim telah dibuka untuk siswa.','good')}catch(err){teacherNotice(err.message||String(err),'bad')}}

  function initTeamState(){return {activeEntryId:'',proposal:null,responses:{},attempts:{},solved:{},hints:{},score:0,finishedAt:0,updatedAt:now()}}
  async function startGame(){
    if(busyAction||!bridge().isHost?.())return;
    const puzzle=cw().puzzle,meta=room()?.meta||{};
    if(!puzzle?.entries)return teacherNotice('Generate TTS terlebih dahulu.','warn');
    if(meta.teamPhase!=='released'||!Object.keys(groups()).length)return teacherNotice('Bentuk dan masukkan siswa ke tim terlebih dahulu.','warn');
    const duration=Math.max(20,Math.min(60,Number(el('cwDuration')?.value||cw().config?.durationMinutes||30)));
    const starter=pickStarterEntry(puzzle),starterSolved=starter?{[starter.id]:{answer:normalizeWord(starter.answer),source:'starter',teamId:'',teamName:'Bantuan Awal',colorIndex:-1,solvedAt:now(),solvedByUid:'',solvedByName:'Sistem',points:0}}:{};
    const updates={};Object.keys(groups()).forEach(gid=>updates[`${roomBase()}/crossword/teams/${gid}`]=initTeamState());
    updates[`${roomBase()}/crossword/globalSolved`]=starterSolved;
    updates[`${roomBase()}/crossword/state`]={status:'active',startedAt:now(),endsAt:now()+duration*60000,finishedAt:0};
    updates[`${roomBase()}/crossword/config/durationMinutes`]=duration;
    busyAction=true;try{await db().ref().update(updates);teacherNotice(`TTS dimulai. ${starter?`${starter.number} ${starter.direction==='H'?'Mendatar':'Menurun'} dibuka sebagai Bantuan Awal. `:''}Jawaban benar dari satu tim akan langsung terbuka untuk semua tim.`,'good')}catch(err){teacherNotice(err.message||String(err),'bad')}finally{busyAction=false}
  }
  async function finishGame(){
    if(!bridge().isHost?.())return;
    if(!confirm('Akhiri permainan TTS sekarang?'))return;
    await db().ref(`${roomBase()}/crossword/state`).update({status:'finished',finishedAt:now(),endsAt:Math.min(Number(cw().state?.endsAt||now()),now())});
  }
  async function resetGame(){
    if(!bridge().isHost?.())return;
    if(!confirm('Hapus puzzle dan progres TTS saat ini?'))return;
    await db().ref(`${roomBase()}/crossword`).remove();teacherNotice('TTS direset. Silakan Generate TTS baru.','good');
  }

  function teamMembers(gid){const field=room()?.meta?.teamPhase==='released'?'groupId':'pendingGroupId';return Object.entries(students()).filter(([,s])=>s?.[field]===gid).sort((a,b)=>Number(a[1].joinedAt||0)-Number(b[1].joinedAt||0)||a[0].localeCompare(b[0]))}
  function requiredAgreeCount(gid){
    const n=teamMembers(gid).length,mode=cw().config?.consensus||'all';
    if(n<=1)return 1;
    return mode==='majority'?Math.floor(n/2)+1:n;
  }
  function currentTeam(){const st=student();return st?.groupId?cw().teams?.[st.groupId]||null:null}
  function hintText(entry,kind){
    const answer=normalizeWord(entry?.answer);
    if(!answer)return '';
    if(kind==='extra'){
      const localHelp=LOCAL_HELP_BY_ANSWER.get(answer)||'';
      return localHelp&&!localHelp.toUpperCase().includes(answer)
        ? localHelp
        : `Dua huruf awal jawabannya ${answer.slice(0,2)}. Cocokkan dengan petunjuk utama.`;
    }
    if(kind==='edges')return `Huruf pertama ${answer[0]}, huruf terakhir ${answer[answer.length-1]}.`;
    if(kind==='pattern'){
      const pattern=[...answer].map((letter,i)=>i===0||i===answer.length-1||i>0&&i%2===0?letter:'_').join(' ');
      return `Pola jawaban (${answer.length} huruf): ${pattern}`;
    }
    return '';
  }
  async function useHint(kind){
    const st=student(),team=currentTeam(),entryId=team?.activeEntryId,entry=cw().puzzle?.entries?.[entryId];
    if(busyHint||!HINT_KINDS.some(([key])=>key===kind)||!st?.groupId||!team||!entry||cw().state?.status!=='active'||sharedSolved()[entryId]||team.hints?.[kind])return;
    const hint={entryId,text:hintText(entry,kind),usedByUid:user()?.uid||'',usedByName:st.name||'Siswa',usedAt:now()};
    busyHint=true;
    try{
      const result=await db().ref(`${roomBase()}/crossword/teams/${st.groupId}`).transaction(current=>{
        if(!current||current.activeEntryId!==entryId||current.hints?.[kind]||Object.keys(current.hints||{}).length>=3)return;
        current.hints={...(current.hints||{}),[kind]:hint};
        current.updatedAt=Date.now();
        return current;
      });
      if(!result?.committed)alert('Bantuan sudah dipakai atau tim telah memilih soal lain. Periksa bantuan tim.');
    }catch(err){alert(`Bantuan belum tersimpan. ${err.message||String(err)}`)}
    finally{busyHint=false}
  }
  function renderTeamHints(team,puzzle,state){
    const host=el('cwTeamHints');if(!host)return;
    const used=team.hints||{},remaining=Math.max(0,3-Object.keys(used).length);
    const button=el('cwStudentHintBtn');
    if(button){button.disabled=false;button.textContent=`💡 Bantuan (${remaining}/3)`}
    const entryId=team.activeEntryId,entry=puzzle?.entries?.[entryId];
    const canUse=state.status==='active'&&!!entry&&!sharedSolved()[entryId];
    const records=HINT_KINDS.filter(([kind])=>used[kind]).map(([kind,label])=>{
      const record=used[kind],forEntry=puzzle.entries?.[record.entryId];
      const number=forEntry?`${forEntry.number} ${forEntry.direction==='H'?'Mendatar':'Menurun'}`:'soal sebelumnya';
      return `<li><b>${esc(label)} · ${esc(number)}</b><span>${esc(record.text||'')}</span></li>`;
    });
    host.innerHTML=`<div class="cw-hints-heading"><strong>Bantuan Tim</strong><span>${remaining}/3 tersisa</span></div>
      <p>Petunjuk langsung dari bank lokal atau huruf jawaban. Tiap bantuan dapat dipakai sekali untuk soal aktif dan terlihat oleh seluruh tim.</p>
      <div class="cw-hint-actions">${HINT_KINDS.map(([kind,label])=>`<button type="button" class="btn secondary" ${!canUse||!!used[kind]||busyHint?'disabled':''} onclick="window.DMCrossword.useHint('${kind}')">${esc(label)}${used[kind]?' ✓':''}</button>`).join('')}</div>
      ${records.length?`<ul class="cw-hint-history">${records.join('')}</ul>`:''}`;
  }
  function toggleStudentHints(){
    const host=el('cwTeamHints'),button=el('cwStudentHintBtn');
    if(!host||!button||button.disabled)return;
    const open=host.classList.contains('hidden');
    host.classList.toggle('hidden',!open);
    button.setAttribute('aria-expanded',String(open));
    if(open)requestAnimationFrame(()=>host.scrollIntoView({behavior:'smooth',block:'center'}));
  }
  function reviewStats(gid,team){
    const members=teamMembers(gid),proposal=team?.proposal||null,responses=team?.responses||{};
    const proposerUid=proposal?.uid||'';
    const reviewers=members.filter(([uid])=>uid!==proposerUid);
    const responded=reviewers.filter(([uid])=>responses[uid]&&typeof responses[uid].agree==='boolean');
    const agreeResponses=responded.filter(([uid])=>responses[uid]?.agree===true).length;
    const proposerCounts=proposal&&members.some(([uid])=>uid===proposerUid)?1:0;
    const agreeCount=proposerCounts+agreeResponses;
    const needAgree=requiredAgreeCount(gid);
    const allResponded=responded.length>=reviewers.length;
    return {
      members,reviewers,responses,responded,
      responseCount:responded.length,responseNeed:reviewers.length,
      agreeCount,needAgree,allResponded,
      unanimous:!!proposal&&proposerCounts===1&&allResponded&&responded.every(([uid])=>responses[uid].agree===true),
      accepted:!!proposal&&allResponded&&agreeCount>=needAgree,
      rejected:!!proposal&&allResponded&&agreeCount<needAgree
    };
  }
  function sameProposal(a,b){
    return !!a&&!!b&&a.uid===b.uid&&normalizeWord(a.text)===normalizeWord(b.text)&&Number(a.createdAt||0)===Number(b.createdAt||0);
  }

  async function cleanupGloballySolvedActive(gid,entryId){
    if(!gid||!entryId)return;const key=`${gid}:${entryId}`;if(staleEntryCleanup.has(key))return;staleEntryCleanup.add(key);
    try{
      await db().ref(`${roomBase()}/crossword/teams/${gid}`).transaction(t=>{
        if(!t||t.activeEntryId!==entryId)return t;
        t.activeEntryId='';t.proposal=null;t.responses={};t.updatedAt=Date.now();return t;
      });
    }finally{setTimeout(()=>staleEntryCleanup.delete(key),1200)}
  }

  async function activateEntry(entryId){
    const st=student(),state=cw().state||{},puzzle=cw().puzzle,team=currentTeam(),solved=sharedSolved();
    if(!st?.groupId||state.status!=='active'||!puzzle?.entries?.[entryId])return;
    if(solved[entryId]){const info=ownerInfo(solved[entryId]);return alert(`Soal ini sudah terjawab oleh ${info.name}. Pilih soal lain.`)}
    const ref=db().ref(`${roomBase()}/crossword/teams/${st.groupId}`);
    await ref.transaction(t=>{
      t=t||initTeamState();
      if(t.activeEntryId&&t.activeEntryId!==entryId)return;
      t.activeEntryId=entryId;t.proposal=null;t.responses={};t.updatedAt=Date.now();return t;
    });
  }

  async function submitProposal(){
    const st=student(),team=currentTeam(),entryId=team?.activeEntryId;
    if(!st?.groupId||!entryId)return;
    if(sharedSolved()[entryId]){const info=ownerInfo(sharedSolved()[entryId]);await cleanupGloballySolvedActive(st.groupId,entryId);return alert(`Soal ini sudah lebih dulu dijawab oleh ${info.name}. Pilih soal lain.`)}
    if(team?.proposal)return alert('Sudah ada usulan yang sedang dibahas. Tanggapi usulan tersebut terlebih dahulu.');
    const input=el('cwProposalInput'),text=normalizeWord(input?.value||'');
    if(text.length<2)return alert('Masukkan usulan jawaban terlebih dahulu.');
    const ref=db().ref(`${roomBase()}/crossword/teams/${st.groupId}`);
    const tx=await ref.transaction(t=>{
      t=t||initTeamState();
      if(t.proposal)return;
      t.proposal={text,uid:user().uid,name:st.name||'Siswa',createdAt:Date.now()};
      t.responses={};
      if(t.votes)delete t.votes;
      t.updatedAt=Date.now();
      return t;
    });
    const savedProposal=tx?.snapshot?.val()?.proposal;
    if(!tx?.committed||savedProposal?.uid!==user()?.uid||normalizeWord(savedProposal?.text)!==text)return alert('Anggota lain lebih dulu mengirim usulan. Periksa usulan yang sedang dibahas.');
    proposalDraft='';
    if(input)input.value='';
    void sendSystemChat(`${st.name||'Seorang anggota'} mengusulkan jawaban "${text}" dan otomatis dihitung Setuju. Anggota lain cukup memilih Setuju atau Tidak Setuju. Jika semua setuju, jawaban diperiksa otomatis.`);
    await maybeAutoResolveProposal(st.groupId);
  }


  function setProposalDraft(value){
    proposalDraft=String(value??'').slice(0,16);
  }

  async function submitReview(decision){
    const st=student(),team=currentTeam(),entryId=team?.activeEntryId,proposal=team?.proposal;
    if(!st?.groupId||!entryId||!proposal||cw().state?.status!=='active')return;
    if(proposal.uid===user()?.uid)return alert('Kamu adalah pengusul. Tanggapan Setuju/Tidak Setuju diberikan oleh anggota lain.');
    if(!['yes','no'].includes(decision))return;

    const uid=user()?.uid;if(!uid)return;
    const record={agree:decision==='yes',name:st.name||'Siswa',uid,createdAt:now()};
    let vote;
    try{
      vote=await db().ref(`${roomBase()}/crossword/teams/${st.groupId}`).transaction(t=>{
        if(!t||t.activeEntryId!==entryId||!sameProposal(t.proposal,proposal))return;
        t.responses=t.responses||{};t.responses[uid]=record;t.updatedAt=Date.now();return t;
      });
    }catch(err){return alert(`Pilihan belum tersimpan. ${err.message||String(err)}`)}
    if(!vote?.committed)return;

    // Pencatatan chat tidak boleh menunda pemeriksaan jawaban.
    void db().ref(chatPath(st.groupId)).push().set({
      uid,name:st.name,
      text:decision==='yes'?'SETUJU':'TIDAK SETUJU',
      game:'crossword',review:true,reviewAgree:decision==='yes',createdAt:firebase.database.ServerValue.TIMESTAMP
    }).catch(err=>console.warn('Pesan voting TTS belum tersimpan.',err));

    // Jika tanggapan ini melengkapi persetujuan seluruh anggota,
    // jawaban langsung diperiksa dan diproses tanpa tombol tambahan.
    try{await maybeAutoResolveProposal(st.groupId)}catch(err){alert(`Pemeriksaan jawaban belum selesai. ${err.message||String(err)}`)}
  }


  async function maybeAutoResolveProposal(gid){
    if(!gid||gid!==student()?.groupId||busySubmit||autoResolveBusy||cw().state?.status!=='active')return false;
    autoResolveBusy=true;
    try{
      const snap=await db().ref(`${roomBase()}/crossword/teams/${gid}`).once('value');
      const latestTeam=snap.val(),entryId=latestTeam?.activeEntryId;
      if(!entryId||!latestTeam?.proposal||!cw().puzzle?.entries?.[entryId]||sharedSolved()[entryId])return false;
      // Pengusul dihitung Setuju; semua anggota lainnya wajib memilih Setuju.
      if(!reviewStats(gid,latestTeam).unanimous)return false;
      await submitAnswer({auto:true,teamSnapshot:latestTeam});
      return true;
    }finally{autoResolveBusy=false}
  }

  async function discussAgain(){
    const st=student(),team=currentTeam();if(!st?.groupId||!team?.proposal)return;
    const stats=reviewStats(st.groupId,team);
    if(!stats.allResponded)return alert('Tunggu semua anggota lain memberikan tanggapan terlebih dahulu.');
    await db().ref(`${roomBase()}/crossword/teams/${st.groupId}`).update({proposal:null,responses:{},updatedAt:now()});
    await sendSystemChat('Usulan belum disepakati. Tim membuka usulan baru setelah berdiskusi.');
  }

  async function submitAnswer(options={}){
    if(busySubmit)return;
    const st=student();
    const team=options?.teamSnapshot||currentTeam();
    const entryId=team?.activeEntryId;
    const entry=cw().puzzle?.entries?.[entryId];
    if(!st?.groupId||!entryId||!entry||!team?.proposal||cw().state?.status!=='active')return;
    const already=sharedSolved()[entryId];
    if(already){const info=ownerInfo(already);await cleanupGloballySolvedActive(st.groupId,entryId);return alert(`Jawaban sudah lebih dulu ditemukan oleh ${info.name}.`)}
    const stats=reviewStats(st.groupId,team);
    if(!stats.allResponded)return alert(`Belum semua anggota lain menanggapi. Masih menunggu ${Math.max(0,stats.responseNeed-stats.responseCount)} tanggapan.`);
    if(!stats.accepted)return alert(`Usulan belum mencapai syarat persetujuan (${stats.agreeCount}/${stats.needAgree} setuju). Buka usulan baru setelah diskusi.`);
    const proposalSnapshot={...team.proposal};
    const proposed=normalizeWord(proposalSnapshot.text);
    const correct=normalizeWord(entry.answer);
    const teamRef=db().ref(`${roomBase()}/crossword/teams/${st.groupId}`);
    const autoMode=!!options?.auto;
    if(autoMode&&!stats.unanimous)return;
    const writerUid=user()?.uid;if(!writerUid)return;
    const creditedUid=autoMode?(proposalSnapshot.uid||user().uid):user().uid;
    const creditedName=autoMode?(proposalSnapshot.name||st.name||'Siswa'):(st.name||'Siswa');
    busySubmit=true;
    try{
      let preparedAttempts=1;
      const prep=await teamRef.transaction(t=>{
        if(!t||t.activeEntryId!==entryId||!sameProposal(t.proposal,proposalSnapshot))return;
        const liveStats=reviewStats(st.groupId,t);
        if(autoMode?!liveStats.unanimous:!liveStats.accepted)return;
        t.attempts=t.attempts||{};t.attempts[entryId]=Number(t.attempts[entryId]||0)+1;
        t.proposal=null;t.responses={};if(t.votes)delete t.votes;t.updatedAt=Date.now();return t;
      });
      if(!prep?.committed)return;
      preparedAttempts=Number(prep.snapshot.val()?.attempts?.[entryId]||1);
      if(proposed!==correct){
        await sendSystemChat('Jawaban belum tepat. Usulan dihapus agar semua anggota dapat mengajukan jawaban baru setelah berdiskusi.');
        return;
      }

      const g=groups()[st.groupId]||{},pts=30,claimId=`${creditedUid}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
      // Aturan Firebase mewajibkan solvedByUid sama dengan pengguna yang menulis.
      // Kredit pengusul tetap disimpan pada hasil tim di bawah.
      const claim={answer:correct,source:'team',teamId:st.groupId,teamName:g.name||'Tim',colorIndex:Number(g.colorIndex||0),solvedAt:Date.now(),solvedByUid:writerUid,solvedByName:st.name||'Siswa',points:pts,claimId};
      const claimRef=db().ref(`${roomBase()}/crossword/globalSolved/${entryId}`);
      const claimed=await claimRef.transaction(current=>current?undefined:claim);
      const winner=claimed?.snapshot?.val();
      if(!claimed?.committed||winner?.claimId!==claimId){
        const info=ownerInfo(winner||sharedSolved()[entryId]);
        await teamRef.transaction(t=>{if(!t)return t;if(t.activeEntryId===entryId)t.activeEntryId='';t.proposal=null;t.responses={};t.updatedAt=Date.now();return t});
        await sendSystemChat(`${info.name||'Tim lain'} lebih dulu menyelesaikan ${entry.number} ${entry.direction==='H'?'Mendatar':'Menurun'} = ${correct}. Jawaban kini terbuka untuk semua tim.`);
        return;
      }

      await teamRef.transaction(t=>{
        t=t||initTeamState();t.solved=t.solved||{};
        if(!t.solved[entryId]){t.solved[entryId]={answer:correct,points:pts,solvedAt:Date.now(),submittedByUid:creditedUid,submittedByName:creditedName,global:true,autoSubmitted:autoMode};t.score=Number(t.score||0)+pts}
        if(t.activeEntryId===entryId)t.activeEntryId='';t.proposal=null;t.responses={};t.updatedAt=Date.now();return t;
      });
      await sendSystemChat(`Benar! ${entry.number} ${entry.direction==='H'?'Mendatar':'Menurun'} = ${correct}. +${pts} poin untuk ${g.name||'tim'}. Jawaban langsung terbuka untuk semua tim.`);
    }finally{busySubmit=false}
  }

  function chatPath(gid){return `groupChats/${code()}/${gid}`}
  function unsubscribeChat(){if(chatRef)chatRef.off();chatRef=null;chatGroup='';chatMessages={}}
  function ensureChat(gid){
    if(!db()||!gid)return;if(chatRef&&chatGroup===gid)return;unsubscribeChat();chatGroup=gid;chatRef=db().ref(chatPath(gid)).limitToLast(100);
    chatRef.on('value',snap=>{chatMessages=snap.val()||{};renderStudentChat()});
  }
  async function sendChat(){
    const st=student(),input=el('cwChatInput');
    if(!st?.groupId||!input||input.dataset.sending==='1')return;
    const text=String(input.value||'').trim().slice(0,500);if(!text)return;
    const button=input.closest('.cw-chat-compose')?.querySelector('button');
    input.dataset.sending='1';input.disabled=true;if(button)button.disabled=true;
    try{
      await db().ref(chatPath(st.groupId)).push().set({uid:user().uid,name:st.name,text,game:'crossword',createdAt:firebase.database.ServerValue.TIMESTAMP});
      // Hapus hanya jika isi belum berubah selama proses kirim.
      if(String(input.value||'').trim().slice(0,500)===text)input.value='';
      input.focus({preventScroll:true});
    }catch(err){
      alert(`Pesan belum terkirim. ${err.message||String(err)}`);
    }finally{
      delete input.dataset.sending;input.disabled=false;if(button)button.disabled=false;
    }
  }
  async function sendSystemChat(text){
    const st=student();if(!st?.groupId)return;
    // Ditulis sebagai pesan siswa agar sesuai dengan security rules yang sudah ada.
    await db().ref(chatPath(st.groupId)).push().set({uid:user().uid,name:st.name,text:String(text).slice(0,500),game:'crossword',system:true,createdAt:firebase.database.ServerValue.TIMESTAMP}).catch(err=>console.warn('Pesan sistem TTS belum tersimpan.',err));
  }
  function renderProposalReviewPanel(){
    const host=el('cwProposalReview');if(!host)return;
    const st=student(),team=currentTeam(),proposal=team?.proposal;
    if(!st?.groupId||!team?.activeEntryId||sharedSolved()[team.activeEntryId]||!proposal){host.classList.add('hidden');host.innerHTML='';return}
    const stats=reviewStats(st.groupId,team),meUid=user()?.uid,myResponse=stats.responses[meUid]||null,isProposer=proposal.uid===meUid;
    const responseRows=stats.reviewers.map(([uid,s])=>{
      const r=stats.responses[uid];
      if(!r)return `<div class="cw-review-member pending"><div><b>${esc(s.name||'Siswa')}</b><small>Belum menanggapi</small></div><span>Menunggu</span></div>`;
      return `<div class="cw-review-member ${r.agree?'agree':'disagree'}"><div><b>${esc(s.name||r.name||'Siswa')}</b><small>${r.agree?'Setuju':'Tidak setuju'}</small></div><span>${r.agree?'SETUJU':'TIDAK'}</span></div>`;
    }).join('');
    let action='';
    if(isProposer){
      action=`<div class="cw-review-own-note"><b>Kamu mengajukan jawaban ini dan dihitung Setuju.</b><span>Tunggu anggota lain memilih Setuju atau Tidak Setuju.</span></div>`;
    }else{
      action=`<div class="cw-review-question"><b>${myResponse?'Perbarui tanggapanmu':'Apakah kamu setuju dengan usulan ini?'}</b><div class="cw-review-actions"><div><button type="button" class="btn cw-disagree-btn" aria-pressed="${myResponse?.agree===false}" onclick="window.DMCrossword.submitReview('no')">Tidak Setuju</button><button type="button" class="btn cw-agree-btn" aria-pressed="${myResponse?.agree===true}" onclick="window.DMCrossword.submitReview('yes')">Setuju</button></div></div></div>`;
    }
    const unanimousPanel=stats.unanimous,rejectedPanel=stats.allResponded&&!unanimousPanel;
    const status=unanimousPanel?'Semua setuju • diproses otomatis':rejectedPanel?'Belum semua setuju':`Menunggu ${Math.max(0,stats.responseNeed-stats.responseCount)} tanggapan`;
    host.classList.remove('hidden');
    host.innerHTML=`<section class="cw-review-card"><div class="cw-review-head"><div><span>USULAN JAWABAN</span><strong>${esc(proposal.text)}</strong><small>Diajukan oleh ${esc(proposal.name||'anggota')}</small></div><b class="${unanimousPanel?'good':rejectedPanel?'bad':'wait'}">${esc(status)}</b></div>${action}<div class="cw-review-list"><div class="cw-review-list-title">Tanggapan anggota lain <span>${stats.responseCount}/${stats.responseNeed}</span></div>${responseRows||'<div class="cw-review-solo">Tidak ada anggota lain. Sistem akan memeriksa usulan secara otomatis.</div>'}</div></section>`;
  }

  function renderStudentChat(){
    renderProposalReviewPanel();
    const host=el('cwChatMessages');if(!host)return;
    const stayAtBottom=host.scrollHeight-host.scrollTop-host.clientHeight<80;
    const list=Object.values(chatMessages||{}).filter(m=>m&&m.game==='crossword').sort((a,b)=>Number(a.createdAt||0)-Number(b.createdAt||0));
    host.innerHTML=list.length?list.map(m=>{
      const me=m.uid===user()?.uid,system=!!m.system;const time=m.createdAt?new Date(Number(m.createdAt)).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}):'';
      if(system)return `<div class="cw-chat-message system"><div class="cw-chat-bubble">${esc(m.text)}</div></div>`;
      const reviewClass=m.review?(m.reviewAgree?' review-agree':' review-disagree'):'';
      return `<div class="cw-chat-message ${me?'me':''}${reviewClass}"><div class="cw-chat-avatar">${esc((m.name||'?').slice(0,1).toUpperCase())}</div><div class="cw-chat-body"><b>${esc(m.name||'Siswa')}${me?' (kamu)':''}</b><time>${esc(time)}</time><div class="cw-chat-bubble">${esc(m.text||'')}</div></div></div>`;
    }).join(''):'<div class="cw-board-empty">Belum ada pesan. Diskusikan petunjuk bersama tim di sini.</div>';
    if(stayAtBottom||host.scrollHeight<=host.clientHeight+80)host.scrollTop=host.scrollHeight;
  }


  async function kickStudent(uid){
    if(!bridge().isHost?.()||!uid)return;
    const st=students()?.[uid];if(!st)return;
    const gid=st.groupId||st.pendingGroupId||'';
    if(!gid)return alert(`${st.name||'Siswa'} saat ini tidak berada di tim.`);
    const groupName=groups()?.[gid]?.name||'tim';
    if(!confirm(`Keluarkan ${st.name||'siswa'} dari ${groupName}? Data siswa tetap tercatat di daftar kelas, tetapi siswa tidak lagi menjadi anggota tim TTS.`))return;
    try{
      const updates={};
      updates[`${roomBase()}/students/${uid}/groupId`]='';
      updates[`${roomBase()}/students/${uid}/pendingGroupId`]='';
      const teamSnap=await db().ref(`${roomBase()}/crossword/teams/${gid}`).once('value');
      const team=teamSnap.val()||{};
      if(team.proposal?.uid===uid){
        updates[`${roomBase()}/crossword/teams/${gid}/proposal`]=null;
        updates[`${roomBase()}/crossword/teams/${gid}/responses`]=null;
      }else{
        updates[`${roomBase()}/crossword/teams/${gid}/responses/${uid}`]=null;
      }
      updates[`${roomBase()}/crossword/teams/${gid}/updatedAt`]=now();
      await db().ref().update(updates);
      teacherNotice(`${st.name||'Siswa'} dikeluarkan dari ${groupName}. Data siswa tetap tersimpan di daftar kelas.`,'good');
    }catch(err){
      teacherNotice(`Siswa belum dapat dikeluarkan: ${err.message||String(err)}`,'bad');
    }
  }

  function setTeacherPreviewMode(mode){
    if(bridge().getMode?.()!=='teacher'||!['student','teacher'].includes(mode))return;
    teacherPreviewMode=mode;
    renderTeacherPreview();
  }

  function renderTeacherPreview(){
    const preview=el('cwTeacherPreview');if(!preview)return;
    const puzzle=cw().puzzle,studentView=teacherPreviewMode==='student';
    preview.classList.toggle('cw-preview-student',studentView);
    const studentBtn=el('cwPreviewStudentBtn'),teacherBtn=el('cwPreviewTeacherBtn');
    if(studentBtn){studentBtn.classList.toggle('is-active',studentView);studentBtn.setAttribute('aria-pressed',String(studentView))}
    if(teacherBtn){teacherBtn.classList.toggle('is-active',!studentView);teacherBtn.setAttribute('aria-pressed',String(!studentView))}
    const description=el('cwTeacherPreviewDescription');
    if(description)description.textContent=studentView
      ?'Hanya jawaban yang sudah terbuka di layar siswa yang ditampilkan. Kotak lainnya tetap kosong.'
      :'Jawaban hanya terlihat pada dashboard guru. Bentuk grid otomatis mengikuti kata yang dipilih dari bank lokal.';
    if(studentView){
      preview.innerHTML=boardHtml(puzzle,null,false,false);
      return;
    }
    preview.innerHTML=puzzle
      ? `<div class="cw-teacher-preview-layout">
            <div class="cw-teacher-preview-board">${boardHtml(puzzle,null,true,false)}</div>
            ${teacherCluePreviewHtml(puzzle)}
          </div>`
      : boardHtml(puzzle,null,true,false);
  }

  function renderTeacher(){
    const host=el('teacherGameWorkspaceCrossword');if(!host||host.classList.contains('hidden'))return;
    const data=cw(),state=data.state||{},puzzle=data.puzzle,teamMap=data.teams||{},phase=room()?.meta?.teamPhase||'collecting',globalSolved=data.globalSolved||{};
    const total=entriesArray(puzzle).length||0,globalDone=Object.keys(globalSolved).length;
    if(el('cwTeacherStudentCount'))el('cwTeacherStudentCount').textContent=Object.keys(students()).length;
    if(el('cwTeacherTeamCount'))el('cwTeacherTeamCount').textContent=Object.keys(groups()).length;
    if(el('cwTeacherStatus'))el('cwTeacherStatus').textContent=state.status==='active'?'Berjalan':state.status==='finished'?'Selesai':state.status==='ready'?'Siap':'Belum dibuat';
    if(el('cwTeacherPuzzleCount'))el('cwTeacherPuzzleCount').textContent=puzzle?(state.status==='active'||state.status==='finished'?`${globalDone}/${total} terjawab`:`${total} kata`):'—';
    renderTeacherPreview();
    const statusBtn=el('cwStartBtn');if(statusBtn){statusBtn.disabled=!puzzle||phase!=='released'||state.status==='active';statusBtn.textContent=state.status==='finished'?'Mulai Ulang TTS':'Mulai TTS'}
    if(el('cwFinishBtn'))el('cwFinishBtn').disabled=state.status!=='active';
    if(el('cwTeacherStatePill'))el('cwTeacherStatePill').textContent=state.status==='active'?`● ${globalDone}/${total} jawaban terbuka`:state.status==='finished'?'Selesai':state.status==='ready'?'Siap dimulai':'Belum dibuat';
    const progress=el('cwTeacherProgress');
    if(progress){
      progress.innerHTML=Object.entries(groups()).length?Object.entries(groups()).map(([gid,g])=>{
        const t=teamMap[gid]||{},members=teamMembers(gid),contrib=Object.keys(t.solved||{}).length,pct=total?Math.round(contrib/total*100):0,active=puzzle?.entries?.[t.activeEntryId];
        const memberNames=members.length?members.map(([,member])=>esc(member.name||'Siswa')).join(', '):'Belum ada anggota';
        const hintsLeft=Math.max(0,3-Object.keys(t.hints||{}).length);
        return `<div class="cw-team-progress-row"><div class="cw-team-name-cell"><b>${esc(g.name||gid)}</b><small class="cw-team-member-names">${memberNames}</small></div><small>${contrib} jawaban tim<br>${hintsLeft}/3 bantuan tersisa</small><div><div class="cw-mini-track"><i style="width:${pct}%"></i></div><small>${active&&!globalSolved[t.activeEntryId]?`Membahas ${active.number} ${active.direction==='H'?'Mendatar':'Menurun'}`:'Menunggu soal'}</small></div><b>${Number(t.score||0)} pt</b></div>`;
      }).join(''):'<div class="cw-board-empty">Tim belum dibentuk.</div>';
    }
    const roster=el('cwTeacherRoster');
    if(roster){
      const all=Object.entries(students()).sort((a,b)=>Number(a[1]?.joinedAt||0)-Number(b[1]?.joinedAt||0)||(a[1]?.name||'').localeCompare(b[1]?.name||''));
      roster.innerHTML=all.length?all.map(([uid,st],i)=>{
        const gid=st.groupId||st.pendingGroupId||'',g=groups()[gid],inTeam=!!gid;
        return `<div class="cw-roster-row"><span class="cw-roster-index">${i+1}</span><div class="cw-roster-person"><b>${esc(st.name||'Siswa')}</b><small>${esc(st.cls||'-')}</small></div><span class="cw-roster-team ${inTeam?'in-team':'no-team'}">${esc(g?.name||(inTeam?'Tim tidak ditemukan':'Tanpa tim'))}</span><button type="button" class="btn secondary small cw-kick-btn" data-uid="${esc(uid)}" ${inTeam?'':'disabled'} onclick="window.DMCrossword.kickStudent(this.dataset.uid)">Keluarkan dari Tim</button></div>`;
      }).join(''):'<div class="cw-board-empty">Belum ada siswa yang masuk.</div>';
    }
    if(state.status==='active'&&total&&globalDone>=total&&bridge().isHost?.()&&!autoFinishGuard){autoFinishGuard=true;db().ref(`${roomBase()}/crossword/state`).update({status:'finished',finishedAt:now(),endsAt:Math.min(Number(state.endsAt||now()),now())}).finally(()=>setTimeout(()=>autoFinishGuard=false,1500))}
    updateTeacherTimer();
  }

  function updateTeacherTimer(){
    const host=el('cwTeacherTimer');if(!host)return;const state=cw().state||{};
    if(state.status!=='active'||!state.endsAt){host.textContent='--:--';return}
    const ms=Math.max(0,Number(state.endsAt)-now()),m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);host.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if(ms<=0&&bridge().isHost?.()&&!autoFinishGuard){autoFinishGuard=true;db().ref(`${roomBase()}/crossword/state`).update({status:'finished',finishedAt:now()}).finally(()=>setTimeout(()=>autoFinishGuard=false,1500))}
  }

  function renderStudent(){
    const ws=el('studentCrosswordWorkspace');if(!ws||ws.classList.contains('hidden'))return;
    const st=student(),data=cw(),state=data.state||{},puzzle=data.puzzle,meta=room()?.meta||{};
    if(!st){return}
    if(el('cwStudentTeam'))el('cwStudentTeam').textContent=st.groupId?(groups()[st.groupId]?.name||'Tim'):'Belum ada tim';
    const memberHost=el('cwTeamMembers');
    if(memberHost){
      const members=st.groupId?teamMembers(st.groupId):[];
      memberHost.innerHTML=members.length?`<b>Anggota tim (${members.length})</b><span>${members.map(([,m])=>esc(m.name||'Siswa')).join(' • ')}</span>`:'<b>Anggota tim</b><span>Belum ada anggota.</span>';
    }
    if(meta.teamPhase!=='released'||!st.groupId){unsubscribeChat();showStudentWait('Tim belum dibentuk','Guru sedang menyiapkan pembagian tim. TTS akan terbuka setelah kamu masuk ke salah satu tim.');return}
    ensureChat(st.groupId);
    if(!puzzle||!['active','finished'].includes(state.status)){showStudentWait('TTS belum dimulai','Tim kamu sudah siap. Tunggu guru membuat dan memulai papan TTS.');return}
    const team=data.teams?.[st.groupId]||initTeamState(),total=entriesArray(puzzle).length,done=Object.keys(data.globalSolved||{}).length,pct=total?Math.round(done/total*100):0;
    el('cwStudentWaiting')?.classList.add('hidden');el('cwStudentGame')?.classList.remove('hidden');
    if(el('cwStudentTitle'))el('cwStudentTitle').textContent=puzzle.title||'TTS Kelompok';
    if(el('cwStudentProgressText'))el('cwStudentProgressText').textContent=`${done}/${total} kata kelas`;
    if(el('cwStudentProgressTextMirror'))el('cwStudentProgressTextMirror').textContent=`${pct}% selesai`;
    if(el('cwStudentProgressBar'))el('cwStudentProgressBar').style.width=`${pct}%`;
    if(el('cwStudentScore'))el('cwStudentScore').textContent=`${Number(team.score||0)} poin`;
    if(el('cwStudentBoard'))el('cwStudentBoard').innerHTML=boardHtml(puzzle,team,false,state.status==='active');
    updateStudentTimer();renderActiveClue(st,team,puzzle,state);renderTeamHints(team,puzzle,state);renderStudentChat();
    if(state.status==='active'&&reviewStats(st.groupId,team).unanimous){
      void maybeAutoResolveProposal(st.groupId).catch(err=>console.warn('Pemeriksaan otomatis TTS belum selesai.',err));
    }
  }
  function showStudentWait(title,text){
    el('cwStudentGame')?.classList.add('hidden');const wait=el('cwStudentWaiting');wait?.classList.remove('hidden');if(el('cwWaitTitle'))el('cwWaitTitle').textContent=title;if(el('cwWaitText'))el('cwWaitText').textContent=text;
    const button=el('cwStudentHintBtn');if(button)button.disabled=true;
  }
  function updateStudentTimer(){
    const host=el('cwStudentTimer'),state=cw().state||{};if(!host)return;
    if(state.status==='finished'){host.textContent='Selesai';return}if(state.status!=='active'||!state.endsAt){host.textContent='--:--';return}
    const ms=Math.max(0,Number(state.endsAt)-now()),m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);host.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  function renderActiveClue(st,team,puzzle,state){
    const zone=el('cwActiveClue');if(!zone)return;
    const previousInput=el('cwProposalInput');
    const restoreFocus=!!previousInput&&document.activeElement===previousInput;
    const previousStart=restoreFocus?previousInput.selectionStart:null;
    const previousEnd=restoreFocus?previousInput.selectionEnd:null;
    if(previousInput)proposalDraft=String(previousInput.value||'').slice(0,16);
    const list=entriesArray(puzzle),solved=sharedSolved();
    const clueButtons=el('cwClueButtons');
    if(clueButtons)clueButtons.innerHTML=list.map(e=>{const rec=solved[e.id];return `<button type="button" class="cw-clue-button ${rec?'solved':''} ${team.activeEntryId===e.id&&!rec?'active':''}" ${state.status==='active'&&!rec?'': 'disabled'} onclick="window.DMCrossword.activateEntry('${esc(e.id)}')"><span>${e.number} ${e.direction==='H'?'Mendatar':'Menurun'}</span>${rec?ownerBadgeHtml(rec):''}</button>`}).join('');

    if(state.status==='finished'){
      const contribution=Object.keys(team.solved||{}).length;
      zone.className='cw-clue-zone waiting';zone.innerHTML=`<strong>Permainan selesai</strong><p>Semua tim membuka <b>${Object.keys(solved).length}/${list.length}</b> jawaban. Tim kamu memperoleh <b>${Number(team.score||0)} poin</b> dari ${contribution} jawaban.</p>`;return;
    }
    if(team.activeEntryId&&solved[team.activeEntryId]){
      const rec=solved[team.activeEntryId],info=ownerInfo(rec);cleanupGloballySolvedActive(st.groupId,team.activeEntryId);
      zone.className='cw-clue-zone waiting';zone.innerHTML=`<strong>Soal telah dijawab ${esc(info.name)}</strong><p>Jawabannya sekarang sudah terbuka untuk semua tim. Pilih nomor lain yang masih kosong.</p>`;return;
    }
    const entry=team.activeEntryId?puzzle.entries[team.activeEntryId]:null;
    if(!entry){
      const remaining=list.length-Object.keys(solved).length;
      zone.className='cw-clue-zone waiting';zone.innerHTML=remaining>0?'<strong>Pilih satu soal untuk dibahas bersama</strong><p>Klik nomor yang belum terjawab. Jawaban benar dari tim mana pun langsung muncul di papan semua tim.</p>':'<strong>Semua jawaban sudah terbuka</strong><p>Seluruh tim telah menyelesaikan papan TTS. Menunggu permainan ditutup.</p>';return
    }
    zone.className='cw-clue-zone';
    const proposal=team.proposal,stats=reviewStats(st.groupId,team);
    let action='';
    if(!proposal){
      action=`<div class="cw-proposal-line"><input id="cwProposalInput" maxlength="16" value="${esc(proposalDraft)}" autocomplete="off" autocapitalize="characters" placeholder="Usulan jawaban…" oninput="window.DMCrossword.setProposalDraft(this.value)" onkeydown="if(event.key==='Enter'){event.preventDefault();window.DMCrossword.submitProposal()}"><button class="btn primary" type="button" onclick="window.DMCrossword.submitProposal()">Ajukan</button></div><span class="cw-inline-status">Semua anggota setara dan boleh mengajukan jawaban. Tim lain juga dapat mengerjakan nomor ini, jadi diskusikan dengan efektif.</span>`;
    }else{
      const unanimousNow=stats.unanimous,rejectedNow=stats.allResponded&&!unanimousNow;

      const stateText=unanimousNow
        ?'Semua anggota sudah Setuju. Sistem memeriksa jawaban dan akan memasukkannya ke TTS secara otomatis jika benar.'
        :rejectedNow
          ?`Semua tanggapan sudah masuk, tetapi belum semua anggota Setuju (${stats.agreeCount}/${stats.needAgree}).`
          :`Menunggu ${Math.max(0,stats.responseNeed-stats.responseCount)} anggota lain memberikan pilihan Setuju/Tidak Setuju.`;

      const meUid=user()?.uid;
      const isProposer=proposal.uid===meUid;
      const myResponse=stats.responses[meUid]||null;

      let inlineReview='';
      if(isProposer){
        inlineReview=stats.responseNeed>0
          ?`<div class="cw-inline-review-note proposer"><b>Kamu adalah pengusul dan otomatis dihitung Setuju.</b><span>Anggota lain cukup memilih Setuju atau Tidak Setuju. Setelah semua setuju, jawaban diperiksa otomatis.</span></div>`
          :`<div class="cw-inline-review-note solo"><b>Tidak ada anggota lain dalam tim.</b><span>Usulan tidak memerlukan voting anggota lain dan dapat langsung dilanjutkan sesuai aturan permainan.</span></div>`;
      }else{
        inlineReview=`<div class="cw-inline-review-box">
          <div class="cw-inline-review-title">
            <div>
              <b>${myResponse?'Perbarui pilihanmu':'Pilih tanggapanmu'}</b>
              <span>Apakah kamu setuju dengan jawaban <strong>${esc(proposal.text)}</strong>?</span>
            </div>
            ${myResponse?`<span class="cw-inline-my-vote ${myResponse.agree?'agree':'disagree'}">${myResponse.agree?'SETUJU':'TIDAK SETUJU'}</span>`:''}
          </div>
          <div class="cw-inline-review-footer">
            <div class="cw-inline-vote-buttons">
              <button type="button" class="btn cw-disagree-btn" aria-pressed="${myResponse?.agree===false}" onclick="window.DMCrossword.submitReview('no')">✕ Tidak Setuju</button>
              <button type="button" class="btn cw-agree-btn" aria-pressed="${myResponse?.agree===true}" onclick="window.DMCrossword.submitReview('yes')">✓ Setuju</button>
            </div>
          </div>
        </div>`;
      }

      action=`<div class="cw-proposal-current"><div><small>Usulan dari ${esc(proposal.name||'anggota')}</small><strong>${esc(proposal.text)}</strong></div><span class="cw-inline-status ${unanimousNow?'good':rejectedNow?'bad':''}">${stats.responseCount}/${stats.responseNeed} tanggapan</span></div>${inlineReview}<div class="cw-submit-row">${unanimousNow?`<span class="cw-auto-submit-badge">⚡ Memeriksa otomatis…</span>`:''}${rejectedNow?`<button class="btn secondary" type="button" onclick="window.DMCrossword.discussAgain()">Buka Usulan Baru</button>`:''}<span class="cw-inline-status ${unanimousNow?'good':rejectedNow?'bad':''}">${esc(stateText)}</span></div>`;
    }
    zone.innerHTML=`<span class="cw-clue-label">Soal Aktif${entry.category==='general'?' · Umum':entry.category==='computer'?' · Komputer':''}</span><div class="cw-clue-title"><span class="cw-clue-no">${entry.number}</span><strong>${entry.direction==='H'?'Mendatar':'Menurun'} · ${entry.answer.length} huruf</strong></div><p class="cw-clue-text">${esc(entry.clue)}</p><div class="cw-equal-team-note"><b>Semua anggota setara</b><span>Siapa pun boleh memberi usulan. Anggota lain cukup memilih Setuju atau Tidak Setuju. Jika semua setuju dan jawaban benar, jawaban langsung terbuka di TTS.</span></div><div class="cw-action-zone">${action}</div>`;
    if(restoreFocus&&!proposal){
      const nextInput=el('cwProposalInput');
      if(nextInput){
        nextInput.focus({preventScroll:true});
        try{nextInput.setSelectionRange(previousStart??nextInput.value.length,previousEnd??nextInput.value.length)}catch(_){ }
      }
    }
  }

  function refresh(){
    const mode=bridge().getMode?.();if(mode==='teacher')renderTeacher();if(mode==='student')renderStudent();
  }
  function openStudent(){refresh();const st=student();if(st?.groupId)ensureChat(st.groupId)}
  function closeStudent(){unsubscribeChat()}

  setInterval(()=>{updateTeacherTimer();updateStudentTimer()},1000);

  window.DMCrossword={
    refresh,openStudent,closeStudent,setTeacherPreviewMode,generateTeacherPuzzle,prepareTeams,releaseTeams,startGame,finishGame,resetGame,
    activateEntry,useHint,toggleStudentHints,submitProposal,setProposalDraft,submitReview,discussAgain,submitAnswer,sendChat,kickStudent,buildPuzzle
  };
})();

;

/* ===== teacher-ui.js ===== */
(function(){
  'use strict';
  if(window.__DM_TEACHER_UI_V8__)return;
  window.__DM_TEACHER_UI_V8__=true;

  const $=id=>document.getElementById(id);
  const bridge=()=>window.DMTeacherState||{};
  let selectedView=null;
  let lastAutoView='pre';
  let lastResultsKey='';
  let difficulty='sedang';
  let activePanel='answers';
  let requestedRounds=null;

  function room(){return bridge().getRoomState?.()||null}
  function meta(){return room()?.meta||{}}
  function roundIndex(){return Number(meta().roundIndex??-1)}
  function isLocked(){const m=meta();return roundIndex()>=0&&(m.locked||m.roundStatus==='locked')}
  function isActive(){const m=meta();return roundIndex()>=0&&!isLocked()&&m.roundStatus==='active'}
  function finalReady(){const total=Number(bridge().getMissionCount?.()||0);return isLocked()&&total>0&&roundIndex()>=total-1}
  function autoView(){return isLocked()?'results':isActive()?'active':'pre'}
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function escAttr(v){return escapeHtml(v)}
  function show(el,yes){if(el)el.classList.toggle('hidden',!yes)}
  function smoothFocus(el){if(!el)return;try{el.scrollIntoView({behavior:'smooth',block:'start'})}catch(_){}}

  function available(view){
    const idx=roundIndex();
    if(view==='cases')return true;
    if(view==='pre')return idx<0;
    if(view==='active')return isActive();
    if(view==='results')return isLocked();
    if(view==='final')return finalReady();
    return false;
  }

  function applyView(view){
    const teacher=$('teacher');if(!teacher)return;
    if(!available(view)&&view!=='cases')view=autoView();
    teacher.dataset.view=view;
    show($('teacherCaseBankInlineView'),view==='cases');
    show($('teacherOperationalView'),view!=='cases'&&view!=='final');
    show($('teacherRoundDurationCard'),view==='pre');
    show($('teacherFinalView'),view==='final');
    document.querySelectorAll('#teacherStageSwitcher button[data-view]').forEach(btn=>{
      const v=btn.dataset.view;
      btn.classList.toggle('active',v===view);
      btn.disabled=!available(v)&&v!=='cases';
      btn.classList.toggle('done',v==='pre'&&roundIndex()>=0 || v==='active'&&isLocked());
      btn.setAttribute('aria-current',v===view?'page':'false');
    });
    if(view==='cases')refreshCasesPanel();
    if(view==='active')switchActivePanel(activePanel);
    if(view==='results'){
      const key=String(bridge().getRoundKey?.()||roundIndex());
      if(key&&key!==lastResultsKey){lastResultsKey=key;toggleAnalysis(true)}
    }
    if(view==='final'){
      if(typeof window.renderFinalScores==='function')window.renderFinalScores();
      smoothFocus($('teacherFinalView'));
    }
  }

  function switchView(view){
    if(bridge().getMode?.()!=='teacher')return;
    if(view!=='cases'&&!available(view))return;
    selectedView=view;
    applyView(view);
  }

  function refresh(){
    if(bridge().getMode?.()!=='teacher')return;
    const a=autoView();
    if(a!==lastAutoView){
      lastAutoView=a;
      if(selectedView!=='cases'||roundIndex()>=0)selectedView=null;
    }
    if(selectedView&&selectedView!=='cases'&&!available(selectedView))selectedView=null;
    if(selectedView==='cases'&&roundIndex()>=0)selectedView=null;
    applyView(selectedView||a);
    updateDateChip();
  }

  function switchActivePanel(panel){
    activePanel=panel==='slides'?'slides':'answers';
    const answerBtn=$('teacherAnswerTabBtn'),slideBtn=$('teacherSlideTabBtn');
    const answerPanel=$('teacherAnswerTabPanel'),slidePanel=$('teacherSlideTabPanel');
    answerBtn?.classList.toggle('active',activePanel==='answers');
    slideBtn?.classList.toggle('active',activePanel==='slides');
    show(answerPanel,activePanel==='answers');
    show(slidePanel,activePanel==='slides');
    if(activePanel==='slides'){
      const idx=roundIndex(),mission=idx>=0?bridge().getMission?.(idx):null;
      if(mission&&typeof window.renderMissionSlides==='function')window.renderMissionSlides('teacherActiveMission',mission,'teacher');
    }
  }

  function toggleAnswers(force){
    const card=$('teacherAnswersCard');if(!card)return;
    const body=document.body;
    const open=typeof force==='boolean'?force:!body.classList.contains('teacher-answers-open');
    body.classList.toggle('teacher-answers-open',open);
    card.classList.toggle('hidden',false);
    if(open){switchActivePanel('answers');smoothFocus(card);}
  }
  function toggleCaseViewer(force){
    const card=$('teacherCaseViewer');if(!card)return;
    const next=typeof force==='boolean'?force:card.classList.contains('hidden');
    show(card,next);if(next)smoothFocus(card);
  }
  function toggleAnalysis(force){
    const card=$('teacherAnalysisCard'),btn=$('toggleAnalysisBtn');if(!card)return;
    const next=typeof force==='boolean'?force:card.classList.contains('collapsed');
    card.classList.toggle('collapsed',!next);
    if(btn)btn.textContent=next?'⌃':'⌄';
  }
  function focusLeaderboard(){smoothFocus($('teacherLeaderboardCard'))}
  function openScores(){
    if(finalReady()){switchView('final');return}
    toggleAnswers(true);
  }

  function downloadFinalScores(){
    const table=$('teacherFinalScoresCard')?.querySelector('table');if(!table)return;
    const rows=[...table.querySelectorAll('tr')].map(tr=>[...tr.children].map(cell=>`"${String(cell.innerText||'').replace(/"/g,'""').replace(/\n+/g,' ')}"`).join(','));
    const blob=new Blob(["\uFEFF"+rows.join("\n")],{type:'text/csv;charset=utf-8'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='digital-mission-nilai-final.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }
  function printFinalScores(){window.print()}
  function focusFinalAnalysis(){smoothFocus($('teacherFinalAnalysis'))}

  function updateDateChip(){
    const chip=$('teacherDateChip');if(!chip)return;
    const target=chip.querySelector('span')||chip;
    const now=new Date();
    target.textContent=now.toLocaleString('id-ID',{weekday:'long',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }

  function sourceControl(id){return document.getElementById(id)}
  function inlineControl(id){return document.getElementById(id)}
  function setVal(id,val){const el=inlineControl(id);if(el&&val!==undefined&&val!==null)el.value=val}
  function firstMission(){return bridge().getMissions?.()?.[0]||null}
  function missionSlides(m){return Array.isArray(m?.slides)&&m.slides.length?m.slides:[{title:m?.title||'Kasus',text:m?.text||''}]}

  function setDifficulty(value){
    difficulty=value||'sedang';
    document.querySelectorAll('#teacherCaseBankDifficulty button').forEach(b=>b.classList.toggle('active',b.dataset.value===difficulty));
  }

  function syncInlineFromConfig(){
    const r=room(),cfg=r?.meta?.missionConfig||{};
    if(requestedRounds===null){
      requestedRounds=Math.max(2,Math.min(5,Number(cfg.rounds||bridge().getMissionCount?.()||5)));
    }
    const control=$('teacherCaseBankRoundCount');
    if(control)control.value=String(requestedRounds);
  }

  function syncInlineToGenerator(){
    const rounds=Math.max(2,Math.min(5,Number($('teacherCaseBankRoundCount')?.value||requestedRounds||5)));
    requestedRounds=rounds;
    const hidden=sourceControl('caseRoundCount');
    if(hidden)hidden.value=String(rounds);
  }

  function updateCounters(){}

  function previewTag(i,total){
    if(i===0)return '▧ Membaca & Memahami';
    if(i===total-1)return '♟ Keputusan & Solusi';
    return '⚖ Analisis & Diskusi';
  }

  function renderPreview(){
    const box=$('teacherCaseBankPreviewCards'),badge=$('teacherCaseBankPreviewBadge'),ready=$('teacherCaseBankReadyTitle');
    if(!box)return;

    const missions=bridge().getMissions?.()||[];
    const requested=Math.max(2,Math.min(5,Number(requestedRounds||$('teacherCaseBankRoundCount')?.value||missions.length||5)));
    const visible=missions.slice(0,requested);
    const mode=bridge().getMissionSourceMode?.()||'default';

    const totalSlides=visible.reduce((sum,m)=>sum+missionSlides(m).length,0);
    if(ready)ready.textContent=mode==='bank'?`${visible.length} ronde dari bank lokal siap digunakan`:`${visible.length} ronde siap digunakan`;
    if(badge)badge.textContent=visible.length?`${visible.length} ronde • ${totalSlides} slide`:`${requested} ronde`;

    if(!visible.length){
      box.innerHTML='<div class="teacher-casebank-preview-empty">Belum ada paket kasus. Klik “Acak Kasus” untuk menyiapkan ronde.</div>';
      return;
    }

    box.innerHTML=visible.map((m,roundIdx)=>{
      const slides=missionSlides(m);
      const cleanTitle=String(m?.title||`Ronde ${roundIdx+1}`).replace(/^Ronde\s+\d+\s*[—-]\s*/i,'');
      const topic=String(m?.topic||m?.kicker||'Kasus pembelajaran');
      const cards=slides.map((sl,i)=>{
        const sharedImage=String(m?.imageUrl||sl?.imageUrl||'');
        const image=sharedImage
          ?`<img src="${escAttr(sharedImage)}" alt="Ilustrasi Ronde ${roundIdx+1}" loading="lazy">`
          :`<div class="teacher-casebank-preview-placeholder"><span>${i+1}</span></div>`;
        const text=String(sl?.text||'');
        return `<article class="teacher-casebank-slide-card">
          <div class="teacher-casebank-slide-image"><span class="teacher-casebank-slide-number">${i+1}</span>${image}</div>
          <h4>Slide ${i+1}: ${escapeHtml(sl?.title||`Bagian ${i+1}`)}</h4>
          <p>${escapeHtml(text)}</p>
          <span class="teacher-casebank-slide-tag">${previewTag(i,slides.length)}</span>
        </article>`;
      }).join('');

      return `<section class="teacher-round-preview-section">
        <div class="teacher-round-preview-head">
          <div>
            <span class="teacher-round-eyebrow">RONDE ${roundIdx+1}</span>
            <h4>${escapeHtml(cleanTitle)}</h4>
            <p>${escapeHtml(topic)}</p>
          </div>
          <span class="teacher-round-slide-count">${slides.length} slide</span>
        </div>
        <div class="teacher-round-slide-grid">${cards}</div>
      </section>`;
    }).join('');

    if(visible.length<requested){
      box.insertAdjacentHTML('beforeend',`<div class="teacher-round-preview-note">Paket aktif baru berisi ${visible.length} ronde. Klik <b>Acak Kasus</b> untuk membuat paket ${requested} ronde.</div>`);
    }
  }

  function refreshCasesPanel(){
    syncInlineFromConfig();
    renderPreview();
    const disabled=roundIndex()>=0;
    const rounds=$('teacherCaseBankRoundCount');
    if(rounds)rounds.disabled=disabled;
    const gen=$('teacherCaseBankGenerateBtn');
    if(gen){gen.disabled=disabled;gen.textContent=disabled?'Kasus Terkunci':'↻ Acak Kasus'}
  }

  async function generateCases(){
    if(roundIndex()>=0)return;
    syncInlineToGenerator();
    const n=$('teacherCaseBankInlineNotice');if(n){n.className='teacher-casebank-inline-notice wait';n.textContent='Sistem sedang memilih dan menyusun paket dari bank kasus lokal…'}
    try{
      if(typeof window.generateCasesFromBank!=='function')throw new Error('Fungsi generator kasus tidak ditemukan.');
      const result=await window.generateCasesFromBank();
      if(result?.ok===false)throw new Error(result.error||'Pembuatan kasus belum berhasil.');
      if(n){n.className='teacher-casebank-inline-notice good';n.textContent=`Paket kasus lokal berhasil diperbarui: ${Number(result?.cases?.length||result?.imageCount||0)} ronde siap digunakan.`}
      setTimeout(()=>{syncInlineFromConfig();renderPreview()},250);
    }catch(err){if(n){n.className='teacher-casebank-inline-notice bad';n.textContent=err?.message||String(err)}}
  }

  function resetCasesForm(){
    const cfg=room()?.meta?.missionConfig||{};
    const rounds=$('teacherCaseBankRoundCount');
    requestedRounds=Math.max(2,Math.min(5,Number(cfg.rounds||bridge().getMissionCount?.()||5)));
    if(rounds)rounds.value=String(requestedRounds);
    renderPreview();
  }

  function bindCasesInputs(){
    const rounds=$('teacherCaseBankRoundCount');
    if(rounds&&!rounds.dataset.bound){
      rounds.dataset.bound='1';
      rounds.addEventListener('change',()=>{
        requestedRounds=Math.max(2,Math.min(5,Number(rounds.value||5)));
        syncInlineToGenerator();
        renderPreview();
      });
    }
  }

  function setMode(mode){if(mode!=='teacher'){selectedView=null;document.body.classList.remove('teacher-answers-open')}}

  window.DMTeacherUI={refresh,switchView,switchActivePanel,toggleAnswers,toggleCaseViewer,toggleAnalysis,focusLeaderboard,openScores,downloadFinalScores,printFinalScores,focusFinalAnalysis,updateDateChip,setDifficulty,generateCases,resetCasesForm,setMode};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.body.classList.remove('teacher-answers-open')});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bindCasesInputs();refresh()},{once:true});else{bindCasesInputs();refresh()}
})();

;

/* ===== student-ui.js ===== */
/* Student discussion view. Case inputs and chat are managed by the main script. */
(function(){
  'use strict';
  if(window.__DM_STUDENT_UI_V5__)return;
  window.__DM_STUDENT_UI_V5__=true;
  const $=id=>document.getElementById(id);
  const bridge=()=>window.DMStudentState||{};
  function switchTab(){
    document.querySelectorAll('#studentGameGrid .student-tab-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.tab==='case'));
    document.querySelectorAll('#studentGameGrid .student-tab-panel').forEach(panel=>panel.classList.toggle('active',panel.dataset.tab==='case'));
  }
  function refresh(){
    const api=bridge();
    if(api.getMode?.()!=='student'||api.getSelectedGame?.()!=='discussion')return;
    const room=api.getRoomState?.(),st=api.getStudent?.();if(!room||!st)return;
    const meta=room.meta||{},all=api.getStudents?.()||{},group=st.groupId?room.groups?.[st.groupId]:null;
    const teammates=st.groupId?Object.values(all).filter(member=>member.groupId===st.groupId):[];
    if($('studentHeaderMembers'))$('studentHeaderMembers').textContent=st.groupId?`${teammates.length} anggota`:`${Object.keys(all).length} siswa masuk`;
    const idx=Number(meta.roundIndex??-1),total=api.getMissionCount?.()||0;
    if($('studentHeaderRound'))$('studentHeaderRound').textContent=idx>=0?`Ronde ${idx+1}/${total||'?'}`:(st.groupId?'Menunggu ronde':'Menunggu tim');
    if($('brandTagline'))$('brandTagline').textContent='Game Diskusi Informatika Kelas VIII';
    if(group&&$('studentGroup'))$('studentGroup').textContent=group.name||'-';
    switchTab();
  }
  function reset(){
    if($('brandTagline'))$('brandTagline').textContent='Think • Discuss • Decide • Defend';
  }
  window.studentSwitchTab=switchTab;
  window.DMStudentUI={refresh,reset,switchTab};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();

;

/* ===== login-ui.js ===== */
(function(){
  const $=id=>document.getElementById(id);
  function setMode(mode){
    const teacher=$('teacherModeBtn'),student=$('studentModeBtn');
    teacher?.classList.toggle('active',mode==='teacher');
    student?.classList.toggle('active',mode==='student');
    const card=document.querySelector('#home .login-card');
    if(card)card.dataset.mode=mode;
  }
  window.setLoginVisualMode=setMode;
  window.toggleTeacherPassword=function(){
    const input=$('teacherPassword');
    if(!input)return;
    input.type=input.type==='password'?'text':'password';
    const btn=input.parentElement?.querySelector('.password-toggle');
    if(btn)btn.textContent=input.type==='password'?'◉':'◎';
    input.focus();
  };
  document.addEventListener('DOMContentLoaded',()=>{
    document.body.classList.add('login-shell-active');
    setMode(sessionStorage.getItem('dm-mode')==='teacher'?'teacher':'student');
    const user=$('teacherUsername'),pass=$('teacherPassword'),name=$('studentName');
    user?.addEventListener('keydown',e=>{if(e.key==='Enter')pass?.focus()});
    pass?.addEventListener('keydown',e=>{if(e.key==='Enter')window.teacherLoginAndOpen?.()});
    name?.addEventListener('keydown',e=>{if(e.key==='Enter')window.joinRoom?.()});
  });
})();
