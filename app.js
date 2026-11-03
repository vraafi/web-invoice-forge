'use strict';

var STORAGE_KEY = 'invoiceForge.v1';
var state = {
  invNumber: '',
  invDate: '',
  clientName: '',
  clientEmail: '',
  bizName: '',
  taxRate: 0,
  items: []
};

function $(id) {
  return document.getElementById(id);
}

function rupiah(n) {
  var num = Number(n) || 0;
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  } catch (e) {
    return 'Rp ' + Math.round(num).toLocaleString('en-US');
  }
}

function todayISO() {
  var d = new Date();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

function uid() {
  return 'it_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

function setStatus(msg) {
  var el = $('statusMsg');
  if (el) el.textContent = msg || '';
}

function defaultState() {
  return {
    invNumber: 'INV-0001',
    invDate: todayISO(),
    clientName: '',
    clientEmail: '',
    bizName: '',
    taxRate: 0,
    items: [{ id: uid(), desc: '', qty: 1, price: 0 }]
  };
}

function toSafeState(obj) {
  var base = defaultState();
  if (!obj || typeof obj !== 'object') return base;
  var out = {
    invNumber: typeof obj.invNumber === 'string' ? obj.invNumber : base.invNumber,
    invDate: typeof obj.invDate === 'string' ? obj.invDate : base.invDate,
    clientName: typeof obj.clientName === 'string' ? obj.clientName : '',
    clientEmail: typeof obj.clientEmail === 'string' ? obj.clientEmail : '',
    bizName: typeof obj.bizName === 'string' ? obj.bizName : '',
    taxRate: isFinite(Number(obj.taxRate)) ? Math.max(0, Math.min(100, Number(obj.taxRate))) : 0,
    items: []
  };
  if (Array.isArray(obj.items)) {
    obj.items.forEach(function (it) {
      if (!it || typeof it !== 'object') return;
      out.items.push({
        id: typeof it.id === 'string' && it.id ? it.id : uid(),
        desc: typeof it.desc === 'string' ? it.desc : '',
        qty: isFinite(Number(it.qty)) ? Math.max(0, Number(it.qty)) : 1,
        price: isFinite(Number(it.price)) ? Math.max(0, Number(it.price)) : 0
      });
    });
  }
  if (out.items.length === 0) out.items.push({ id: uid(), desc: '', qty: 1, price: 0 });
  return out;
}

function loadState() {
  var raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    raw = null;
  }
  if (!raw) {
    state = defaultState();
    return;
  }
  try {
    state = toSafeState(JSON.parse(raw));
  } catch (e) {
    state = defaultState();
  }
}

function saveState(silent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!silent) setStatus('Data tersimpan di localStorage.');
    return true;
  } catch (e) {
    if (!silent) setStatus('Gagal menyimpan ke localStorage.');
    return false;
  }
}

function syncInputsFromState() {
  $('invNumber').value = state.invNumber;
  $('invDate').value = state.invDate;
  $('clientName').value = state.clientName;
  $('clientEmail').value = state.clientEmail;
  $('bizName').value = state.bizName;
  $('taxRate').value = String(state.taxRate);
}

function readInputsToState() {
  state.invNumber = $('invNumber').value;
  state.invDate = $('invDate').value;
  state.clientName = $('clientName').value;
  state.clientEmail = $('clientEmail').value;
  state.bizName = $('bizName').value;
  var tr = Number($('taxRate').value);
  state.taxRate = isFinite(tr) ? Math.max(0, Math.min(100, tr)) : 0;
}

function computeTotals() {
  var sub = 0;
  state.items.forEach(function (it) {
    sub += (Number(it.qty) || 0) * (Number(it.price) || 0);
  });
  var tax = sub * ((Number(state.taxRate) || 0) / 100);
  return { sub: sub, tax: tax, total: sub + tax };
}

function renderSummary() {
  var t = computeTotals();
  $('sumSub').textContent = rupiah(t.sub);
  $('sumTax').textContent = rupiah(t.tax) + ' (' + (Number(state.taxRate) || 0) + '%)';
  $('sumTotal').textContent = rupiah(t.total);
}

