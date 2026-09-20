/* Digital Mission — Misi Konsep Informatika
   Game 4: Struktur Bilangan, Struktur Data, dan Algoritma.
   Isolated module: tidak mengubah algoritma tiga permainan lama. */
(function(){
  'use strict';

  const TOTAL=20;
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
  function itemBase(topic,id,title,explain,question,rationale,visualKind,steps){
    return {topic,id,title,explain,question,rationale,visualKind,steps:steps||[]};
  }
  function bin(n,w=0){return n.toString(2).padStart(w,'0')}
  function oct(n){return n.toString(8)}
  function hex(n){return n.toString(16).toUpperCase()}

  function buildNumberItems(r){
    const a=[];
    {
      const n=int(r,18,62), b=bin(n);
      a.push(withOptions(r,itemBase('numbers','n-bin-dec','Biner → Desimal',`Setiap posisi biner bernilai pangkat dua. Untuk ${b}₂, jumlahkan hanya nilai posisi yang berisi 1.`,`Nilai desimal dari ${b}₂ adalah ...`,`Gunakan bobot 2ⁿ dari kanan ke kiri, lalu jumlahkan posisi yang bernilai 1.`,'number',[`${b}₂`,`Pisahkan nilai tempat`,`Jumlahkan → ${n}₁₀`]),n,[n-1,n+1,n+2,n-2]));
    }
    {
      const n=int(r,20,70), b=bin(n);
      a.push(withOptions(r,itemBase('numbers','n-dec-bin','Desimal → Biner',`Konversi desimal ke biner dapat dilihat sebagai pemilihan pangkat dua yang jumlahnya tepat ${n}.`,`Bentuk biner dari ${n}₁₀ adalah ...`,`Pilih kombinasi pangkat dua yang jumlahnya tepat sama dengan bilangan desimal.`,'number',[`${n}₁₀`,`Cari pangkat 2 terbesar`,`Susun bit → ${b}₂`]),`${b}₂`,[`${bin(n-1)}₂`,`${bin(n+1)}₂`,`${b.split('').reverse().join('')}₂`,`${bin(n+2)}₂`]));
    }
    {
      const n=int(r,20,110), o=oct(n);
      a.push(withOptions(r,itemBase('numbers','n-oct-dec','Oktal → Desimal',`Setiap digit oktal memakai nilai tempat 8ⁿ. Bilangan ${o}₈ diuraikan berdasarkan posisi digitnya.`,`Nilai desimal dari ${o}₈ adalah ...`,`Kalikan tiap digit dengan 8 pangkat posisinya, lalu jumlahkan.`,'number',[`${o}₈`,`Gunakan 8ⁿ`,`Hasil → ${n}₁₀`]),n,[n-1,n+1,n+8,n-8]));
    }
    {
      const n=int(r,30,140), o=oct(n);
      a.push(withOptions(r,itemBase('numbers','n-dec-oct','Desimal → Oktal',`Untuk mengubah ${n}₁₀ ke oktal, pecah nilai menggunakan pangkat delapan atau pembagian berulang dengan 8.`,`Bentuk oktal dari ${n}₁₀ adalah ...`,`Hasil pembagian berulang dibaca dari sisa terakhir ke sisa pertama.`,'number',[`${n}₁₀`,`Bagi berulang dengan 8`,`Baca sisa → ${o}₈`]),`${o}₈`,[`${oct(n-1)}₈`,`${oct(n+1)}₈`,`${o.split('').reverse().join('')}₈`,`${oct(n+8)}₈`]));
    }
    {
      const n=int(r,34,210), h=hex(n);
      a.push(withOptions(r,itemBase('numbers','n-hex-dec','Heksadesimal → Desimal',`Heksadesimal menggunakan 16 simbol: 0–9 dan A–F. Setiap posisi bernilai 16ⁿ.`,`Nilai desimal dari ${h}₁₆ adalah ...`,`Ingat A=10 sampai F=15, kemudian gunakan nilai tempat 16ⁿ.`,'number',[`${h}₁₆`,`A–F mewakili 10–15`,`Hitung → ${n}₁₀`]),n,[n-1,n+1,n+16,n-16]));
    }
    {
      const n=int(r,40,220), h=hex(n);
      a.push(withOptions(r,itemBase('numbers','n-dec-hex','Desimal → Heksadesimal',`Basis 16 memakai digit 0–9 lalu A–F. Nilai ${n} dapat dipecah menjadi kelipatan 16 dan sisanya.`,`Bentuk heksadesimal dari ${n}₁₀ adalah ...`,`Bagi dengan 16. Hasil bagi menjadi digit kiri, sisa menjadi digit kanan.`,'number',[`${n}₁₀`,`Bagi dengan 16`,`Hasil → ${h}₁₆`]),`${h}₁₆`,[`${hex(n-1)}₁₆`,`${hex(n+1)}₁₆`,`${hex(Math.max(16,n-16))}₁₆`]));
    }
    {
      const base=pick(r,[2,8,16]);
      const invalid=base===2?pick(r,['2','5','9']):base===8?pick(r,['8','9']):pick(r,['G','H','Z']);
      const valid=base===2?['101101','110010','100111']:base===8?['725','607','154']:['9AF','B7C','10D'];
      const bad=base===16?`${pick(r,['2','A','F'])}${invalid}${pick(r,['4','B','0'])}`:`${pick(r,['1','3','6'])}${invalid}${pick(r,['0','1','5'])}`;
      const opts=shuffle(r,[...valid.map(x=>`${x}${base===16?'₁₆':base===8?'₈':'₂'}`),`${bad}${base===16?'₁₆':base===8?'₈':'₂'}`]);
      const correct=opts.indexOf(`${bad}${base===16?'₁₆':base===8?'₈':'₂'}`);
      a.push({...itemBase('numbers','n-validity','Digit yang Diizinkan',`Basis menentukan digit yang boleh dipakai: biner hanya 0–1, oktal 0–7, desimal 0–9, dan heksadesimal 0–9 serta A–F.`,`Manakah bilangan yang tidak valid pada basisnya?`,`Cari digit yang berada di luar rentang simbol basis tersebut.`,'number',['Cek basis','Periksa setiap digit','Satu digit tidak sah → bilangan tidak valid']),options:opts,correct});
    }
    {
      const exp=int(r,2,5), contribution=2**exp;
      const bits=Array.from({length:6},()=>r()<.5?'0':'1');bits[5-exp]='1';
      const b=bits.join('');
      a.push(withOptions(r,itemBase('numbers','n-place','Nilai Tempat Biner',`Posisi paling kanan bernilai 2⁰, lalu 2¹, 2², dan seterusnya. Digit 1 pada posisi 2^${exp} menyumbang ${contribution}.`,`Pada ${b}₂, kontribusi digit 1 pada posisi 2^${exp} adalah ...`,`Nilai kontribusi satu digit biner adalah digit × 2 pangkat posisinya.`,'number',[`Posisi 2^${exp}`,`Digitnya = 1`,`Kontribusi = ${contribution}`]),contribution,[contribution/2,contribution*2,contribution+2,Math.max(1,contribution-2)]));
    }
    {
      const n=int(r,48,238), b=bin(n,8), h=hex(n).padStart(2,'0');
      const swap=h.length===2?h[1]+h[0]:h;
      a.push(withOptions(r,itemBase('numbers','n-bin-hex','Biner → Heksadesimal',`Untuk mengubah biner ke heksadesimal, kelompokkan bit per 4 dari kanan. Setiap kelompok 4 bit menjadi satu digit heksadesimal.`,`Bentuk heksadesimal dari ${b}₂ adalah ...`,`Pisahkan menjadi dua kelompok 4 bit, ubah masing-masing menjadi 0–F.`,'number',[`${b.slice(0,4)}  ${b.slice(4)}`,`4 bit → 1 digit heksa`,`Hasil → ${h}₁₆`]),`${h}₁₆`,[`${swap}₁₆`,`${hex(n+1)}₁₆`,`${hex(n-1)}₁₆`,`${hex(n+16)}₁₆`]));
    }
    {
      const n=int(r,32,220), h=hex(n).padStart(2,'0'), b=bin(n,8);
      a.push(withOptions(r,itemBase('numbers','n-hex-bin','Heksadesimal → Biner',`Satu digit heksadesimal selalu dapat ditulis sebagai tepat 4 bit. Dua digit heksa menjadi 8 bit.`,`Bentuk biner 8-bit dari ${h}₁₆ adalah ...`,`Ubah tiap digit heksa menjadi 4 bit dan gabungkan tanpa mengubah urutan.`,'number',[`${h[0]} → 4 bit`,`${h[1]} → 4 bit`,`Gabungkan → ${b}`]),`${b}₂`,[`${bin(n-1,8)}₂`,`${bin(n+1,8)}₂`,`${b.slice(4)+b.slice(0,4)}₂`,`${bin(n+16,8)}₂`]));
    }
    {
      const n=int(r,16,90), b=bin(n), o=oct(n), h=hex(n);
      const correct=`${b}₂ = ${n}₁₀`;
      a.push(withOptions(r,itemBase('numbers','n-equivalent','Kesetaraan Antar Basis',`Bilangan yang ditulis dengan basis berbeda bisa memiliki nilai yang sama. Yang dibandingkan adalah nilainya, bukan bentuk digitnya.`,`Pasangan manakah yang bernilai sama?`,`Konversi salah satu sisi ke desimal untuk mengecek kesetaraan.`,'number',[`${n}₁₀`,`Biner ${b}₂`,`Oktal ${o}₈ • Heksa ${h}₁₆`]),correct,[`${b}₂ = ${n+1}₁₀`,`${o}₈ = ${n-1}₁₀`,`${h}₁₆ = ${n+16}₁₀`]));
    }
    {
      const digit=int(r,1,7), correct=`${bin(digit,3)}₂`;
      a.push(withOptions(r,itemBase('numbers','n-oct-bin','Oktal → Biner Cepat',`Setiap satu digit oktal tepat setara dengan 3 bit karena 8 = 2³.`,`Bentuk biner 3-bit dari digit ${digit}₈ adalah ...`,`Gunakan representasi 3 bit untuk nilai 0 sampai 7.`,'number',[`${digit}₈`,`1 digit oktal = 3 bit`,`${correct}`]),correct,[`${bin((digit+1)%8,3)}₂`,`${bin(Math.max(0,digit-1),3)}₂`,`${bin(digit,4)}₂`]));
    }
    return a;
  }

  function buildDataItems(r){
    const a=[];
    const names=shuffle(r,['Alya','Bima','Citra','Dimas','Eka','Fajar','Gita','Hana']);
    {
      const seq=names.slice(0,4);
      a.push(withOptions(r,itemBase('data','d-stack','Stack: LIFO',`Stack bekerja seperti tumpukan buku: data terakhir yang masuk adalah data pertama yang keluar.`,`Data masuk berurutan ${seq.join(' → ')}. Jika satu data di-pop, siapa yang keluar?`,`Operasi pop mengambil elemen paling atas, yaitu yang terakhir dimasukkan.`,'stack',[`${seq[0]} masuk`,`${seq[1]} dan ${seq[2]} masuk`,`${seq[3]} terakhir → keluar pertama`]),seq[3],[seq[2],seq[1],seq[0]]));
    }
    {
      const seq=names.slice(1,5);
      a.push(withOptions(r,itemBase('data','d-queue','Queue: FIFO',`Queue bekerja seperti antrean: yang datang lebih dahulu dilayani lebih dahulu.`,`Urutan antrean ${seq.join(' → ')}. Siapa yang dilayani pertama?`,`Dequeue mengambil elemen paling depan, yaitu yang masuk paling awal.`,'queue',[`${seq[0]} datang pertama`,`Antrean bertambah di belakang`,`${seq[0]} dilayani dulu`]),seq[0],[seq[1],seq[2],seq[3]]));
    }
    {
      const vals=shuffle(r,[12,18,23,31,44,57]).slice(0,5), idx=int(r,0,4), target=vals[idx];
      a.push(withOptions(r,itemBase('data','d-array-index','Array dan Indeks',`Array menyimpan data berurutan dan biasanya dihitung mulai indeks 0. Lima elemen berarti indeks 0 sampai 4.`,`Pada array [${vals.join(', ')}], indeks dari nilai ${target} adalah ...`,`Hitung posisi dari kiri mulai 0, bukan mulai 1.`,'array',[`[${vals.join(' • ')}]`,`Indeks mulai 0`,`Nilai ${target} berada di indeks ${idx}`]),idx,[(idx+1)%5,(idx+2)%5,(idx+3)%5,(idx+4)%5]));
    }
    {
      a.push(withOptions(r,itemBase('data','d-undo','Undo sebagai Stack',`Riwayat Undo perlu membatalkan tindakan yang paling baru terlebih dahulu, sehingga cocok dengan pola LIFO.`,`Struktur data paling tepat untuk fitur Undo adalah ...`,`Undo membutuhkan tindakan terakhir dibatalkan lebih dahulu.`,'stack',['Tindakan 1','Tindakan 2','Tindakan terakhir → Undo pertama']),'Stack',['Queue','Tree','Graph']));
    }
    {
      a.push(withOptions(r,itemBase('data','d-printer','Antrean Printer',`Dokumen yang dikirim ke printer biasanya masuk barisan pekerjaan. Tanpa prioritas, pekerjaan pertama diproses lebih dahulu.`,`Struktur data yang paling tepat untuk antrean cetak tanpa prioritas adalah ...`,`Urutan layanan pertama masuk–pertama keluar adalah karakteristik queue.`,'queue',['Dokumen A masuk','Dokumen B menunggu','A dicetak lebih dulu']),'Queue',['Stack','Tree','Graph']));
    }
    {
      a.push(withOptions(r,itemBase('data','d-tree','Tree untuk Hierarki',`Tree cocok untuk hubungan bertingkat yang memiliki induk dan anak, seperti folder dan subfolder.`,`Struktur paling tepat untuk Folder Utama → Materi → Bab 1/Bab 2 adalah ...`,`Hubungan hierarkis parent–child merupakan ciri tree.`,'tree',['Folder Utama','↳ Materi','↳ Bab 1 • Bab 2']),'Tree',['Graph','Queue','Stack']));
    }
    {
      a.push(withOptions(r,itemBase('data','d-graph','Graph untuk Jaringan',`Graph merepresentasikan node dan hubungan. Satu node dapat terhubung ke banyak node lain tanpa harus membentuk hierarki.`,`Struktur paling tepat untuk jaringan pertemanan akun media sosial adalah ...`,`Jaringan pertemanan memiliki banyak simpul dan relasi silang, sehingga cocok sebagai graph.`,'graph',['A ↔ B','A ↔ C','B ↔ D dan C ↔ D']),'Graph',['Tree','Queue','Array']));
    }
    {
      const seq=names.slice(0,3), extra=names[3];
      a.push(withOptions(r,itemBase('data','d-stack-ops','Jejak Push dan Pop',`Push menambah data ke puncak stack, sedangkan pop menghapus data paling atas.`,`Stack berisi ${seq.join(', ')} dari bawah ke atas. Setelah push ${extra}, lalu pop sekali, elemen teratas menjadi ...`,`Push menempatkan ${extra} di atas, kemudian pop langsung menghapus ${extra}; puncak kembali ke elemen sebelumnya.`,'stack',[`${seq.join(' • ')}`,`Push ${extra}`,`Pop → kembali ke ${seq[2]}`]),seq[2],[extra,seq[1],seq[0]]));
    }
    {
      const seq=names.slice(2,5), extra=names[5];
      a.push(withOptions(r,itemBase('data','d-queue-ops','Jejak Enqueue dan Dequeue',`Enqueue menambah data di belakang queue, sedangkan dequeue mengambil data dari depan.`,`Queue dari depan: ${seq.join(' → ')}. Setelah enqueue ${extra}, lalu dequeue sekali, siapa yang berada di depan?`,`Dequeue menghapus ${seq[0]}; elemen berikutnya, ${seq[1]}, menjadi paling depan.`,'queue',[`${seq.join(' → ')}`,`+ ${extra} di belakang`,`- ${seq[0]} dari depan`]),seq[1],[seq[0],seq[2],extra]));
    }
    {
      a.push(withOptions(r,itemBase('data','d-browser-back','Riwayat Tombol Back',`Ketika tombol Back ditekan, halaman yang paling baru dikunjungi sebelum halaman sekarang harus dibuka terlebih dahulu.`,`Pola struktur data yang paling mirip dengan tombol Back pada browser adalah ...`,`Riwayat kembali bekerja dari kunjungan terbaru ke yang lebih lama, yaitu pola stack.`,'stack',['Halaman A','Lalu B','Lalu C → Back kembali ke B']),'Stack',['Queue','Graph','Array']));
    }
    {
      a.push(withOptions(r,itemBase('data','d-org','Memilih Struktur',`Pemilihan struktur data bergantung pada pola hubungan dan operasi yang paling sering dilakukan.`,`Data silsilah organisasi dari Kepala → Wakil → Koordinator → Anggota paling tepat dimodelkan sebagai ...`,`Hubungan berjenjang dari satu induk menuju anak-anak cocok menggunakan tree.`,'tree',['Kepala','↳ Wakil','↳ Koordinator ↳ Anggota']),'Tree',['Stack','Queue','Graph lengkap']));
    }
    {
      const vals=shuffle(r,['Merah','Biru','Hijau','Kuning','Ungu']);
      a.push(withOptions(r,itemBase('data','d-array-access','Akses Posisi Array',`Array memudahkan mengambil elemen berdasarkan posisi indeks yang tetap.`,`Jika warna = [${vals.join(', ')}], elemen pada indeks 2 adalah ...`,`Dengan indeks mulai 0, indeks 2 adalah elemen ketiga.`,'array',[`0:${vals[0]}`,`1:${vals[1]}`,`2:${vals[2]}`]),vals[2],[vals[1],vals[3],vals[0]]));
    }
    return a;
  }

  function buildAlgorithmItems(r){
    const a=[];
    {
      const x=int(r,2,7), add=int(r,2,5), mul=int(r,2,4), result=(x+add)*mul;
      a.push(withOptions(r,itemBase('algorithm','a-trace','Menelusuri Urutan',`Algoritma sequence menjalankan instruksi dari atas ke bawah. Perubahan nilai harus dilacak sesuai urutan.`,`x = ${x}; x = x + ${add}; x = x × ${mul}. Nilai akhir x adalah ...`,`Kerjakan operasi sesuai urutan program: tambah dahulu, kemudian kali.`,'algorithm',[`x = ${x}`,`x + ${add} = ${x+add}`,`× ${mul} = ${result}`]),result,[x+add,x*mul,result-1,result+1]));
    }
    {
      const score=int(r,55,95), limit=75, result=score>=limit?'Lulus':'Belum lulus';
      a.push(withOptions(r,itemBase('algorithm','a-if','Selection / Percabangan',`Selection memilih aksi berdasarkan kondisi. Hanya cabang yang kondisinya terpenuhi yang dijalankan.`,`Jika nilai ≥ ${limit} tampilkan “Lulus”, selain itu “Belum lulus”. Untuk nilai ${score}, keluaran adalah ...`,`Bandingkan nilai dengan batas kondisi, lalu jalankan tepat satu cabang.`,'algorithm',[`Nilai = ${score}`,`Cek ≥ ${limit}`,`Hasil → ${result}`]),result,[result==='Lulus'?'Belum lulus':'Lulus','Tidak ada keluaran','Program berhenti']));
    }
    {
      const times=int(r,4,9), per=int(r,2,5), result=times*per;
      a.push(withOptions(r,itemBase('algorithm','a-loop','Loop / Perulangan',`Loop mengulang blok instruksi tanpa menulis perintah yang sama berkali-kali.`,`Perintah “ulangi ${times} kali: tambah ${per}” dimulai dari 0. Nilai akhir adalah ...`,`Setiap putaran menambah ${per}; total pertambahan = ${times} × ${per}.`,'algorithm',[`Mulai 0`,`+${per} diulang ${times}×`,`Hasil = ${result}`]),result,[result-per,result+per,times+per]));
    }
    {
      const n=int(r,8,24);
      a.push(withOptions(r,itemBase('algorithm','a-efficient','Efisiensi Algoritma',`Dua algoritma dapat sama-sama benar, tetapi satu dapat lebih ringkas atau lebih mudah dipelihara.`,`Untuk mengambil ${n} kotak, manakah algoritma yang paling ringkas namun tetap tepat?`,`Perulangan mengekspresikan tindakan berulang dengan jelas tanpa menulis instruksi yang sama ${n} kali.`,'algorithm',[`Tujuan: ${n} kotak`,`Cari pola berulang`,`Gunakan loop ${n}×`]),`Ulangi ${n} kali: ambil 1 kotak`,[`Tulis “ambil 1 kotak” sebanyak ${n} baris`,`Jika ada kotak: ambil 1 kotak`,`Ambil ${n-1} kotak lalu berhenti`]));
    }
    {
      a.push(withOptions(r,itemBase('algorithm','a-redundant','Mencari Langkah Redundan',`Algoritma yang baik tidak memuat langkah yang tidak perlu. Langkah redundan tidak mengubah hasil dan hanya menambah proses.`,`Urutan: (1) ambil gelas, (2) masukkan teh, (3) tuang air, (4) ambil gelas lagi, (5) minum. Langkah paling redundan adalah ...`,`Gelas sudah diambil pada langkah 1 dan belum pernah diletakkan, sehingga langkah 4 mengulang tindakan tanpa kebutuhan.`,'algorithm',['Ambil gelas','Siapkan minuman','“Ambil gelas” kedua tidak diperlukan']),'Langkah 4',['Langkah 1','Langkah 2','Langkah 3']));
    }
    {
      const start=int(r,1,4), end=start+int(r,3,6), count=end-start+1;
      a.push(withOptions(r,itemBase('algorithm','a-loop-inclusive','Batas Perulangan',`Pada loop dengan batas inklusif, nilai awal dan nilai akhir sama-sama ikut dihitung.`,`Untuk i = ${start} sampai ${end}, perintah cetak dijalankan berapa kali?`,`Jumlah bilangan bulat dari awal sampai akhir secara inklusif adalah akhir − awal + 1.`,'algorithm',[`Mulai i=${start}`,`Berakhir i=${end}`,`Jumlah = ${end}-${start}+1 = ${count}`]),count,[count-1,count+1,count+2,Math.max(1,count-2)]));
    }
    {
      const temp=int(r,24,35), limit=30, action=temp>limit?'Nyalakan kipas':'Matikan kipas';
      a.push(withOptions(r,itemBase('algorithm','a-condition','Membaca Kondisi',`Kondisi harus dibaca persis seperti ditulis. Tanda > berbeda dari ≥ karena nilai yang sama dengan batas tidak memenuhi >.`,`Jika suhu > ${limit} maka nyalakan kipas, selain itu matikan. Suhu ${temp} menghasilkan ...`,`Bandingkan ${temp} dengan ${limit} menggunakan operator >, bukan perkiraan.`,'algorithm',[`Suhu ${temp}°`,`Cek > ${limit}°`,`Aksi → ${action}`]),action,[action==='Nyalakan kipas'?'Matikan kipas':'Nyalakan kipas','Kipas menyala lalu mati','Tidak ada aksi']));
    }
    {
      const x=int(r,1,5), y=int(r,2,6), out=x*y+x;
      a.push(withOptions(r,itemBase('algorithm','a-pseudocode','Membaca Pseudocode',`Pseudocode membantu manusia memahami logika program tanpa terikat bahasa pemrograman tertentu.`,`a=${x}; b=${y}; c=a×b; c=c+a. Nilai c adalah ...`,`Ikuti setiap assignment. Nilai c yang lama diganti oleh hasil langkah berikutnya.`,'algorithm',[`c=${x}×${y}=${x*y}`,`c=${x*y}+${x}`,`c=${out}`]),out,[x*y,out-1,out+1,x+y]));
    }
    {
      a.push(withOptions(r,itemBase('algorithm','a-deterministic','Algoritma yang Jelas',`Instruksi algoritma harus cukup jelas agar pelaksana yang berbeda menghasilkan langkah yang konsisten.`,`Manakah instruksi yang paling tidak ambigu?`,`Instruksi yang menyebut jumlah, objek, dan tindakan secara spesifik lebih mudah dijalankan konsisten.`,'algorithm',['“Ambil secukupnya” → samar','“Ambil beberapa” → samar','“Ambil tepat 3 kartu” → terukur']),'Ambil tepat 3 kartu',['Ambil kartu secukupnya','Ambil beberapa kartu','Ambil kartu yang menurutmu perlu']));
    }
    {
      const target=int(r,4,8);
      a.push(withOptions(r,itemBase('algorithm','a-stop','Kondisi Berhenti',`Loop harus memiliki kondisi berhenti agar tidak berjalan tanpa akhir.`,`Robot mengulang “maju 1 langkah”. Agar berhenti tepat setelah ${target} langkah, kondisi yang paling tepat adalah ...`,`Kondisi berhenti harus mengukur jumlah langkah yang sudah dilakukan dan berhenti saat mencapai target.`,'algorithm',[`Hitung langkah`,`Tambah 1 tiap maju`,`Berhenti saat hitungan = ${target}`]),`Berhenti ketika jumlah langkah = ${target}`,[`Berhenti ketika jumlah langkah > ${target}`,`Berhenti ketika jumlah langkah < ${target}`,`Tidak perlu kondisi berhenti`]));
    }
    {
      a.push(withOptions(r,itemBase('algorithm','a-debug','Debugging Logika',`Debugging berarti menemukan penyebab hasil salah lalu memperbaiki bagian yang relevan, bukan mengubah semua langkah sekaligus.`,`Program menghitung rata-rata dengan rumus total ÷ jumlahData, tetapi jumlahData selalu 0. Langkah pertama yang paling tepat adalah ...`,`Periksa bagaimana jumlahData diinisialisasi dan diperbarui sebelum melakukan pembagian.`,'algorithm',['Hasil salah','Telusuri variabel penyebab','Periksa jumlahData sebelum membagi']),'Periksa inisialisasi dan pembaruan jumlahData',['Ganti semua nama variabel','Tambahkan loop baru tanpa mengecek kode','Hapus perhitungan rata-rata']));
    }
    {
      const n=int(r,3,7), result=n*(n+1)/2;
      a.push(withOptions(r,itemBase('algorithm','a-accumulator','Akumulator dalam Loop',`Akumulator menyimpan hasil sementara dan diperbarui setiap putaran. Contohnya total = total + i.`,`total=0; untuk i=1 sampai ${n}: total=total+i. Nilai total akhir adalah ...`,`Jumlahkan 1 + 2 + ... + ${n}, karena setiap i ditambahkan ke total.`,'algorithm',[`total=0`,`Tambah 1 sampai ${n}`,`total=${result}`]),result,[result-n,result+n,n*n,result+1]));
    }
    return a;
  }

  function makePackage(uid,st,version){
    const seed=`concept-v${version}|${uid}|${st?.name||''}|${st?.cls||''}`;
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
    if(Number(p.version||0)!==c.version)return {version:c.version,answers:[],correct:0,startedAt:0,updatedAt:0,completedAt:0};
    const answers=Array.isArray(p.answers)?p.answers.slice(0,TOTAL).map(v=>Number(v)) : [];
    return {version:c.version,answers,correct:Math.max(0,Math.min(TOTAL,Number(p.correct||0))),startedAt:Number(p.startedAt||0),updatedAt:Number(p.updatedAt||0),completedAt:Number(p.completedAt||0)};
  }
  function currentStudent(){return typeof getStudent==='function'?getStudent():roomState?.students?.[currentUser?.uid]}
  function studentPackage(){const st=currentStudent(),uid=currentUser?.uid||'';return st&&uid?makePackage(uid,st,config().version):[]}

  function visualHtml(item){
    const steps=(item.steps||[]).map((s,i)=>`<div class="concept-anim-step" style="--i:${i}"><span>${i+1}</span><b>${esc(s)}</b></div>`).join('');
    if(item.visualKind==='stack')return `<div class="concept-visual concept-stack-visual" data-anim="${animationNonce}"><div class="concept-stack-boxes"><i></i><i></i><i></i><i></i></div><div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='queue')return `<div class="concept-visual concept-queue-visual" data-anim="${animationNonce}"><div class="concept-queue-line"><i>1</i><i>2</i><i>3</i><i>4</i><em>→</em></div><div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='tree')return `<div class="concept-visual concept-tree-visual" data-anim="${animationNonce}"><div class="concept-tree"><b>ROOT</b><span></span><div><i>A</i><i>B</i></div><small></small><div class="leafs"><i>A1</i><i>A2</i></div></div><div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='graph')return `<div class="concept-visual concept-graph-visual" data-anim="${animationNonce}"><div class="concept-graph"><i class="n1">A</i><i class="n2">B</i><i class="n3">C</i><i class="n4">D</i><span class="e1"></span><span class="e2"></span><span class="e3"></span><span class="e4"></span></div><div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='array')return `<div class="concept-visual concept-array-visual" data-anim="${animationNonce}"><div class="concept-array-row"><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i></div><div class="concept-anim-steps">${steps}</div></div>`;
    if(item.visualKind==='algorithm')return `<div class="concept-visual concept-algo-visual" data-anim="${animationNonce}"><div class="concept-flow"><i>START</i><span>→</span><i>PROSES</i><span>→</span><i>HASIL</i></div><div class="concept-anim-steps">${steps}</div></div>`;
    return `<div class="concept-visual concept-number-visual" data-anim="${animationNonce}"><div class="concept-bits"><i>1</i><i>0</i><i>1</i><i>1</i><i>0</i><i>1</i></div><div class="concept-anim-steps">${steps}</div></div>`;
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
      body.innerHTML=`<article class="concept-question-shell"><div class="concept-q-head"><span class="concept-topic-pill ${item.topic}">${esc(topic)}</span><strong>Misi ${idx+1}/${TOTAL}</strong></div><span class="concept-question-kicker">SOAL KRITIS • PILIHAN MIRIP</span><h2>${esc(item.question)}</h2><div class="concept-options">${item.options.map((op,i)=>`<button type="button" ${answerBusy?'disabled':''} onclick="DMConceptGame.answer(${i})"><span>${String.fromCharCode(65+i)}</span><b>${esc(op)}</b></button>`).join('')}</div><div class="concept-question-note">Pilih satu jawaban. Setelah dikirim, jawaban tidak dapat diubah.</div></article>`;
      return;
    }
    animationNonce++;
    body.innerHTML=`<article class="concept-explain-shell"><div class="concept-q-head"><span class="concept-topic-pill ${item.topic}">${esc(topic)}</span><strong>Misi ${idx+1}/${TOTAL}</strong></div><span class="concept-question-kicker">PAHAMI POLANYA</span><h2>${esc(item.title)}</h2><p class="concept-explain-copy">${esc(item.explain)}</p>${visualHtml(item)}<div class="concept-explain-actions"><button type="button" class="btn secondary" onclick="DMConceptGame.replay()">↻ Ulangi animasi</button><button type="button" class="btn primary" onclick="DMConceptGame.showQuestion()">Lanjut ke Soal →</button></div></article>`;
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
    const next={version:config().version,answers,correct,startedAt:p.startedAt||ts,updatedAt:ts,completedAt:answers.length>=TOTAL?ts:0};
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
      return `<tr><td>${i+1}</td><td><b>${esc(x.st.name||'Siswa')}</b></td><td>${esc(x.st.cls||'—')}</td><td><div class="concept-mini-progress"><i style="width:${Math.round(x.answered/TOTAL*100)}%"></i></div><small>${x.answered}/${TOTAL}</small></td><td><span class="concept-table-score">${x.score}</span></td><td>${esc(current)}</td><td><span class="concept-status-tag ${x.done?'done':x.answered?'working':'idle'}">${x.done?'Selesai':x.answered?'Mengerjakan':'Belum mulai'}</span></td><td><div class="concept-row-actions"><button type="button" onclick="DMConceptGame.preview('${esc(uid)}')">Lihat Paket</button><button type="button" class="danger" onclick="DMConceptGame.resetStudent('${esc(uid)}')">Reset</button></div></td></tr>`;
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
    renderStudent,renderTeacher,showQuestion,replay,next,answer,closeStudent,preview,closePreview,
    open:()=>setOpen(true),pause:()=>setOpen(false),resetAll,resetStudent,
    makePackage
  };
})();
