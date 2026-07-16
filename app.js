// ===== Logika halaman toko + Asisten AI =====
let ALL = [];
let filtered = [];
let shown = 0;
const PAGE = 12;

const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const brandFilter = document.getElementById("brandFilter");
const sortSelect = document.getElementById("sortSelect");
const resultCount = document.getElementById("resultCount");
const loadMoreBtn = document.getElementById("loadMoreBtn");

init();

async function init() {
  ALL = await loadAllWatches();
  populateBrands();
  applyFilters();

  searchInput.addEventListener("input", applyFilters);
  brandFilter.addEventListener("change", applyFilters);
  sortSelect.addEventListener("change", applyFilters);
  loadMoreBtn.addEventListener("click", () => renderMore());

  setupChat();
  setupModal();
}

function populateBrands() {
  const brands = [...new Set(ALL.map((w) => w.merek))].sort();
  for (const b of brands) {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    brandFilter.appendChild(opt);
  }
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const brand = brandFilter.value;
  const sort = sortSelect.value;

  filtered = ALL.filter((w) => {
    const matchQ =
      !q ||
      w.merek.toLowerCase().includes(q) ||
      w.model.toLowerCase().includes(q);
    const matchBrand = !brand || w.merek === brand;
    return matchQ && matchBrand;
  });

  if (sort === "price-asc") filtered.sort((a, b) => a.harga - b.harga);
  else if (sort === "price-desc") filtered.sort((a, b) => b.harga - a.harga);
  else if (sort === "name-asc")
    filtered.sort((a, b) => (a.merek + a.model).localeCompare(b.merek + b.model));

  grid.innerHTML = "";
  shown = 0;
  renderMore();

  resultCount.textContent = `${filtered.length} jam tangan ditemukan`;
}

function renderMore() {
  const next = filtered.slice(shown, shown + PAGE);
  for (const w of next) grid.appendChild(cardEl(w));
  shown += next.length;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">Tidak ada jam tangan yang cocok. Coba kata kunci lain.</div>`;
  }
  loadMoreBtn.style.display = shown >= filtered.length ? "none" : "inline-block";
}

function cardEl(w) {
  const el = document.createElement("article");
  el.className = "card";
  el.innerHTML = `
    <img class="card-img" src="${w.foto}" alt="${w.merek} ${w.model}" loading="lazy"
         onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
    <div class="card-body">
      ${w.isNew ? '<span class="badge-new">Baru</span>' : ""}
      <span class="card-brand">${w.merek}</span>
      <h3 class="card-title">${w.model}</h3>
      <span class="card-meta">${w.warna || "-"} · ${w.material || "-"}</span>
      <span class="card-price">${formatRupiah(w.harga)}</span>
    </div>`;
  el.addEventListener("click", () => openModal(w));
  return el;
}

// ===== Modal detail =====
const modal = document.getElementById("detailModal");
const modalContent = document.getElementById("modalContent");

function setupModal() {
  document.getElementById("modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

function openModal(w) {
  modalContent.innerHTML = `
    <img class="modal-img" src="${w.foto}" alt="${w.model}"
         onerror="this.src='https://via.placeholder.com/520x325?text=No+Image'">
    <div class="modal-info">
      <span class="card-brand">${w.merek}</span>
      <h2>${w.model}</h2>
      <p style="color:var(--muted)">${w.deskripsi || ""}</p>
      <div class="price">${formatRupiah(w.harga)}</div>
      <ul class="spec-list">
        <li>Merek <span>${w.merek}</span></li>
        <li>Warna <span>${w.warna || "-"}</span></li>
        <li>Material <span>${w.material || "-"}</span></li>
      </ul>
    </div>`;
  modal.hidden = false;
}
function closeModal() {
  modal.hidden = true;
}

// ===================================================
// ============  ASISTEN AI (rule-based)  ============
// ===================================================
function setupChat() {
  const toggle = document.getElementById("chatToggle");
  const win = document.getElementById("chatWindow");
  const close = document.getElementById("chatClose");
  const form = document.getElementById("chatForm");
  const text = document.getElementById("chatText");

  toggle.addEventListener("click", () => {
    win.hidden = !win.hidden;
    if (!win.hidden && !form.dataset.greeted) {
      botSay(
        "Halo! 👋 Saya asisten AI ChronoStore. Saya bisa bantu:\n" +
          "• Rekomendasi sesuai budget (mis. \"budget 5 juta\")\n" +
          "• Cari merek (mis. \"ada Rolex?\")\n" +
          "• Jam termurah / termahal\n" +
          "• Info bahan & warna\n\nApa yang bisa saya bantu?"
      );
      form.dataset.greeted = "1";
    }
  });
  close.addEventListener("click", () => (win.hidden = true));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = text.value.trim();
    if (!q) return;
    userSay(q);
    text.value = "";
    setTimeout(() => respond(q), 250);
  });

  // Klik mini-kartu di dalam chat -> buka detail produk
  messages.addEventListener("click", (e) => {
    const card = e.target.closest(".mini-card");
    if (card) openById(card.dataset.id);
  });
  messages.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".mini-card");
    if (card) {
      e.preventDefault();
      openById(card.dataset.id);
    }
  });
}

// Buka modal produk berdasarkan id (id bisa angka atau string custom)
function openById(id) {
  const w = ALL.find((x) => String(x.id) === String(id));
  if (w) openModal(w);
}