function makeCellInput(value, type, cls, placeholder) {
  var input = document.createElement('input');
  input.type = type;
  input.className = cls;
  input.value = value;
  if (placeholder) input.placeholder = placeholder;
  return input;
}

function renderItems() {
  var tbody = $('itemRows');
  tbody.textContent = '';
  state.items.forEach(function (it, index) {
    var tr = document.createElement('tr');

    var tdDesc = document.createElement('td');
    var descInput = makeCellInput(it.desc, 'text', 'cell-input', 'Deskripsi item');
    descInput.setAttribute('aria-label', 'Deskripsi item ' + (index + 1));
    descInput.addEventListener('input', function () {
      state.items[index].desc = descInput.value;
    });
    tdDesc.appendChild(descInput);

    var tdQty = document.createElement('td');
    var qtyInput = makeCellInput(String(it.qty), 'number', 'cell-input num', '');
    qtyInput.min = '0';
    qtyInput.step = '1';
    qtyInput.setAttribute('aria-label', 'Qty item ' + (index + 1));
    qtyInput.addEventListener('input', function () {
      var v = Number(qtyInput.value);
      state.items[index].qty = isFinite(v) && v >= 0 ? v : 0;
      renderSummary();
    });
    tdQty.appendChild(qtyInput);

    var tdPrice = document.createElement('td');
    var priceInput = makeCellInput(String(it.price), 'number', 'cell-input num', '');
    priceInput.min = '0';
    priceInput.step = '0.01';
    priceInput.setAttribute('aria-label', 'Harga item ' + (index + 1));
    priceInput.addEventListener('input', function () {
      var v = Number(priceInput.value);
      state.items[index].price = isFinite(v) && v >= 0 ? v : 0;
      renderSummary();
    });
    tdPrice.appendChild(priceInput);

    var tdSub = document.createElement('td');
    tdSub.className = 'subtotal-cell';
    tdSub.textContent = rupiah((Number(it.qty) || 0) * (Number(it.price) || 0));

    var tdAct = document.createElement('td');
    var delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn secondary small';
    delBtn.textContent = 'Hapus';
    delBtn.setAttribute('aria-label', 'Hapus item ' + (index + 1));
    delBtn.addEventListener('click', function () {
      state.items.splice(index, 1);
      if (state.items.length === 0) {
        state.items.push({ id: uid(), desc: '', qty: 1, price: 0 });
      }
      renderItems();
      renderSummary();
      saveState(true);
      setStatus('Item dihapus.');
    });
    tdAct.appendChild(delBtn);

    tr.appendChild(tdDesc);
    tr.appendChild(tdQty);
    tr.appendChild(tdPrice);
    tr.appendChild(tdSub);
    tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
}

function refresh() {
  renderItems();
  renderSummary();
}

function addItem() {
  state.items.push({ id: uid(), desc: '', qty: 1, price: 0 });
  renderItems();
  renderSummary();
  saveState(true);
  setStatus('Item ditambahkan.');
}

function resetAll() {
  state = defaultState();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    void e;
  }
  syncInputsFromState();
  refresh();
  setStatus('Data direset.');
}

function init() {
  loadState();
  syncInputsFromState();
  refresh();

  ['invNumber', 'invDate', 'clientName', 'clientEmail', 'bizName', 'taxRate'].forEach(function (id) {
    var el = $(id);
    el.addEventListener('input', function () {
      readInputsToState();
      renderSummary();
    });
    el.addEventListener('change', function () {
      readInputsToState();
      renderSummary();
      saveState(true);
    });
  });

  $('addItem').addEventListener('click', addItem);

  $('saveBtn').addEventListener('click', function () {
    readInputsToState();
    renderSummary();
    var ok = saveState(false);
    if (ok) {
      var t = computeTotals();
      setStatus('Tersimpan. Total: ' + rupiah(t.total));
    }
  });

  $('printBtn').addEventListener('click', function () {
    readInputsToState();
    renderSummary();
    saveState(true);
    var msg = $('statusMsg');
    if (msg) msg.textContent = '';
    window.print();
  });

  $('resetBtn').addEventListener('click', function () {
    if (window.confirm('Reset semua data invoice?')) {
      resetAll();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
