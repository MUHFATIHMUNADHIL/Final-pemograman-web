// ===== Modul data bersama (dipakai app.js & admin.js) =====
const STORAGE_KEY = "chronostore_custom_watches";

// Ambil jam tangan tambahan dari localStorage (yang ditambahkan lewat halaman admin)
function getCustomWatches() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCustomWatches(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ===== Simulasi REST API (GET, POST, PUT, PATCH, DELETE) =====
// Proyek ini statis (tanpa server backend), jadi kelima method HTTP disimulasikan
// di atas localStorage supaya panel admin tetap punya siklus CRUD yang lengkap.

// GET /watches -> semua data custom
function apiGetWatches() {
  return getCustomWatches();
}

// GET /watches/:id -> satu data custom
function apiGetWatchById(id) {
  return getCustomWatches().find((w) => w.id === id) || null;
}

// POST /watches -> tambah data baru
function apiPostWatch(data) {
  const list = getCustomWatches();
  const newWatch = { id: "c" + Date.now(), ...data };
  list.unshift(newWatch);
  saveCustomWatches(list);
  return newWatch;
}

// PUT /watches/:id -> ganti seluruh field data (replace penuh)
function apiPutWatch(id, data) {
  const list = getCustomWatches();
  const idx = list.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  list[idx] = { ...data, id };
  saveCustomWatches(list);
  return list[idx];
}

// PATCH /watches/:id -> ubah sebagian field saja
function apiPatchWatch(id, partialData) {
  const list = getCustomWatches();
  const idx = list.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...partialData };
  saveCustomWatches(list);
  return list[idx];
}

// DELETE /watches/:id -> hapus satu data
function apiDeleteWatch(id) {
  const list = getCustomWatches();
  const filtered = list.filter((w) => w.id !== id);
  saveCustomWatches(filtered);
  return filtered.length !== list.length;
}

// Muat data dari jam-tangan.json lalu gabungkan dengan data custom
async function loadAllWatches() {
  let base = [];
  try {
    const res = await fetch("jam-tangan.json");
    const json = await res.json();
    base = json.jamTangan || [];
  } catch (e) {
    console.error("Gagal memuat jam-tangan.json", e);
  }
  const custom = getCustomWatches();
  // data custom ditandai isNew agar bisa diberi badge
  return [...custom.map((w) => ({ ...w, isNew: true })), ...base];
}

function formatRupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}
