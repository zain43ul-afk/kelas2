# Pembaruan akses siswa lintas perangkat

Siswa kini membuka data yang sama dari perangkat atau browser mana pun dengan
memilih kelas dan menulis nama lengkap yang sama. Tidak ada Firebase Anonymous Authentication
dan tidak ada tombol Reset Perangkat. UID siswa lama tetap digunakan sehingga
nilai, tim, dan progresnya tidak perlu dipindahkan. Rekaman lama yang pernah
ditandai menunggu reset dapat diaktifkan kembali saat nama itu ditulis lagi.

Siswa tidak perlu menunggu guru membuka kelas. Jika belum ada sesi kelas,
aplikasi membuatnya secara otomatis saat siswa pertama masuk. Siswa baru juga
dapat masuk setelah tim terbentuk dan akan ditempatkan secara otomatis pada
tim dengan anggota paling sedikit. Guru tetap mengatur pembagian tim dan ronde.

Untuk menerapkan pembaruan, unggah seluruh isi arsip ke hosting dan publikasikan
`database.rules.json` di Firebase Realtime Database Rules. Mengunggah file
aturan ke hosting saja tidak menerapkan aturan database.
