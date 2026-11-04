'use strict';

var STORAGE_KEY = 'invoiceforge_data_v1';

function $(id) {
  return document.getElementById(id);
}

function formatMoney(amount, currency) {
  var num = Number(amount);
  if (!isFinite(num)) { num = 0; }
  var rounded = Math.round(num * 100) / 100;
  var parts = rounded.toFixed(2).split('.');
  var intPart = parts[0];
  var decPart = parts[1];
  var neg = false;
  if (intPart.charAt(0) === '-') {
    neg = true;
    intPart = intPart.substring(1);
  }
  var withSep = '';
  var count = 0;
  for (var i = intPart.length - 1; i >= 0; i--) {
    withSep = intPart.charAt(i) + withSep;
    count++;
    if (count % 3 === 0 && i > 0) {
      withSep = '.' + withSep;
    }
  }
  var cur = currency || '';
  return (neg ? '-' : '') + cur + (cur ? ' ' : '') + withSep + ',' + decPart;
}

var state = {
  items: []
};

function createRow(item) {
  var tr = document.createElement('tr');

  var tdDesc = document.createElement('td');
  var inputDesc = document.createElement('input');
  inputDesc.type = 'text';
  inputDesc.className = 'cell-input desc-input';
  inputDesc.value = item.desc || '';
  inputDesc.setAttribute('aria-label', 'Deskripsi item');
  tdDesc.appendChild(inputDesc);

  var tdQty = document.createElement('td');
  var inputQty = document.createElement('input');
  inputQty.type = 'number';
  inputQty.className = 'cell-input qty-input';
  inputQty.min = '0';
  inputQty.step = 'any';
  inputQty.value = item.qty;
  inputQty.setAttribute('aria-label', 'Jumlah item');
  tdQty.appendChild(inputQty);

  var tdPrice = document.createElement('td');
  var inputPrice = document.createElement('input');
  inputPrice.type = 'number';
  inputPrice.className = 'cell-input price-input';
  inputPrice.min = '0';
  inputPrice.step = 'any';
  inputPrice.value = item.price;
  inputPrice.setAttribute('aria-label', 'Harga item');
  tdPrice.appendChild(inputPrice);

  var tdTotal = document.createElement('td');
  tdTotal.className = 'line-total';
  tdTotal.textContent = formatMoney((Number(item.qty) || 0) * (Number(item.price) || 0), $('currency').value);

  var tdAction = document.createElement('td');
  var removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn-secondary btn-small';
  removeBtn.textContent = 'Hapus';
  removeBtn.setAttribute('aria-label', 'Hapus item');
  removeBtn.addEventListener('click', function () {
    var idx = Array.prototype.indexOf.call($('itemsBody').children, tr);
    if (idx >= 0) {
      state.items.splice(idx, 1);
      renderRows();
      recalc();
    }
  });
  tdAction.appendChild(removeBtn);

  inputDesc.addEventListener('input', function () {
    var idx = Array.prototype.indexOf.call($('itemsBody').children, tr);
    if (idx >= 0) { state.items[idx].desc = inputDesc.value; }
  });
  inputQty.addEventListener('input', function () {
    var idx = Array.prototype.indexOf.call($('itemsBody').children, tr);
    if (idx >= 0) { state.items[idx].qty = inputQty.value; }
    tdTotal.textContent = formatMoney((Number(inputQty.value) || 0) * (Number(inputPrice.value) || 0), $('currency').value);
    recalc();
  });
  inputPrice.addEventListener('input', function () {
    var idx = Array.prototype.indexOf.call($('itemsBody').children, tr);
    if (idx >= 0) { state.items[idx].price = inputPrice.value; }
    tdTotal.textContent = formatMoney((Number(inputQty.value) || 0) * (Number(inputPrice.value) || 0), $('currency').value);
    recalc();
  });

  tr.appendChild(tdDesc);
  tr.appendChild(tdQty);
  tr.appendChild(tdPrice);
  tr.appendChild(tdTotal);
  tr.appendChild(tdAction);
  return tr;
}

function renderRows() {
  var body = $('itemsBody');
  body.innerHTML = '';
  for (var i = 0; i < state.items.length; i++) {
    body.appendChild(createRow(state.items[i]));
  }
}

function calcNumbers() {
  var subtotal = 0;
  for (var i = 0; i < state.items.length; i++) {
    var q = Number(state.items[i].qty) || 0;
    var p = Number(state.items[i].price) || 0;
    subtotal += q * p;
  }
  var discountRate = Number($('discountRate').value) || 0;
  var taxRate = Number($('taxRate').value) || 0;
  if (discountRate < 0) { discountRate = 0; }
  if (discountRate > 100) { discountRate = 100; }
  if (taxRate < 0) { taxRate = 0; }
  if (taxRate > 100) { taxRate = 100; }
  var discountAmt = subtotal * (discountRate / 100);
  var afterDiscount = subtotal - discountAmt;
  var taxAmt = afterDiscount * (taxRate / 100);
  var total = afterDiscount + taxAmt;
  return {
    subtotal: subtotal,
    discount: discountAmt,
    tax: taxAmt,
    total: total
  };
}

