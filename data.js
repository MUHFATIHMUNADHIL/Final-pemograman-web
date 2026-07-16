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
