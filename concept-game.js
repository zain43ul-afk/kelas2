/* Digital Mission — Misi Konsep Informatika
   Game 4: 4 bab belajar + 40 soal ABCD.
   Bab 1 Fungsi & Himpunan, Bab 2 Sistem Bilangan, Bab 3 Algoritma, Bab 4 Struktur Data.
   Isolated module: tidak mengubah algoritma tiga permainan lama. */
(function(){
  'use strict';

  const PER_CHAPTER=10;
  const TOTAL=40;
  const BANK_REV=5;
  const CHAPTERS=[
    {key:'functions',label:'Fungsi & Himpunan',topicLabel:'Fungsi & Himpunan',start:0,end:10,no:1},
    {key:'numbers',label:'Sistem Bilangan',topicLabel:'Struktur Bilangan',start:10,end:20,no:2},
    {key:'algorithm',label:'Algoritma',topicLabel:'Algoritma',start:20,end:30,no:3},
    {key:'data',label:'Struktur Data',topicLabel:'Struktur Data',start:30,end:40,no:4}
  ];
  const TOPIC_LABELS={functions:'Fungsi & Himpunan',numbers:'Sistem Bilangan',algorithm:'Algoritma',data:'Struktur Data'};
  let activeChapter='';
  let answerBusyIndex=-1;
  let previewUid='';
  let animationNonce=0;
  let lastSeenVersion=0;
  let showFinal=false;

  const q=(id)=>document.getElementById(id);
  const esc=(v)=>typeof window.escapeHtml==='function'?window.escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":"&#39;"}[c]));
  const now=()=>typeof serverNow==='function'?serverNow():Date.now();

  function hash32(text){
    let h=2166136261>>>0;
    const s=String(text||'');
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
    h+=h<<13;h^=h>>>7;h+=h<<3;h^=h>>>17;h+=h<<5;
    return h>>>0;
  }
  function rngFrom(text){
    let a=hash32(text)||0x9e3779b9;
    return function(){
      a|=0;a=a+0x6D2B79F5|0;
      let t=Math.imul(a^a>>>15,1|a);
      t=t+Math.imul(t^t>>>7,61|t)^t;
      return ((t^t>>>14)>>>0)/4294967296;
    };
  }
  function int(r,min,max){return min+Math.floor(r()*(max-min+1))}
  function pick(r,arr){return arr[Math.floor(r()*arr.length)]}
  function shuffle(r,arr){
    const out=arr.slice();
    for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
    return out;
  }
  function uniqueOptions(correct,candidates){
    const seen=new Set([String(correct)]), out=[String(correct)];
    for(const x of candidates){const s=String(x);if(!seen.has(s)){seen.add(s);out.push(s)}if(out.length===4)break}
    let pad=1;
    while(out.length<4){const s=String(correct)+String(pad++);if(!seen.has(s)){seen.add(s);out.push(s)}}
    return out;
  }
  function withOptions(r,item,correct,candidates){
    const raw=uniqueOptions(correct,candidates);
    const options=shuffle(r,raw);
    return {...item,options,correct:options.indexOf(String(correct))};
  }
  function itemBase(topic,id,title,explain,question,rationale,visualKind,steps,demo){
    return {topic,id,title,explain,question,rationale,visualKind,steps:steps||[],demo:demo||''};
  }
  function buildFunctionSetItems(r){
    const a=[];
    const names=shuffle(r,['Alya','Bima','Citra','Dimas','Eka','Fajar']);
    const nums=shuffle(r,[5,7,8,9,10,12]);
    const range=`B2:B${int(r,5,8)}`;

    a.push(withOptions(r,itemBase('functions','f-meaning','Pengertian Fungsi',`Fungsi adalah aturan yang menerima masukan atau input, memprosesnya dengan aturan tertentu, lalu menghasilkan keluaran atau output. Dalam matematika, fungsi menghubungkan anggota himpunan asal dengan tepat satu hasil. Dalam Excel, fungsi adalah rumus siap pakai untuk mengolah data lebih cepat.`,`Pernyataan yang paling tepat tentang fungsi adalah ...`,`Fungsi memiliki aturan yang jelas: menerima input dan menghasilkan output. Pada fungsi matematika, setiap anggota domain mempunyai tepat satu pasangan hasil.`,'function',['Ada data sebagai input','Gunakan satu aturan yang jelas','Proses input dengan aturan tersebut','Diperoleh output'],'INPUT → ATURAN → OUTPUT'),'Aturan yang mengolah input menjadi output tertentu',['Kumpulan angka yang tidak memiliki aturan','Gambar yang hanya berfungsi sebagai hiasan','Cara menyimpan file tanpa menghasilkan apa pun']));

    a.push(withOptions(r,itemBase('functions','f-excel-sum','Fungsi SUM di Excel',`SUM digunakan untuk menjumlahkan beberapa angka atau isi sel. Misalnya =SUM(B2:B5) berarti Excel menjumlahkan semua nilai dari B2 sampai B5. Fungsi ini berguna ketika data yang dijumlahkan cukup banyak sehingga kita tidak perlu menulis B2+B3+B4+B5 satu per satu.`,`Jika guru ingin menjumlahkan seluruh nilai pada ${range}, fungsi Excel yang paling tepat adalah ...`,`SUM digunakan untuk menjumlahkan data dalam suatu rentang sel. Bentuk umumnya adalah =SUM(rentang).`,'function',['Pilih rentang data','Gunakan SUM','Excel menjumlahkan seluruh nilai','Hasil muncul pada sel rumus'],`=SUM(${range})`),`=SUM(${range})`,[`=AVERAGE(${range})`,`=MAX(${range})`,`=COUNT(${range})`]));

    a.push(withOptions(r,itemBase('functions','f-excel-average','Fungsi AVERAGE di Excel',`AVERAGE digunakan untuk mencari nilai rata-rata dari sekumpulan angka. Excel menjumlahkan nilai yang dipilih lalu membaginya dengan banyaknya data angka. Kita cukup menuliskan rentang sel, sehingga prosesnya lebih praktis.`,`Fungsi yang digunakan untuk mencari rata-rata nilai siswa adalah ...`,`AVERAGE berarti rata-rata. Fungsi ini berbeda dari SUM yang menjumlahkan dan MAX yang mencari nilai terbesar.`,'function',['Pilih data nilai','Gunakan AVERAGE','Excel menghitung rata-rata','Tampilkan hasilnya'],'=AVERAGE(C2:C6)'),'AVERAGE',['SUM','MAX','COUNT']));

    a.push(withOptions(r,itemBase('functions','f-excel-maxmin','Fungsi MAX dan MIN',`MAX digunakan untuk mencari angka terbesar, sedangkan MIN digunakan untuk mencari angka terkecil. Misalnya pada nilai 70, 85, 90, dan 78, MAX menghasilkan 90 dan MIN menghasilkan 70.`,`Guru ingin mengetahui nilai paling tinggi dalam satu kolom. Fungsi yang tepat adalah ...`,`MAX mencari nilai terbesar pada data angka. MIN digunakan untuk nilai terkecil.`,'function',['Ada beberapa nilai','Cari yang paling besar','Gunakan MAX','Excel menampilkan nilai tertinggi'],'70 • 85 • 90 • 78 → MAX = 90'),'MAX',['MIN','SUM','COUNT']));

    a.push(withOptions(r,itemBase('functions','f-excel-count','Fungsi COUNT',`COUNT digunakan untuk menghitung berapa banyak sel yang berisi angka. COUNT tidak menjumlahkan nilainya. Jadi jika ada lima sel berisi angka, COUNT menghasilkan 5, berapa pun besar angka yang ada di dalam sel tersebut.`,`Apa yang dilakukan fungsi COUNT pada sekumpulan sel berisi angka?`,`COUNT menghitung banyaknya data angka, bukan jumlah nilainya dan bukan rata-ratanya.`,'function',['Periksa sel pada rentang','Kenali sel yang berisi angka','Hitung banyak sel angka','Tampilkan jumlah datanya'],'12, 15, 20, 25 → COUNT = 4'),'Menghitung banyaknya sel yang berisi angka',['Menjumlahkan semua angka','Mencari angka paling besar','Mencari nilai rata-rata']));

    a.push(withOptions(r,itemBase('functions','f-mapping','Fungsi sebagai Hubungan Dua Himpunan',`Dalam matematika, fungsi dapat dilihat sebagai hubungan antara dua himpunan. Himpunan pertama disebut domain. Setiap anggota domain harus mempunyai tepat satu pasangan pada himpunan tujuan. Beberapa anggota domain boleh menuju hasil yang sama, tetapi satu anggota domain tidak boleh menuju dua hasil berbeda sekaligus.`,`Manakah ciri yang harus dipenuhi agar sebuah hubungan disebut fungsi?`,`Syarat utamanya adalah setiap anggota domain memiliki tepat satu pasangan hasil. Tidak boleh ada anggota domain yang tidak punya pasangan atau mempunyai dua hasil sekaligus.`,'function',['Siapkan himpunan domain','Siapkan himpunan tujuan','Pasangkan setiap anggota domain','Pastikan tiap input hanya punya satu hasil'],'Domain → tepat satu pasangan'),'Setiap anggota domain memiliki tepat satu pasangan',['Setiap anggota domain harus memiliki dua pasangan','Hanya satu anggota domain yang boleh memiliki pasangan','Semua anggota domain harus menuju hasil yang berbeda']));

    a.push(withOptions(r,itemBase('functions','f-domain-range','Domain, Kodomain, dan Range',`Domain adalah himpunan semua input. Kodomain adalah himpunan tujuan yang mungkin menjadi output. Range adalah anggota kodomain yang benar-benar mendapat pasangan dari domain. Karena itu range dapat sama dengan kodomain atau hanya sebagian darinya.`,`Pada sebuah fungsi, istilah untuk himpunan semua nilai masukan adalah ...`,`Semua input berada di domain. Kodomain adalah himpunan tujuan, sedangkan range adalah hasil yang benar-benar dipakai.`,'function',['Domain = kumpulan input','Kodomain = tujuan yang tersedia','Range = hasil yang benar-benar terpakai','Ketiganya membantu membaca fungsi'],'DOMAIN → KODOMAIN'),'Domain',['Range','Kodomain','Irisan']));

    a.push(withOptions(r,itemBase('functions','f-set-meaning','Pengertian Himpunan',`Himpunan adalah kumpulan objek yang anggotanya dapat ditentukan dengan jelas. Contohnya himpunan hari sekolah, himpunan bilangan genap kecil, atau himpunan nama siswa dalam satu kelompok. Himpunan biasanya ditulis menggunakan tanda kurung kurawal, misalnya A = {2, 4, 6}.`,`Manakah yang paling tepat disebut himpunan?`,`Himpunan harus memiliki anggota yang dapat ditentukan dengan jelas, sehingga orang dapat memutuskan apakah suatu objek termasuk atau tidak.`,'function',['Tentukan aturan keanggotaan','Kumpulkan objek yang sesuai','Tulis anggotanya dengan jelas','Beri nama himpunan'],`A = {${nums.slice(0,3).join(', ')}}`),'Kumpulan siswa kelas VII N',['Kumpulan makanan yang sangat enak','Kumpulan film yang paling bagus','Kumpulan lagu yang terasa keren']));

    a.push(withOptions(r,itemBase('functions','f-subset','Himpunan Bagian',`Himpunan B disebut himpunan bagian dari A jika setiap anggota B juga merupakan anggota A. Contohnya A = {1,2,3,4} dan B = {1,2}; semua anggota B terdapat di A, sehingga B adalah himpunan bagian dari A.`,`Jika A = {1, 2, 3, 4} dan B = {1, 3}, hubungan B terhadap A adalah ...`,`Karena semua anggota B terdapat di A, B merupakan himpunan bagian dari A.`,'function',['Lihat anggota B','Cek satu per satu pada A','Semua anggota B ada di A','Maka B adalah bagian dari A'],'B berada di dalam A'),'B adalah himpunan bagian dari A',['B adalah himpunan kosong','B dan A saling lepas','B tidak mempunyai anggota']));

    a.push(withOptions(r,itemBase('functions','f-set-types','Himpunan Beririsan dan Saling Lepas',`Dua himpunan beririsan jika memiliki sedikitnya satu anggota yang sama. Sebaliknya, dua himpunan saling lepas jika tidak mempunyai anggota yang sama. Ilustrasi diagram Venn membantu kita melihat apakah kedua lingkaran memiliki bagian yang bertumpuk atau terpisah.`,`A = {1, 2, 3} dan B = {3, 4, 5}. Hubungan kedua himpunan tersebut adalah ...`,`A dan B sama-sama memiliki anggota 3. Karena ada anggota yang sama, kedua himpunan beririsan.`,'function',['Bandingkan anggota A dan B','Cari anggota yang sama','Angka 3 ada pada keduanya','Jadi kedua himpunan beririsan'],'A ∩ B = {3}'),'Beririsan',['Saling lepas','Himpunan kosong','Himpunan yang sama persis']));

    return a;
  }

  function buildNumberItems(r){
    const a=[];
    const device=pick(r,['lampu otomatis','sensor pintu','tombol permainan','mesin absensi']);
    const daily=pick(r,['harga di kantin','jumlah siswa di kelas','umur seseorang','nomor antrean']);
    const compactUse=pick(r,['kode warna pada desain','alamat memori komputer','kode teknis perangkat','penanda data pada program']);

    a.push(withOptions(r,itemBase('numbers','n-two-states','Biner dan Dua Keadaan',`Komputer bekerja menggunakan rangkaian elektronik. Banyak bagian elektronik paling mudah dibedakan dalam dua keadaan yang jelas, misalnya menyala atau mati, aktif atau tidak aktif. Karena itu, sistem bilangan biner cocok digunakan untuk menggambarkan keadaan seperti ini tanpa membuat perangkat harus membedakan terlalu banyak kondisi.`,`Sebuah ${device} hanya perlu mengenali keadaan “aktif” dan “tidak aktif”. Mengapa biner cocok untuk menggambarkan keadaan tersebut?`,`Biner cocok ketika informasi dapat dibedakan menjadi dua keadaan. Intinya bukan melakukan hitungan, tetapi mencocokkan cara penulisan dengan keadaan yang dimiliki perangkat.`,'number',['Perangkat punya dua keadaan','Kedua keadaan harus dibedakan dengan jelas','Biner mewakili dua keadaan dengan sederhana','Perangkat lebih mudah membaca informasinya'],'AKTIF ↔ TIDAK AKTIF → dua keadaan'),'Karena biner cocok untuk mewakili dua keadaan yang berbeda',['Karena biner selalu menghasilkan angka paling kecil','Karena biner hanya digunakan untuk pelajaran matematika','Karena biner membuat semua perangkat bekerja tanpa listrik']));

    a.push(withOptions(r,itemBase('numbers','n-decimal-daily','Desimal dalam Kehidupan Sehari-hari',`Dalam kehidupan sehari-hari, manusia paling sering menulis jumlah dengan sistem desimal. Kita menjumpainya saat membaca harga, umur, jumlah barang, nilai, atau nomor antrean. Desimal terasa akrab karena digunakan terus-menerus dalam kegiatan sehari-hari, sehingga mudah dipahami oleh kebanyakan orang.`,`Mengapa ${daily} biasanya ditampilkan dalam bentuk desimal kepada pengguna?`,`Desimal biasa digunakan untuk informasi yang dibaca manusia karena bentuknya paling akrab dalam kehidupan sehari-hari. Pilihan sistem bilangan bergantung pada siapa yang membaca dan untuk tujuan apa.`,'number',['Informasi akan dibaca manusia','Gunakan bentuk yang sudah akrab','Desimal umum dipakai sehari-hari','Informasi menjadi lebih mudah dipahami'],daily),'Karena desimal paling akrab digunakan manusia dalam kehidupan sehari-hari',['Karena desimal hanya dapat digunakan pada kertas','Karena komputer tidak dapat menyimpan bentuk bilangan lain','Karena desimal selalu lebih pendek daripada semua sistem lain']));

    a.push(withOptions(r,itemBase('numbers','n-same-info','Informasi Sama, Cara Menulis Berbeda',`Satu jumlah yang sama dapat ditulis dengan sistem bilangan yang berbeda. Bentuk tulisannya mungkin berubah, tetapi informasi yang dimaksud tetap dapat mewakili jumlah yang sama. Ini mirip satu nama tempat yang dapat ditulis dengan dua bahasa berbeda: tulisannya berbeda, tetapi tempat yang dimaksud tetap sama.`,`Guru menunjukkan satu jumlah yang ditulis dalam desimal dan biner. Apa gagasan terpenting yang harus dipahami?`,`Sistem bilangan adalah cara menuliskan suatu nilai. Jika sistemnya berubah, bentuk tulisan dapat berubah tanpa berarti jumlah aslinya ikut berubah.`,'number',['Ada satu informasi yang ingin ditulis','Pilih sistem penulisan yang berbeda','Bentuk simbolnya dapat berubah','Makna jumlahnya tetap dapat sama'],'SATU INFORMASI → BISA DITULIS DENGAN CARA BERBEDA'),'Tulisan dapat berbeda walaupun informasi jumlah yang diwakili sama',['Jika tulisannya berbeda, jumlahnya pasti berbeda','Biner selalu menunjukkan jumlah yang lebih kecil','Desimal selalu menunjukkan jumlah yang lebih besar']));

    a.push(withOptions(r,itemBase('numbers','n-base-label','Mengapa Nama Sistem Bilangan Penting?',`Tulisan angka perlu dibaca dengan aturan yang benar. Bentuk yang sama bisa ditafsirkan berbeda jika pembaca tidak tahu sistem bilangan yang digunakan. Karena itu, memberi keterangan seperti “biner”, “oktal”, “desimal”, atau “heksadesimal” membantu orang memahami aturan pembacaannya dan mencegah salah tafsir.`,`Dua siswa melihat tulisan angka yang sama tetapi mengira sistem bilangannya berbeda. Apa cara paling tepat untuk mencegah kebingungan?`,`Keterangan sistem bilangan memberi konteks tentang aturan yang dipakai untuk membaca tulisan angka. Dengan konteks itu, pembaca tidak menebak-nebak sistem yang dimaksud.`,'number',['Tulisan angka terlihat sama','Pembaca bisa memakai aturan berbeda','Tambahkan keterangan sistem bilangan','Semua orang membaca dengan konteks yang sama'],'ANGKA + KETERANGAN SISTEM → lebih jelas'),'Cantumkan sistem bilangan yang digunakan agar cara membacanya jelas',['Buat tulisannya lebih besar agar tidak salah','Hilangkan semua angka yang bentuknya sama','Gunakan warna berbeda tanpa menjelaskan sistemnya']));

    a.push(withOptions(r,itemBase('numbers','n-hex-compact','Heksadesimal sebagai Bentuk yang Lebih Ringkas',`Data komputer pada dasarnya dapat ditulis dalam bentuk biner yang panjang. Dalam beberapa pekerjaan komputer, manusia perlu membaca atau menyalin data tersebut. Heksadesimal sering dipakai sebagai bentuk yang lebih ringkas sehingga deretan informasi lebih mudah dilihat, dibandingkan menampilkan rangkaian biner yang sangat panjang.`,`Mengapa heksadesimal sering muncul pada ${compactUse}?`,`Heksadesimal membantu manusia menuliskan informasi komputer secara lebih ringkas. Tujuannya bukan membuat nilainya menjadi lebih besar atau kecil, melainkan membuat representasinya lebih praktis untuk dibaca.`,'number',['Informasi komputer bisa sangat panjang','Manusia perlu membaca atau menyalinnya','Gunakan bentuk yang lebih ringkas','Kode menjadi lebih mudah diperiksa'],compactUse),'Karena heksadesimal dapat membuat penulisan informasi komputer lebih ringkas',['Karena heksadesimal mengubah semua data menjadi gambar','Karena heksadesimal hanya bisa dibaca oleh mesin','Karena heksadesimal membuat ukuran file selalu menjadi nol']));

    a.push(withOptions(r,itemBase('numbers','n-octal-role','Oktal sebagai Cara Penulisan Alternatif',`Selain biner, desimal, dan heksadesimal, ada juga sistem oktal. Dalam konteks komputer tertentu, oktal dapat digunakan sebagai cara lain untuk menuliskan pola bilangan dengan bentuk yang lebih singkat daripada deretan biner. Jadi oktal bukan “bilangan yang lebih hebat”, melainkan pilihan representasi untuk kebutuhan tertentu.`,`Pernyataan mana yang paling tepat tentang penggunaan oktal?`,`Oktal adalah salah satu cara menuliskan bilangan. Kegunaannya bergantung pada konteks, terutama ketika orang ingin bentuk yang lebih ringkas atau sesuai dengan sistem yang sedang digunakan.`,'number',['Ada informasi bilangan','Biner dapat terlihat panjang','Oktal bisa menjadi bentuk alternatif','Pilih sesuai kebutuhan sistem'],'SATU DATA → beberapa cara penulisan'),'Oktal dapat dipakai sebagai cara alternatif menuliskan bilangan pada konteks tertentu',['Oktal selalu lebih benar daripada desimal','Oktal hanya digunakan untuk menghitung uang','Oktal membuat komputer tidak lagi memerlukan biner']));

    a.push(withOptions(r,itemBase('numbers','n-hex-letters-why','Mengapa Heksadesimal Memakai Huruf?',`Sistem desimal menggunakan simbol angka yang biasa kita lihat sehari-hari. Heksadesimal membutuhkan lebih banyak simbol berbeda dalam satu posisi, sehingga beberapa huruf digunakan sebagai tambahan simbol. Huruf tersebut bukan kata atau singkatan, melainkan bagian dari cara penulisan sistem bilangan itu.`,`Mengapa kita dapat melihat huruf di dalam bilangan heksadesimal?`,`Heksadesimal memerlukan lebih banyak simbol daripada simbol angka yang biasa dipakai dalam desimal. Karena itu, huruf digunakan sebagai simbol tambahan, bukan sebagai kata.`,'number',['Sistem memerlukan lebih banyak simbol','Simbol angka biasa belum cukup','Huruf dipakai sebagai simbol tambahan','Tulisan tetap merupakan bilangan'],'ANGKA + HURUF → simbol dalam satu sistem'),'Karena huruf dipakai sebagai simbol tambahan dalam sistem heksadesimal',['Karena setiap heksadesimal harus membentuk sebuah kata','Karena huruf menunjukkan nama pembuat komputer','Karena heksadesimal tidak boleh memakai angka']));

    a.push(withOptions(r,itemBase('numbers','n-context-choice','Pilih Sistem Sesuai Konteks',`Tidak ada satu sistem bilangan yang harus dipakai untuk semua keadaan. Perangkat elektronik dapat lebih nyaman bekerja dengan representasi dua keadaan, sedangkan manusia lebih nyaman membaca jumlah sehari-hari dalam desimal. Dalam pekerjaan teknis, bentuk lain seperti oktal atau heksadesimal dapat membantu membuat tulisan lebih ringkas.`,`Manakah kesimpulan yang paling tepat dari penjelasan tersebut?`,`Sistem bilangan dipilih sesuai kebutuhan. Yang penting adalah kecocokan antara cara penulisan, pengguna, dan konteksnya, bukan mencari satu sistem yang selalu paling baik.`,'number',['Lihat siapa yang membaca informasi','Lihat bagaimana perangkat bekerja','Pertimbangkan kemudahan penulisan','Pilih sistem yang sesuai konteks'],'PERANGKAT ≠ MANUSIA → kebutuhan bisa berbeda'),'Sistem bilangan yang dipakai sebaiknya disesuaikan dengan kebutuhan dan konteks',['Semua informasi harus selalu ditulis dalam biner','Desimal tidak boleh digunakan di komputer','Satu sistem bilangan pasti paling baik untuk semua situasi']));

    a.push(withOptions(r,itemBase('numbers','n-human-machine','Manusia dan Komputer Bisa Melihat Bentuk Berbeda',`Sebuah aplikasi dapat menampilkan angka dalam bentuk desimal agar mudah dibaca pengguna. Di dalam perangkat, informasi itu dapat diproses dalam bentuk yang lebih sesuai dengan rangkaian elektronik komputer. Artinya, tampilan yang dilihat manusia tidak harus sama dengan bentuk internal yang digunakan mesin.`,`Aplikasi menampilkan jumlah barang secara desimal, tetapi komputer memproses data secara internal dengan biner. Apakah hal ini masuk akal?`,`Ya. Sistem yang ditampilkan kepada manusia dan sistem yang digunakan mesin dapat berbeda karena keduanya memiliki kebutuhan yang berbeda. Informasinya tetap dapat mewakili hal yang sama.`,'number',['Pengguna perlu tampilan yang mudah dibaca','Komputer punya cara kerja elektronik','Masing-masing memakai bentuk yang sesuai','Informasi tetap dapat saling diterjemahkan'],'MANUSIA: mudah dibaca ↔ MESIN: mudah diproses'),'Ya, karena manusia dan komputer dapat memakai representasi yang berbeda sesuai kebutuhan',['Tidak, karena satu data hanya boleh mempunyai satu bentuk tulisan','Tidak, karena komputer hanya memahami tulisan yang terlihat di layar','Ya, karena desimal dan biner sebenarnya selalu ditulis persis sama']));

    a.push(withOptions(r,itemBase('numbers','n-long-code','Mengapa Bentuk Ringkas Membantu?',`Bayangkan teknisi harus memeriksa deretan kode yang sangat panjang. Jika informasi yang sama dapat ditulis dengan bentuk yang lebih ringkas, teknisi akan lebih mudah melihat pola, membandingkan bagian, dan mengurangi kesalahan saat menyalin. Karena alasan inilah bentuk seperti oktal atau heksadesimal dapat berguna dalam situasi tertentu.`,`Apa manfaat utama menggunakan penulisan bilangan yang lebih ringkas ketika manusia memeriksa kode?`,`Bentuk yang ringkas membantu keterbacaan. Tujuannya terutama agar manusia lebih mudah memeriksa dan menyalin representasi data, bukan untuk mengubah makna data.`,'number',['Kode terlalu panjang','Manusia perlu memeriksanya','Bentuk ringkas mengurangi kerumitan visual','Pemeriksaan menjadi lebih mudah'],'PANJANG → DIRINGKAS → lebih mudah dibaca'),'Membuat kode lebih mudah dibaca dan diperiksa oleh manusia',['Membuat data otomatis menjadi benar tanpa diperiksa','Menghilangkan kebutuhan komputer terhadap listrik','Membuat semua bilangan mempunyai arti yang sama']));

    a.push(withOptions(r,itemBase('numbers','n-what-is-system','Sistem Bilangan adalah Aturan Penulisan',`Sistem bilangan adalah aturan untuk menuliskan dan memahami bilangan menggunakan kumpulan simbol tertentu. Biner, oktal, desimal, dan heksadesimal adalah contoh cara penulisan yang berbeda. Mempelajari sistem bilangan membantu kita memahami mengapa komputer dan manusia kadang memakai bentuk angka yang berbeda.`,`Manakah deskripsi yang paling tepat tentang “sistem bilangan”?`,`Sistem bilangan berkaitan dengan aturan representasi angka. Ia bukan jenis perangkat keras, bukan aplikasi, dan bukan cara menyimpan nama siswa.`,'number',['Ada informasi berupa bilangan','Bilangan ditulis memakai aturan tertentu','Aturan dapat berbeda antar sistem','Pembaca harus mengetahui konteksnya'],'BILANGAN + ATURAN PENULISAN'),'Cara atau aturan untuk menuliskan dan memahami bilangan',['Alat untuk mempercepat koneksi internet','Program untuk membuat gambar bergerak','Daftar nama yang disusun berdasarkan abjad']));

    a.push(withOptions(r,itemBase('numbers','n-not-ranking','Bukan Soal Mana yang Paling Hebat',`Biner, oktal, desimal, dan heksadesimal tidak perlu diperlombakan untuk mencari mana yang “paling hebat”. Setiap sistem mempunyai fungsi dan konteks penggunaan. Biner dekat dengan cara kerja elektronik, desimal dekat dengan kebiasaan manusia, sedangkan oktal dan heksadesimal dapat membantu dalam penulisan teknis tertentu.`,`Seorang siswa berkata, “Heksadesimal pasti selalu lebih baik daripada biner.” Tanggapan yang paling tepat adalah ...`,`Tidak ada satu sistem yang selalu paling baik untuk semua kebutuhan. Kelebihan suatu sistem bergantung pada konteks penggunaannya.`,'number',['Setiap sistem punya karakter berbeda','Kebutuhan pengguna juga berbeda','Tidak ada satu pilihan untuk semua keadaan','Pilih berdasarkan tujuan'],'BUKAN LOMBA → PILIH SESUAI TUJUAN'),'Belum tentu, karena pilihan sistem bilangan bergantung pada kebutuhan',['Benar, karena heksadesimal harus dipakai di semua perangkat','Benar, karena sistem lain tidak mempunyai kegunaan','Salah, karena hanya desimal yang boleh digunakan manusia dan komputer']));

    a.push(withOptions(r,itemBase('numbers','n-misread','Kesalahan Karena Konteks Tidak Jelas',`Dua program dapat menerima tulisan angka yang sama tetapi menafsirkannya dengan aturan sistem bilangan yang berbeda. Jika informasi tentang sistemnya tidak dicantumkan, hasil pembacaan bisa membingungkan. Karena itu, saat bertukar data, program perlu sepakat tentang format atau sistem bilangan yang digunakan.`,`Apa masalah utama ketika pengirim dan penerima data memakai aturan sistem bilangan yang berbeda tanpa keterangan?`,`Masalahnya adalah perbedaan cara menafsirkan representasi yang sama. Solusinya adalah menyepakati atau mencantumkan sistem yang dipakai.`,'number',['Pengirim menulis sebuah data','Penerima memakai aturan berbeda','Tulisan bisa ditafsirkan tidak sama','Keduanya perlu menyepakati format'],'FORMAT JELAS → mengurangi salah tafsir'),'Data dapat ditafsirkan berbeda karena aturan pembacaannya tidak sama',['Layar komputer pasti langsung rusak','Semua angka otomatis berubah menjadi huruf','Internet akan berhenti bekerja untuk semua pengguna']));

    a.push(withOptions(r,itemBase('numbers','n-color-code','Kode Warna dan Heksadesimal',`Pada desain digital, warna sering ditulis dengan kode heksadesimal. Salah satu alasannya adalah bentuknya cukup ringkas untuk mewakili informasi warna yang sebenarnya disimpan komputer sebagai data digital. Pengguna tidak perlu menghitung nilai kodenya untuk memahami fungsi utama dari penulisan tersebut.`,`Mengapa kode warna digital sering memakai bentuk heksadesimal?`,`Dalam konteks warna digital, heksadesimal merupakan cara yang ringkas dan praktis untuk menuliskan informasi yang digunakan komputer. Fokusnya adalah kemudahan representasi, bukan menghafal nilai setiap simbol.`,'number',['Warna disimpan sebagai data digital','Data perlu ditulis dalam kode','Heksadesimal memberi bentuk yang ringkas','Kode lebih praktis digunakan'],`contoh konteks: ${compactUse}`),'Karena heksadesimal merupakan cara ringkas untuk menuliskan data digital tertentu',['Karena warna hanya dapat dilihat jika memakai huruf','Karena heksadesimal membuat semua warna menjadi sama','Karena setiap kode heksadesimal adalah nama sebuah warna']));

    return a;
  }

  function buildDataItems(r){
    const a=[];
    const names=shuffle(r,['Alya','Bima','Citra','Dimas','Eka','Fajar','Gita','Hana']);
    {
      const objects=shuffle(r,['Pensil','Buku','Penghapus','Penggaris','Spidol']);
      a.push(withOptions(r,itemBase('data','d-meaning','Apa Itu Struktur Data?',`Struktur data adalah cara menata data supaya mudah disimpan, dicari, dan digunakan. Bayangkan meja belajar: alat tulis yang ditata akan lebih mudah ditemukan daripada alat tulis yang bercampur tanpa aturan. Di komputer, data juga perlu ditata dengan pola tertentu.`,`Tujuan utama struktur data adalah ...`,`Struktur data membantu data tersusun sehingga lebih mudah digunakan dan dikelola.`,'array',['Ada banyak data','Data ditata dengan aturan','Data menjadi lebih mudah dicari','Program lebih mudah menggunakannya'],`${objects.slice(0,3).join(' • ')} → ditata rapi`),'Menata data agar mudah digunakan',['Membuat layar menjadi lebih terang','Mengubah semua data menjadi gambar','Menghapus semua data lama']));
    }
    {
      const vals=shuffle(r,['Merah','Biru','Hijau','Kuning','Ungu']);
      a.push(withOptions(r,itemBase('data','d-list-order','Daftar / Array Berurutan',`Array atau daftar menyimpan beberapa data dalam urutan tertentu. Kita dapat melihat data pertama, kedua, ketiga, dan seterusnya. Ini mirip deretan loker yang masing-masing memiliki posisi.`,`Jika warna = [${vals.join(', ')}], data ketiga adalah ...`,`Data ketiga berarti hitung dari kiri: pertama ${vals[0]}, kedua ${vals[1]}, ketiga ${vals[2]}.`,'array',[`Data 1 = ${vals[0]}`,`Data 2 = ${vals[1]}`,`Data 3 = ${vals[2]}`,`Jadi pilih ${vals[2]}`],`[ ${vals.join(' | ')} ]`),vals[2],[vals[1],vals[3],vals[0]]));
    }
    {
      const vals=shuffle(r,[10,20,30,40,50]), idx=pick(r,[0,1,2,3]), target=vals[idx];
      a.push(withOptions(r,itemBase('data','d-array-index','Indeks Array Mulai dari 0',`Di banyak bahasa pemrograman, posisi array dihitung mulai dari 0, bukan 1. Artinya data pertama berada di indeks 0, data kedua di indeks 1, dan data ketiga di indeks 2. Awalnya terasa aneh, tetapi pola ini sangat umum di pemrograman.`,`Pada [${vals.join(', ')}], nilai ${target} berada pada indeks ...`,`Hitung dari kiri dengan nomor 0, 1, 2, 3, 4. ${target} berada pada indeks ${idx}.`,'array',[`Data pertama → indeks 0`,`Data kedua → indeks 1`,`Cari ${target}`,`Ketemu di indeks ${idx}`],`0:${vals[0]}  1:${vals[1]}  2:${vals[2]}  3:${vals[3]}  4:${vals[4]}`),idx,[(idx+1)%5,(idx+2)%5,(idx+3)%5]));
    }
    {
      const seq=names.slice(0,4);
      a.push(withOptions(r,itemBase('data','d-stack','Stack = Tumpukan',`Stack dapat dibayangkan seperti tumpukan buku. Buku yang baru diletakkan berada paling atas, sehingga buku itulah yang paling mudah diambil lebih dulu. Pola ini disebut “terakhir masuk, pertama keluar”.`,`Buku diberi nama ${seq.join(' → ')} dan ditumpuk sesuai urutan itu. Buku mana yang berada paling atas?`,`Buku terakhir yang ditambahkan berada paling atas. Jadi jawabannya ${seq[3]}.`,'stack',[`${seq[0]} diletakkan pertama`,`${seq[1]} lalu ${seq[2]} di atasnya`,`${seq[3]} diletakkan terakhir`,`${seq[3]} sekarang paling atas`],`${seq[0]} ↓ ${seq[1]} ↓ ${seq[2]} ↓ ${seq[3]}`),seq[3],[seq[2],seq[1],seq[0]]));
    }
    {
      const seq=names.slice(1,5);
      a.push(withOptions(r,itemBase('data','d-queue','Queue = Antrean',`Queue bekerja seperti antrean di kantin. Orang yang datang lebih dulu berada di depan dan biasanya dilayani lebih dulu. Orang baru masuk ke bagian belakang antrean. Pola ini disebut “pertama masuk, pertama keluar”.`,`Urutan antrean adalah ${seq.join(' → ')}. Siapa yang dilayani lebih dulu?`,`Yang datang pertama adalah ${seq[0]}, sehingga ia berada di depan antrean.`,'queue',[`${seq[0]} datang pertama`,`${seq[1]} lalu ${seq[2]} datang`,` ${seq[3]} datang paling akhir`,`${seq[0]} dilayani lebih dulu`],`${seq[0]} → ${seq[1]} → ${seq[2]} → ${seq[3]}`),seq[0],[seq[1],seq[2],seq[3]]));
    }
    {
      a.push(withOptions(r,itemBase('data','d-undo','Undo Mirip Stack',`Saat menekan Undo, komputer membatalkan tindakan yang baru saja kita lakukan. Jika kita mengetik, lalu memberi warna, lalu memasukkan gambar, maka Undo pertama akan membatalkan memasukkan gambar. Karena yang terakhir dilakukan dibatalkan lebih dulu, pola ini mirip stack.`,`Fitur Undo paling mirip dengan struktur ...`,`Undo mengambil tindakan terakhir terlebih dahulu. Itu adalah pola stack.`,'stack',['Mengetik','Memberi warna','Memasukkan gambar terakhir','Undo → batalkan gambar dulu'],'Terakhir dilakukan → pertama dibatalkan'),'Stack / tumpukan',['Queue / antrean','Tree / pohon','Graph / jaringan']));
    }
    {
      a.push(withOptions(r,itemBase('data','d-printer','Antrean Printer',`Bayangkan tiga siswa mengirim dokumen ke satu printer. Jika tidak ada dokumen prioritas, dokumen yang masuk lebih dulu biasanya dicetak lebih dulu. Dokumen baru menunggu di belakang. Ini adalah contoh sederhana queue atau antrean.`,`Struktur yang cocok untuk antrean printer adalah ...`,`Printer tanpa prioritas memproses pekerjaan pertama yang masuk terlebih dahulu, seperti queue.`,'queue',['Dokumen A masuk','Dokumen B masuk setelah A','A berada di depan','A dicetak lebih dulu'],'A → B → C → printer'),'Queue / antrean',['Stack / tumpukan','Tree / pohon','Graph / jaringan']));
    }
    {
      a.push(withOptions(r,itemBase('data','d-tree','Tree = Struktur Bertingkat',`Tree cocok untuk data yang bertingkat dari induk ke anak. Bayangkan sebuah folder utama yang bercabang menjadi beberapa subfolder. Setiap subfolder dapat bercabang lagi menjadi folder yang lebih khusus, sehingga jumlah bagian biasanya semakin banyak ketika kita turun ke tingkat berikutnya. Bentuk ini mirip pohon yang memiliki batang, cabang, lalu ranting.`,`Folder Utama → Pelajaran → Informatika paling cocok digambarkan dengan ...`,`Hubungan dari folder utama ke subfolder adalah hubungan bertingkat, sehingga cocok dengan tree.`,'tree',['Mulai dari 1 folder utama','Turun ke 2 subfolder','Turun lagi menjadi lebih banyak','Semakin ke bawah, item bertambah'],'Folder Utama, Pelajaran, Dokumen'),'Tree / pohon',['Queue / antrean','Stack / tumpukan','Array satu baris']));
    }
    {
      a.push(withOptions(r,itemBase('data','d-graph','Graph = Jaringan Hubungan',`Graph digunakan saat banyak benda atau orang dapat saling terhubung. Contohnya pertemanan: Alya dapat berteman dengan Bima dan Citra, sementara Bima juga dapat berteman dengan Dimas. Hubungannya tidak harus bertingkat seperti folder.`,`Jaringan pertemanan beberapa siswa paling cocok digambarkan dengan ...`,`Pertemanan memiliki banyak titik dan hubungan silang. Pola seperti ini disebut graph.`,'graph',['Alya terhubung Bima','Alya juga terhubung Citra','Bima terhubung Dimas','Terbentuk jaringan hubungan'],'Alya ↔ Bima ↔ Dimas, Alya ↔ Citra'),'Graph / jaringan',['Queue / antrean','Stack / tumpukan','Satu angka saja']));
    }
    {
      const first=names[0], second=names[1], third=names[2];
      a.push(withOptions(r,itemBase('data','d-stack-simple-op','Menambah ke Stack',`Pada stack, data baru selalu diletakkan di bagian paling atas. Misalnya ${first} sudah ada, lalu ${second} ditambahkan, lalu ${third} ditambahkan. Maka ${third} menjadi yang paling atas karena ia masuk terakhir.`,`Stack dari bawah berisi ${first}, lalu ${second}. Jika ${third} ditambahkan, siapa yang berada paling atas?`,`Data yang baru ditambahkan selalu menjadi puncak stack. Karena ${third} masuk terakhir, ${third} ada di atas.`,'stack',[`${first} sudah ada`,`Tambahkan ${second}`,`Tambahkan ${third} terakhir`,`${third} menjadi paling atas`],`${first} ↓ ${second} ↓ ${third}`),third,[second,first,names[3]]));
    }
    {
      const seq=names.slice(0,3), extra=names[3];
      a.push(withOptions(r,itemBase('data','d-queue-add','Menambah ke Antrean',`Pada queue, orang baru masuk dari belakang. Orang yang sudah berada di depan tetap menjadi orang pertama yang dilayani. Jadi menambah anggota baru tidak mengubah siapa yang sedang berada paling depan.`,`Antrean ${seq.join(' → ')}. Lalu ${extra} datang dan masuk ke belakang. Siapa yang tetap berada paling depan?`,`Orang baru masuk di belakang. ${seq[0]} sudah berada di depan sejak awal, jadi tetap paling depan.`,'queue',[`${seq[0]} ada di depan`,`${seq[1]} dan ${seq[2]} mengikuti`,`${extra} datang baru`,` ${extra} masuk paling belakang`],`${seq.join(' → ')} → ${extra}`),seq[0],[seq[1],seq[2],extra]));
    }
    {
      const scenario=pick(r,['tumpukan piring','antrean kantin']);
      const correct=scenario==='tumpukan piring'?'Stack / tumpukan':'Queue / antrean';
      a.push(withOptions(r,itemBase('data','d-analogy','Pilih Struktur dari Kehidupan Sehari-hari',`Kita dapat mengenali struktur data lewat benda sehari-hari. Tumpukan piring biasanya diambil dari bagian atas, sedangkan antrean kantin melayani orang dari bagian depan. Mengenali pola ini membantu sebelum mempelajari istilah komputer yang lebih rumit.`,`Contoh “${scenario}” paling mirip dengan ...`,`Lihat pola geraknya: tumpukan memakai bagian atas, sedangkan antrean memakai bagian depan.`,'array',['Lihat contoh sehari-hari','Tentukan mana yang masuk dulu/terakhir','Perhatikan mana yang keluar dulu','Cocokkan dengan struktur'],scenario),correct,[correct.startsWith('Stack')?'Queue / antrean':'Stack / tumpukan','Tree / pohon','Graph / jaringan']));
    }
    return a;
  }

  function buildAlgorithmItems(r){
    const a=[];
    {
      a.push(withOptions(r,itemBase('algorithm','a-sequence','Algoritma = Langkah Berurutan',`Algoritma adalah urutan langkah untuk menyelesaikan suatu tugas. Kita sebenarnya memakai algoritma setiap hari, misalnya saat membuat minuman: siapkan gelas, masukkan minuman, tuang air, lalu sajikan. Urutan yang jelas membuat tugas lebih mudah diikuti.`,`Manakah yang paling tepat disebut algoritma?`,`Algoritma harus berupa langkah-langkah yang jelas dan dapat diikuti sampai tujuan tercapai.`,'algorithm',['Tentukan tujuan','Susun langkah pertama','Lanjutkan sesuai urutan','Sampai tujuan selesai'],'MULAI → langkah 1 → langkah 2 → SELESAI'),'Urutan langkah untuk menyelesaikan tugas',['Satu gambar tanpa petunjuk','Kumpulan angka acak','Nama sebuah aplikasi']));
    }
    {
      a.push(withOptions(r,itemBase('algorithm','a-order','Urutan Langkah Itu Penting',`Beberapa tugas harus dilakukan dengan urutan yang benar. Misalnya sebelum minum teh, kita perlu menyiapkan gelas dan membuat tehnya terlebih dahulu. Jika urutannya dibalik, hasilnya bisa tidak masuk akal.`,`Urutan paling masuk akal untuk membuat teh adalah ...`,`Siapkan wadah lebih dulu, masukkan teh, lalu tuang air. Itulah urutan yang logis.`,'algorithm',['1. Siapkan gelas','2. Masukkan teh','3. Tuang air','4. Teh siap'],'Gelas → teh → air → siap'),'Siapkan gelas → masukkan teh → tuang air',['Tuang air → minum → cari gelas','Minum → masukkan teh → siapkan gelas','Masukkan teh → minum → tuang air']));
    }
    {
      const score=pick(r,[65,70,80,85]), pass=75, result=score>=pass?'Lulus':'Belum lulus';
      a.push(withOptions(r,itemBase('algorithm','a-if-easy','Jika... Maka...',`Percabangan digunakan ketika komputer harus memilih tindakan berdasarkan suatu kondisi. Bentuk sederhananya adalah “jika kondisi benar, lakukan A; jika tidak, lakukan B”. Kita hanya perlu membandingkan kondisi dengan data yang diberikan.`,`Jika nilai ≥ ${pass}, tampilkan “Lulus”. Jika tidak, tampilkan “Belum lulus”. Untuk nilai ${score}, hasilnya ...`,`Bandingkan ${score} dengan ${pass}. Karena ${score>=pass?'lebih besar atau sama dengan':'lebih kecil dari'} ${pass}, hasilnya “${result}”.`,'algorithm',[`Nilai = ${score}`,`Batas = ${pass}`,`Bandingkan keduanya`,`Pilih hasil: ${result}`],`${score} ${score>=pass?'≥':'<'} ${pass} → ${result}`),result,[result==='Lulus'?'Belum lulus':'Lulus','Tidak ada jawaban','Ulangi dari awal']));
    }
    {
      const raining=pick(r,[true,false]);
      const result=raining?'Bawa payung':'Tidak perlu payung';
      a.push(withOptions(r,itemBase('algorithm','a-condition-story','Percabangan dalam Kehidupan',`Percabangan tidak hanya ada di komputer. Kita juga sering membuat keputusan sederhana: jika hujan, bawa payung; jika tidak hujan, tidak perlu payung. Komputer melakukan hal yang sama, hanya dengan aturan yang ditulis lebih jelas.`,`Aturannya: jika hujan, bawa payung. Jika tidak hujan, tidak perlu payung. Sekarang ${raining?'sedang hujan':'tidak hujan'}. Apa tindakan yang sesuai?`,`Gunakan kondisi yang diberikan. Karena ${raining?'hujan':'tidak hujan'}, pilih “${result}”.`,'algorithm',[`Lihat keadaan: ${raining?'hujan':'tidak hujan'}`,`Cocokkan dengan aturan IF`,`Pilih cabang yang sesuai`,`Hasil: ${result}`],`${raining?'HUJAN':'TIDAK HUJAN'} → ${result}`),result,[raining?'Tidak perlu payung':'Bawa payung','Bawa dua tas','Matikan komputer']));
    }
    {
      const times=int(r,3,6);
      a.push(withOptions(r,itemBase('algorithm','a-loop-count','Loop = Mengulang',`Loop atau perulangan digunakan ketika suatu langkah dilakukan berkali-kali. Daripada menulis “tepuk tangan” berulang-ulang, kita dapat menulis “ulangi ${times} kali: tepuk tangan”. Instruksi menjadi lebih singkat tetapi hasilnya tetap jelas.`,`Jika perintahnya “ulangi ${times} kali: tepuk 1 kali”, berapa kali tepuk dilakukan?`,`Satu putaran menghasilkan satu tepuk. Karena diulang ${times} kali, jumlah tepuk juga ${times}.`,'algorithm',[`Perintah: tepuk 1 kali`,`Ulangi sebanyak ${times} kali`,`Setiap putaran = 1 tepuk`,`Total = ${times} tepuk`],`🔁 ${times}× × 1 tepuk = ${times} tepuk`),times,[times-1,times+1,times+2]));
    }
    {
      const times=int(r,3,5), add=1, result=times;
      a.push(withOptions(r,itemBase('algorithm','a-loop-number','Mengikuti Perulangan Sederhana',`Kita dapat mengikuti loop dengan menghitung perubahan sedikit demi sedikit. Mulai dari 0, lalu setiap putaran tambahkan 1. Setelah beberapa putaran, angka akhir sama dengan banyaknya penambahan yang dilakukan.`,`Mulai dari 0. Ulangi ${times} kali: tambah 1. Nilai akhirnya adalah ...`,`Urutannya 0 → 1 → 2 dan seterusnya sampai ${times} kali. Jadi hasil akhirnya ${result}.`,'algorithm',[`Mulai = 0`,`Putaran 1 → 1`,`Terus tambah 1 sampai ${times} putaran`,`Nilai akhir = ${result}`],`0 → 1 → 2 → … → ${result}`),result,[result-1,result+1,result+2]));
    }
    {
      const n=int(r,5,9);
      a.push(withOptions(r,itemBase('algorithm','a-efficient','Cara Lebih Ringkas',`Algoritma yang baik tidak harus panjang. Jika satu tindakan sama dilakukan berkali-kali, perulangan dapat membuat instruksi lebih ringkas dan mudah dibaca. Hasilnya tetap sama, tetapi cara menulisnya lebih sederhana.`,`Untuk melompat ${n} kali, perintah yang paling ringkas adalah ...`,`Karena tindakannya sama dan diulang ${n} kali, gunakan perulangan ${n} kali.`,'algorithm',[`Tujuan: lompat ${n} kali`,`Tindakan selalu sama`,`Gunakan “ulangi”`,`Instruksi menjadi ringkas`],`Ulangi ${n} kali → lompat 1 kali`),`Ulangi ${n} kali: lompat 1 kali`,[`Tulis “lompat” ${n-1} kali`,`Lompat 1 kali lalu berhenti`,`Jika lapar, lompat ${n} kali`]));
    }
    {
      a.push(withOptions(r,itemBase('algorithm','a-bug-order','Menemukan Kesalahan Urutan',`Kesalahan kecil dalam urutan langkah dapat membuat algoritma tidak bekerja sesuai tujuan. Kita tidak perlu langsung mengubah semuanya. Cari langkah yang tidak masuk akal, lalu perbaiki bagian itu saja.`,`Urutan mencuci tangan: (1) keringkan tangan, (2) basahi tangan, (3) pakai sabun, (4) bilas. Langkah yang jelas berada terlalu awal adalah ...`,`Mengeringkan tangan seharusnya dilakukan setelah tangan dibasuh dan dibilas, bukan sebelum dimulai.`,'algorithm',['Baca semua langkah','Bayangkan dilakukan satu per satu','Cari langkah yang waktunya salah','Langkah 1 perlu dipindah ke akhir'],'Keringkan seharusnya di akhir'),'Langkah 1',['Langkah 2','Langkah 3','Langkah 4']));
    }
    {
      a.push(withOptions(r,itemBase('algorithm','a-clear','Instruksi Harus Jelas',`Komputer mengikuti instruksi secara tepat. Kalimat seperti “ambil secukupnya” dapat berbeda arti bagi setiap orang, sedangkan “ambil tepat 3 kartu” mempunyai arti yang jelas. Instruksi yang jelas membantu menghasilkan tindakan yang sama.`,`Manakah instruksi yang paling jelas?`,`Pilihan yang menyebut jumlah dan benda secara tepat paling mudah diikuti tanpa menebak.`,'algorithm',['Hindari kata yang samar','Sebutkan tindakan','Sebutkan jumlah jika perlu','“Ambil tepat 3 kartu” paling jelas'],'Jumlah + benda + tindakan yang pasti'),'Ambil tepat 3 kartu',['Ambil beberapa kartu','Ambil secukupnya','Ambil kartu sebanyak yang kamu mau']));
    }
    {
      a.push(withOptions(r,itemBase('algorithm','a-flow','Mengenal Alur Dasar',`Banyak algoritma sederhana dapat dibayangkan sebagai tiga bagian: mulai, proses, lalu selesai atau hasil. Bagian proses berisi tindakan utama yang harus dilakukan. Pola ini membantu kita membaca alur tanpa bingung.`,`Urutan alur dasar yang paling masuk akal adalah ...`,`Kegiatan dimulai terlebih dahulu, kemudian proses dilakukan, dan setelah itu hasil atau selesai.`,'algorithm',['MULAI','Lakukan PROSES','Dapatkan HASIL','SELESAI'],'MULAI → PROSES → HASIL'),'Mulai → Proses → Hasil',['Hasil → Mulai → Proses','Proses → Hasil → Mulai','Mulai → Hasil → Proses']));
    }
    {
      const target=int(r,3,6);
      a.push(withOptions(r,itemBase('algorithm','a-stop','Kapan Perulangan Berhenti?',`Perulangan harus tahu kapan harus berhenti. Jika robot diminta maju tepat ${target} langkah, kita dapat menghitung setiap langkah. Saat hitungan mencapai ${target}, robot harus berhenti agar tidak berjalan terlalu jauh.`,`Robot harus maju tepat ${target} langkah. Kondisi berhenti yang paling tepat adalah ...`,`Robot berhenti saat jumlah langkah sudah sama dengan target, yaitu ${target}.`,'algorithm',[`Mulai hitung dari 0`,`Setiap maju, tambah hitungan`,`Pantau sampai hitungan ${target}`,`Saat = ${target}, berhenti`],`jumlah langkah = ${target} → BERHENTI`),`Berhenti saat jumlah langkah = ${target}`,[`Berhenti saat jumlah langkah = ${target-1}`,`Berhenti saat jumlah langkah = ${target+1}`,'Tidak perlu berhenti']));
    }
    {
      const start=int(r,1,5), add=pick(r,[1,2]), result=start+add;
      a.push(withOptions(r,itemBase('algorithm','a-trace-easy','Ikuti Nilai Langkah demi Langkah',`Dalam algoritma, nilai sebuah variabel dapat berubah setelah menjalankan perintah. Cara termudah adalah menulis nilai awal, lalu lakukan satu perubahan pada satu waktu. Jangan melompat langsung ke jawaban.`,`x = ${start}. Lalu x = x + ${add}. Nilai x sekarang adalah ...`,`Mulai dari ${start}, lalu tambahkan ${add}. Jadi x menjadi ${result}.`,'algorithm',[`Nilai awal x = ${start}`,`Perintah: tambah ${add}`,`${start} + ${add} = ${result}`,`Nilai baru x = ${result}`],`x: ${start} → ${result}`),result,[result-1,result+1,start,add]));
    }
    return a;
  }


  function makePackage(uid,st,version){
    const stableUid=String(st?.packageUid||st?.recoveredFromUid||uid||'');
    const seed=`concept-bank${BANK_REV}|v${version}|${stableUid}|${st?.name||''}|${st?.cls||''}`;
    const r=rngFrom(seed);
    const functions=shuffle(r,buildFunctionSetItems(r)).slice(0,PER_CHAPTER);
    const nums=shuffle(r,buildNumberItems(r)).slice(0,PER_CHAPTER);
    const algo=shuffle(r,buildAlgorithmItems(r)).slice(0,PER_CHAPTER);
    const data=shuffle(r,buildDataItems(r)).slice(0,PER_CHAPTER);
    return [...functions,...nums,...algo,...data].map((item,i)=>({...item,seq:i+1,localNo:(i%PER_CHAPTER)+1,chapterNo:Math.floor(i/PER_CHAPTER)+1,packageKey:`${version}-${hash32(seed+'|'+item.id+'|'+i).toString(36)}`}));
  }

  function config(){
    const c=roomState?.meta?.conceptGame||{};
    return {open:!!c.open,version:Math.max(1,Number(c.version||1)),startedAt:Number(c.startedAt||0)};
  }
  function blankAnswers(){return Array(TOTAL).fill(-1)}
  function normalizeAnswers(raw){
    const out=blankAnswers();
    if(Array.isArray(raw)) for(let i=0;i<Math.min(TOTAL,raw.length);i++){
      const n=Number(raw[i]);out[i]=Number.isInteger(n)&&n>=0&&n<=3?n:-1;
    }
    return out;
  }
  function progressFor(st){
    const c=config(),p=st?.conceptProgress||{};
    if(Number(p.version||0)!==c.version||Number(p.bankRev||0)!==BANK_REV)return {version:c.version,bankRev:BANK_REV,answers:blankAnswers(),correct:0,startedAt:0,updatedAt:0,completedAt:0};
    const answers=normalizeAnswers(p.answers),correct=Math.max(0,Math.min(TOTAL,Number(p.correct||0)));
    return {version:c.version,bankRev:BANK_REV,answers,correct,startedAt:Number(p.startedAt||0),updatedAt:Number(p.updatedAt||0),completedAt:Number(p.completedAt||0)};
  }
  function currentStudent(){return typeof getStudent==='function'?getStudent():roomState?.students?.[currentUser?.uid]}
  function studentPackage(){const st=currentStudent(),uid=currentUser?.uid||'';return st&&uid?makePackage(uid,st,config().version):[]}
  function isAnswered(v){return Number.isInteger(Number(v))&&Number(v)>=0&&Number(v)<=3}
  function answeredCount(answers){return answers.reduce((n,v)=>n+(isAnswered(v)?1:0),0)}
  function countCorrect(pkg,answers){
    let n=0;for(let i=0;i<TOTAL;i++)if(isAnswered(answers[i])&&pkg[i]&&Number(answers[i])===pkg[i].correct)n++;return n;
  }
  function scorePercent(pkg,answers){return Math.round(countCorrect(pkg,answers)/TOTAL*100)}
  function chapterByKey(key){return CHAPTERS.find(c=>c.key===key)||CHAPTERS[0]}
  function chapterProgress(chapter,answers){
    let answered=0;for(let i=chapter.start;i<chapter.end;i++)if(isAnswered(answers[i]))answered++;
    return answered;
  }
  function chapterCorrect(chapter,pkg,answers){
    let correct=0;for(let i=chapter.start;i<chapter.end;i++)if(isAnswered(answers[i])&&pkg[i]&&Number(answers[i])===pkg[i].correct)correct++;
    return correct;
  }
  function firstIncomplete(answers){return CHAPTERS.find(c=>chapterProgress(c,answers)<PER_CHAPTER)||CHAPTERS[CHAPTERS.length-1]}

  function visualHtml(item){
    const steps=(item.steps||[]).map((s,i)=>`<div class="concept-anim-step" style="--i:${i}"><span>${i+1}</span><b>${esc(s)}</b></div>`).join('');
    const demo=item.demo?`<div class="concept-demo-banner"><small>CONTOH SEDERHANA</small><strong>${esc(item.demo)}</strong></div>`:'';
    const helper=`<div class="concept-animation-helper"><span>▶</span><p>Ikuti animasinya pelan-pelan. Fokus pada pola dan fungsi, bukan menghafal.</p></div>`;
    if(item.visualKind==='stack')return `<div class="concept-visual concept-stack-visual concept-data-illustration" data-anim="${animationNonce}">${demo}<div class="concept-stack-scene" role="img" aria-label="Ilustrasi stack berupa tumpukan buku"><div class="concept-stack-arrow"><span>↓</span><b>PUSH</b><small>masuk dari atas</small></div><div class="concept-stack-frame"><em class="concept-stack-top">TOP</em><div class="concept-stack-boxes"><i>Buku 1</i><i>Buku 2</i><i>Buku 3</i><i>Buku 4</i></div><span class="concept-stack-base"></span></div><div class="concept-stack-pop"><span>↑</span><b>POP</b><small>keluar dari atas</small></div></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='queue')return `<div class="concept-visual concept-queue-visual concept-data-illustration" data-anim="${animationNonce}">${demo}<div class="concept-queue-scene" role="img" aria-label="Ilustrasi queue berupa antrean siswa"><div class="concept-queue-service"><span>LAYANAN</span><b>← keluar</b></div><div class="concept-queue-line"><i><span>👧</span><b>Alya</b><small>1</small></i><i><span>👦</span><b>Bima</b><small>2</small></i><i><span>👧</span><b>Citra</b><small>3</small></i><i><span>👦</span><b>Dimas</b><small>4</small></i></div><div class="concept-queue-entry"><b>masuk →</b><span>BELAKANG</span></div></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='record')return `<div class="concept-visual concept-record-visual concept-data-illustration" data-anim="${animationNonce}">${demo}<div class="concept-record-scene" role="img" aria-label="Ilustrasi record data seorang siswa"><div class="concept-record-person"><span>👩‍🎓</span><b>Satu siswa</b><small>satu objek</small></div><div class="concept-record-link">→</div><div class="concept-record-card"><div class="concept-record-head">RECORD SISWA</div><div class="concept-record-grid"><div><span>Nama</span><b>Alya</b></div><div><span>Kelas</span><b>VII N</b></div><div><span>Absen</span><b>12</b></div><div><span>Nilai</span><b>90</b></div></div></div></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='list')return `<div class="concept-visual concept-list-visual concept-data-illustration" data-anim="${animationNonce}">${demo}<div class="concept-list-scene" role="img" aria-label="Ilustrasi list berupa rangkaian item yang saling terhubung"><div class="concept-list-head"><small>AWAL</small><span>↓</span></div><div class="concept-list-chain"><div class="concept-list-node"><small>1</small><b>Buku</b></div><span>→</span><div class="concept-list-node"><small>2</small><b>Pensil</b></div><span>→</span><div class="concept-list-node"><small>3</small><b>Penghapus</b></div><span>→</span><div class="concept-list-node"><small>4</small><b>Penggaris</b></div><span class="concept-list-null">∅</span></div></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='tree')return `<div class="concept-visual concept-tree-visual" data-anim="${animationNonce}">${demo}<div class="concept-tree concept-tree-expanded" role="img" aria-label="Tree folder bertingkat"><ul class="tree-root"><li><div class="tree-node-wrap tree-level-1"><span class="tree-level-badge">1</span><b class="tree-node">Folder Utama</b></div><ul><li><div class="tree-node-wrap tree-level-2"><span class="tree-level-badge">2</span><b class="tree-node">Pelajaran</b></div><ul><li><div class="tree-node-wrap tree-level-3"><span class="tree-level-badge">3</span><b class="tree-node">Informatika</b></div><ul><li><div class="tree-node-wrap tree-level-4"><span class="tree-level-badge">4</span><b class="tree-node tree-leaf">Materi</b></div></li><li><div class="tree-node-wrap tree-level-4"><span class="tree-level-badge">4</span><b class="tree-node tree-leaf">Contoh</b></div></li></ul></li><li><div class="tree-node-wrap tree-level-3"><span class="tree-level-badge">3</span><b class="tree-node">Matematika</b></div><ul><li><div class="tree-node-wrap tree-level-4"><span class="tree-level-badge">4</span><b class="tree-node tree-leaf">Latihan</b></div></li><li><div class="tree-node-wrap tree-level-4"><span class="tree-level-badge">4</span><b class="tree-node tree-leaf">Nilai</b></div></li></ul></li></ul></li><li><div class="tree-node-wrap tree-level-2"><span class="tree-level-badge">2</span><b class="tree-node">Dokumen</b></div><ul><li><div class="tree-node-wrap tree-level-3"><span class="tree-level-badge">3</span><b class="tree-node">Foto</b></div></li><li><div class="tree-node-wrap tree-level-3"><span class="tree-level-badge">3</span><b class="tree-node">Arsip</b></div><ul><li><div class="tree-node-wrap tree-level-4"><span class="tree-level-badge">4</span><b class="tree-node tree-leaf">Liburan</b></div></li><li><div class="tree-node-wrap tree-level-4"><span class="tree-level-badge">4</span><b class="tree-node tree-leaf">Surat Lama</b></div></li></ul></li></ul></li></ul></li></ul></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='graph')return `<div class="concept-visual concept-graph-visual" data-anim="${animationNonce}">${demo}<div class="concept-graph concept-graph-expanded" role="img" aria-label="Graph pertemanan"><span class="graph-edge ge1"></span><span class="graph-edge ge2"></span><span class="graph-edge ge3"></span><i class="graph-node gn1">Alya</i><i class="graph-node gn2">Bima</i><i class="graph-node gn3">Citra</i><i class="graph-node gn4">Dimas</i><em class="graph-step gs1">1</em><em class="graph-step gs2">2</em><em class="graph-step gs3">3</em><span class="graph-complete"><em>4</em><b></b><b></b><b></b><b></b></span></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='array')return `<div class="concept-visual concept-array-visual concept-data-illustration" data-anim="${animationNonce}">${demo}<div class="concept-array-scene" role="img" aria-label="Ilustrasi array berupa lima kotak data yang berjajar dan memiliki indeks"><div class="concept-array-pointer"><span>↓</span><b>posisi / indeks</b></div><div class="concept-array-indices"><small>0</small><small>1</small><small>2</small><small>3</small><small>4</small></div><div class="concept-array-row"><i><span>🔴</span><b>Merah</b></i><i><span>🟡</span><b>Kuning</b></i><i><span>🟢</span><b>Hijau</b></i><i><span>🔵</span><b>Biru</b></i><i><span>🟣</span><b>Ungu</b></i></div><div class="concept-array-caption">Semua data tersusun <b>berjajar</b> dan setiap posisi dapat dikenali.</div></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='algorithm')return `<div class="concept-visual concept-algo-visual" data-anim="${animationNonce}">${demo}<div class="concept-flow"><i>MULAI</i><span>→</span><i>LANGKAH</i><span>→</span><i>HASIL</i></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    return `<div class="concept-visual concept-number-visual" data-anim="${animationNonce}">${demo}<div class="concept-number-roles"><i><b>BINER</b><span>dua keadaan</span></i><i><b>OKTAL</b><span>alternatif ringkas</span></i><i><b>DESIMAL</b><span>sehari-hari</span></i><i><b>HEKSA</b><span>kode teknis ringkas</span></i></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
  }

  function chapterNavHtml(active,p,answers){
    return `<div class="concept-chapter-nav">${CHAPTERS.map(c=>{const n=chapterProgress(c,answers),state=c.key===active?'active':n===PER_CHAPTER?'done':'locked';return `<div class="${state}"><span>${n===PER_CHAPTER?'✓':c.no}</span><b>${esc(c.label)}</b><small>${n}/${PER_CHAPTER}</small></div>`}).join('')}</div>`;
  }

  function functionSetsExplanation(){
    return `<span class="concept-question-kicker">BAB 1 • PELAJARI SATU SUBBAB PENUH</span>
      <h2>Fungsi dan Himpunan: dari Kumpulan Data sampai Fungsi Excel</h2>
      <p class="concept-explain-copy"><b>Himpunan</b> adalah kumpulan objek yang keanggotaannya dapat ditentukan dengan jelas. <b>Fungsi</b> adalah aturan yang menghubungkan masukan dengan keluaran. Dua gagasan ini saling berkaitan: dalam matematika, fungsi dapat dipandang sebagai hubungan dari satu himpunan input ke himpunan output. Dalam Excel, kata fungsi digunakan untuk rumus siap pakai seperti <code>SUM</code>, <code>AVERAGE</code>, <code>MAX</code>, <code>MIN</code>, dan <code>COUNT</code> yang membantu kita mengolah kumpulan data.</p>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>01</span><div><b>Apa itu himpunan?</b><small>Kumpulan objek dengan aturan keanggotaan yang jelas.</small></div></div>
        <p>Himpunan adalah kumpulan benda, angka, nama, atau objek lain yang dapat kita tentukan anggotanya secara jelas. Contoh: <b>A = {2, 4, 6, 8}</b> adalah himpunan bilangan genap kecil. Kita dapat memutuskan bahwa 4 termasuk A, sedangkan 5 tidak termasuk A. Himpunan biasanya diberi nama dengan huruf kapital seperti A, B, atau C dan anggotanya ditulis di dalam kurung kurawal.</p>
        <div class="concept-set-intro"><div><small>HIMPUNAN A</small><strong>{ 2, 4, 6, 8 }</strong><span>anggota yang memenuhi aturan</span></div><div class="concept-set-arrow">→</div><div><small>PERTANYAAN</small><strong>Apakah 6 anggota A?</strong><span>Ya, karena 6 tercantum dan sesuai aturan.</span></div></div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>02</span><div><b>Apa itu fungsi?</b><small>Input diproses oleh aturan lalu menghasilkan output.</small></div></div>
        <p>Secara sederhana, fungsi dapat dibayangkan seperti sebuah mesin. Kita memasukkan <b>input</b>, mesin menggunakan satu aturan, lalu menghasilkan <b>output</b>. Dalam fungsi matematika, setiap anggota himpunan input harus memiliki <b>tepat satu</b> hasil. Dua input yang berbeda boleh saja menghasilkan output yang sama, tetapi satu input tidak boleh memiliki dua hasil berbeda pada fungsi yang sama.</p>
        <div class="concept-function-machine" role="img" aria-label="Ilustrasi fungsi sebagai mesin input proses output"><div class="cfm-input"><small>INPUT</small><b>3</b></div><span class="cfm-arrow">→</span><div class="cfm-machine"><small>ATURAN</small><b>× 2</b><i>fungsi</i></div><span class="cfm-arrow">→</span><div class="cfm-output"><small>OUTPUT</small><b>6</b></div></div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>03</span><div><b>Fungsi pada Excel</b><small>Rumus siap pakai untuk mengolah kumpulan data.</small></div></div>
        <p>Di Excel, fungsi adalah rumus bawaan yang menerima data dari sel atau rentang sel lalu menghasilkan suatu hasil. Fungsi membantu kita bekerja lebih cepat, mengurangi penulisan rumus panjang, dan membuat langkah pengolahan data lebih mudah dibaca.</p>
        <div class="concept-excel-mini" role="img" aria-label="Ilustrasi lembar Excel dan contoh fungsi"><div class="cem-sheet"><div class="cem-head"><b>A</b><b>B</b></div><div><span>Nilai</span><strong>70</strong></div><div><span>Nilai</span><strong>80</strong></div><div><span>Nilai</span><strong>90</strong></div><div><span>Nilai</span><strong>100</strong></div></div><div class="cem-formula"><small>RUMUS</small><b>=AVERAGE(B2:B5)</b><span>↓</span><strong>85</strong><em>hasil rata-rata</em></div></div>
        <div class="concept-conversion-table-wrap"><table class="concept-conversion-table"><thead><tr><th>Fungsi Excel</th><th>Kegunaan</th><th>Contoh</th><th>Makna</th></tr></thead><tbody><tr><th>SUM</th><td>Menjumlahkan angka</td><td><code>=SUM(B2:B5)</code></td><td>Jumlah seluruh angka B2 sampai B5</td></tr><tr><th>AVERAGE</th><td>Mencari rata-rata</td><td><code>=AVERAGE(B2:B5)</code></td><td>Rata-rata angka pada rentang</td></tr><tr><th>MAX</th><td>Mencari nilai terbesar</td><td><code>=MAX(B2:B5)</code></td><td>Angka tertinggi pada rentang</td></tr><tr><th>MIN</th><td>Mencari nilai terkecil</td><td><code>=MIN(B2:B5)</code></td><td>Angka terendah pada rentang</td></tr><tr><th>COUNT</th><td>Menghitung banyak data angka</td><td><code>=COUNT(B2:B5)</code></td><td>Berapa sel yang berisi angka</td></tr><tr><th>IF</th><td>Memilih hasil berdasarkan kondisi</td><td><code>=IF(B2&gt;=75,"Lulus","Belum")</code></td><td>Jika kondisi benar, pilih hasil pertama; jika salah, hasil kedua</td></tr></tbody></table></div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>04</span><div><b>Hubungan fungsi dan himpunan</b><small>Domain → kodomain, dan hasil yang terpakai disebut range.</small></div></div>
        <p>Dalam matematika, fungsi menghubungkan dua himpunan. <b>Domain</b> adalah himpunan semua input. <b>Kodomain</b> adalah himpunan tujuan yang disediakan. <b>Range</b> adalah anggota kodomain yang benar-benar mendapat pasangan. Agar hubungan itu disebut fungsi, setiap anggota domain harus mempunyai tepat satu panah menuju kodomain.</p>
        <div class="concept-function-map" role="img" aria-label="Diagram pemetaan fungsi dari domain ke kodomain"><div class="cfmap-set"><small>DOMAIN A</small><i>1</i><i>2</i><i>3</i></div><div class="cfmap-lines"><span>1 → A</span><span>2 → B</span><span>3 → B</span></div><div class="cfmap-set output"><small>KODOMAIN B</small><i>A</i><i>B</i><i>C</i></div></div><div class="concept-chapter-key"><b>Perhatikan</b><p>Semua anggota domain 1, 2, dan 3 memiliki tepat satu pasangan. A dan B adalah <b>range</b> karena mendapat panah. C tetap bagian dari kodomain, tetapi bukan range pada contoh ini.</p></div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>05</span><div><b>Jenis-jenis himpunan</b><small>Gunakan ilustrasi untuk melihat hubungan antarhimpunan.</small></div></div>
        <div class="concept-set-types">
          <article><h3>Himpunan Kosong</h3><div class="set-figure empty"><span class="set-universe">U</span><i>A</i><b>∅</b></div><p>Tidak mempunyai anggota. Contoh: himpunan bilangan asli antara 2 dan 3.</p></article>
          <article><h3>Himpunan Semesta</h3><div class="set-figure universe"><span class="set-universe">U</span><i>A</i><i>B</i></div><p>Himpunan yang memuat semua objek yang sedang dibicarakan.</p></article>
          <article><h3>Himpunan Bagian</h3><div class="set-figure subset"><span class="set-universe">A</span><i>B</i></div><p>B ⊂ A jika setiap anggota B juga merupakan anggota A.</p></article>
          <article><h3>Himpunan Sama</h3><div class="set-figure equal"><i>A</i><i>B</i><b>{1,2,3}</b></div><p>Dua himpunan sama jika anggotanya persis sama.</p></article>
          <article><h3>Himpunan Beririsan</h3><div class="set-figure intersect"><i>A</i><i>B</i><b>A ∩ B</b></div><p>Memiliki satu atau lebih anggota yang sama. Bagian bertumpuk menunjukkan irisan.</p></article>
          <article><h3>Himpunan Saling Lepas</h3><div class="set-figure disjoint"><i>A</i><i>B</i><b>∩ = ∅</b></div><p>Tidak mempunyai anggota yang sama, sehingga kedua lingkaran tidak bertumpuk.</p></article>
        </div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>06</span><div><b>Ringkasan hubungan konsep</b><small>Himpunan menyusun data, fungsi memberi aturan hubungan atau pengolahan.</small></div></div>
        <div class="concept-conversion-table-wrap"><table class="concept-conversion-table"><thead><tr><th>Konsep</th><th>Pertanyaan sederhana</th><th>Contoh</th></tr></thead><tbody><tr><th>Himpunan</th><td>Objek apa saja yang menjadi anggota?</td><td>A = {2,4,6}</td></tr><tr><th>Fungsi matematika</th><td>Setiap input menuju output apa?</td><td>1→A, 2→B, 3→B</td></tr><tr><th>Fungsi Excel</th><td>Data akan diolah dengan aturan apa?</td><td>SUM, AVERAGE, MAX, MIN, COUNT, IF</td></tr><tr><th>Domain</th><td>Apa saja nilai masukannya?</td><td>{1,2,3}</td></tr><tr><th>Kodomain</th><td>Hasil apa saja yang tersedia?</td><td>{A,B,C}</td></tr><tr><th>Range</th><td>Hasil mana yang benar-benar terpakai?</td><td>{A,B}</td></tr></tbody></table></div>
      </section>`;
  }

  function numberExplanation(){
    const synthetic={visualKind:'number',demo:'Kenali basis → pahami simbol → pilih cara konversi → periksa hasil.',steps:['Kenali basis sistem asal dan tujuan','Ke desimal: gunakan nilai tempat','Dari desimal: bagi berulang dengan basis tujuan','Biner ↔ oktal/heksa: kelompokkan digit']};
    return `<span class="concept-question-kicker">BAB 2 • PELAJARI SATU SUBBAB PENUH</span>
      <h2>Sistem Bilangan: Biner, Oktal, Desimal, dan Heksadesimal</h2>
      <p class="concept-explain-copy">Sistem bilangan adalah <b>cara menuliskan dan mewakili suatu nilai</b> menggunakan kumpulan simbol serta aturan tertentu. Dalam informatika kita tidak hanya memakai desimal. Komputer, perangkat digital, dan pekerjaan teknis juga sering memakai biner, oktal, dan heksadesimal. Keempatnya dapat mewakili nilai yang sama, tetapi cara menulisnya berbeda karena <b>basis</b> yang digunakan berbeda.</p>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>01</span><div><b>Pengertian dasar</b><small>Apa yang dimaksud sistem bilangan dan basis?</small></div></div>
        <p>Sebuah sistem bilangan memiliki <b>basis</b>, yaitu banyaknya simbol dasar yang tersedia sebelum penulisan berpindah ke posisi berikutnya. Desimal berbasis 10 karena memakai sepuluh simbol 0–9. Biner berbasis 2 karena hanya memakai 0 dan 1. Nilai sebuah digit juga dipengaruhi oleh <b>posisinya</b>. Karena itu, angka yang sama dapat mempunyai makna berbeda ketika berada pada posisi atau sistem yang berbeda.</p>
        <div class="concept-number-foundation">
          <article><b>Simbol</b><span>Tanda yang boleh dipakai, misalnya 0 dan 1 pada biner.</span></article>
          <article><b>Basis</b><span>Jumlah simbol dasar yang digunakan oleh suatu sistem.</span></article>
          <article><b>Nilai tempat</b><span>Posisi digit menentukan nilainya, dari kanan ke kiri semakin besar.</span></article>
        </div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>02</span><div><b>Jenis-jenis sistem bilangan</b><small>Kenali pengertian, simbol, dan contoh masing-masing.</small></div></div>
        <div class="concept-number-system-grid">
          <article class="concept-number-system-card binary"><div class="concept-base-chip">Basis 2</div><h3>Biner</h3><p>Biner hanya memakai <b>0 dan 1</b>. Sistem ini sangat dekat dengan cara kerja perangkat digital karena dua simbol tersebut mudah dipakai untuk mewakili dua keadaan, seperti mati/menyala atau tidak aktif/aktif.</p><div class="concept-number-example"><small>Contoh</small><strong>1011<sub>2</sub></strong><span>Dibaca sebagai bilangan biner, bukan “seribu sebelas”.</span></div></article>
          <article class="concept-number-system-card octal"><div class="concept-base-chip">Basis 8</div><h3>Oktal</h3><p>Oktal memakai delapan simbol, yaitu <b>0 sampai 7</b>. Oktal dapat digunakan sebagai bentuk penulisan yang lebih ringkas daripada deretan biner pada konteks komputer tertentu.</p><div class="concept-number-example"><small>Contoh</small><strong>157<sub>8</sub></strong><span>Digit 8 dan 9 tidak digunakan dalam sistem oktal.</span></div></article>
          <article class="concept-number-system-card decimal"><div class="concept-base-chip">Basis 10</div><h3>Desimal</h3><p>Desimal memakai sepuluh simbol, yaitu <b>0 sampai 9</b>. Ini adalah sistem yang paling sering kita gunakan dalam kehidupan sehari-hari, misalnya untuk harga, umur, nilai, jumlah barang, dan nomor.</p><div class="concept-number-example"><small>Contoh</small><strong>245<sub>10</sub></strong><span>Jika tidak diberi tanda basis, biasanya manusia menganggapnya desimal.</span></div></article>
          <article class="concept-number-system-card hex"><div class="concept-base-chip">Basis 16</div><h3>Heksadesimal</h3><p>Heksadesimal memakai enam belas simbol: <b>0–9 dan A–F</b>. Huruf A, B, C, D, E, F dipakai sebagai simbol tambahan untuk nilai 10 sampai 15. Sistem ini sering dipakai agar data teknis lebih ringkas.</p><div class="concept-number-example"><small>Contoh</small><strong>2F<sub>16</sub></strong><span>A=10, B=11, C=12, D=13, E=14, dan F=15.</span></div></article>
        </div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>03</span><div><b>Bagaimana nilai sebuah bilangan terbentuk?</b><small>Gunakan nilai tempat dari kanan ke kiri.</small></div></div>
        <p>Posisi paling kanan bernilai <b>basis<sup>0</sup></b>, posisi berikutnya basis<sup>1</sup>, lalu basis<sup>2</sup>, dan seterusnya. Cara ini membantu kita memahami mengapa bilangan dari sistem yang berbeda dapat diubah ke desimal.</p>
        <div class="concept-placevalue-demo"><div><span>1</span><span>0</span><span>1</span><span>1</span><small>1011<sub>2</sub></small></div><div class="concept-placevalue-arrow">↓</div><p><b>1×2³</b> + <b>0×2²</b> + <b>1×2¹</b> + <b>1×2⁰</b> = 8 + 0 + 2 + 1 = <strong>11<sub>10</sub></strong></p></div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>04</span><div><b>Cara konversi ke desimal</b><small>Kalikan setiap digit dengan nilai tempatnya, lalu jumlahkan.</small></div></div>
        <div class="concept-conversion-grid">
          <article class="concept-conversion-card"><h3>Biner → Desimal</h3><div class="concept-conversion-formula">1011<sub>2</sub></div><ol><li>Mulai dari kanan: 2⁰, 2¹, 2², 2³.</li><li>Kalikan setiap digit dengan nilai tempatnya.</li><li>Jumlahkan hasilnya.</li></ol><strong>1011<sub>2</sub> = 11<sub>10</sub></strong></article>
          <article class="concept-conversion-card"><h3>Oktal → Desimal</h3><div class="concept-conversion-formula">17<sub>8</sub></div><ol><li>Gunakan nilai tempat berbasis 8.</li><li>1×8¹ + 7×8⁰.</li><li>8 + 7 = 15.</li></ol><strong>17<sub>8</sub> = 15<sub>10</sub></strong></article>
          <article class="concept-conversion-card"><h3>Heksa → Desimal</h3><div class="concept-conversion-formula">2A<sub>16</sub></div><ol><li>Ingat A mewakili 10.</li><li>2×16¹ + 10×16⁰.</li><li>32 + 10 = 42.</li></ol><strong>2A<sub>16</sub> = 42<sub>10</sub></strong></article>
        </div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>05</span><div><b>Cara mengubah desimal ke sistem lain</b><small>Bagi berulang dengan basis tujuan, catat sisa, lalu baca sisa dari bawah ke atas.</small></div></div>
        <div class="concept-conversion-grid">
          <article class="concept-conversion-card division"><h3>Desimal → Biner</h3><div class="concept-conversion-formula">13<sub>10</sub> → ?<sub>2</sub></div><ol><li>13 ÷ 2 = 6 sisa <b>1</b></li><li>6 ÷ 2 = 3 sisa <b>0</b></li><li>3 ÷ 2 = 1 sisa <b>1</b></li><li>1 ÷ 2 = 0 sisa <b>1</b></li></ol><strong>Baca dari bawah: 1101<sub>2</sub></strong></article>
          <article class="concept-conversion-card division"><h3>Desimal → Oktal</h3><div class="concept-conversion-formula">25<sub>10</sub> → ?<sub>8</sub></div><ol><li>25 ÷ 8 = 3 sisa <b>1</b></li><li>3 ÷ 8 = 0 sisa <b>3</b></li></ol><strong>Baca dari bawah: 31<sub>8</sub></strong></article>
          <article class="concept-conversion-card division"><h3>Desimal → Heksa</h3><div class="concept-conversion-formula">42<sub>10</sub> → ?<sub>16</sub></div><ol><li>42 ÷ 16 = 2 sisa <b>10</b> = A</li><li>2 ÷ 16 = 0 sisa <b>2</b></li></ol><strong>Baca dari bawah: 2A<sub>16</sub></strong></article>
        </div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>06</span><div><b>Konversi cepat yang melibatkan biner</b><small>Gunakan kelompok digit agar tidak perlu menghitung panjang.</small></div></div>
        <div class="concept-binary-shortcuts">
          <article><div><b>Biner ↔ Oktal</b><span>Kelompokkan biner per <strong>3 digit</strong> dari kanan.</span></div><p>111010<sub>2</sub> → 111 | 010 → 7 | 2 → <b>72<sub>8</sub></b></p><small>Untuk arah sebaliknya, setiap satu digit oktal diubah menjadi tiga digit biner.</small></article>
          <article><div><b>Biner ↔ Heksadesimal</b><span>Kelompokkan biner per <strong>4 digit</strong> dari kanan.</span></div><p>10101111<sub>2</sub> → 1010 | 1111 → A | F → <b>AF<sub>16</sub></b></p><small>Untuk arah sebaliknya, setiap satu digit heksa diubah menjadi empat digit biner.</small></article>
          <article><div><b>Oktal ↔ Heksadesimal</b><span>Paling mudah memakai biner sebagai jembatan.</span></div><p>17<sub>8</sub> → 001 | 111<sub>2</sub> → 1111<sub>2</sub> → <b>F<sub>16</sub></b></p><small>Bisa juga diubah ke desimal terlebih dahulu, lalu dari desimal ke sistem tujuan.</small></article>
        </div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>07</span><div><b>Ringkasan cara memilih metode</b><small>Lihat sistem asal dan sistem tujuan terlebih dahulu.</small></div></div>
        <div class="concept-conversion-table-wrap"><table class="concept-conversion-table"><thead><tr><th>Dari</th><th>Ke desimal</th><th>Ke biner</th><th>Ke oktal</th><th>Ke heksa</th></tr></thead><tbody><tr><th>Biner</th><td>Nilai tempat basis 2</td><td>—</td><td>Kelompok 3 bit</td><td>Kelompok 4 bit</td></tr><tr><th>Oktal</th><td>Nilai tempat basis 8</td><td>1 digit → 3 bit</td><td>—</td><td>Lewat biner/desimal</td></tr><tr><th>Desimal</th><td>—</td><td>Bagi 2 berulang</td><td>Bagi 8 berulang</td><td>Bagi 16 berulang</td></tr><tr><th>Heksa</th><td>Nilai tempat basis 16</td><td>1 digit → 4 bit</td><td>Lewat biner/desimal</td><td>—</td></tr></tbody></table></div>
      </section>

      <div class="concept-chapter-key"><b>Ingat tiga aturan sederhana</b><p><b>1)</b> Kenali basisnya. <b>2)</b> Jika menuju desimal, gunakan nilai tempat. <b>3)</b> Jika berangkat dari desimal, lakukan pembagian berulang dengan basis tujuan. Untuk biner–oktal dan biner–heksa, pengelompokan digit biasanya paling cepat.</p></div>
      ${visualHtml(synthetic)}`;
  }

  function algorithmExplanation(){
    const synthetic={visualKind:'algorithm',demo:'Tujuan → urutan → keputusan bila perlu → pengulangan bila perlu → periksa hasil',steps:['Sequence: kerjakan langkah sesuai urutan','Selection: pilih tindakan berdasarkan kondisi','Loop: ulangi langkah yang sama','Debugging: cari, perbaiki, lalu uji kembali']};
    return `<span class="concept-question-kicker">BAB 3 • PELAJARI SATU SUBBAB PENUH</span>
      <h2>Algoritma: Sequence, Selection, Loop, dan Debugging</h2>
      <p class="concept-explain-copy">Algoritma adalah <b>urutan langkah yang logis, jelas, dan dapat diikuti untuk menyelesaikan suatu masalah atau mencapai tujuan</b>. Kita memakai cara berpikir algoritmik setiap hari, misalnya ketika membuat minuman, berangkat ke sekolah, mencari sebuah buku, atau mengikuti petunjuk permainan. Dalam komputer, algoritma sangat penting karena komputer tidak dapat menebak maksud manusia. Komputer hanya menjalankan perintah yang diberikan kepadanya. Karena itu, langkah dalam algoritma harus disusun dengan jelas, urut, dan tidak membingungkan.</p>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>01</span><div><b>Pengertian algoritma</b><small>Algoritma bukan sekadar daftar kegiatan, tetapi langkah yang membawa kita menuju tujuan.</small></div></div>
        <p>Sebuah algoritma biasanya dimulai dari <b>tujuan</b>, lalu berisi beberapa <b>langkah</b>, dan berakhir ketika tujuan tercapai. Langkah yang baik harus dapat dipahami orang lain, memiliki urutan yang masuk akal, dan tidak menimbulkan banyak tafsir. Jika satu langkah salah atau hilang, hasil akhirnya juga dapat salah.</p>
        <div class="concept-number-foundation">
          <article><b>Tujuan</b><span>Kita harus mengetahui apa yang ingin dicapai, misalnya membuat teh atau masuk ke sebuah aplikasi.</span></article>
          <article><b>Langkah jelas</b><span>Setiap langkah harus mudah dimengerti dan dapat dilakukan satu per satu.</span></article>
          <article><b>Hasil</b><span>Algoritma selesai ketika tujuan sudah tercapai atau proses sudah berhenti dengan benar.</span></article>
        </div>
        <div class="concept-number-example"><small>CONTOH SEDERHANA</small><strong>Membuat teh</strong><span>Siapkan gelas → masukkan teh → tuang air → aduk → teh siap. Jika urutannya kacau, hasilnya bisa tidak sesuai.</span></div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>02</span><div><b>Sequence • urutan langkah</b><small>Langkah dikerjakan satu per satu dari awal sampai akhir.</small></div></div>
        <p><b>Sequence</b> atau urutan adalah bentuk algoritma paling dasar. Pada sequence, langkah pertama dilakukan terlebih dahulu, kemudian langkah kedua, ketiga, dan seterusnya. Tidak ada pilihan jalan dan tidak ada pengulangan. Sequence cocok digunakan ketika semua langkah memang harus dilakukan dalam urutan tertentu.</p>
        <div class="concept-conversion-grid">
          <article class="concept-conversion-card"><h3>Contoh sehari-hari</h3><div class="concept-conversion-formula">Bangun → mandi → memakai seragam → sarapan → berangkat</div><ol><li>Setiap kegiatan memiliki urutan.</li><li>Beberapa langkah tidak masuk akal jika dibalik.</li><li>Setelah langkah terakhir, tujuan tercapai.</li></ol><strong>Intinya: satu langkah dilanjutkan ke langkah berikutnya.</strong></article>
          <article class="concept-conversion-card"><h3>Contoh di komputer</h3><div class="concept-conversion-formula">Buka aplikasi → ketik nama → tekan masuk</div><ol><li>Aplikasi harus dibuka dahulu.</li><li>Nama dimasukkan setelah halaman siap.</li><li>Tombol masuk ditekan setelah data tersedia.</li></ol><strong>Urutan yang benar membuat proses dapat berjalan.</strong></article>
          <article class="concept-conversion-card"><h3>Kapan dipakai?</h3><div class="concept-conversion-formula">1 → 2 → 3 → 4</div><ol><li>Ketika semua langkah harus dijalankan.</li><li>Ketika tidak ada kondisi pilihan.</li><li>Ketika tidak ada bagian yang perlu diulang.</li></ol><strong>Kata kunci: berurutan, satu per satu, dari awal ke akhir.</strong></article>
        </div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>03</span><div><b>Selection • pilihan berdasarkan kondisi</b><small>Algoritma dapat memilih tindakan yang berbeda sesuai keadaan.</small></div></div>
        <p><b>Selection</b> atau percabangan digunakan ketika sebuah tindakan bergantung pada suatu <b>kondisi</b>. Algoritma akan memeriksa keadaan terlebih dahulu, kemudian memilih tindakan yang sesuai. Jadi, tidak semua orang atau semua keadaan harus menjalankan langkah yang sama.</p>
        <div class="concept-conversion-grid">
          <article class="concept-conversion-card"><h3>Contoh sehari-hari</h3><div class="concept-conversion-formula">Jika hujan → bawa payung<br>Jika tidak hujan → tidak perlu payung</div><ol><li>Periksa kondisi cuaca.</li><li>Pilih tindakan yang sesuai.</li><li>Hanya satu cabang yang dijalankan sesuai keadaan.</li></ol><strong>Keputusan berubah karena kondisinya berubah.</strong></article>
          <article class="concept-conversion-card"><h3>Contoh di komputer</h3><div class="concept-conversion-formula">Jika password benar → masuk<br>Jika salah → tampilkan pesan</div><ol><li>Sistem memeriksa password.</li><li>Jika benar, pengguna masuk.</li><li>Jika salah, sistem memberi peringatan.</li></ol><strong>Program memilih tindakan berdasarkan hasil pemeriksaan.</strong></article>
          <article class="concept-conversion-card"><h3>Pola sederhana</h3><div class="concept-conversion-formula">JIKA kondisi → lakukan A<br>JIKA TIDAK → lakukan B</div><ol><li>Harus ada sesuatu yang diperiksa.</li><li>Hasil pemeriksaan menentukan jalur.</li><li>Cabang dapat berjumlah dua atau lebih.</li></ol><strong>Kata kunci: jika, apabila, kalau, benar/salah, ya/tidak.</strong></article>
        </div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>04</span><div><b>Loop • perulangan</b><small>Langkah yang sama dapat dilakukan berkali-kali tanpa ditulis berulang.</small></div></div>
        <p><b>Loop</b> atau perulangan digunakan ketika suatu tindakan harus dilakukan lebih dari satu kali. Daripada menuliskan perintah yang sama berkali-kali, kita cukup menentukan tindakan apa yang diulang dan kapan pengulangan berhenti. Loop membuat algoritma lebih singkat dan mudah dibaca.</p>
        <div class="concept-conversion-grid">
          <article class="concept-conversion-card"><h3>Contoh berdasarkan jumlah</h3><div class="concept-conversion-formula">Ulangi 5 kali → tepuk tangan 1 kali</div><ol><li>Tentukan tindakan: tepuk tangan.</li><li>Tentukan jumlah pengulangan: 5 kali.</li><li>Setelah pengulangan ke-5, proses berhenti.</li></ol><strong>Hasil: tepuk dilakukan 5 kali.</strong></article>
          <article class="concept-conversion-card"><h3>Contoh berdasarkan kondisi</h3><div class="concept-conversion-formula">Selama masih ada buku → masukkan 1 buku ke tas</div><ol><li>Periksa apakah masih ada buku.</li><li>Jika ada, lakukan tindakan.</li><li>Jika sudah tidak ada, berhenti.</li></ol><strong>Loop dapat berhenti karena suatu kondisi sudah tidak terpenuhi.</strong></article>
          <article class="concept-conversion-card"><h3>Hal yang perlu diperhatikan</h3><div class="concept-conversion-formula">ULANGI → CEK → BERHENTI</div><ol><li>Harus jelas apa yang diulang.</li><li>Harus jelas berapa kali atau sampai kapan.</li><li>Tanpa aturan berhenti, loop dapat terus berjalan.</li></ol><strong>Kata kunci: ulangi, setiap, selama, sampai.</strong></article>
        </div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>05</span><div><b>Debugging • mencari dan memperbaiki kesalahan</b><small>Jika hasil tidak sesuai, periksa prosesnya langkah demi langkah.</small></div></div>
        <p><b>Debugging</b> adalah proses mencari penyebab kesalahan atau <i>bug</i>, memperbaikinya, lalu mencoba kembali. Kesalahan tidak selalu berarti seluruh algoritma salah. Kadang hanya ada satu langkah yang tertukar, kurang, berlebihan, atau menggunakan kondisi yang salah. Karena itu debugging dilakukan secara sistematis, bukan sekadar menebak.</p>
        <div class="concept-conversion-grid">
          <article class="concept-conversion-card"><h3>Contoh sederhana</h3><div class="concept-conversion-formula">1. Tuang air<br>2. Ambil gelas<br>3. Masukkan teh</div><ol><li>Hasilnya tidak masuk akal.</li><li>Periksa dari langkah pertama.</li><li>Temukan bahwa gelas seharusnya disiapkan sebelum menuang air.</li></ol><strong>Perbaikan: Ambil gelas → masukkan teh → tuang air.</strong></article>
          <article class="concept-conversion-card"><h3>Langkah debugging</h3><div class="concept-conversion-formula">Temukan → Periksa → Perbaiki → Uji lagi</div><ol><li>Bandingkan hasil dengan yang seharusnya.</li><li>Cari langkah yang menyebabkan masalah.</li><li>Perbaiki bagian tersebut.</li><li>Jalankan kembali untuk memastikan sudah benar.</li></ol><strong>Debugging selesai ketika proses bekerja sesuai tujuan.</strong></article>
          <article class="concept-conversion-card"><h3>Contoh di komputer</h3><div class="concept-conversion-formula">Klik tombol → tidak terjadi apa-apa</div><ol><li>Periksa apakah tombol memiliki perintah.</li><li>Periksa apakah kondisi yang dibutuhkan terpenuhi.</li><li>Perbaiki kesalahan lalu uji tombol lagi.</li></ol><strong>Tujuannya bukan menyalahkan, tetapi menemukan bagian yang perlu diperbaiki.</strong></article>
        </div>
      </section>

      <section class="concept-number-section">
        <div class="concept-number-section-title"><span>06</span><div><b>Membedakan empat konsep</b><small>Lihat ciri utama dari masalah yang sedang dihadapi.</small></div></div>
        <div class="concept-conversion-table-wrap"><table class="concept-conversion-table"><thead><tr><th>Konsep</th><th>Fungsi utama</th><th>Ciri yang mudah dikenali</th><th>Contoh</th></tr></thead><tbody><tr><th>Sequence</th><td>Menjalankan langkah secara urut</td><td>Langkah 1 → 2 → 3</td><td>Membuat teh</td></tr><tr><th>Selection</th><td>Memilih tindakan</td><td>Ada kondisi “jika”</td><td>Jika hujan, bawa payung</td></tr><tr><th>Loop</th><td>Mengulang tindakan</td><td>Ada “ulangi”, “selama”, atau jumlah tertentu</td><td>Ulangi tepuk 5 kali</td></tr><tr><th>Debugging</th><td>Memperbaiki kesalahan</td><td>Hasil tidak sesuai lalu diperiksa</td><td>Mencari langkah yang tertukar</td></tr></tbody></table></div>
      </section>

      <div class="concept-chapter-key"><b>Ingat cara membedakannya</b><p><b>Sequence</b> menjawab “langkah apa dulu?”. <b>Selection</b> menjawab “jika kondisi berbeda, tindakan mana yang dipilih?”. <b>Loop</b> menjawab “bagian mana yang perlu diulang?”. <b>Debugging</b> menjawab “bagian mana yang salah dan bagaimana memperbaikinya?”. Dalam satu algoritma, keempat konsep ini dapat digunakan bersama-sama.</p></div>
      ${visualHtml(synthetic)}`;
  }

  function dataExplanation(){
    const arrayVisual={visualKind:'array',demo:'Array menyimpan data dalam urutan tetap, misalnya daftar warna atau nilai.',steps:['Data diletakkan berjajar dari kiri ke kanan','Setiap kotak memuat satu nilai','Posisi membantu kita menemukan data','Array cocok untuk data yang rapi dan berurutan']};
    const recordVisual={visualKind:'record',demo:'Satu record menyimpan beberapa informasi berbeda milik satu objek yang sama.',steps:['Mulai dari satu objek, misalnya satu siswa','Setiap bagian menyimpan jenis data yang berbeda','Semua bagian tetap milik objek yang sama','Record cocok untuk data rinci tentang satu hal']};
    const listVisual={visualKind:'list',demo:'List menyimpan data sebagai rangkaian item yang dapat ditelusuri satu per satu.',steps:['Data pertama dihubungkan ke data berikutnya','Kita bisa bergerak dari item awal ke item sesudahnya','Urutan tetap terlihat jelas','List cocok untuk data yang dibaca berantai']};
    const stackVisual={visualKind:'stack',demo:'Stack seperti tumpukan buku. Yang terakhir diletakkan akan paling atas.',steps:['Buku pertama diletakkan di bawah','Buku baru ditaruh di atas buku sebelumnya','Yang paling atas paling mudah diambil','Pola ini disebut terakhir masuk, pertama keluar']};
    const queueVisual={visualKind:'queue',demo:'Queue seperti antrean. Yang datang lebih dulu ada di depan.',steps:['Orang pertama berdiri di depan','Orang berikutnya masuk ke belakang','Pelayanan dimulai dari bagian depan','Pola ini disebut pertama masuk, pertama keluar']};
    const treeVisual={visualKind:'tree',demo:'Tree: satu induk dapat bercabang menjadi beberapa anak.',steps:['Mulai dari satu induk','Turun menjadi beberapa cabang','Cabang dapat memiliki anak lagi','Semakin ke bawah, bagian dapat bertambah']};
    const graphVisual={visualKind:'graph',demo:'Graph: titik-titik dapat saling terhubung tanpa harus bertingkat.',steps:['Alya terhubung Bima','Alya terhubung Citra','Bima terhubung Dimas','Terbentuk jaringan hubungan']};
    return `<span class="concept-question-kicker">BAB 4 • PELAJARI SATU SUBBAB PENUH</span><h2>Struktur Data: Array, Record, List, Stack, Queue, Tree, dan Graph</h2><p class="concept-explain-copy">Struktur data adalah cara menata data supaya mudah disimpan, dicari, dan digunakan. Setiap bentuk memiliki fungsi yang berbeda. <b>Array</b> cocok untuk data berurutan, <b>record</b> cocok untuk menyimpan beberapa informasi milik satu objek, <b>list</b> cocok untuk rangkaian item, <b>stack</b> cocok untuk tumpukan, <b>queue</b> cocok untuk antrean, <b>tree</b> cocok untuk hubungan bertingkat, dan <b>graph</b> cocok untuk jaringan hubungan.</p><div class="concept-chapter-cards seven"><article><span>01</span><b>Array</b><p>Data berjajar dalam urutan tertentu seperti deretan loker.</p></article><article><span>02</span><b>Record</b><p>Satu data berisi beberapa bagian, misalnya nama, kelas, dan nilai.</p></article><article><span>03</span><b>List</b><p>Data disusun sebagai rangkaian item yang dapat ditelusuri satu demi satu.</p></article><article><span>04</span><b>Stack</b><p>Seperti tumpukan buku: yang terakhir masuk berada paling atas.</p></article><article><span>05</span><b>Queue</b><p>Seperti antrean: yang datang lebih dulu berada di depan.</p></article><article><span>06</span><b>Tree</b><p>Hubungan bertingkat dari induk ke anak, misalnya folder dan subfolder.</p></article><article><span>07</span><b>Graph</b><p>Jaringan hubungan antar titik, misalnya pertemanan beberapa siswa.</p></article></div><div class="concept-subvisual-title"><b>Array • data berjajar berurutan</b><span>Perhatikan setiap kotak memiliki posisi yang jelas.</span></div>${visualHtml(arrayVisual)}<div class="concept-subvisual-title"><b>Record • satu data, banyak bagian</b><span>Satu siswa dapat punya nama, kelas, absen, dan nilai.</span></div>${visualHtml(recordVisual)}<div class="concept-subvisual-title"><b>List • rangkaian item</b><span>Item dibaca satu demi satu mengikuti urutan.</span></div>${visualHtml(listVisual)}<div class="concept-subvisual-title"><b>Stack • tumpukan</b><span>Yang terakhir masuk berada di atas dan diambil lebih dulu.</span></div>${visualHtml(stackVisual)}<div class="concept-subvisual-title"><b>Queue • antrean</b><span>Yang datang lebih dulu berada di depan dan dilayani lebih dulu.</span></div>${visualHtml(queueVisual)}<div class="concept-subvisual-title"><b>Tree • hubungan bertingkat</b><span>Perhatikan jumlah cabang yang bertambah ketika turun.</span></div>${visualHtml(treeVisual)}<div class="concept-subvisual-title"><b>Graph • jaringan hubungan</b><span>Hubungan dapat menyilang dan tidak harus memiliki satu induk.</span></div>${visualHtml(graphVisual)}`;
  }

  function chapterExplanationHtml(key){
    if(key==='functions')return functionSetsExplanation();
    if(key==='numbers')return numberExplanation();
    if(key==='algorithm')return algorithmExplanation();
    if(key==='data')return dataExplanation();
    return functionSetsExplanation();
  }

  function questionCardHtml(item,index,p){
    const selected=Number(p.answers[index]),answered=isAnswered(selected),ok=answered&&selected===item.correct;
    return `<article class="concept-chapter-question-card ${answered?(ok?'answered correct':'answered wrong'):''}"><div class="concept-chapter-question-head"><span>Soal ${item.localNo}</span>${answered?`<b>${ok?'✓ Benar':'! Belum tepat'}</b>`:'<b>ABCD</b>'}</div><h3>${esc(item.question)}</h3><div class="concept-chapter-options">${item.options.map((op,i)=>{let cls='';if(answered&&i===item.correct)cls+=' correct';if(answered&&i===selected&&i!==item.correct)cls+=' wrong';if(answered&&i===selected)cls+=' selected';return `<button type="button" class="${cls.trim()}" ${(answered||answerBusyIndex>=0)?'disabled':''} onclick="DMConceptGame.answerAt(${index},${i})"><span>${String.fromCharCode(65+i)}</span><b>${esc(op)}</b></button>`}).join('')}</div>${answered?`<div class="concept-chapter-rationale"><b>${ok?'Tepat.':'Jawaban yang tepat: '+esc(item.options[item.correct])}</b><p>${esc(item.rationale)}</p></div>`:''}</article>`;
  }

  function questionsHtml(chapter,pkg,p){
    const answered=chapterProgress(chapter,p.answers),correct=chapterCorrect(chapter,pkg,p.answers),remaining=PER_CHAPTER-answered;
    const items=[];for(let i=chapter.start;i<chapter.end;i++)items.push(questionCardHtml(pkg[i],i,p));
    const last=chapter.no===CHAPTERS.length;
    const action=answered===PER_CHAPTER
      ?`<button type="button" class="btn primary concept-chapter-next" onclick="${last?'DMConceptGame.finish()':'DMConceptGame.nextChapter()'}">${last?'Lihat Hasil Akhir':'Lanjut ke '+esc(CHAPTERS[chapter.no].label)} →</button>`
      :`<div class="concept-chapter-locknote"><b>${remaining} soal lagi</b><span>Selesaikan 10 soal pada bab ini untuk membuka halaman berikutnya.</span></div>`;
    return `<aside class="concept-chapter-questions"><div class="concept-chapter-questions-head"><div><span>10 SOAL ABCD • BAB ${chapter.no}</span><h2>${esc(chapter.label)}</h2></div><div><strong>${answered}/10</strong><small>${correct} benar</small></div></div><div class="concept-chapter-question-list">${items.join('')}</div>${action}</aside>`;
  }

  function renderStudent(){
    const host=q('studentConceptWorkspace');if(!host||!roomState||!currentUser)return;
    const st=currentStudent();if(!st)return;
    const cfg=config(),pkg=studentPackage(),p=progressFor(st),answered=answeredCount(p.answers),score=scorePercent(pkg,p.answers),done=answered>=TOTAL;
    if(lastSeenVersion!==cfg.version){lastSeenVersion=cfg.version;activeChapter='';answerBusyIndex=-1;showFinal=false}
    if(!activeChapter)activeChapter=firstIncomplete(p.answers).key;
    const chapter=chapterByKey(activeChapter);
    q('studentGroup')&&(q('studentGroup').textContent='Individu');
    q('studentHeaderMembers')&&(q('studentHeaderMembers').textContent='4 bab');
    q('studentHeaderRound')&&(q('studentHeaderRound').textContent=`Bab ${chapter.no}/4 • ${chapter.label}`);
    q('studentTimer')&&(q('studentTimer').textContent='--:--');
    q('studentScore')&&(q('studentScore').textContent=String(score));
    const prog=q('conceptStudentProgressBar');if(prog)prog.style.width=`${Math.round(answered/TOTAL*100)}%`;
    q('conceptStudentProgressText')&&(q('conceptStudentProgressText').textContent=`${answered}/${TOTAL}`);
    q('conceptStudentScore')&&(q('conceptStudentScore').textContent=`${score}/100`);
    q('conceptStudentIdentity')&&(q('conceptStudentIdentity').textContent=`${st.name} • ${st.cls}`);
    const body=q('conceptStudentBody');if(!body)return;
    if(!cfg.open){body.innerHTML=`<div class="concept-wait-card"><div class="concept-wait-icon">◈</div><span>MISI KONSEP</span><h2>Menunggu guru membuka sesi</h2><p>Materi disusun menjadi 4 halaman bab: Fungsi & Himpunan, Sistem Bilangan, Algoritma, dan Struktur Data. Setiap bab memiliki penjelasan lengkap di kiri dan 10 soal ABCD di kanan.</p><button type="button" class="btn secondary" onclick="openStudentGameSelector()">← Kembali ke Pilih Game</button></div>`;return}
    if(done&&showFinal){
      body.innerHTML=`<div class="concept-complete-card"><div class="concept-complete-mark">✓</div><span>SEMUA BAB SELESAI</span><h2>${esc(st.name)}, kamu menyelesaikan 40 soal.</h2><p>Nilai dihitung sebagai persentase jawaban benar dari seluruh 40 soal.</p><strong class="concept-final-score">${score}<small>/100</small></strong><div class="concept-topic-result">${CHAPTERS.map(c=>`<div><span>${esc(c.label)}</span><b>${chapterCorrect(c,pkg,p.answers)}/10</b></div>`).join('')}</div><button type="button" class="btn secondary" onclick="openStudentGameSelector()">← Kembali ke Pilih Game</button></div>`;return
    }
    animationNonce++;
    body.innerHTML=`<article class="concept-chapter-shell">${chapterNavHtml(chapter.key,p,p.answers)}<div class="concept-chapter-layout"><section class="concept-chapter-explain"><div class="concept-chapter-headline"><span class="concept-topic-pill ${chapter.key}">${esc(chapter.topicLabel)}</span><strong>Bab ${chapter.no}/4</strong></div>${chapterExplanationHtml(chapter.key)}<div class="concept-explain-actions"><button type="button" class="btn secondary" onclick="DMConceptGame.replay()">↻ Ulangi animasi</button></div></section>${questionsHtml(chapter,pkg,p)}</div></article>`;
  }

  async function answerAt(index,choice){
    if(answerBusyIndex>=0||!db||!currentUser||!config().open)return;
    const st=currentStudent();if(!st)return;
    const pkg=studentPackage(),p=progressFor(st),item=pkg[index];if(!item||index<0||index>=TOTAL||isAnswered(p.answers[index]))return;
    const chapter=chapterByKey(activeChapter);if(index<chapter.start||index>=chapter.end)return;
    const selected=Math.max(0,Math.min(3,Number(choice))),answers=p.answers.slice();answers[index]=selected;
    answerBusyIndex=index;renderStudent();
    const correct=countCorrect(pkg,answers),ts=now(),done=answeredCount(answers)>=TOTAL;
    const next={version:config().version,bankRev:BANK_REV,answers,correct,startedAt:p.startedAt||ts,updatedAt:ts,completedAt:done?ts:0};
    try{await db.ref(`${roomPath(currentCode)}/students/${currentUser.uid}/conceptProgress`).set(next)}catch(err){console.error('Misi Konsep answer:',err);alert('Jawaban belum tersimpan. Periksa koneksi lalu coba lagi.')}finally{answerBusyIndex=-1;renderStudent()}
  }

  function nextChapter(){
    const st=currentStudent();if(!st)return;const p=progressFor(st),chapter=chapterByKey(activeChapter);
    if(chapterProgress(chapter,p.answers)<PER_CHAPTER)return;
    const next=CHAPTERS[chapter.no];if(next){activeChapter=next.key;showFinal=false;window.scrollTo({top:0,behavior:'smooth'});renderStudent()}
  }
  function finish(){
    const st=currentStudent();if(!st)return;const p=progressFor(st);if(answeredCount(p.answers)<TOTAL)return;showFinal=true;window.scrollTo({top:0,behavior:'smooth'});renderStudent();
  }
  function replay(){animationNonce++;renderStudent()}
  function closeStudent(){activeChapter='';answerBusyIndex=-1;showFinal=false}
  function showQuestion(){renderStudent()}
  function backToExplain(){renderStudent()}
  function next(){nextChapter()}

  function renderTeacher(){
    const host=q('teacherGameWorkspaceConcept');if(!host||!roomState)return;
    const cfg=config(),students=Object.entries(typeof getStudents==='function'?getStudents():(roomState.students||{})).sort((a,b)=>String(a[1]?.cls||'').localeCompare(String(b[1]?.cls||''))||String(a[1]?.name||'').localeCompare(String(b[1]?.name||'')));
    const rows=students.map(([uid,st])=>{const p=progressFor(st),pkg=makePackage(uid,st,cfg.version),answered=answeredCount(p.answers),score=scorePercent(pkg,p.answers),current=firstIncomplete(p.answers);return {uid,st,p,pkg,answered,score,current,done:answered>=TOTAL}});
    const started=rows.filter(x=>x.answered>0).length,done=rows.filter(x=>x.done).length;
    const avgProgress=rows.length?Math.round(rows.reduce((s,x)=>s+x.answered/TOTAL*100,0)/rows.length):0;
    const completedScores=rows.filter(x=>x.done).map(x=>x.score),avgScore=completedScores.length?Math.round(completedScores.reduce((a,b)=>a+b,0)/completedScores.length):0;
    q('conceptTeacherStatus')&&(q('conceptTeacherStatus').textContent=cfg.open?'Sedang dibuka':'Dijeda');
    q('conceptTeacherStudents')&&(q('conceptTeacherStudents').textContent=String(rows.length));
    q('conceptTeacherStarted')&&(q('conceptTeacherStarted').textContent=String(started));
    q('conceptTeacherFinished')&&(q('conceptTeacherFinished').textContent=String(done));
    q('conceptTeacherAvg')&&(q('conceptTeacherAvg').textContent=`${avgProgress}%`);
    q('conceptTeacherScoreAvg')&&(q('conceptTeacherScoreAvg').textContent=completedScores.length?`${avgScore}`:'—');
    q('conceptTeacherVersion')&&(q('conceptTeacherVersion').textContent=`Paket V${cfg.version}`);
    const openBtn=q('conceptOpenBtn'),pauseBtn=q('conceptPauseBtn');if(openBtn)openBtn.disabled=!isHost?.()||cfg.open;if(pauseBtn)pauseBtn.disabled=!isHost?.()||!cfg.open;
    const tbody=q('conceptTeacherBody');
    if(tbody)tbody.innerHTML=rows.length?rows.map((x,i)=>{const chapterCount=x.done?10:chapterProgress(x.current,x.p.answers),current=x.done?'Selesai':`${x.current.label} ${chapterCount}/10`;return `<tr><td>${i+1}</td><td><b>${esc(x.st.name||'Siswa')}</b></td><td>${esc(x.st.cls||'—')}</td><td><div class="concept-mini-progress"><i style="width:${Math.round(x.answered/TOTAL*100)}%"></i></div><small>${x.answered}/${TOTAL}</small></td><td><span class="concept-table-score">${x.score}</span></td><td>${esc(current)}</td><td><span class="concept-status-tag ${x.done?'done':x.answered?'working':'idle'}">${x.done?'Selesai':x.answered?'Mengerjakan':'Belum mulai'}</span></td><td><div class="concept-row-actions"><button type="button" onclick="DMConceptGame.preview('${esc(x.uid)}')">Lihat Paket</button><button type="button" class="danger" onclick="DMConceptGame.resetStudent('${esc(x.uid)}')">Reset</button></div></td></tr>`}).join(''):`<tr><td colspan="8"><div class="concept-empty">Belum ada siswa yang masuk.</div></td></tr>`;
    if(previewUid){const exists=rows.find(x=>x.uid===previewUid);if(exists)renderPreview(exists.uid,exists.st,exists.p,exists.pkg);else previewUid=''}
  }

  function renderPreview(uid,st,p,pkg){
    const panel=q('conceptTeacherPreview');if(!panel)return;panel.classList.remove('hidden');
    panel.innerHTML=`<div class="concept-preview-head"><div><span>PAKET INDIVIDUAL • 4 BAB</span><h3>${esc(st.name)} • ${esc(st.cls||'')}</h3><p>Setiap bab berisi 10 soal. Urutan soal dan opsi tetap deterministik untuk siswa ini selama versi sesi tidak di-reset.</p></div><button type="button" onclick="DMConceptGame.closePreview()">×</button></div><div class="concept-preview-chapters">${CHAPTERS.map(c=>`<section><div><b>Bab ${c.no} • ${esc(c.label)}</b><span>${chapterProgress(c,p.answers)}/10 selesai</span></div><ol>${pkg.slice(c.start,c.end).map((it,i)=>`<li class="${isAnswered(p.answers[c.start+i])?'answered':''}"><span>${i+1}</span>${esc(it.question)}</li>`).join('')}</ol></section>`).join('')}</div>`;
    panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function preview(uid){const st=(typeof getStudents==='function'?getStudents():roomState?.students||{})[uid];if(!st)return;previewUid=uid;const p=progressFor(st),pkg=makePackage(uid,st,config().version);renderPreview(uid,st,p,pkg)}
  function closePreview(){previewUid='';q('conceptTeacherPreview')?.classList.add('hidden')}

  function studentSummary(uid,st){
    if(!st)return {answered:0,total:TOTAL,score:0,done:false,started:false,status:'Belum mulai',updatedAt:0};
    const p=progressFor(st),pkg=makePackage(uid,st,config().version),answered=answeredCount(p.answers),score=scorePercent(pkg,p.answers),done=answered>=TOTAL,current=firstIncomplete(p.answers);
    return {answered,total:TOTAL,score,done,started:answered>0,status:done?'Selesai':answered>0?`${current.label} ${chapterProgress(current,p.answers)}/10`:'Sudah masuk',updatedAt:Number(p.updatedAt||0)};
  }

  async function setOpen(open){
    if(!isHost?.()||!db)return;
    try{const base=`${roomPath(currentCode)}/meta/conceptGame`,updates={open:!!open,updatedAt:firebase.database.ServerValue.TIMESTAMP};if(open&&!config().startedAt)updates.startedAt=firebase.database.ServerValue.TIMESTAMP;await db.ref(base).update(updates)}catch(err){console.error(err);alert('Status Misi Konsep belum dapat diubah: '+(err.message||err))}
  }
  async function resetAll(){
    if(!isHost?.()||!db)return;if(!confirm('Acak ulang paket dan hapus seluruh progres Misi Konsep siswa? Tiga permainan lain tidak akan terpengaruh.'))return;
    const students=typeof getStudents==='function'?getStudents():(roomState?.students||{}),nextVersion=config().version+1,updates={};
    updates[`${roomPath(currentCode)}/meta/conceptGame/version`]=nextVersion;updates[`${roomPath(currentCode)}/meta/conceptGame/open`]=false;updates[`${roomPath(currentCode)}/meta/conceptGame/startedAt`]=0;updates[`${roomPath(currentCode)}/meta/conceptGame/updatedAt`]=firebase.database.ServerValue.TIMESTAMP;
    Object.keys(students).forEach(uid=>updates[`${roomPath(currentCode)}/students/${uid}/conceptProgress`]=null);
    try{await db.ref().update(updates);previewUid='';closePreview()}catch(err){console.error(err);alert('Reset belum berhasil: '+(err.message||err))}
  }
  async function resetStudent(uid){
    if(!isHost?.()||!db)return;const st=(typeof getStudents==='function'?getStudents():(roomState?.students||{}))[uid];if(!st)return;if(!confirm(`Reset progres Misi Konsep untuk ${st.name}?`))return;
    try{await db.ref(`${roomPath(currentCode)}/students/${uid}/conceptProgress`).remove();if(previewUid===uid)closePreview()}catch(err){console.error(err);alert('Reset siswa belum berhasil: '+(err.message||err))}
  }

  window.DMConceptGame={
    renderStudent,renderTeacher,showQuestion,replay,backToExplain,next,nextChapter,finish,answerAt,closeStudent,preview,closePreview,
    answer:(choice)=>{const st=currentStudent();if(!st)return;const p=progressFor(st),c=chapterByKey(activeChapter),idx=Math.max(c.start,Math.min(c.end-1,c.start+chapterProgress(c,p.answers)));return answerAt(idx,choice)},
    open:()=>setOpen(true),pause:()=>setOpen(false),resetAll,resetStudent,makePackage,studentSummary
  };
})();
