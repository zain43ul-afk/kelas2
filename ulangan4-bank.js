/* Ulangan Informatika 4 — bank soal dan materi kelas VIII, Bab Jaringan dan Internet Aman.
   Disusun dari materi halaman 46–54 yang diberikan guru. */
(function(){
  'use strict';

  const mk=(id,title,question,answer,wrong,reason,visualKind='algorithm',steps=[],demo='')=>({id,title,question,answer,wrong,reason,visualKind,steps,demo});

  const questions={
    network4:[
      mk('n01','Pengertian internet','Internet adalah ...','jaringan komputer global yang saling terhubung','komputer tunggal yang berdiri sendiri','program untuk membuat presentasi','alat input untuk mengetik data','Internet menghubungkan banyak jaringan komputer di seluruh dunia sehingga pertukaran informasi bisa dilakukan dengan cepat.'),
      mk('n02','Intranet','Intranet adalah jaringan yang ...','digunakan secara internal dalam organisasi atau lembaga','menghubungkan seluruh dunia tanpa batas','selalu memakai satelit','hanya ada pada ponsel','Intranet dipakai dalam ruang lingkup internal, misalnya sekolah atau kantor.'),
      mk('n03','Protokol','Protokol yang umum dipakai dalam jaringan internet adalah ...','TCP/IP','USB/HDMI','CPU/RAM','LAN/WAN','TCP/IP mengatur bagaimana data dikirim, diterima, dan dipahami dalam jaringan.'),
      mk('n04','Packet switching','Dalam jaringan internet, data dikirim dalam bentuk ...','paket-paket data','lembar kertas','sinyal suara saja','hanya file video','Data internet dibagi menjadi paket-paket kecil agar pengiriman lebih efisien.'),
      mk('n05','LAN','Jaringan yang mencakup area kecil seperti rumah, laboratorium, atau kantor disebut ...','LAN','WAN','Internet global','Bluetooth speaker','LAN adalah Local Area Network untuk wilayah lokal yang relatif sempit.'),
      mk('n06','WAN','Jaringan yang menghubungkan area sangat luas antarkota atau antarnegara disebut ...','WAN','LAN','input device','RAM','WAN adalah Wide Area Network, cakupannya jauh lebih luas daripada LAN.'),
      mk('n07','Wired network','Contoh media pada jaringan berkabel adalah ...','kabel LAN','gelombang radio','satelit cuaca','bluetooth earphone','Jaringan berkabel memanfaatkan media fisik seperti kabel LAN untuk menghubungkan perangkat.'),
      mk('n08','Wireless network','Jaringan nirkabel (wireless) memanfaatkan ...','gelombang radio tanpa kabel','kabel serat optik saja','hanya printer','tinta warna','Wireless memungkinkan perangkat terhubung tanpa kabel fisik.'),
      mk('n09','Fungsi ISP','Penyedia layanan internet disebut ...','ISP','CPU','OS','URL','ISP adalah Internet Service Provider, yaitu pihak yang memberi akses pengguna ke internet.'),
      mk('n10','Alamat IP','Agar dapat terhubung dalam jaringan, komputer memerlukan ...','alamat IP','kertas login','warna casing tertentu','tombol ekstra di keyboard','Alamat IP digunakan untuk mengenali perangkat dalam jaringan.'),
      mk('n11','Client server','Pada jaringan client-server, komputer client umumnya berperan untuk ...','mengakses layanan dari server','menggantikan fungsi router','menjadi kabel penghubung','menjadi sistem operasi','Client meminta layanan, sedangkan server menyediakan layanan atau sumber daya.'),
      mk('n12','Manfaat jaringan','Salah satu manfaat jaringan komputer adalah ...','berbagi data dan sumber daya lebih cepat','menghapus kebutuhan listrik','menghilangkan semua risiko keamanan','mengganti fungsi otak manusia','Jaringan membantu pertukaran data, berbagi perangkat, dan komunikasi antarpengguna.'),
    ],
    routing4:[
      mk('r01','Konfigurasi jaringan','Konfigurasi jaringan adalah ...','pengaturan agar perangkat dapat terhubung dan berkomunikasi dalam jaringan','nama lain dari browser','alat untuk mencetak dokumen','bagian dari keyboard','Konfigurasi jaringan mencakup pengaturan alamat, koneksi, dan parameter jaringan lain.'),
      mk('r02','Default routing','Default routing biasanya digunakan ketika router ...','tidak menemukan rute yang lebih spesifik ke tujuan','ingin mematikan jaringan','sedang mencetak file','menjalankan browser','Default route dipakai sebagai jalur utama ketika tidak ada rute khusus yang lebih tepat.'),
      mk('r03','Fungsi router','Router berfungsi untuk ...','mengarahkan paket data ke jaringan tujuan','mengganti sistem operasi','menampilkan video','merekam suara','Router membaca tujuan paket dan meneruskannya ke jalur yang sesuai.'),
      mk('r04','Static routing','Static routing adalah rute yang ...','ditentukan secara manual oleh administrator','dibuat otomatis oleh aplikasi kamera','hanya digunakan untuk printer','selalu berubah setiap detik tanpa pengaturan','Static routing dikonfigurasi secara manual sehingga jalurnya tetap sesuai aturan yang dimasukkan admin.'),
      mk('r05','Dynamic routing','Dynamic routing merupakan rute yang ...','dapat menyesuaikan jalur secara otomatis sesuai kondisi jaringan','selalu ditulis tangan di buku','tidak memerlukan router','hanya berjalan tanpa internet','Dynamic routing memudahkan penentuan jalur karena perangkat jaringan dapat memilih rute yang tersedia.'),
      mk('r06','Tujuan routing','Tujuan utama routing adalah ...','mengirim paket ke tujuan melalui jalur yang tepat','mengubah monitor menjadi speaker','mencetak alamat IP di kertas','memperbesar ukuran file','Routing memastikan paket sampai ke tujuan dengan rute yang sesuai.'),
      mk('r07','Troubleshooting','Troubleshooting jaringan berarti ...','mencari dan mengatasi gangguan pada jaringan','menambah warna tampilan browser','mengubah teks menjadi gambar','menduplikasi semua file','Troubleshooting dilakukan untuk menemukan penyebab masalah koneksi dan memperbaikinya.'),
      mk('r08','Penyebab gangguan LAN','Salah satu penyebab umum gangguan pada LAN adalah ...','kabel longgar atau rusak','siswa memakai seragam rapi','monitor menyala terang','dokumen dicetak dua kali','Gangguan LAN sering terjadi karena masalah fisik seperti kabel atau konfigurasi yang kurang tepat.'),
      mk('r09','IP dan subnet','Pengaturan seperti alamat IP dan subnet mask termasuk bagian dari ...','konfigurasi jaringan','aplikasi presentasi','perangkat output','gerbang logika','Alamat IP dan subnet mask adalah parameter penting dalam pengaturan jaringan.'),
      mk('r10','Gateway','Gateway dalam konfigurasi jaringan membantu perangkat untuk ...','berkomunikasi ke jaringan lain','mengatur ukuran font','mengganti RAM','mencetak gambar','Gateway berfungsi sebagai pintu keluar ke jaringan lain.'),
      mk('r11','Keamanan konfigurasi','Konfigurasi jaringan perlu tepat agar ...','komunikasi data berjalan optimal dan aman','speaker berbunyi lebih keras','komputer selalu dingin','printer mencetak lebih cepat','Pengaturan yang benar membantu koneksi lebih stabil serta mengurangi kesalahan akses.'),
      mk('r12','Jaringan besar','Pada jaringan besar, routing dibutuhkan karena ...','ada banyak kemungkinan jalur dan tujuan','semua perangkat berada di meja yang sama','tidak ada paket data','komputer tidak memakai alamat','Semakin besar jaringan, semakin penting mekanisme pemilihan rute yang efisien.'),
    ],
    mobile4:[
      mk('m01','Wireless pada ponsel','Telepon seluler bekerja menggunakan sistem ...','wireless','kabel serial','hanya LAN','optical disk','Ponsel berkomunikasi tanpa kabel, memanfaatkan jaringan nirkabel melalui BTS.'),
      mk('m02','BTS','BTS pada komunikasi seluler berfungsi untuk ...','memfasilitasi pertukaran sinyal antara ponsel dan jaringan','mencetak SMS','mengganti kartu memori','menjadi baterai cadangan','BTS menjadi penghubung sinyal antara ponsel dan jaringan operator.'),
      mk('m03','Contoh komunikasi ponsel','Yang termasuk komunikasi data pada ponsel adalah ...','SMS dan transfer data internet','mencetak kertas dengan printer','mengganti warna casing','membersihkan meja','Komunikasi ponsel meliputi pesan, panggilan, dan pertukaran data internet.'),
      mk('m04','Komponen komunikasi data','Komponen pertama dalam komunikasi data adalah ...','sumber (source)','tujuan akhir saja','baterai cadangan','warna sinyal','Source adalah pihak atau perangkat asal yang mengirimkan data.'),
      mk('m05','Transmitter','Dalam sistem komunikasi data, transmitter berfungsi untuk ...','mengubah data agar siap dikirim melalui media','menyimpan semua pesan selamanya','menghapus sinyal dari jaringan','menjadi browser','Transmitter mempersiapkan data menjadi sinyal yang sesuai untuk media pengiriman.'),
      mk('m06','Transmission system','Media penghantar yang membawa sinyal dari sumber ke penerima disebut ...','transmission system','scanner','password manager','web browser','Transmission system adalah jalur/media yang dilalui sinyal, misalnya udara atau kabel.'),
      mk('m07','Destination','Komponen destination pada komunikasi data adalah ...','penerima data','pengirim data','alat input','router utama','Destination adalah pihak atau perangkat tujuan yang menerima data.'),
      mk('m08','GPRS','GPRS merupakan teknologi pada jaringan ...','2G','3G','4G','5G','Materi menjelaskan GPRS sebagai pengembangan jaringan 2G untuk data paket.'),
      mk('m09','EDGE','EDGE dikenal sebagai peningkatan dari ...','GPRS pada jaringan 2G','4G LTE','Wi-Fi rumah','Bluetooth','EDGE hadir sesudah GPRS dan menawarkan kecepatan lebih baik pada generasi 2G.'),
      mk('m10','3G','Jaringan 3G memungkinkan ...','kecepatan data lebih tinggi dibanding 2G','komputer tidak perlu sinyal','penghapusan semua pesan otomatis','pengiriman data tanpa source','3G hadir sebagai generasi setelah 2G dengan peningkatan layanan data.'),
      mk('m11','4G LTE','Teknologi 4G/LTE dikenal karena ...','akses data lebih cepat dan lebih stabil untuk internet mobile','hanya untuk telepon rumah','tidak mendukung internet','menggunakan CD/DVD','4G/LTE menjadi teknologi yang umum dipakai untuk akses data mobile modern.'),
      mk('m12','Alur SMS','Dalam alur SMS, pesan dari ponsel pengirim diteruskan melalui jaringan operator menuju ...','MSC/SMSC dan kemudian ke ponsel penerima','printer kelas','hard disk eksternal','monitor tanpa komputer','Pesan SMS melalui BTS dan pusat layanan operator sebelum sampai ke penerima.'),
    ],
    safe4:[
      mk('s01','Phishing','Web phishing adalah ...','upaya penipuan untuk mencuri data melalui situs atau tautan palsu','cara resmi update browser','alat untuk memperkuat sinyal Wi-Fi','fitur mencetak dokumen','Phishing menipu korban agar menyerahkan data sensitif seperti password atau informasi perbankan.'),
      mk('s02','Ciri phishing','Salah satu ciri web phishing adalah ...','alamat situs atau domain mencurigakan','selalu memakai domain resmi yang benar','tidak pernah meminta data','tampilan selalu sederhana dan aman','Banyak situs phishing memakai alamat mirip situs asli atau ada ejaan yang janggal.'),
      mk('s03','Cara menghindari phishing','Langkah aman untuk menghindari phishing adalah ...','memeriksa URL dan tidak mudah klik tautan sembarangan','memberi password kepada siapa saja','mengabaikan keamanan browser','selalu login dari tautan pesan acak','Memeriksa alamat web dan berpikir sebelum klik adalah langkah pencegahan penting.'),
      mk('s04','Pertemanan di internet','Saat menerima permintaan pertemanan di internet, sebaiknya ...','memeriksa profil dan hanya menerima yang dikenal atau terpercaya','langsung menerima semuanya','membagikan nomor PIN dan password','menghapus aplikasi browser','Selektif memilih teman membantu menjaga keamanan serta kenyamanan berinteraksi.'),
      mk('s05','Berpikir sebelum posting','Sebelum memposting sesuatu di internet, kita perlu ...','memikirkan dampaknya dan menjaga privasi','menuliskan semua data pribadi','menyalin unggahan orang lain tanpa izin','mematikan browser selamanya','Apa yang diunggah di internet bisa menyebar luas, sehingga perlu dipikirkan dampaknya.'),
      mk('s06','Informasi pribadi','Contoh informasi pribadi yang tidak boleh dibagikan sembarangan adalah ...','password dan data bank','hobi belajar','nama mata pelajaran','warna kesukaan','Password dan data perbankan termasuk informasi sangat sensitif.'),
      mk('s07','Browser','Browser adalah perangkat lunak yang digunakan untuk ...','mengakses dan menampilkan halaman web','mengganti RAM komputer','menjadi router jaringan','mencetak SMS','Browser dipakai untuk membuka situs dan berinteraksi dengan layanan web.'),
      mk('s08','Update browser','Browser perlu diperbarui secara berkala agar ...','keamanan dan kompatibilitasnya lebih baik','warna tampilannya selalu hitam','komputer tidak perlu internet','hanya bisa dipakai sekali','Pembaruan browser membantu menutup celah keamanan dan mendukung fitur web yang lebih baru.'),
      mk('s09','JavaScript','JavaScript pada browser berfungsi terutama untuk ...','membuat halaman web lebih interaktif','mengganti baterai ponsel','mengubah monitor menjadi modem','mencetak buku digital','JavaScript banyak digunakan agar halaman web dapat merespons aksi pengguna.'),
      mk('s10','Keamanan browser','Salah satu risiko jika fitur keamanan browser dimatikan adalah ...','komputer lebih mudah terkena gangguan atau penyalahgunaan situs web','internet menjadi gratis','sinyal ponsel bertambah otomatis','printer bekerja tanpa tinta','Fitur keamanan browser membantu melindungi pengguna dari situs berbahaya dan serangan web.'),
      mk('s11','Metode pembayaran','Saat belanja online, lebih aman menggunakan ...','metode pembayaran tepercaya dan mengecek informasi toko','tautan acak dari pesan asing','akun orang lain tanpa izin','semua situs tanpa memeriksa alamat','Keamanan transaksi perlu didukung pengecekan toko dan metode pembayaran yang tepercaya.'),
      mk('s12','Internet bijak','Menggunakan internet secara bijak berarti ...','aman, bertanggung jawab, dan menghormati privasi orang lain','membagikan semua rahasia pribadi','klik semua pop-up yang muncul','mengabaikan semua aturan keamanan','Penggunaan internet yang bijak mencakup etika, kehati-hatian, dan kesadaran keamanan digital.'),
    ]
  };

  function panel(no,title,subtitle,body){return `<section class="concept-lesson-panel"><div class="concept-lesson-panel-head"><span>${no}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`}
  function table(headers,rows){return `<div class="concept-conversion-table-wrap"><table class="concept-conversion-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>i===0?`<th>${c}</th>`:`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
  function overview(items){return `<div class="concept-chapter-cards">${items.map(row=>`<article><span>${row[0]}</span><b>${row[1]}</b><p>${row[2]}</p></article>`).join('')}</div>`}

  const lessons={
    network4:`<span class="concept-question-kicker">BAB 1 • MATERI HALAMAN 46–47</span>
      <h2>Jaringan Komputer dan Internet</h2>
      <p class="concept-explain-copy"><b>Jaringan komputer</b> adalah kumpulan dua komputer atau lebih yang saling terhubung sehingga dapat berbagi data, sumber daya, dan layanan. Materi ini mengenalkan perbedaan internet, intranet, LAN, dan WAN, serta pentingnya protokol dan alamat agar komunikasi data berjalan dengan baik.</p>
      ${panel('01','Konsep dasar','Kenali istilah yang sering muncul pada jaringan.',overview([
        ['01','Internet','Jaringan global yang menghubungkan banyak jaringan komputer di seluruh dunia.'],
        ['02','Intranet','Jaringan internal milik sekolah, kantor, atau lembaga tertentu.'],
        ['03','LAN','Local Area Network untuk area kecil seperti rumah atau laboratorium.'],
        ['04','WAN','Wide Area Network untuk wilayah lebih luas antarkota atau antarnegara.']
      ]))}
      ${panel('02','Media jaringan','Jaringan dapat berupa berkabel atau nirkabel.',table(['Jenis','Ciri','Contoh'],[
        ['Wired','Memakai media fisik','Kabel LAN / Ethernet'],
        ['Wireless','Tanpa kabel','Wi-Fi atau gelombang radio']
      ]))}
      ${panel('03','Protokol dan layanan','Agar perangkat dapat saling memahami, dibutuhkan aturan bersama.',`<p><b>TCP/IP</b> adalah protokol yang umum dipakai pada internet. Perangkat juga memerlukan <b>alamat IP</b> agar dapat dikenali dalam jaringan. Untuk mengakses internet, pengguna biasanya memerlukan <b>ISP</b> (Internet Service Provider) sebagai penyedia layanan.</p><div class="concept-chapter-key"><b>Ringkas</b><p>Data dikirim sebagai paket-paket kecil melalui jaringan agar pengiriman lebih efisien.</p></div>`)}
      <div class="concept-chapter-key"><b>Ingat</b><p>LAN untuk area lokal, WAN untuk area luas. Internet bersifat global, sedangkan intranet digunakan secara internal.</p></div>`,

    routing4:`<span class="concept-question-kicker">BAB 2 • MATERI HALAMAN 47–48</span>
      <h2>Konfigurasi Jaringan dan Routing</h2>
      <p class="concept-explain-copy">Setelah perangkat dihubungkan, jaringan perlu dikonfigurasi agar proses komunikasi berjalan normal. Pada jaringan yang lebih besar, diperlukan <b>routing</b> agar paket data dapat diarahkan ke tujuan melalui jalur yang sesuai.</p>
      ${panel('01','Konfigurasi jaringan','Mengatur parameter dasar koneksi.',overview([
        ['01','Alamat IP','Identitas perangkat pada jaringan.'],
        ['02','Subnet mask','Membantu mengenali bagian jaringan perangkat.'],
        ['03','Gateway','Jalur keluar ke jaringan lain atau internet.'],
        ['04','DNS','Membantu menerjemahkan nama domain menjadi alamat IP.']
      ]))}
      ${panel('02','Routing','Router memilih jalur pengiriman paket.',table(['Istilah','Makna'],[
        ['Router','Perangkat yang mengarahkan paket data.'],
        ['Default routing','Rute cadangan/utama jika tidak ada rute spesifik.'],
        ['Static routing','Rute diatur manual oleh administrator.'],
        ['Dynamic routing','Rute menyesuaikan kondisi jaringan secara otomatis.']
      ]))}
      ${panel('03','Troubleshooting jaringan','Masalah jaringan perlu dideteksi dan diperbaiki.',`<p><b>Troubleshooting</b> adalah proses mencari penyebab gangguan jaringan, misalnya kabel longgar, alamat IP yang tidak tepat, atau gangguan perangkat. Pemeriksaan bertahap membantu jaringan kembali bekerja normal.</p><div class="concept-chapter-key"><b>Contoh</b><p>Jika komputer tidak bisa terhubung ke LAN, cek kabel, lampu indikator, konfigurasi IP, dan perangkat jaringan yang dipakai.</p></div>`)}
      <div class="concept-chapter-key"><b>Kunci bab ini</b><p>Konfigurasi yang tepat membuat komunikasi lebih stabil. Routing memastikan paket data menemukan tujuan melalui jalur yang benar.</p></div>`,

    mobile4:`<span class="concept-question-kicker">BAB 3 • MATERI HALAMAN 49–50</span>
      <h2>Komunikasi Data pada Ponsel</h2>
      <p class="concept-explain-copy">Komunikasi data pada ponsel memungkinkan pengguna mengirim pesan, melakukan panggilan, dan mengakses internet. Ponsel bekerja secara <b>wireless</b> melalui jaringan seluler dan BTS. Materi ini juga menjelaskan komponen komunikasi data dan perkembangan jaringan 2G hingga 4G/LTE.</p>
      ${panel('01','Komponen komunikasi data','Perhatikan alur dasar pengiriman data.',overview([
        ['01','Source','Sumber atau pengirim data.'],
        ['02','Transmitter','Mengubah data agar siap dikirim sebagai sinyal.'],
        ['03','Transmission system','Media atau jalur penghantar sinyal.'],
        ['04','Destination','Penerima atau tujuan data.']
      ]))}
      ${panel('02','Jaringan seluler','Generasi jaringan menentukan kecepatan dan kemampuan layanan.',table(['Generasi','Contoh','Keterangan'],[
        ['2G','GPRS, EDGE','Mulai mendukung data paket, namun kecepatannya masih terbatas.'],
        ['3G','UMTS/HSPA','Kecepatan data lebih baik dibanding 2G.'],
        ['4G','LTE','Akses internet mobile jauh lebih cepat dan stabil.']
      ]))}
      ${panel('03','Cara kerja sederhana','Pesan dan data tidak langsung melompat ke penerima.',`<p>Pada komunikasi ponsel, sinyal dari perangkat pengguna diteruskan ke <b>BTS</b>, lalu masuk ke jaringan operator. Untuk SMS, pesan akan melewati pusat layanan operator sebelum diteruskan ke ponsel tujuan. Untuk internet, data dikirim dalam paket dan diarahkan melalui jaringan seluler.</p><div class="concept-chapter-key"><b>Contoh</b><p>Saat mengirim SMS, ponsel pengirim → BTS → MSC/SMSC operator → BTS penerima → ponsel tujuan.</p></div>`)}
      <div class="concept-chapter-key"><b>Ingat</b><p>Ponsel bekerja tanpa kabel. BTS berperan sebagai penghubung antara perangkat seluler dan jaringan operator.</p></div>`,

    safe4:`<span class="concept-question-kicker">BAB 4 • MATERI HALAMAN 51–54</span>
      <h2>Internet Aman, Web Phishing, dan Browser</h2>
      <p class="concept-explain-copy">Internet sangat bermanfaat, tetapi pengguna perlu berhati-hati terhadap penipuan seperti <b>web phishing</b> dan penyalahgunaan data pribadi. Selain itu, browser juga perlu dipahami karena menjadi pintu masuk utama saat menjelajah web.</p>
      ${panel('01','Web phishing','Penipuan digital yang perlu diwaspadai.',overview([
        ['01','Tujuan phishing','Mencuri data penting seperti password, OTP, atau data bank.'],
        ['02','Ciri umum','Alamat web aneh, pesan mendesak, tampilan meniru situs resmi.'],
        ['03','Pencegahan','Periksa URL, jangan asal klik tautan, dan jaga kerahasiaan akun.'],
        ['04','Sikap aman','Berpikir sebelum membagikan informasi pribadi.']
      ]))}
      ${panel('02','Bijak menggunakan internet','Gunakan internet secara aman dan bertanggung jawab.',table(['Kebiasaan baik','Alasan'],[
        ['Selektif menerima pertemanan','Mengurangi risiko penipuan atau akun palsu.'],
        ['Berpikir sebelum posting','Menghindari konflik dan kebocoran privasi.'],
        ['Tidak membagikan password','Menjaga akun tetap aman.'],
        ['Memeriksa toko/tautan','Mengurangi risiko transaksi dan situs palsu.']
      ]))}
      ${panel('03','Mengenal browser','Browser membantu pengguna membuka layanan web.',`<p><b>Browser</b> adalah perangkat lunak untuk mengakses dan menampilkan halaman web. Browser sebaiknya selalu diperbarui agar lebih aman dan kompatibel. Fitur seperti <b>JavaScript</b> membantu membuat halaman lebih interaktif, tetapi keamanan browser tetap perlu dijaga agar pengguna terlindungi dari situs berbahaya.</p><div class="concept-chapter-key"><b>Contoh browser</b><p>Browser umum antara lain Google Chrome, Mozilla Firefox, Microsoft Edge, dan Safari.</p></div>`)}
      <div class="concept-chapter-key"><b>Pesan penting</b><p>Gunakan internet dengan bijak: cek alamat situs, jaga privasi, aktifkan pembaruan browser, dan jangan mudah percaya pada pesan yang mendesak atau mencurigakan.</p></div>`
  };

  window.DMUlangan4Bank={questions,lessons};
})();
