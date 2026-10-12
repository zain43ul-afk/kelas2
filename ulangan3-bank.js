/* Ulangan Informatika 3 — bank soal dan materi kelas VIII, Bab Sistem Komputer.
   Bab dibuat mengikuti pokok pembahasan halaman 33–39 yang diberikan guru.
   Tiap bab menyediakan lebih dari 10 soal; paket mengambil 10 secara deterministik per siswa. */
(function(){
  'use strict';
  const rows={
    components3:[
      ['c01','Tiga komponen utama yang harus bekerja sama agar sistem komputer berjalan dengan baik adalah ...','hardware, software, dan brainware','monitor, printer, dan speaker','CPU, GPU, dan RAM','keyboard, mouse, dan scanner','Sistem komputer memerlukan perangkat keras, perangkat lunak, serta manusia yang mengoperasikannya.'],
      ['c02','Yang termasuk perangkat masukan (input device) adalah ...','keyboard','monitor','proyektor','speaker','Keyboard memasukkan data ke komputer, sedangkan monitor, proyektor, dan speaker menampilkan keluaran.'],
      ['c03','Seorang siswa memindai foto dengan scanner. Peran scanner dalam sistem komputer adalah ...','memasukkan data atau gambar','menampilkan hasil perhitungan','mencetak dokumen','menyimpan data permanen','Scanner membaca gambar fisik dan memasukkannya sebagai data digital.'],
      ['c04','Komponen yang menjalankan instruksi serta mengolah data secara umum disebut ...','CPU atau prosesor','monitor','printer','flashdisk','CPU memproses instruksi dan data, sehingga disebut pusat pemrosesan komputer.'],
      ['c05','Hasil pengolahan data ingin ditampilkan kepada seluruh siswa di layar kelas. Perangkat yang tepat adalah ...','proyektor','scanner','mouse','keyboard','Proyektor termasuk output device, berguna menampilkan hasil ke layar yang lebih besar.'],
      ['c06','Manakah pasangan perangkat dan fungsi yang benar?','Mouse — input','Monitor — input','Scanner — output','Speaker — penyimpanan','Mouse mengirim gerakan dan klik sebagai masukan ke komputer.'],
      ['c07','Hard disk dan flashdisk dikelompokkan sebagai perangkat ...','penyimpanan data','masukan teks','keluaran suara','pengolah instruksi utama','Hard disk dan flashdisk menyimpan data untuk digunakan kembali.'],
      ['c08','RAM berbeda dari hard disk karena RAM umumnya digunakan untuk ...','menyimpan data kerja sementara saat program berjalan','mencetak halaman tugas','memproyeksikan gambar ke dinding','merekam suara langsung tanpa alat lain','RAM menyimpan data yang sedang diakses, bukan sebagai media penyimpanan permanen.'],
      ['c09','Modem digunakan terutama untuk mendukung ...','komunikasi atau konektivitas jaringan','pencetakan foto','penampilan suara','pengetikan huruf','Modem termasuk perangkat pendukung komunikasi komputer.'],
      ['c10','Brainware pada sistem komputer merujuk kepada ...','manusia atau pengguna yang mengoperasikan komputer','sistem operasi Android','semua kabel dalam CPU','perangkat lunak antivirus','Brainware adalah orang yang memakai, mengelola, atau mengembangkan sistem komputer.'],
      ['c11','Jika komputer memiliki perangkat keras lengkap tetapi tidak mempunyai perangkat lunak yang diperlukan, maka ...','pekerjaan yang diinginkan tidak dapat dijalankan sebagaimana mestinya','komputer otomatis mencetak dokumen','monitor bekerja sebagai scanner','semua aplikasi tetap berjalan normal','Hardware membutuhkan instruksi perangkat lunak agar bekerja sesuai tujuan.'],
      ['c12','Software disebut berbeda dari hardware karena software ...','berupa instruksi atau program yang tidak berwujud fisik seperti perangkat keras','selalu berbentuk kabel','hanya tersimpan di kertas','merupakan nama lain dari monitor','Software adalah instruksi komputer, sedangkan hardware adalah komponen fisik.'],
      ['c13','Urutan sederhana pengolahan data yang tepat adalah ...','input → proses → output','output → proses → input','proses → output → input','output → input → proses','Data dimasukkan, diproses, lalu hasilnya ditampilkan.'],
      ['c14','Ketika siswa mengetik jawaban, komputer mengolahnya, lalu hasil terlihat di monitor. Perangkat output-nya adalah ...','monitor','keyboard','mouse','scanner','Monitor menampilkan hasil pemrosesan sebagai keluaran visual.'],
      ['c15','Yang merupakan contoh pasangan perangkat input dan output adalah ...','keyboard dan printer','printer dan speaker','monitor dan proyektor','CPU dan RAM','Keyboard adalah input, sedangkan printer menghasilkan output tercetak.'],
      ['c16','GPU atau VGA paling berkaitan dengan proses ...','pengolahan tampilan grafis','pencetakan dokumen fisik','memasukkan suara melalui mikrofon','penyimpanan berkas di flashdisk','GPU bertugas mengolah grafis untuk ditampilkan melalui perangkat keluaran.'],
      ['c17','Komputer tidak berjalan optimal jika hardware, software, dan brainware tidak saling mendukung. Pernyataan ini menunjukkan bahwa komponen sistem komputer ...','saling bergantung dan saling melengkapi','seluruhnya hanya terdiri atas perangkat fisik','tidak memerlukan pengguna','selalu bekerja tanpa instruksi','Ketiga komponen berperan berbeda tetapi perlu bekerja sama untuk mencapai tujuan.']
    ],
    operating3:[
      ['o01','Fungsi utama sistem operasi adalah ...','mengelola sumber daya dan menjadi penghubung pengguna dengan perangkat keras','hanya mengetik surat','mengganti monitor secara otomatis','menyimpan data di kertas','Sistem operasi mengelola sumber daya komputer dan menyediakan layanan bagi program.'],
      ['o02','Manakah yang termasuk sistem operasi?','Linux','Microsoft Word','Adobe Photoshop','Google Slides','Linux adalah sistem operasi; yang lain adalah aplikasi untuk tugas tertentu.'],
      ['o03','Windows dikembangkan oleh perusahaan ...','Microsoft','Apple','Google','Adobe','Windows adalah keluarga sistem operasi yang dikembangkan Microsoft.'],
      ['o04','Android terutama dikenal sebagai sistem operasi untuk ...','smartphone dan tablet','hanya printer dot matrix','hanya proyektor LCD','hanya flashdisk','Android banyak digunakan pada perangkat bergerak.'],
      ['o05','Sistem operasi macOS dikembangkan oleh ...','Apple','Microsoft','Canonical','Red Hat','macOS adalah sistem operasi yang digunakan pada komputer Mac buatan Apple.'],
      ['o06','Linux dikenal dengan ciri utama sebagai ...','sistem operasi berbasis sumber terbuka (open source)','sistem operasi yang hanya bisa dipakai di telepon','aplikasi pengolah presentasi','sebuah merek printer','Kode sumber Linux dapat dipelajari dan dikembangkan sesuai ketentuan lisensinya.'],
      ['o07','Ubuntu, Fedora, dan Debian merupakan contoh ...','distribusi Linux','aplikasi desain grafis','perangkat masukan','protokol video','Ubuntu, Fedora, dan Debian termasuk distribusi sistem operasi Linux.'],
      ['o08','Windows 11 diperkenalkan lebih baru daripada ...','Windows 10','Ubuntu terbaru','Chrome OS terbaru','Android 15','Windows 11 hadir sesudah Windows 10.'],
      ['o09','Dalam buku, Windows 10 disebut dirilis secara resmi pada tahun ...','2015','2001','2024','1995','Windows 10 diluncurkan pada 2015 sebagaimana dijelaskan pada halaman materi.'],
      ['o10','Salah satu perubahan tampilan yang dikenal pada Windows 11 adalah ...','desain antarmuka yang lebih modern','hilangnya seluruh ikon','hanya bisa menjalankan aplikasi MS-DOS','tidak memiliki desktop','Windows 11 mengusung perubahan desain dan pengalaman pengguna dibanding Windows 10.'],
      ['o11','Sistem operasi yang ringan dan banyak berorientasi pada aplikasi web/cloud pada laptop tertentu adalah ...','ChromeOS','Adobe Reader','Microsoft Excel','Blender','ChromeOS dirancang Google dengan penekanan pada layanan web dan komputasi cloud.'],
      ['o12','Fungsi pengelolaan memori dan perangkat input/output dilakukan terutama oleh ...','sistem operasi','aplikasi kamera','permainan komputer','file foto','Sistem operasi mengatur penggunaan memori, perangkat, dan jalannya proses.'],
      ['o13','Jika dua aplikasi ingin menggunakan printer yang sama, yang mengatur akses sumber daya tersebut adalah ...','sistem operasi','speaker','scanner','kabel HDMI','OS membantu mengatur pemakaian perangkat dan sumber daya oleh aplikasi.'],
      ['o14','Perbedaan sistem operasi dan aplikasi yang paling tepat adalah ...','sistem operasi mengelola komputer; aplikasi membantu tugas pengguna','keduanya adalah perangkat keras','aplikasi selalu mengatur seluruh perangkat keras langsung','sistem operasi hanya berisi gambar','OS menjalankan fungsi pengelolaan, aplikasi memberi fungsi khusus kepada pengguna.'],
      ['o15','Salah satu keuntungan distribusi Linux bagi pengguna adalah ...','tersedianya banyak pilihan distro untuk kebutuhan berbeda','tidak bisa diubah sama sekali','tidak memiliki antarmuka','selalu harus membeli komputer merek tertentu','Ekosistem Linux menyediakan beragam distribusi dengan karakteristik masing-masing.'],
      ['o16','Salah satu contoh perangkat dengan sistem operasi Android adalah ...','telepon pintar','kabel charger','flashdisk','monitor tanpa komputer','Android umum digunakan pada smartphone.'],
      ['o17','Program antivirus termasuk kategori ...','perangkat lunak utilitas','perangkat input','perangkat output','firmware layar','Utilitas membantu pemeliharaan, perlindungan, atau pengelolaan sistem.']
    ],
    memory3:[
      ['m01','CPU merupakan singkatan dari ...','Central Processing Unit','Computer Printing Utility','Central Program Upload','Core Personal User','CPU adalah Central Processing Unit, unit pusat pemrosesan instruksi komputer.'],
      ['m02','Bagian CPU yang menangani operasi hitung dan logika dikenal sebagai ...','ALU','ROM','printer','scanner','ALU (Arithmetic Logic Unit) bertugas melakukan operasi aritmetika dan logika.'],
      ['m03','Komponen CPU yang mengendalikan urutan pelaksanaan instruksi adalah ...','Control Unit (CU)','speaker','SSD','monitor','CU mengatur dan mengoordinasikan pelaksanaan instruksi dalam CPU.'],
      ['m04','RAM merupakan kependekan dari ...','Random Access Memory','Read Always Memory','Rapid Application Machine','Remote Access Monitor','RAM adalah Random Access Memory, memori kerja yang dapat diakses secara acak.'],
      ['m05','Ciri memori RAM yang umum dijumpai adalah ...','isinya dapat hilang ketika listrik dimatikan','data selalu tercetak di kertas','hanya untuk menampilkan gambar','tidak pernah dipakai aplikasi','RAM umumnya bersifat volatile, artinya data kerja tidak tetap tersimpan saat daya mati.'],
      ['m06','ROM merupakan singkatan dari ...','Read Only Memory','Random Output Module','Read Open Machine','Real Operation Mode','ROM adalah Read Only Memory, jenis memori non-volatile pada penggunaan umumnya.'],
      ['m07','Memori yang menyimpan instruksi dasar atau firmware dan tetap ada tanpa daya biasanya disebut ...','ROM atau memori non-volatile','RAM kerja sementara','register ALU','cache volatil saja','ROM dikenal sebagai media penyimpanan instruksi dasar yang mempertahankan data.'],
      ['m08','Perbedaan RAM dan ROM yang paling tepat adalah ...','RAM memori kerja sementara; ROM menyimpan informasi dasar lebih menetap','RAM untuk mencetak, ROM untuk menggerakkan mouse','RAM adalah layar; ROM adalah keyboard','keduanya nama perangkat output','RAM umumnya volatile, sedangkan ROM digunakan menyimpan instruksi dasar non-volatile.'],
      ['m09','Satuan data terkecil pada sistem komputer disebut ...','bit','byte','kilobyte','gigabyte','Bit berisi satu nilai biner 0 atau 1.'],
      ['m10','Satu byte terdiri atas ...','8 bit','2 bit','4 bit','16 bit','Secara umum 1 byte sama dengan 8 bit.'],
      ['m11','Bahasa mesin dipahami langsung oleh CPU dalam bentuk ...','instruksi biner atau kode mesin','kalimat bahasa sehari-hari tanpa terjemahan','gambar JPEG','suara manusia','CPU mengeksekusi instruksi kode mesin, bukan teks bahasa manusia secara langsung.'],
      ['m12','Compiler adalah program yang digunakan untuk ...','menerjemahkan kode sumber ke bentuk yang dapat diproses mesin','memindai foto menggunakan scanner','mencetak kertas dari monitor','menaikkan kapasitas fisik RAM','Compiler menerjemahkan program dari bahasa tertentu menuju kode target.'],
      ['m13','Python dan C merupakan contoh ...','bahasa pemrograman','sistem operasi saja','perangkat keluaran','alat penyimpanan optik','Python dan C dipakai untuk menulis instruksi atau program komputer.'],
      ['m14','Mengapa instruksi program perlu diterjemahkan ke bahasa yang dimengerti mesin?','Agar CPU dapat mengeksekusi instruksi tersebut','Agar monitor berubah menjadi keyboard','Agar file selalu terhapus','Agar komputer tidak memerlukan sistem operasi','CPU menjalankan kode mesin, sehingga kode sumber memerlukan pemrosesan atau penerjemahan.'],
      ['m15','CPU bekerja dengan cara umum ...','mengambil, menafsirkan, dan menjalankan instruksi','hanya memutar musik tanpa program','menyimpan buku kertas','mencetak dokumen dengan tangan','Siklus kerja CPU berhubungan dengan fetch, decode, dan execute instruksi.'],
      ['m16','Ketika banyak aplikasi dibuka secara bersamaan, kapasitas RAM biasanya berpengaruh terhadap ...','ruang memori kerja yang tersedia bagi aplikasi','jumlah kaki meja','resolusi kertas printer','panjang kabel listrik','RAM membantu menampung data dan program yang aktif saat komputer bekerja.'],
      ['m17','Alamat memori dalam komputer berfungsi untuk ...','menunjukkan lokasi data atau instruksi di memori','menunjukkan alamat rumah pengguna','memperbesar ukuran monitor','mencetak nomor halaman','Alamat memori dipakai untuk menemukan lokasi data yang dibutuhkan prosesor.']
    ],
    logic3:[
      ['l01','Gerbang AND menghasilkan keluaran 1 apabila ...','semua masukan bernilai 1','salah satu masukan bernilai 1','semua masukan bernilai 0','kedua masukan berbeda','AND benar hanya jika semua input benar.'],
      ['l02','Gerbang OR menghasilkan keluaran 1 apabila ...','sedikitnya satu masukan bernilai 1','semua masukan bernilai 0','kedua masukan pasti berbeda','hanya jika kedua masukan 0','OR menghasilkan 1 jika salah satu atau semua input bernilai 1.'],
      ['l03','Fungsi gerbang NOT adalah ...','membalik nilai masukan 0 menjadi 1 dan 1 menjadi 0','menjumlahkan dua angka desimal','menyimpan data ke hard disk','menghasilkan 1 untuk semua input','NOT memiliki satu masukan dan menghasilkan kebalikannya.'],
      ['l04','Jika A = 1 dan B = 0, keluaran A AND B adalah ...','0','1','2','tidak terdefinisi','AND membutuhkan A dan B sama-sama 1.'],
      ['l05','Jika A = 1 dan B = 0, keluaran A OR B adalah ...','1','0','2','tidak terdefinisi','OR menghasilkan 1 bila sedikitnya satu input bernilai 1.'],
      ['l06','Jika masukan NOT adalah 1, keluarannya adalah ...','0','1','2','3','NOT membalik 1 menjadi 0.'],
      ['l07','Gerbang NAND adalah kebalikan dari gerbang ...','AND','OR','XOR','XNOR','NAND berarti NOT-AND: hasil AND dibalik.'],
      ['l08','Jika A = 1 dan B = 1, keluaran NAND adalah ...','0','1','2','4','AND(1,1) = 1, maka NAND = NOT(1) = 0.'],
      ['l09','Gerbang NOR adalah kebalikan dari gerbang ...','OR','AND','XOR','XNOR','NOR berarti NOT-OR: hasil OR dibalik.'],
      ['l10','Jika A = 0 dan B = 0, keluaran NOR adalah ...','1','0','2','tidak terdefinisi','OR(0,0) = 0, maka NOR = NOT(0) = 1.'],
      ['l11','Gerbang XOR menghasilkan keluaran 1 jika ...','kedua nilai masukannya berbeda','kedua masukan bernilai sama','kedua masukan selalu 0','salah satu masukan tidak terhubung','XOR bernilai benar ketika kedua masukan tidak sama.'],
      ['l12','Jika A = 1 dan B = 1, keluaran XOR adalah ...','0','1','2','3','XOR bernilai 0 ketika kedua input sama.'],
      ['l13','Gerbang XNOR menghasilkan keluaran 1 jika ...','kedua nilai masukannya sama','kedua masukan berbeda','A pasti 1 dan B pasti 0','setidaknya satu masukan 1','XNOR adalah invers XOR, menghasilkan 1 saat input sama.'],
      ['l14','Jika A = 0 dan B = 0, keluaran XNOR adalah ...','1','0','2','tidak terdefinisi','XNOR(0,0) bernilai 1 karena kedua masukan sama.'],
      ['l15','Gerbang yang secara umum memiliki satu masukan adalah ...','NOT','AND','OR','XOR','NOT membalik satu input, sedangkan AND, OR, dan XOR biasanya menggunakan dua input.'],
      ['l16','Simbol aljabar logika A · B menunjukkan operasi ...','AND','OR','NOT','XOR','Dalam aljabar Boolean, perkalian atau tanda titik sering dipakai untuk AND.'],
      ['l17','Simbol aljabar logika A + B umumnya menunjukkan operasi ...','OR','AND','NOT','NAND','Dalam aljabar Boolean, tanda tambah melambangkan OR, bukan penjumlahan aritmetika biasa.'],
      ['l18','Keluaran rangkaian NOT(A AND B) sama dengan gerbang ...','NAND','NOR','XOR','OR','NOT yang diterapkan pada keluaran AND menghasilkan NAND.'],
      ['l19','Jika keluaran hanya 1 ketika A dan B sama-sama 0, gerbang yang sesuai adalah ...','NOR','OR','AND','XOR','NOR(0,0) = 1; kombinasi lainnya bernilai 0.'],
      ['l20','Jika A = 1 dan B = 0, hasil A XNOR B adalah ...','0','1','2','3','XNOR bernilai 1 hanya saat kedua input sama.']
    ]
  };
  const questions=Object.fromEntries(Object.entries(rows).map(([key,records])=>[
    key,records.map(([id,question,answer,a,b,c,reason])=>({id,question,answer,wrong:[a,b,c],reason,title:'Latihan konsep',explain:reason}))
  ]));
  const panel=(n,title,description,body)=>`<section class="concept-number-section"><div class="concept-number-section-title"><span>${n}</span><div><b>${title}</b><small>${description}</small></div></div>${body}</section>`;
  const table=(heads,records)=>`<div class="concept-conversion-table-wrap"><table class="concept-conversion-table"><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${records.map(c=>`<tr>${c.map((x,i)=>i===0?`<th>${x}</th>`:`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const overview=(items)=>`<div class="concept-chapter-cards four">${items.map(([number,title,desc])=>`<article><span>${number}</span><b>${title}</b><p>${desc}</p></article>`).join('')}</div>`;
  const lessons={
    components3:`<span class="concept-question-kicker">BAB 1 • MATERI HALAMAN 33</span>
      <h2>Komponen Sistem Komputer</h2>
      <p class="concept-explain-copy">Sistem komputer terdiri atas bagian-bagian yang <b>saling bekerja sama</b> untuk menjalankan tugas secara efisien. Tiga komponen pentingnya adalah <b>hardware</b> (perangkat keras), <b>software</b> (perangkat lunak), dan <b>brainware</b> (manusia/pengguna). Ketiganya mempunyai peran yang berbeda dan tidak dapat dipandang sebagai pengganti satu sama lain.</p>
      ${overview([['01','Hardware','Benda fisik seperti keyboard, CPU, RAM, monitor, dan printer.'],['02','Software','Instruksi dan program yang mengatur apa yang dikerjakan komputer.'],['03','Brainware','Pengguna, operator, teknisi, dan pemrogram yang menjalankan komputer.'],['04','Kerja sama','Hardware memproses instruksi software, diarahkan oleh brainware.']])}
      ${panel('01','Mengenal perangkat keras','Dikelompokkan menurut fungsinya.',table(['Kategori','Tugas','Contoh'],[
        ['Input','Memasukkan data','Keyboard, mouse, scanner'],
        ['Process','Mengolah data/instruksi','CPU, GPU, RAM sebagai memori kerja'],
        ['Output','Menampilkan hasil','Monitor, printer, proyektor, speaker'],
        ['Storage','Menyimpan data','Hard disk, SSD, flashdisk, CD/DVD'],
        ['Peripheral jaringan','Mendukung konektivitas','Modem dan perangkat jaringan']]))}
      ${panel('02','Alur kerja komputer','Perhatikan urutan input–process–output.',`<div class="ui3-flow" role="img" aria-label="Keyboard input menuju CPU proses dan monitor output"><div><b>⌨ Input</b><small>Keyboard / scanner</small></div><span>→</span><div><b>⚙ Proses</b><small>CPU dan memori kerja</small></div><span>→</span><div><b>▣ Output</b><small>Monitor / printer</small></div></div><p>Contoh: siswa mengetik nilai melalui keyboard, CPU memprosesnya menggunakan instruksi dari aplikasi, lalu hasilnya terlihat di monitor. Saat disimpan, data dapat masuk ke media penyimpanan.</p>`)}
      ${panel('03','Perangkat lunak dan peran pengguna','Hardware tidak bekerja sebagaimana mestinya tanpa program.',`<p><b>Software</b> merupakan kumpulan instruksi yang mengarahkan perangkat keras. Program dibuat menggunakan bahasa pemrograman dan dijalankan agar perangkat keras menghasilkan tindakan tertentu. <b>Brainware</b> adalah pihak yang memberi perintah, memeriksa hasil, dan menggunakan keluaran komputer.</p><div class="concept-chapter-key"><b>Contoh sehari-hari</b><p>Saat mengetik tugas, siswa (brainware) membuka pengolah kata (software) menggunakan keyboard dan monitor (hardware).</p></div>`)}
      <div class="concept-chapter-key"><b>Ingat</b><p><b>Input → Proses → Output</b>. Data dapat disimpan dalam storage. Tiga pilar komputer adalah hardware, software, dan brainware.</p></div>`,

    operating3:`<span class="concept-question-kicker">BAB 2 • MATERI HALAMAN 33–35</span>
      <h2>Sistem Operasi dan Perangkat Lunak</h2>
      <p class="concept-explain-copy"><b>Sistem operasi (Operating System/OS)</b> merupakan perangkat lunak sistem yang menghubungkan pengguna serta aplikasi dengan perangkat keras komputer. OS mengelola memori, prosesor, penyimpanan, perangkat input/output, dan program yang berjalan. Tanpa sistem operasi yang sesuai, pemakaian komputer menjadi sangat terbatas.</p>
      ${panel('01','Tugas sistem operasi','OS mengoordinasikan perangkat dan aplikasi.',overview([['01','Prosesor','Mengatur giliran kerja program pada CPU.'],['02','Memori','Mengelola penggunaan RAM oleh aplikasi.'],['03','Perangkat','Mengatur input/output, penyimpanan, serta periferal.'],['04','Antarmuka','Memudahkan pengguna menjalankan aplikasi.']]))}
      ${panel('02','Jenis sistem operasi','Kenali nama dan karakteristiknya.',table(['Sistem operasi','Pengembang / karakteristik','Perangkat'],[
        ['Windows','Microsoft; versi Windows 10 (2015), Windows 11 (2021)','PC / laptop'],
        ['Linux','Open source; distro Ubuntu, Fedora, Debian, SUSE','PC, server, banyak perangkat'],
        ['macOS','Apple; digunakan pada komputer Mac','Mac desktop / laptop'],
        ['Android','Ekosistem mobile untuk aplikasi smartphone','Smartphone / tablet'],
        ['ChromeOS','Google; menekankan aplikasi web dan cloud','Chromebook']]))}
      ${panel('03','Sistem operasi, aplikasi, dan utilitas','Ketiganya adalah software dengan fungsi berbeda.',`<p><b>Software sistem</b> memelihara dan mengatur jalannya komputer, terutama OS. <b>Aplikasi</b> membantu tugas pengguna: pengolah kata, browser, desain, dan pemutar video. <b>Utilitas</b> membantu pekerjaan pemeliharaan, misalnya antivirus, pencadangan data, dan pembersihan berkas.</p><div class="ui3-flow" role="img" aria-label="Hubungan pengguna aplikasi sistem operasi dan perangkat keras"><div><b>Pengguna</b><small>Brainware</small></div><span>→</span><div><b>Aplikasi + OS</b><small>Software</small></div><span>→</span><div><b>Perangkat</b><small>Hardware</small></div></div>`)}
      <div class="concept-chapter-key"><b>Perhatikan istilah</b><p><b>Linux</b> adalah OS, <b>Ubuntu</b> salah satu distribusinya. <b>macOS</b> digunakan pada Mac, <b>Android</b> umum pada ponsel, dan <b>ChromeOS</b> dikenal pada Chromebook.</p></div>`,

    memory3:`<span class="concept-question-kicker">BAB 3 • MATERI HALAMAN 36–37</span>
      <h2>CPU, Memori, dan Instruksi Program</h2>
      <p class="concept-explain-copy"><b>CPU (Central Processing Unit)</b> berperan sebagai pusat pemrosesan instruksi komputer. CPU bekerja bersama memori. Program memberikan instruksi yang pada akhirnya diproses menjadi bentuk yang dimengerti mesin, sedangkan RAM menampung data yang sedang dipakai ketika program berjalan.</p>
      ${panel('01','Bagian-bagian CPU','Mengenali tiga bagian penting.',overview([['01','Control Unit (CU)','Mengatur dan mengendalikan pelaksanaan instruksi.'],['02','ALU','Arithmetic Logic Unit: operasi hitung dan logika.'],['03','Register','Tempat penyimpanan sangat cepat untuk data/instruksi tertentu.'],['04','Siklus instruksi','Mengambil → menafsirkan → menjalankan instruksi.']]))}
      ${panel('02','Bagaimana komputer bekerja?','Gambaran sederhana proses instruksi.',`<div class="ui3-flow" role="img" aria-label="Instruksi diambil ditafsirkan lalu dieksekusi"><div><b>1. Fetch</b><small>Ambil instruksi</small></div><span>→</span><div><b>2. Decode</b><small>Tafsirkan instruksi</small></div><span>→</span><div><b>3. Execute</b><small>Jalankan</small></div></div><p>Instruksi dan data diakses melalui alamat memori. CPU memakai sinyal kendali untuk menjalankan operasi sesuai urutan.</p>`)}
      ${panel('03','RAM, ROM, dan penyimpanan','Apa perbedaan volatile dan non-volatile?',table(['Istilah','Fungsi','Sifat'],[
        ['RAM (Random Access Memory)','Memori kerja saat aplikasi berjalan','Umumnya volatile: isi hilang saat daya mati'],
        ['ROM (Read Only Memory)','Penyimpanan instruksi dasar / firmware','Non-volatile: data bertahan tanpa daya'],
        ['SSD / hard disk','Menyimpan file dan program jangka panjang','Non-volatile'],
        ['Bit dan byte','1 bit = 0/1; 1 byte = 8 bit','Satuan data']]))}
      ${panel('04','Program dan bahasa pemrograman','Mengapa CPU memerlukan instruksi yang dimengerti mesin?',`<p>Programmer menulis <b>kode sumber (source code)</b> dengan bahasa pemrograman seperti Python atau C. Komputer menjalankan instruksi mesin, sehingga kode sumber biasanya perlu diproses oleh compiler atau interpreter. <b>Compiler</b> menerjemahkan program ke kode target sesuai bahasa dan platform.</p><div class="ui3-flow" role="img" aria-label="Alur kode program diterjemahkan"><div><b>Source code</b><small>Bahasa pemrograman</small></div><span>→</span><div><b>Penerjemah</b><small>Compiler / interpreter</small></div><span>→</span><div><b>Instruksi mesin</b><small>Dijalankan CPU</small></div></div>`)}
      <div class="concept-chapter-key"><b>Ringkasan</b><p>CU mengendalikan, ALU menghitung dan memutuskan operasi logika, RAM menyimpan data kerja sementara, dan ROM menyimpan instruksi dasar secara lebih menetap. 1 byte = 8 bit.</p></div>`,

    logic3:`<span class="concept-question-kicker">BAB 4 • MATERI HALAMAN 37–39</span>
      <h2>Gerbang Logika dan Tabel Kebenaran</h2>
      <p class="concept-explain-copy"><b>Gerbang logika</b> mengolah satu atau lebih nilai biner (0 dan 1) menjadi keluaran biner sesuai suatu aturan. Nilai <b>1</b> dapat dimaknai benar/aktif dan <b>0</b> salah/tidak aktif. Materi mengenalkan AND, OR, NOT, NAND, NOR, XOR, serta XNOR.</p>
      ${panel('01','Tujuh gerbang yang perlu diingat','Perhatikan kapan keluaran bernilai 1.',table(['Gerbang','Aturan utama','Contoh'],[
        ['AND','1 jika kedua input = 1','1 AND 0 = 0'],
        ['OR','1 jika minimal satu input = 1','1 OR 0 = 1'],
        ['NOT','Membalik 0 ↔ 1','NOT 1 = 0'],
        ['NAND','Kebalikan AND','1 NAND 1 = 0'],
        ['NOR','Kebalikan OR','0 NOR 0 = 1'],
        ['XOR','1 jika input berbeda','1 XOR 0 = 1'],
        ['XNOR','1 jika input sama','1 XNOR 1 = 1']]))}
      ${panel('02','Tabel kebenaran dua masukan','Hafalkan pola, bukan sekadar menghafal simbol.',table(['A','B','AND','OR','NAND','NOR','XOR','XNOR'],[
        ['0','0','0','0','1','1','0','1'],
        ['0','1','0','1','1','0','1','0'],
        ['1','0','0','1','1','0','1','0'],
        ['1','1','1','1','0','0','0','1']]))}
      ${panel('03','NOT dan kombinasi gerbang','Gerbang NOT cukup memakai satu input.',`${table(['Masukan A','NOT A'],[['0','1'],['1','0']])}<p>Gerbang gabungan diperoleh dari beberapa operasi. Contohnya <b>NOT(A AND B)</b> sama dengan <b>NAND</b>, sedangkan <b>NOT(A OR B)</b> sama dengan <b>NOR</b>.</p><div class="ui3-flow" role="img" aria-label="AND diikuti NOT menghasilkan NAND"><div><b>A dan B</b><small>Dua masukan</small></div><span>→</span><div><b>AND</b><small>Hitung hasil</small></div><span>→</span><div><b>NOT</b><small>Balik menjadi NAND</small></div></div>`)}
      ${panel('04','Contoh kehidupan sehari-hari','Hubungkan gerbang logika dengan keputusan sederhana.',overview([['01','AND','Pintu dibuka hanya jika kartu valid DAN PIN benar.'],['02','OR','Bel berbunyi jika tombol A ATAU tombol B ditekan.'],['03','NOT','Lampu indikator menyala jika sensor menunjukkan tidak aktif.'],['04','XOR','Indikator menyala ketika tepat satu dari dua tombol ditekan.']]))}
      <div class="concept-chapter-key"><b>Kiat mengerjakan soal</b><p>Mulailah dari input (A,B). Kerjakan operasi dasar AND/OR/XOR, lalu jika ada awalan N (NAND/NOR) atau NOT, balikkan hasilnya. Ingat: <b>XOR = berbeda</b> dan <b>XNOR = sama</b>.</p></div>`
  };
  window.DMUlangan3Bank={questions,lessons};
})();
