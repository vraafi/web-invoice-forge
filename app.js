(function () {
  'use strict';

  var KEY = 'invoice-forge-v1';
  var itemCounter = 0;

  function $(id) { return document.getElementById(id); }
  function rupiah(n) {
    var v = Math.round((Number(n) || 0) * 100) / 100;
    return 'Rp ' + v.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function buatItem(data) {
    itemCounter += 1;
    var id = 'item-' + itemCounter;
    var wrap = document.createElement('div');
    wrap.className = 'item-row';
    wrap.dataset.id = id;

    var f1 = document.createElement('div');
    f1.className = 'field grow';
    var l1 = document.createElement('label');
    l1.setAttribute('for', id + '-nama');
    l1.textContent = 'Nama Item';
    var i1 = document.createElement('input');
    i1.type = 'text';
    i1.id = id + '-nama';
    i1.className = 'item-nama';
    i1.placeholder = 'Deskripsi item';
    i1.setAttribute('autocomplete', 'off');
    f1.appendChild(l1);
    f1.appendChild(i1);

    var f2 = document.createElement('div');
    f2.className = 'field qty';
    var l2 = document.createElement('label');
    l2.setAttribute('for', id + '-qty');
    l2.textContent = 'Qty';
    var i2 = document.createElement('input');
    i2.type = 'number';
    i2.id = id + '-qty';
    i2.className = 'item-qty';
    i2.value = '1';
    i2.min = '0';
    i2.step = 'any';
    f2.appendChild(l2);
    f2.appendChild(i2);

    var f3 = document.createElement('div');
    f3.className = 'field harga';
    var l3 = document.createElement('label');
    l3.setAttribute('for', id + '-harga');
    l3.textContent = 'Harga Satuan';
    var i3 = document.createElement('input');
    i3.type = 'number';
    i3.id = id + '-harga';
    i3.className = 'item-harga';
    i3.value = '0';
    i3.min = '0';
    i3.step = 'any';
    f3.appendChild(l3);
    f3.appendChild(i3);

    var f4 = document.createElement('div');
    f4.className = 'field subtotal';
    var l4 = document.createElement('label');
    l4.textContent = 'Subtotal';
    var span = document.createElement('span');
    span.className = 'item-subtotal';
    span.textContent = rupiah(0);
    f4.appendChild(l4);
    f4.appendChild(span);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-secondary btn-hapus-item';
    btn.textContent = 'Hapus';

    if (data) {
      i1.value = data.nama || '';
      i2.value = String(data.qty != null ? data.qty : 1);
      i3.value = String(data.harga != null ? data.harga : 0);
    }

    wrap.appendChild(f1);
    wrap.appendChild(f2);
    wrap.appendChild(f3);
    wrap.appendChild(f4);
    wrap.appendChild(btn);
    $('daftar-item').appendChild(wrap);
    hitung();
  }

  function kumpulkan() {
    var rows = document.querySelectorAll('.item-row');
    var items = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      items.push({
        nama: r.querySelector('.item-nama').value,
        qty: parseFloat(r.querySelector('.item-qty').value) || 0,
        harga: parseFloat(r.querySelector('.item-harga').value) || 0
      });
    }
    return items;
  }

  function hitung() {
    var rows = document.querySelectorAll('.item-row');
    var subtotal = 0;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var qty = parseFloat(r.querySelector('.item-qty').value) || 0;
      var harga = parseFloat(r.querySelector('.item-harga').value) || 0;
      var sub = qty * harga;
      subtotal += sub;
      r.querySelector('.item-subtotal').textContent = rupiah(sub);
    }
    var pajakPersen = parseFloat($('inv-pajak').value) || 0;
    var pajak = subtotal * pajakPersen / 100;
    var total = subtotal + pajak;
    $('val-subtotal').textContent = rupiah(subtotal);
    $('val-pajak').textContent = rupiah(pajak);
    $('val-total').textContent = rupiah(total);
    return { subtotal: subtotal, pajak: pajak, total: total, pajakPersen: pajakPersen };
  }

  function status(msg) {
    $('status').textContent = msg;
  }

  function ambilData() {
    return {
      nama: $('inv-nama').value,
      klien: $('inv-klien').value,
      nomor: $('inv-nomor').value,
      tanggal: $('inv-tanggal').value,
      pajak: $('inv-pajak').value,
      items: kumpulkan()
    };
  }

  function isiData(data) {
    $('inv-nama').value = data.nama || '';
    $('inv-klien').value = data.klien || '';
    $('inv-nomor').value = data.nomor || '';
    $('inv-tanggal').value = data.tanggal || '';
    $('inv-pajak').value = data.pajak != null ? String(data.pajak) : '11';
    $('daftar-item').innerHTML = '';
    var items = Array.isArray(data.items) ? data.items : [];
    if (items.length === 0) {
      buatItem(null);
    } else {
      for (var i = 0; i < items.length; i++) buatItem(items[i]);
    }
    hitung();
  }

  function simpan() {
    try {
      localStorage.setItem(KEY, JSON.stringify(ambilData()));
      status('Invoice tersimpan di perangkat ini.');
    } catch (e) {
      status('Gagal menyimpan: penyimpanan tidak tersedia.');
    }
  }

  function muat() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (!raw) {
      isiData({ pajak: '11', items: [{ nama: '', qty: 1, harga: 0 }] });
      return;
    }
    try {
      isiData(JSON.parse(raw));
      status('Invoice tersimpan berhasil dimuat.');
    } catch (e) {
      isiData({ pajak: '11', items: [{ nama: '', qty: 1, harga: 0 }] });
      status('Data tersimpan rusak; dimulai invoice baru.');
    }
  }

  function baru() {
    isiData({ pajak: '11', items: [{ nama: '', qty: 1, harga: 0 }] });
    status('Invoice baru dibuat.');
  }

  function hapus() {
    try {
      localStorage.removeItem(KEY);
      status('Data tersimpan dihapus.');
    } catch (e) {
      status('Gagal menghapus: penyimpanan tidak tersedia.');
    }
  }

  function cetak() {
    hitung();
    var hasil = hitung();
    if (hasil.total <= 0) {
      status('Isi minimal satu item dengan total lebih dari nol sebelum mencetak.');
      var pertama = document.querySelector('.item-nama');
      if (pertama) pertama.focus();
      return;
    }
    status('Menyiapkan cetak…');
    window.print();
  }

  function init() {
    muat();

    $('btn-tambah-item').addEventListener('click', function () {
      buatItem(null);
      status('Item ditambahkan.');
      var rows = document.querySelectorAll('.item-row');
      var last = rows[rows.length - 1];
      if (last) last.querySelector('.item-nama').focus();
    });

    $('btn-simpan').addEventListener('click', simpan);
    $('btn-cetak').addEventListener('click', cetak);
    $('btn-baru').addEventListener('click', baru);
    $('btn-hapus').addEventListener('click', hapus);

    $('daftar-item').addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.classList || !t.classList.contains('btn-hapus-item')) return;
      var row = t.closest('.item-row');
      if (!row) return;
      var totalRows = document.querySelectorAll('.item-row').length;
      if (totalRows <= 1) {
        status('Minimal harus ada satu item.');
        return;
      }
      row.parentNode.removeChild(row);
      hitung();
      status('Item dihapus.');
    });

    $('daftar-item').addEventListener('input', hitung);
    $('inv-pajak').addEventListener('input', hitung);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