function recalc() {
  var c = calcNumbers();
  var cur = $('currency').value;
  $('subtotal').textContent = formatMoney(c.subtotal, cur);
  $('discount').textContent = formatMoney(c.discount, cur);
  $('tax').textContent = formatMoney(c.tax, cur);
  $('total').textContent = formatMoney(c.total, cur);
}

function setStatus(msg) {
  $('statusMsg').textContent = msg;
}

function addItem() {
  state.items.push({ desc: '', qty: 1, price: 0 });
  renderRows();
  recalc();
  var body = $('itemsBody');
  var lastRow = body.children[body.children.length - 1];
  if (lastRow) {
    var inp = lastRow.querySelector('.desc-input');
    if (inp) { inp.focus(); }
  }
}

function collectData() {
  var data = {
    invNumber: $('invNumber').value,
    invDate: $('invDate').value,
    companyName: $('companyName').value,
    clientName: $('clientName').value,
    clientAddress: $('clientAddress').value,
    currency: $('currency').value,
    taxRate: $('taxRate').value,
    discountRate: $('discountRate').value,
    items: []
  };
  for (var i = 0; i < state.items.length; i++) {
    data.items.push({
      desc: state.items[i].desc,
      qty: state.items[i].qty,
      price: state.items[i].price
    });
  }
  return data;
}

function applyData(data) {
  $('invNumber').value = data.invNumber || '';
  $('invDate').value = data.invDate || '';
  $('companyName').value = data.companyName || '';
  $('clientName').value = data.clientName || '';
  $('clientAddress').value = data.clientAddress || '';
  $('currency').value = data.currency || 'Rp';
  $('taxRate').value = data.taxRate !== undefined ? data.taxRate : '11';
  $('discountRate').value = data.discountRate !== undefined ? data.discountRate : '0';
  state.items = [];
  if (Array.isArray(data.items) && data.items.length > 0) {
    for (var i = 0; i < data.items.length; i++) {
      state.items.push({
        desc: data.items[i].desc || '',
        qty: data.items[i].qty !== undefined ? data.items[i].qty : 1,
        price: data.items[i].price !== undefined ? data.items[i].price : 0
      });
    }
  } else {
    state.items.push({ desc: '', qty: 1, price: 0 });
  }
  renderRows();
  recalc();
}

function saveData() {
  try {
    var data = collectData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setStatus('Data berhasil disimpan ke localStorage.');
  } catch (e) {
    setStatus('Gagal menyimpan data: ' + (e && e.message ? e.message : 'kesalahan tidak diketahui'));
  }
}

function loadData() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setStatus('Belum ada data tersimpan. Silakan simpan terlebih dahulu.');
      return;
    }
    var parsed = JSON.parse(raw);
    applyData(parsed);
    setStatus('Data berhasil dimuat dari localStorage.');
  } catch (e) {
    setStatus('Gagal memuat data: ' + (e && e.message ? e.message : 'kesalahan tidak diketahui'));
  }
}

function resetData() {
  state.items = [{ desc: '', qty: 1, price: 0 }];
  $('invNumber').value = 'INV-0001';
  $('invDate').value = '';
  $('companyName').value = 'Nama Perusahaan Anda';
  $('clientName').value = 'Nama Klien';
  $('clientAddress').value = 'Alamat Klien';
  $('currency').value = 'Rp';
  $('taxRate').value = '11';
  $('discountRate').value = '0';
  renderRows();
  recalc();
  setStatus('Formulir telah direset.');
}

function doPrint() {
  recalc();
  window.print();
}

function todayISO() {
  var d = new Date();
  var m = d.getMonth() + 1;
  var day = d.getDate();
  if (m < 10) { m = '0' + m; }
  if (day < 10) { day = '0' + day; }
  return d.getFullYear() + '-' + m + '-' + day;
}

function init() {
  $('invDate').value = todayISO();

  state.items = [{ desc: '', qty: 1, price: 0 }];

  var raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    raw = null;
  }
  if (raw) {
    try {
      var parsed = JSON.parse(raw);
      applyData(parsed);
      setStatus('Data sebelumnya berhasil dimuat otomatis.');
    } catch (e) {
      renderRows();
      recalc();
    }
  } else {
    renderRows();
    recalc();
  }

  $('addItem').addEventListener('click', addItem);
  $('saveBtn').addEventListener('click', saveData);
  $('loadBtn').addEventListener('click', loadData);
  $('resetBtn').addEventListener('click', resetData);
  $('printBtn').addEventListener('click', doPrint);

  $('taxRate').addEventListener('input', recalc);
  $('discountRate').addEventListener('input', recalc);
  $('currency').addEventListener('input', recalc);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
