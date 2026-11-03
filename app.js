'use strict';

(function () {
  var STORAGE_KEY = 'invoice-forge-v1';
  var currencySymbols = { IDR: 'Rp', USD: '$', EUR: '\u20AC' };
  var currencyLocale = { IDR: 'id-ID', USD: 'en-US', EUR: 'de-DE' };

  var els = {
    company: document.getElementById('company'),
    client: document.getElementById('client'),
    invno: document.getElementById('invno'),
    invdate: document.getElementById('invdate'),
    duedate: document.getElementById('duedate'),
    currency: document.getElementById('currency'),
    items: document.getElementById('items'),
    addItem: document.getElementById('addItem'),
    taxrate: document.getElementById('taxrate'),
    subtotal: document.getElementById('subtotal'),
    taxamount: document.getElementById('taxamount'),
    grand: document.getElementById('grand'),
    printBtn: document.getElementById('printBtn'),
    saveBtn: document.getElementById('saveBtn'),
    resetBtn: document.getElementById('resetBtn'),
    status: document.getElementById('status')
  };

  var state = {
    company: '',
    client: '',
    invno: 'INV-001',
    invdate: '',
    duedate: '',
    currency: 'IDR',
    taxrate: 11,
    items: []
  };

  var itemSeq = 0;

  function newItem(data) {
    itemSeq += 1;
    return {
      id: 'it' + itemSeq,
      desc: data && typeof data.desc === 'string' ? data.desc : '',
      qty: data && isFinite(data.qty) ? Number(data.qty) : 1,
      price: data && isFinite(data.price) ? Number(data.price) : 0
    };
  }

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function fmt(n) {
    var cur = state.currency || 'IDR';
    var locale = currencyLocale[cur] || 'id-ID';
    var sym = currencySymbols[cur] || '';
    var num = isFinite(n) ? n : 0;
    var rounded = Math.round(num * 100) / 100;
    var s;
    try {
      s = rounded.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    } catch (e) {
      s = String(rounded);
    }
    return sym + ' ' + s;
  }

  function computeTotals() {
    var sub = 0;
    state.items.forEach(function (it) {
      var q = isFinite(it.qty) ? it.qty : 0;
      var p = isFinite(it.price) ? it.price : 0;
      sub += q * p;
    });
    var rate = isFinite(state.taxrate) ? state.taxrate : 0;
    var tax = sub * (rate / 100);
    return { subtotal: sub, tax: tax, grand: sub + tax };
  }

  function renderTotals() {
    var t = computeTotals();
    els.subtotal.textContent = fmt(t.subtotal);
    els.taxamount.textContent = fmt(t.tax);
    els.grand.textContent = fmt(t.grand);
  }

  function createItemRow(item) {
    var row = document.createElement('div');
    row.className = 'item-row';
    row.dataset.id = item.id;

    var descWrap = document.createElement('label');
    descWrap.className = 'field grow';
    var descSpan = document.createElement('span');
    descSpan.textContent = 'Deskripsi';
    var desc = document.createElement('input');
    desc.type = 'text';
    desc.value = item.desc;
    desc.placeholder = 'Nama barang/jasa';
    desc.dataset.role = 'desc';
    descWrap.appendChild(descSpan);
    descWrap.appendChild(desc);

    var qtyWrap = document.createElement('label');
    qtyWrap.className = 'field narrow';
    var qtySpan = document.createElement('span');
    qtySpan.textContent = 'Qty';
    var qty = document.createElement('input');
    qty.type = 'number';
    qty.min = '0';
    qty.step = 'any';
    qty.value = String(item.qty);
    qty.inputMode = 'decimal';
    qty.dataset.role = 'qty';
    qtyWrap.appendChild(qtySpan);
    qtyWrap.appendChild(qty);

    var priceWrap = document.createElement('label');
    priceWrap.className = 'field narrow';
    var priceSpan = document.createElement('span');
    priceSpan.textContent = 'Harga Satuan';
    var price = document.createElement('input');
    price.type = 'number';
    price.min = '0';
    price.step = 'any';
    price.value = String(item.price);
    price.inputMode = 'decimal';
    price.dataset.role = 'price';
    priceWrap.appendChild(priceSpan);
    priceWrap.appendChild(price);

    var lineWrap = document.createElement('div');
    lineWrap.className = 'field narrow line-total';
    var lineSpan = document.createElement('span');
    lineSpan.textContent = 'Jumlah';
    var lineVal = document.createElement('span');
    lineVal.className = 'line-val';
    lineVal.dataset.role = 'line';
    lineWrap.appendChild(lineSpan);
    lineWrap.appendChild(lineVal);

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn danger';
    del.textContent = 'Hapus';
    del.addEventListener('click', function () {
      removeItem(item.id);
    });

    desc.addEventListener('input', function () {
      updateItemField(item.id, 'desc', desc.value);
    });
    qty.addEventListener('input', function () {
      updateItemField(item.id, 'qty', parseFloat(qty.value));
    });
    price.addEventListener('input', function () {
      updateItemField(item.id, 'price', parseFloat(price.value));
    });

    row.appendChild(descWrap);
    row.appendChild(qtyWrap);
    row.appendChild(priceWrap);
    row.appendChild(lineWrap);
    row.appendChild(del);
    return row;
  }

  function refreshLineTotals() {
    var rows = els.items.querySelectorAll('.item-row');
    rows.forEach(function (row) {
      var id = row.dataset.id;
      var item = findItem(id);
      if (!item) return;
      var lineEl = row.querySelector('[data-role="line"]');
      if (lineEl) {
        var line = (isFinite(item.qty) ? item.qty : 0) * (isFinite(item.price) ? item.price : 0);
        lineEl.textContent = fmt(line);
      }
    });
  }

  function findItem(id) {
    for (var i = 0; i < state.items.length; i++) {
      if (state.items[i].id === id) return state.items[i];
    }
    return null;
  }

  function updateItemField(id, field, value) {
    var item = findItem(id);
    if (!item) return;
    if (field === 'desc') {
      item.desc = String(value);
    } else if (field === 'qty') {
      item.qty = isFinite(value) ? value : 0;
    } else if (field === 'price') {
      item.price = isFinite(value) ? value : 0;
    }
    refreshLineTotals();
    renderTotals();
  }

  function removeItem(id) {
    state.items = state.items.filter(function (it) { return it.id !== id; });
    var row = els.items.querySelector('[data-id="' + id + '"]');
    if (row && row.parentNode) row.parentNode.removeChild(row);
    refreshLineTotals();
    renderTotals();
    setStatus('Item dihapus.');
  }

  function addItemRow(item) {
    var it = item || newItem(null);
    if (!item) state.items.push(it);
    els.items.appendChild(createItemRow(it));
    refreshLineTotals();
    renderTotals();
    return it;
  }

  function setStatus(msg) {
    els.status.textContent = msg || '';
  }

  function readForm() {
    state.company = els.company.value;
    state.client = els.client.value;
    state.invno = els.invno.value;
    state.invdate = els.invdate.value;
    state.duedate = els.duedate.value;
    state.currency = els.currency.value;
    var rate = parseFloat(els.taxrate.value);
    state.taxrate = isFinite(rate) ? rate : 0;
  }

  function fillForm() {
    els.company.value = state.company || '';
    els.client.value = state.client || '';
    els.invno.value = state.invno || '';
    els.invdate.value = state.invdate || '';
    els.duedate.value = state.duedate || '';
    els.currency.value = state.currency || 'IDR';
    els.taxrate.value = String(isFinite(state.taxrate) ? state.taxrate : 0);
  }

  function renderItems() {
    els.items.innerHTML = '';
    state.items.forEach(function (it) {
      els.items.appendChild(createItemRow(it));
    });
    refreshLineTotals();
    renderTotals();
  }

  function save() {
    readForm();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStatus('Data tersimpan di localStorage.');
    } catch (e) {
      setStatus('Gagal menyimpan: ' + (e && e.message ? e.message : 'unknown'));
    }
  }

  function load() {
    var raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      raw = null;
    }
    if (!raw) return false;
    try {
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return false;
      state.company = typeof data.company === 'string' ? data.company : '';
      state.client = typeof data.client === 'string' ? data.client : '';
      state.invno = typeof data.invno === 'string' ? data.invno : 'INV-001';
      state.invdate = typeof data.invdate === 'string' ? data.invdate : '';
      state.duedate = typeof data.duedate === 'string' ? data.duedate : '';
      state.currency = ['IDR', 'USD', 'EUR'].indexOf(data.currency) !== -1 ? data.currency : 'IDR';
      state.taxrate = isFinite(data.taxrate) ? Number(data.taxrate) : 11;
      state.items = [];
      if (Array.isArray(data.items)) {
        data.items.forEach(function (d) {
          if (d && typeof d === 'object') {
            state.items.push(newItem({ desc: d.desc, qty: d.qty, price: d.price }));
          }
        });
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    state.company = '';
    state.client = '';
    state.invno = 'INV-001';
    state.invdate = todayISO();
    state.duedate = '';
    state.currency = 'IDR';
    state.taxrate = 11;
    state.items = [];
    fillForm();
    addItemRow();
    setStatus('Data direset.');
  }

  function init() {
    els.invdate.value = todayISO();
    if (load()) {
      fillForm();
      renderItems();
      if (state.items.length === 0) addItemRow();
      setStatus('Data dimuat dari localStorage.');
    } else {
      state.invdate = todayISO();
      fillForm();
      addItemRow();
      setStatus('Siap membuat invoice.');
    }

    els.company.addEventListener('input', function () { state.company = els.company.value; });
    els.client.addEventListener('input', function () { state.client = els.client.value; });
    els.invno.addEventListener('input', function () { state.invno = els.invno.value; });
    els.duedate.addEventListener('input', function () { state.duedate = els.duedate.value; });
    els.invdate.addEventListener('input', function () { state.invdate = els.invdate.value; });
    els.duedate.addEventListener('input', function () { state.duedate = els.duedate.value; });
    els.currency.addEventListener('change', function () {
      state.currency = els.currency.value;
      renderTotals();
      refreshLineTotals();
    });
    els.taxrate.addEventListener('input', function () {
      var v = parseFloat(els.taxrate.value);
      state.taxrate = isFinite(v) ? v : 0;
      renderTotals();
    });

    els.addItem.addEventListener('click', function () {
      addItemRow();
      setStatus('Item ditambahkan.');
    });

    els.saveBtn.addEventListener('click', save);
    els.resetBtn.addEventListener('click', reset);

    els.printBtn.addEventListener('click', function () {
      readForm();
      renderTotals();
      refreshLineTotals();
      setStatus('Menyiapkan cetak...');
      setTimeout(function () {
        window.print();
        setStatus('Dialog cetak dibuka. Pilih Simpan sebagai PDF.');
      }, 120);
    });

    renderTotals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
