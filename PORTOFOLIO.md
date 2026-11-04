## Masalah

Pembuat invoice kecil sering berat, berlapis akun, dan menyimpan data di server pihak ketiga. Kebutuhan nyata lebih sederhana: satu halaman, item, pajak, total, lalu cetak PDF.

## Yang Dibangun

Invoice Forge adalah aplikasi web satu halaman. Pengguna mengisi item, pajak dihitung, total tampil, dan PDF dihasilkan lewat print browser. Data tersimpan di localStorage sehingga tidak butuh backend. Hasilnya empat berkas: app.js (9507 B), index.html (3252 B), README.md (832 B), style.css (4617 B).

## Keputusan Teknis

localStorage dipilih agar tidak ada server dan tidak ada basis data. Cetak PDF diserahkan ke print browser, bukan pustaka PDF, supaya jejak dependensi tetap kecil. Kode ditulis dalam JavaScript dan CSS terpisah, dengan README sebagai panduan pakai. Pemeriksaan QC menyentuh tiga lapis: kode, pengguna, visual.

## Bukti

Tiga lapis QC aktif dan tiga lapis lulus dalam 81.6 detik. Temuan nol. Rincian kode: 1 berkas JS, 1 JSON, 6 lain, 0 Python, 0 Lua.

## Batasan

Data terikat pada browser dan localStorage. Tidak ada sinkronisasi antarperangkat. Tidak ada autentikasi. PDF mengikuti setelan print browser, bukan mesin PDF khusus.