const messages = document.getElementById("chatMessages");
function pushMsg(html, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.innerHTML = html;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
function botSay(t) {
  pushMsg(escapeHtml(t), "bot");
}
function userSay(t) {
  pushMsg(escapeHtml(t), "user");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function miniCard(w) {
  return `<div class="mini-card" data-id="${w.id}" role="button" tabindex="0" title="Lihat detail">
    <img src="${w.foto}" alt="" onerror="this.style.visibility='hidden'">
    <div><strong>${escapeHtml(w.merek)} ${escapeHtml(w.model)}</strong><br>
    <small>${formatRupiah(w.harga)}</small></div></div>`;
}

// Otak asisten AI: analisis maksud pengguna
function respond(qRaw) {
  const q = qRaw.toLowerCase();

  // Sapaan
  if (/\b(halo|hai|hi|hello|pagi|siang|sore|malam)\b/.test(q)) {
    return botSay("Halo juga! 😊 Mau cari jam tangan seperti apa hari ini?");
  }

  // Terima kasih
  if (/(terima kasih|makasih|thanks|thx)/.test(q)) {
    return botSay("Sama-sama! Senang bisa membantu. 🙏");
  }

  // Jumlah / berapa produk
  if (/(berapa|jumlah).*(jam|produk|barang|stok)/.test(q)) {
    const brands = new Set(ALL.map((w) => w.merek)).size;
    return botSay(
      `Saat ini tersedia ${ALL.length} jam tangan dari ${brands} merek berbeda.`
    );
  }

  // Termurah
  if (/(termurah|paling murah|murah)/.test(q)) {
    const w = [...ALL].sort((a, b) => a.harga - b.harga)[0];
    pushMsg(
      "Jam tangan termurah kami:" + miniCard(w),
      "bot"
    );
    return;
  }

  // Termahal
  if (/(termahal|paling mahal|mewah|termewah)/.test(q)) {
    const w = [...ALL].sort((a, b) => b.harga - a.harga)[0];
    pushMsg("Jam tangan termahal kami:" + miniCard(w), "bot");
    return;
  }

  // Budget / harga di bawah X
  const budget = parseBudget(q);
  if (budget !== null) {
    const opsi = ALL.filter((w) => w.harga <= budget)
      .sort((a, b) => b.harga - a.harga)
      .slice(0, 3);
    if (opsi.length === 0) {
      const termurah = [...ALL].sort((a, b) => a.harga - b.harga)[0];
      pushMsg(
        `Maaf, belum ada yang di bawah ${formatRupiah(budget)}. ` +
          `Yang termurah:` + miniCard(termurah),
        "bot"
      );
      return;
    }
    pushMsg(
      `Rekomendasi dengan budget ${formatRupiah(budget)}:` +
        opsi.map(miniCard).join(""),
      "bot"
    );
    return;
  }

  // Pencarian merek
  const brandHit = [...new Set(ALL.map((w) => w.merek))].find((b) =>
    q.includes(b.toLowerCase())
  );
  if (brandHit) {
    const list = ALL.filter((w) => w.merek === brandHit);
    const sample = list.slice(0, 3);
    pushMsg(
      `Ya, kami punya ${list.length} model ${brandHit}. Contohnya:` +
        sample.map(miniCard).join(""),
      "bot"
    );
    return;
  }

  // Material
  const materialHit = [
    "titanium",
    "stainless steel",
    "keramik",
    "emas",
    "kulit",
    "karet",
    "rose gold",
  ].find((m) => q.includes(m));
  if (materialHit) {
    const list = ALL.filter((w) =>
      (w.material || "").toLowerCase().includes(materialHit)
    );
    if (list.length) {
      pushMsg(
        `Ada ${list.length} jam dengan material ${materialHit}. Contoh:` +
          list.slice(0, 3).map(miniCard).join(""),
        "bot"
      );
      return;
    }
  }

  // Rekomendasi umum
  if (/(rekomendasi|saran|bagus|recommend)/.test(q)) {
    const pick = [...ALL].sort(() => Math.random() - 0.5).slice(0, 3);
    pushMsg(
      "Beberapa pilihan menarik untuk Anda:" + pick.map(miniCard).join(""),
      "bot"
    );
    return;
  }

  // Fallback
  botSay(
    "Maaf, saya belum paham. 🤔 Coba tanya seperti:\n" +
      "• \"budget 10 juta\"\n" +
      "• \"ada Seiko?\"\n" +
      "• \"jam termahal\"\n" +
      "• \"jam bahan titanium\""
  );
}

// Ubah teks budget menjadi angka rupiah
function parseBudget(q) {
  // format "5 juta", "10jt", "500 ribu", "2 milyar"
  const m = q.match(/(\d[\d.,]*)\s*(milyar|miliar|juta|jt|ribu|rb|k)?/);
  if (!m) return null;
  if (!/(budget|bawah|maksimal|max|kurang dari|dibawah|sekitar|harga|punya uang|dana|modal)/.test(q) &&
      !m[2]) {
    return null;
  }
  let n = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
  const unit = m[2] || "";
  if (/milyar|miliar/.test(unit)) n *= 1_000_000_000;
  else if (/juta|jt/.test(unit)) n *= 1_000_000;
  else if (/ribu|rb|k/.test(unit)) n *= 1_000;
  if (!n || n < 1000) return null;
  return n;
}
