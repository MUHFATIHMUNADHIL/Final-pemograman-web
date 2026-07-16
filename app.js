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
  setupCart();
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
      <button class="btn btn-primary" id="addToCartBtn" style="width:100%;margin-top:16px;">
        🛒 Tambah ke Keranjang
      </button>
    </div>`;
  document.getElementById("addToCartBtn").addEventListener("click", () => {
    addToCart(w.id);
    closeModal();
    openCart();
  });
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

// ===================================================
// ==============  KERANJANG & CHECKOUT  =============
// ===================================================
const CART_KEY = "chronostore_cart";
let cart = loadCart();

const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");
const checkoutModal = document.getElementById("checkoutModal");

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}
function persistCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function setupCart() {
  updateCartCount();
  cartBtn.addEventListener("click", openCart);
  document.getElementById("cartCloseBtn").addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);
  document.getElementById("checkoutBtn").addEventListener("click", startCheckout);
  document.getElementById("checkoutClose").addEventListener("click", () => {
    checkoutModal.hidden = true;
  });
  document.getElementById("checkoutForm").addEventListener("submit", submitOrder);
}

function addToCart(id) {
  const item = cart.find((c) => String(c.id) === String(id));
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  persistCart();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find((c) => String(c.id) === String(id));
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((c) => String(c.id) !== String(id));
  persistCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((c) => String(c.id) !== String(id));
  persistCart();
  renderCart();
}

function cartDetailed() {
  return cart
    .map((c) => {
      const w = ALL.find((x) => String(x.id) === String(c.id));
      return w ? { ...w, qty: c.qty } : null;
    })
    .filter(Boolean);
}

function cartTotal() {
  return cartDetailed().reduce((sum, w) => sum + w.harga * w.qty, 0);
}

function updateCartCount() {
  const n = cart.reduce((s, c) => s + c.qty, 0);
  cartCountEl.textContent = n;
}

function openCart() {
  renderCart();
  cartOverlay.hidden = false;
  cartDrawer.hidden = false;
}
function closeCart() {
  cartOverlay.hidden = true;
  cartDrawer.hidden = true;
}

function renderCart() {
  const items = cartDetailed();
  if (items.length === 0) {
    cartItemsEl.innerHTML =
      '<p class="cart-empty">Keranjang masih kosong.<br>Yuk pilih jam tangan favoritmu! 🕶️</p>';
    cartTotalEl.textContent = formatRupiah(0);
    return;
  }
  cartItemsEl.innerHTML = "";
  for (const w of items) {
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <img src="${w.foto}" alt="" onerror="this.src='https://via.placeholder.com/60?text=?'">
      <div class="ci-info">
        <strong>${escapeHtml(w.merek)} ${escapeHtml(w.model)}</strong>
        <small>${formatRupiah(w.harga)}</small>
        <div class="qty-control">
          <button data-act="dec">−</button>
          <span>${w.qty}</span>
          <button data-act="inc">+</button>
        </div>
      </div>
      <button class="ci-remove" data-act="rm">Hapus</button>`;
    el.querySelector('[data-act="inc"]').addEventListener("click", () => changeQty(w.id, 1));
    el.querySelector('[data-act="dec"]').addEventListener("click", () => changeQty(w.id, -1));
    el.querySelector('[data-act="rm"]').addEventListener("click", () => removeFromCart(w.id));
    cartItemsEl.appendChild(el);
  }
  cartTotalEl.textContent = formatRupiah(cartTotal());
}

function startCheckout() {
  const items = cartDetailed();
  if (items.length === 0) {
    alert("Keranjang masih kosong.");
    return;
  }
  const summary = document.getElementById("checkoutSummary");
  summary.innerHTML =
    items
      .map(
        (w) =>
          `<div class="cs-row"><span>${escapeHtml(w.merek)} ${escapeHtml(
            w.model
          )} × ${w.qty}</span><span>${formatRupiah(w.harga * w.qty)}</span></div>`
      )
      .join("") +
    `<div class="cs-row cs-total"><span>Total</span><span>${formatRupiah(
      cartTotal()
    )}</span></div>`;
  // reset form ke tampilan awal jika sebelumnya sukses
  document.getElementById("checkoutForm").style.display = "";
  closeCart();
  checkoutModal.hidden = false;
}

function submitOrder(e) {
  e.preventDefault();
  const nama = document.getElementById("coName").value.trim();
  const total = cartTotal();
  const orderId = "INV-" + Date.now().toString().slice(-8);

  // kosongkan keranjang
  cart = [];
  persistCart();

  // tampilkan konfirmasi
  const box = checkoutModal.querySelector(".modal-info");
  box.innerHTML = `
    <div class="order-success">
      <div class="check">✅</div>
      <h2>Pesanan Berhasil!</h2>
      <p style="color:var(--muted)">Terima kasih, <strong>${escapeHtml(
        nama
      )}</strong>. Pesananmu sedang diproses.</p>
      <ul class="spec-list" style="margin:18px 0;">
        <li>No. Pesanan <span>${orderId}</span></li>
        <li>Total Bayar <span>${formatRupiah(total)}</span></li>
      </ul>
      <button class="btn btn-primary" id="okOrder" style="width:100%;">Selesai</button>
    </div>`;
  document.getElementById("okOrder").addEventListener("click", () => {
    checkoutModal.hidden = true;
    box.innerHTML = savedCheckoutHtml; // pulihkan form untuk pesanan berikutnya
    reattachCheckout();
  });
}

// Simpan HTML form checkout asli agar bisa dipulihkan setelah sukses
const savedCheckoutHtml = checkoutModal.querySelector(".modal-info").innerHTML;
function reattachCheckout() {
  document.getElementById("checkoutForm").addEventListener("submit", submitOrder);
}
