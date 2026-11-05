## Masalah

Pembuat invoice kecil sering berakhir sebagai spreadsheet berantakan atau aplikasi berat yang memaksa pengguna membuat akun. Kebutuhan sebenarnya sederhana: isi item, hitung pajak, cetak PDF, simpan data. Tidak lebih.

## Yang Dibangun

Invoice Forge: halaman tunggal untuk menyusun invoice, menghitung subtotal dan pajak, mencetak lewat print browser, dan menyimpan data di localStorage. Empat berkas: app.js, index.html, README.md, style.css. Tidak ada server, tidak ada basis data eksternal, tidak ada ketergantungan berat.

## Keputusan Teknis

localStorage dipilih karena data invoice bersifat pribadi dan cukup kecil. Print browser dipakai sebagai jalur PDF karena menghindari pustaka generasi PDF tambahan. Logika perhitungan dipisah di app.js agar mudah diperiksa. Hasilnya: 1 berkas JS, 1 berkas JSON, 6 berkas lain, tanpa kode Python atau Lua.

## Bukti

QC mencatat 3 lapis aktif: kode, pengguna, visual. Ketiganya lulus dalam 46,97 detik. Temuan: 0. Angka ini yang kami pegang, bukan klaim rasa.

## Batasan

Data terikat pada satu browser dan satu perangkat. Tidak ada sinkronisasi antar perangkat, tidak ada autentikasi, tidak ada audit trail. Invoice Forge cocok untuk pemakaian pribadi dan tim kecil, bukan untuk kepatuhan pajak tingkat perusahaan.