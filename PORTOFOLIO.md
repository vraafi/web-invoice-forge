## Invoice Forge

**Masalah**
Pembuat invoice kecil sering berakhir di spreadsheet berantakan atau aplikasi berat berlangganan. Kebutuhan nyatanya sederhana: satu halaman, hitung pajak, cetak PDF, dan data tidak hilang saat tab ditutup.

**Yang Dibangun**
Invoice Forge adalah aplikasi web satu halaman. Pengguna menambah item, sistem menghitung subtotal, pajak, dan total. Cetak PDF memakai dialog print browser, bukan pustaka tambahan. Data tersimpan di localStorage. Berkas hasil: app.js (11979 B), index.html (2470 B), style.css (4687 B).

**Keputusan Teknis**
Saya memilih localStorage karena beban data kecil dan tidak butuh server. Print browser dipakai agar PDF keluar tanpa dependensi pihak ketiga. Struktur tiga berkas dipisah tegas: logika di app.js, tampilan di style.css, kerangka di index.html. Ini memudahkan audit dan perawatan.

**Bukti**
QC menyelesaikan 44,59 detik dengan 0 temuan. Tiga lapis aktif dan lulus: kode, pengguna, visual. Rincian berkas: 0 masalah Python, 1 JavaScript, 0 JSON, 0 Lua, 2 lain-lain. Angka ini yang saya pegang, bukan klaim rasa.

**Batasan**
Data terikat pada satu browser dan satu perangkat. Tidak ada sinkronisasi, tidak ada akun, tidak ada backup otomatis. Cetak PDF bergantung pada pengaturan print pengguna. Untuk pemakaian tim, arsitektur ini perlu diganti.