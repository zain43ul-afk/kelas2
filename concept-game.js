/* Digital Mission — Misi Konsep Informatika
   Game 4: Struktur Bilangan, Struktur Data, dan Algoritma.
   Isolated module: tidak mengubah algoritma tiga permainan lama. */
(function(){
  'use strict';

  const TOTAL=20;
  const BANK_REV=3; // Struktur Bilangan deskriptif: tanpa hitungan dan hafalan
  const TOPIC_LABELS={numbers:'Struktur Bilangan',data:'Struktur Data',algorithm:'Algoritma'};
  const TOPIC_SHORT={numbers:'Bilangan',data:'Data',algorithm:'Algoritma'};
  let phase='explain';
  let review=null;
  let answerBusy=false;
  let previewUid='';
  let animationNonce=0;
  let lastSeenVersion=0;

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
  function bin(n,w=0){return n.toString(2).padStart(w,'0')}
  function oct(n){return n.toString(8)}
  function hex(n){return n.toString(16).toUpperCase()}

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
      a.push(withOptions(r,itemBase('data','d-tree','Tree = Struktur Bertingkat',`Tree cocok untuk data yang bertingkat dari induk ke anak. Contoh paling dekat adalah folder: satu folder utama dapat mempunyai beberapa subfolder, lalu subfolder dapat mempunyai isi lagi. Bentuknya seperti cabang pohon.`,`Folder Utama → Pelajaran → Informatika paling cocok digambarkan dengan ...`,`Hubungan dari folder utama ke subfolder adalah hubungan bertingkat, sehingga cocok dengan tree.`,'tree',['Mulai dari Folder Utama','Di bawahnya ada Pelajaran','Di bawahnya ada Informatika','Terbentuk tingkat/cabang'],'Folder Utama ↳ Pelajaran ↳ Informatika'),'Tree / pohon',['Queue / antrean','Stack / tumpukan','Array satu baris']));
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
    const seed=`concept-bank${BANK_REV}|v${version}|${uid}|${st?.name||''}|${st?.cls||''}`;
    const r=rngFrom(seed);
    const nums=shuffle(r,buildNumberItems(r)).slice(0,7);
    const data=shuffle(r,buildDataItems(r)).slice(0,7);
    const algo=shuffle(r,buildAlgorithmItems(r)).slice(0,6);
    return shuffle(r,[...nums,...data,...algo]).map((item,i)=>({...item,seq:i+1,packageKey:`${version}-${hash32(seed+'|'+item.id+'|'+i).toString(36)}`}));
  }

  function config(){
    const c=roomState?.meta?.conceptGame||{};
    return {open:!!c.open,version:Math.max(1,Number(c.version||1)),startedAt:Number(c.startedAt||0)};
  }
  function progressFor(st){
    const c=config();
    const p=st?.conceptProgress||{};
    if(Number(p.version||0)!==c.version||Number(p.bankRev||0)!==BANK_REV)return {version:c.version,bankRev:BANK_REV,answers:[],correct:0,startedAt:0,updatedAt:0,completedAt:0};
    const answers=Array.isArray(p.answers)?p.answers.slice(0,TOTAL).map(v=>Number(v)) : [];
    return {version:c.version,bankRev:BANK_REV,answers,correct:Math.max(0,Math.min(TOTAL,Number(p.correct||0))),startedAt:Number(p.startedAt||0),updatedAt:Number(p.updatedAt||0),completedAt:Number(p.completedAt||0)};
  }
  function currentStudent(){return typeof getStudent==='function'?getStudent():roomState?.students?.[currentUser?.uid]}
  function studentPackage(){const st=currentStudent(),uid=currentUser?.uid||'';return st&&uid?makePackage(uid,st,config().version):[]}

  function visualHtml(item){
    const steps=(item.steps||[]).map((s,i)=>`<div class="concept-anim-step" style="--i:${i}"><span>${i+1}</span><b>${esc(s)}</b></div>`).join('');
    const demo=item.demo?`<div class="concept-demo-banner"><small>CONTOH SEDERHANA</small><strong>${esc(item.demo)}</strong></div>`:'';
    const helper=`<div class="concept-animation-helper"><span>▶</span><p>Ikuti langkahnya dari kiri ke kanan. Tidak perlu cepat; pahami satu langkah sebelum melihat langkah berikutnya.</p></div>`;
    if(item.visualKind==='stack')return `<div class="concept-visual concept-stack-visual" data-anim="${animationNonce}">${demo}<div class="concept-stack-boxes"><i>1</i><i>2</i><i>3</i><i>4</i></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='queue')return `<div class="concept-visual concept-queue-visual" data-anim="${animationNonce}">${demo}<div class="concept-queue-line"><i>1</i><i>2</i><i>3</i><i>4</i><em>→</em></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='tree')return `<div class="concept-visual concept-tree-visual" data-anim="${animationNonce}">${demo}<div class="concept-tree"><b>UTAMA</b><span></span><div><i>A</i><i>B</i></div><small></small><div class="leafs"><i>A1</i><i>A2</i></div></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='graph')return `<div class="concept-visual concept-graph-visual" data-anim="${animationNonce}">${demo}<div class="concept-graph"><i class="n1">A</i><i class="n2">B</i><i class="n3">C</i><i class="n4">D</i><span class="e1"></span><span class="e2"></span><span class="e3"></span><span class="e4"></span></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='array')return `<div class="concept-visual concept-array-visual" data-anim="${animationNonce}">${demo}<div class="concept-array-row"><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='algorithm')return `<div class="concept-visual concept-algo-visual" data-anim="${animationNonce}">${demo}<div class="concept-flow"><i>MULAI</i><span>→</span><i>LANGKAH</i><span>→</span><i>HASIL</i></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
    return `<div class="concept-visual concept-number-visual" data-anim="${animationNonce}">${demo}<div class="concept-number-roles"><i><b>BINER</b><span>dua keadaan</span></i><i><b>DESIMAL</b><span>sehari-hari</span></i><i><b>OKTAL</b><span>alternatif</span></i><i><b>HEKSA</b><span>lebih ringkas</span></i></div>${helper}<div class="concept-anim-steps">${steps}</div></div>`;
  }

  function renderStudent(){
    const host=q('studentConceptWorkspace');
    if(!host||!roomState||!currentUser)return;
    const st=currentStudent();if(!st)return;
    const cfg=config();
    if(lastSeenVersion!==cfg.version){lastSeenVersion=cfg.version;phase='explain';review=null;answerBusy=false}
    const pkg=studentPackage(), p=progressFor(st), answered=p.answers.length, score=countCorrect(pkg,p.answers)*5, done=answered>=TOTAL;
    q('studentGroup')&&(q('studentGroup').textContent='Individu');
    q('studentHeaderMembers')&&(q('studentHeaderMembers').textContent='20 misi');
    q('studentHeaderRound')&&(q('studentHeaderRound').textContent=`Misi Konsep ${Math.min(answered+1,TOTAL)}/${TOTAL}`);
    q('studentTimer')&&(q('studentTimer').textContent='--:--');
    q('studentScore')&&(q('studentScore').textContent=String(score));
    const prog=q('conceptStudentProgressBar');if(prog)prog.style.width=`${Math.round(answered/TOTAL*100)}%`;
    q('conceptStudentProgressText')&&(q('conceptStudentProgressText').textContent=`${answered}/${TOTAL}`);
    q('conceptStudentScore')&&(q('conceptStudentScore').textContent=`${score}/100`);
    q('conceptStudentIdentity')&&(q('conceptStudentIdentity').textContent=`${st.name} • ${st.cls}`);

    const body=q('conceptStudentBody');if(!body)return;
    if(!cfg.open){
      phase='explain';review=null;
      body.innerHTML=`<div class="concept-wait-card"><div class="concept-wait-icon">◈</div><span>MISI KONSEP</span><h2>Menunggu guru membuka sesi</h2><p>Paket 20 soalmu sudah disiapkan secara individual. Materi mencakup Struktur Bilangan, Struktur Data, dan Algoritma.</p><button type="button" class="btn secondary" onclick="openStudentGameSelector()">← Kembali ke Pilih Game</button></div>`;
      return;
    }
    if(done){
      const by=topicSummary(pkg,p.answers);
      body.innerHTML=`<div class="concept-complete-card"><div class="concept-complete-mark">✓</div><span>MISI SELESAI</span><h2>${esc(st.name)}, kamu menuntaskan 20 misi.</h2><p>Nilai akhir dihitung dari 20 jawaban, masing-masing bernilai 5 poin.</p><strong class="concept-final-score">${score}<small>/100</small></strong><div class="concept-topic-result">${Object.keys(TOPIC_LABELS).map(k=>`<div><span>${esc(TOPIC_LABELS[k])}</span><b>${by[k].correct}/${by[k].answered}</b></div>`).join('')}</div><button type="button" class="btn secondary" onclick="openStudentGameSelector()">← Kembali ke Pilih Game</button></div>`;
      return;
    }
    const idx=review?review.index:answered;
    const item=pkg[idx];if(!item){body.innerHTML='<div class="notice bad">Paket soal tidak dapat dimuat. Kembali ke Pilih Game lalu buka lagi.</div>';return}
    const topic=TOPIC_LABELS[item.topic]||item.topic;
    if(review&&review.index===idx){
      const ok=review.choice===item.correct;
      body.innerHTML=`<article class="concept-question-shell feedback ${ok?'correct':'wrong'}"><div class="concept-q-head"><span class="concept-topic-pill ${item.topic}">${esc(topic)}</span><strong>Misi ${idx+1}/${TOTAL}</strong></div><div class="concept-feedback-icon">${ok?'✓':'!'}</div><h2>${ok?'Jawaban tepat':'Belum tepat'}</h2><p class="concept-feedback-answer">Jawaban benar: <b>${esc(item.options[item.correct])}</b></p><div class="concept-rationale"><b>Mengapa?</b><p>${esc(item.rationale)}</p></div><button type="button" class="btn primary concept-next-btn" onclick="DMConceptGame.next()">${idx+1>=TOTAL?'Lihat Hasil Akhir':'Lanjut ke Misi Berikutnya'} →</button></article>`;
      return;
    }
    if(phase==='question'){
      body.innerHTML=`<article class="concept-question-shell"><div class="concept-q-head"><span class="concept-topic-pill ${item.topic}">${esc(topic)}</span><strong>Misi ${idx+1}/${TOTAL}</strong></div><span class="concept-question-kicker">SOAL PEMAHAMAN • TELITI PILIHANNYA</span><h2>${esc(item.question)}</h2><div class="concept-options">${item.options.map((op,i)=>`<button type="button" ${answerBusy?'disabled':''} onclick="DMConceptGame.answer(${i})"><span>${String.fromCharCode(65+i)}</span><b>${esc(op)}</b></button>`).join('')}</div><div class="concept-question-note">Pilih satu jawaban yang paling tepat. Jika masih ragu, kamu boleh melihat penjelasan lagi sebelum menjawab.</div><button type="button" class="concept-back-explain" onclick="DMConceptGame.backToExplain()">← Lihat penjelasan lagi</button></article>`;
      return;
    }
    animationNonce++;
    body.innerHTML=`<article class="concept-explain-shell"><div class="concept-q-head"><span class="concept-topic-pill ${item.topic}">${esc(topic)}</span><strong>Misi ${idx+1}/${TOTAL}</strong></div><span class="concept-question-kicker">PELAJARI PELAN-PELAN</span><h2>${esc(item.title)}</h2><p class="concept-explain-copy">${esc(item.explain)}</p><div class="concept-read-tip"><b>Tips belajar:</b> perhatikan contoh dan animasi langkah demi langkah. Setelah merasa paham, baru lanjut ke soal.</div>${visualHtml(item)}<div class="concept-explain-actions"><button type="button" class="btn secondary" onclick="DMConceptGame.replay()">↻ Ulangi animasi</button><button type="button" class="btn primary" onclick="DMConceptGame.showQuestion()">Lanjut ke Soal →</button></div></article>`;
  }

  function countCorrect(pkg,answers){
    return answers.reduce((sum,choice,i)=>sum+(pkg[i]&&Number(choice)===pkg[i].correct?1:0),0);
  }

  function topicSummary(pkg,answers){
    const out={numbers:{answered:0,correct:0},data:{answered:0,correct:0},algorithm:{answered:0,correct:0}};
    answers.forEach((choice,i)=>{const it=pkg[i];if(!it||!out[it.topic])return;out[it.topic].answered++;if(Number(choice)===it.correct)out[it.topic].correct++});
    return out;
  }

  async function answer(choice){
    if(answerBusy||!db||!currentUser||!config().open)return;
    const st=currentStudent();if(!st)return;
    const pkg=studentPackage(),p=progressFor(st),idx=p.answers.length,item=pkg[idx];if(!item||idx>=TOTAL)return;
    const selected=Math.max(0,Math.min(3,Number(choice)));
    answerBusy=true;renderStudent();
    const answers=p.answers.concat(selected),correct=countCorrect(pkg,answers),ts=now();
    const next={version:config().version,bankRev:BANK_REV,answers,correct,startedAt:p.startedAt||ts,updatedAt:ts,completedAt:answers.length>=TOTAL?ts:0};
    try{
      await db.ref(`${roomPath(currentCode)}/students/${currentUser.uid}/conceptProgress`).set(next);
      review={index:idx,choice:selected};phase='explain';
    }catch(err){
      console.error('Misi Konsep answer:',err);
      alert('Jawaban belum tersimpan. Periksa koneksi lalu coba lagi.');
    }finally{answerBusy=false;renderStudent()}
  }
  function showQuestion(){if(!config().open)return;phase='question';review=null;renderStudent()}
  function replay(){animationNonce++;renderStudent()}
  function backToExplain(){phase='explain';review=null;renderStudent()}
  function next(){review=null;phase='explain';renderStudent()}
  function closeStudent(){phase='explain';review=null;answerBusy=false}

  function renderTeacher(){
    const host=q('teacherGameWorkspaceConcept');if(!host||!roomState)return;
    const cfg=config(),students=Object.entries(typeof getStudents==='function'?getStudents():(roomState.students||{})).sort((a,b)=>String(a[1]?.cls||'').localeCompare(String(b[1]?.cls||''))||String(a[1]?.name||'').localeCompare(String(b[1]?.name||'')));
    const rows=students.map(([uid,st])=>{const p=progressFor(st),pkg=makePackage(uid,st,cfg.version),by=topicSummary(pkg,p.answers);return {uid,st,p,pkg,by,answered:p.answers.length,score:countCorrect(pkg,p.answers)*5,done:p.answers.length>=TOTAL}});
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
    if(tbody)tbody.innerHTML=rows.length?rows.map((x,i)=>{
      const current=x.done?'Selesai':x.answered?`${TOPIC_SHORT[x.pkg[x.answered]?.topic]||'Misi'} #${x.answered+1}`:'Belum mulai';
      return `<tr><td>${i+1}</td><td><b>${esc(x.st.name||'Siswa')}</b></td><td>${esc(x.st.cls||'—')}</td><td><div class="concept-mini-progress"><i style="width:${Math.round(x.answered/TOTAL*100)}%"></i></div><small>${x.answered}/${TOTAL}</small></td><td><span class="concept-table-score">${x.score}</span></td><td>${esc(current)}</td><td><span class="concept-status-tag ${x.done?'done':x.answered?'working':'idle'}">${x.done?'Selesai':x.answered?'Mengerjakan':'Belum mulai'}</span></td><td><div class="concept-row-actions"><button type="button" onclick="DMConceptGame.preview('${esc(x.uid)}')">Lihat Paket</button><button type="button" class="danger" onclick="DMConceptGame.resetStudent('${esc(x.uid)}')">Reset</button></div></td></tr>`;
    }).join(''):`<tr><td colspan="8"><div class="concept-empty">Belum ada siswa yang masuk.</div></td></tr>`;
    if(previewUid){const exists=rows.find(x=>x.uid===previewUid);if(exists)renderPreview(exists.uid,exists.st,exists.p,exists.pkg);else previewUid=''}
  }

  function renderPreview(uid,st,p,pkg){
    const panel=q('conceptTeacherPreview');if(!panel)return;
    panel.classList.remove('hidden');
    panel.innerHTML=`<div class="concept-preview-head"><div><span>PAKET INDIVIDUAL</span><h3>${esc(st.name)} • ${esc(st.cls||'')}</h3><p>Urutan dan variasi angka ditentukan secara deterministik dari identitas siswa dan versi sesi.</p></div><button type="button" onclick="DMConceptGame.closePreview()">×</button></div><div class="concept-preview-grid">${pkg.map((it,i)=>`<article class="${i<p.answers.length?'answered':''} ${i===p.answers.length?'current':''}"><span>${i+1}</span><div><b>${esc(TOPIC_LABELS[it.topic])}</b><small>${esc(it.title)}</small></div></article>`).join('')}</div>`;
    panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function preview(uid){
    const st=(typeof getStudents==='function'?getStudents():roomState?.students||{})[uid];if(!st)return;
    previewUid=uid;const p=progressFor(st),pkg=makePackage(uid,st,config().version);renderPreview(uid,st,p,pkg)
  }
  function closePreview(){previewUid='';q('conceptTeacherPreview')?.classList.add('hidden')}

  // Ringkasan aman untuk dashboard utama guru. Nilai dihitung dari paket aktif
  // sehingga progres versi lama tidak tercampur dengan versi soal saat ini.
  function studentSummary(uid,st){
    if(!st)return {answered:0,total:TOTAL,score:0,done:false,started:false,status:'Belum mulai',updatedAt:0};
    const p=progressFor(st),pkg=makePackage(uid,st,config().version);
    const answered=p.answers.length,score=countCorrect(pkg,p.answers)*5,done=answered>=TOTAL;
    return {
      answered,total:TOTAL,score,done,started:answered>0,
      status:done?'Selesai':answered>0?'Mengerjakan':'Sudah masuk',
      updatedAt:Number(p.updatedAt||0)
    };
  }

  async function setOpen(open){
    if(!isHost?.()||!db)return;
    try{
      const base=`${roomPath(currentCode)}/meta/conceptGame`;
      const updates={open:!!open,updatedAt:firebase.database.ServerValue.TIMESTAMP};
      if(open&&!config().startedAt)updates.startedAt=firebase.database.ServerValue.TIMESTAMP;
      await db.ref(base).update(updates);
    }catch(err){console.error(err);alert('Status Misi Konsep belum dapat diubah: '+(err.message||err))}
  }
  async function resetAll(){
    if(!isHost?.()||!db)return;
    if(!confirm('Acak ulang paket dan hapus seluruh progres Misi Konsep siswa? Tiga permainan lain tidak akan terpengaruh.'))return;
    const students=typeof getStudents==='function'?getStudents():(roomState?.students||{}),nextVersion=config().version+1,updates={};
    updates[`${roomPath(currentCode)}/meta/conceptGame/version`]=nextVersion;
    updates[`${roomPath(currentCode)}/meta/conceptGame/open`]=false;
    updates[`${roomPath(currentCode)}/meta/conceptGame/startedAt`]=0;
    updates[`${roomPath(currentCode)}/meta/conceptGame/updatedAt`]=firebase.database.ServerValue.TIMESTAMP;
    Object.keys(students).forEach(uid=>updates[`${roomPath(currentCode)}/students/${uid}/conceptProgress`]=null);
    try{await db.ref().update(updates);previewUid='';closePreview()}catch(err){console.error(err);alert('Reset belum berhasil: '+(err.message||err))}
  }
  async function resetStudent(uid){
    if(!isHost?.()||!db)return;
    const st=(typeof getStudents==='function'?getStudents():(roomState?.students||{}))[uid];if(!st)return;
    if(!confirm(`Reset progres Misi Konsep untuk ${st.name}?`))return;
    try{await db.ref(`${roomPath(currentCode)}/students/${uid}/conceptProgress`).remove();if(previewUid===uid)closePreview()}catch(err){console.error(err);alert('Reset siswa belum berhasil: '+(err.message||err))}
  }

  window.DMConceptGame={
    renderStudent,renderTeacher,showQuestion,replay,backToExplain,next,answer,closeStudent,preview,closePreview,
    open:()=>setOpen(true),pause:()=>setOpen(false),resetAll,resetStudent,
    makePackage,studentSummary
  };
})();
