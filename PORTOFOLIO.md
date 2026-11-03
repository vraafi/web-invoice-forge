## Masalah
Pembuat invoice sering kali berupa aplikasi berat dengan banyak fitur yang tidak dipakai. Pengguna UMKM butuh alat cepat: satu halaman, langsung cetak PDF, data tersimpan lokal.

## Yang Dibangun
Invoice Forge: aplikasi web satu halaman. Fungsi inti: item, pajak, total, cetak PDF lewat print browser, data tersimpan di localStorage. Berkas: app.js (8610 B), index.html (2635 B), style.css (4207 B).

## Keputusan Teknis
- Cetak PDF memakai print browser, bukan library PDF. Ukuran kode tetap kecil.
- localStorage untuk persistensi tanpa backend. Tidak ada server, tidak ada login.
- Tiga lapis QC: kode, pengguna, visual.

## Bukti
QC selesai dalam 46,98 detik. Tiga lapis aktif dan lulus: kode, pengguna, visual. Temuan: 0. Rincian kode: 0 file Python, 1 file JS, 0 file JSON, 0 file Lua, 2 file lain.

## Batasan
Data tersimpan per browser. Tidak ada sinkronisasi antar perangkat. Cetak PDF bergantung pada dialog print browser. Aplikasi tidak menangani multi-pengguna atau backup otomatis.