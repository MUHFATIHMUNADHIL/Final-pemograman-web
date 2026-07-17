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

// Animasi mewah: elemen fade + naik saat pertama kali masuk viewport
const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add("reveal-in");
          // Lepas class animasi setelah selesai, supaya transform bebas
          // dipakai lagi oleh efek hover (animation forwards mengunci transform).
          el.addEventListener(
            "animationend",
            () => el.classList.remove("reveal-pending", "reveal-in"),
            { once: true }
          );
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.15 })
  : null;

function observeReveal(el, index = 0) {
  el.classList.add("reveal-pending");
  el.style.animationDelay = `${Math.min(index, 6) * 0.035}s`;
  if (!revealObserver) {
    el.classList.add("reveal-in");
    return;
  }
  revealObserver.observe(el);
}

function setupScrollReveal() {
  document.querySelectorAll(".section-heading, .section-sub").forEach((el) => observeReveal(el));
  document.querySelectorAll(".footer-col").forEach((el, i) => observeReveal(el, i));
  const newsletterInner = document.querySelector(".footer-newsletter-inner");
  if (newsletterInner) observeReveal(newsletterInner);
}

init();

async function init() {
  try {
    ALL = await loadAllWatches();
  } catch (err) {
    console.error("Gagal memuat data jam tangan:", err);
    ALL = [];
  }
  populateBrands();
  applyFilters();

  searchInput.addEventListener("input", applyFilters);
  brandFilter.addEventListener("change", applyFilters);
  sortSelect.addEventListener("change", applyFilters);
  loadMoreBtn.addEventListener("click", () => renderMore());

  enhanceSelect(sortSelect);
  enhanceSelect(brandFilter);

  // Setiap bagian dijalankan terpisah agar satu error tidak menghentikan yang lain
  runSafely(setupChat, "chat");
  runSafely(setupModal, "modal");
  runSafely(setupCart, "keranjang");
  runSafely(setupHeroParticles, "partikel hero");
  runSafely(setupNewArrivals, "produk baru");
  runSafely(setupBrandLogos, "logo merek");
  runSafely(setupTopExpensive, "jam tangan termahal");
  runSafely(setupScrollReveal, "animasi scroll");
}

function runSafely(fn, label) {
  try {
    fn();
  } catch (err) {
    console.error(`Gagal memuat bagian "${label}":`, err);
  }
}

// Carousel hero: autoplay gambar + dot navigasi
(function setupHeroCarousel() {
  const slides = document.querySelectorAll("#heroSlides .hero-slide");
  const dotsWrap = document.getElementById("heroDots");
  if (!slides.length || !dotsWrap) return;

  let active = 0;
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Slide ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll(".hero-dot");

  function goTo(i) {
    slides[active].classList.remove("is-active");
    dots[active].classList.remove("is-active");
    active = i;
    slides[active].classList.add("is-active");
    dots[active].classList.add("is-active");
  }

  setInterval(() => goTo((active + 1) % slides.length), 2000);
})();

// Baris "Produk Baru": carousel horizontal dari data yang sama
function setupNewArrivals() {
  const row = document.getElementById("newArrivalsRow");
  if (!row) return;
  const picks = ALL.slice(0, 10);

  if (picks.length === 0) {
    row.innerHTML = '<p style="color:var(--muted);padding:20px 0;">Belum ada produk untuk ditampilkan. Cek koneksi ke jam-tangan.json.</p>';
    return;
  }

  row.innerHTML = "";
  picks.forEach((w, i) => row.appendChild(newArrivalCardEl(w, i)));

  const prev = document.getElementById("newArrivalsPrev");
  const next = document.getElementById("newArrivalsNext");
  const step = () => row.clientWidth * 0.7;
  if (prev) prev.addEventListener("click", () => row.scrollBy({ left: -step(), behavior: "smooth" }));
  if (next) next.addEventListener("click", () => row.scrollBy({ left: step(), behavior: "smooth" }));
}

// Kartu produk baru bergaya badge diskon + harga coret
function newArrivalCardEl(w, i) {
  // Diskon semu untuk tampilan, dibuat konsisten berdasarkan id produk
  const discount = [45, 35, 23, 45, 45, 23, 35, 45, 23, 45][i % 10];
  const original = Math.round((w.harga / (1 - discount / 100)) / 1000) * 1000;

  const el = document.createElement("article");
  el.className = "new-card";
  el.innerHTML = `
    <div class="new-card-img">
      <span class="new-card-badge">${discount}%</span>
      <img src="${w.foto}" alt="${w.merek} ${w.model}" loading="lazy"
           onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
    </div>
    <p class="new-card-title">${w.merek} ${w.model}</p>
    <p class="new-card-del">${formatRupiah(original)}</p>
    <p class="new-card-price">${formatRupiah(w.harga)}</p>`;
  el.addEventListener("click", () => openModal(w));
  return el;
}

// 5 jam tangan termahal: grid dengan animasi mewah
function setupTopExpensive() {
  const wrap = document.getElementById("topExpensiveGrid");
  if (!wrap) return;
  const top5 = [...ALL].sort((a, b) => b.harga - a.harga).slice(0, 5);

  if (top5.length === 0) {
    wrap.innerHTML = '<p style="color:var(--muted);padding:20px 0;">Belum ada produk untuk ditampilkan.</p>';
    return;
  }

  wrap.innerHTML = "";
  top5.forEach((w, i) => {
    const el = document.createElement("article");
    el.className = "luxury-card";
    el.innerHTML = `
      <span class="luxury-rank">${i + 1}</span>
      <div class="luxury-card-img">
        <img src="${w.foto}" alt="${w.merek} ${w.model}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
      </div>
      <p class="luxury-card-title">${w.merek} ${w.model}</p>
      <p class="luxury-card-price">${formatRupiah(w.harga)}</p>`;
    el.addEventListener("click", () => openModal(w));
    observeReveal(el, i);
    wrap.appendChild(el);
  });
}

// Grid logo merek: dibuat otomatis dari daftar merek yang tersedia
function setupBrandLogos() {
  const wrap = document.getElementById("brandLogos");
  if (!wrap) return;
  const brands = [...new Set(ALL.map((w) => w.merek))].sort();
  wrap.innerHTML = "";
  for (const b of brands) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "brand-logo-item";
    item.innerHTML = `<span class="avatar">${b.charAt(0)}</span><span>${b}</span>`;
    item.addEventListener("click", () => {
      brandFilter.value = b;
      brandFilter.dispatchEvent(new Event("change"));
      syncDropdownLabel(brandFilter);
      document.getElementById("produk").scrollIntoView({ behavior: "smooth" });
    });
    wrap.appendChild(item);
  }
}

// Sinkronkan tampilan dropdown kustom setelah <select> diubah lewat kode
function syncDropdownLabel(select) {
  const dd = select.previousElementSibling;
  if (!dd || !dd.classList.contains("dropdown")) return;
  const opt = select.options[select.selectedIndex];
  dd.querySelector(".dropdown-trigger span").textContent = opt.textContent;
  dd.querySelectorAll(".dropdown-option").forEach((o, i) => {
    o.classList.toggle("selected", i === select.selectedIndex);
  });
}

// Form newsletter (front-end saja, tanpa backend)
(function setupNewsletter() {
  const form = document.getElementById("newsletterForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("newsletterEmail");
    alert(`Terima kasih! Promo akan dikirim ke ${input.value}`);
    form.reset();
  });
})();

// Ubah <select> menjadi dropdown kustom bergaya tema
function enhanceSelect(select) {
  const dd = document.createElement("div");
  dd.className = "dropdown";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "dropdown-trigger";
  const label = document.createElement("span");
  label.textContent = select.options[select.selectedIndex].textContent;
  trigger.append(label, Object.assign(document.createElement("span"), {
    className: "arrow",
    textContent: "▼",
  }));

  const menu = document.createElement("div");
  menu.className = "dropdown-menu";

  [...select.options].forEach((opt) => {
    const item = document.createElement("div");
    item.className = "dropdown-option" + (opt.selected ? " selected" : "");
    item.textContent = opt.textContent;
    item.addEventListener("click", () => {
      select.value = opt.value;
      select.dispatchEvent(new Event("change"));
      label.textContent = opt.textContent;
      menu.querySelectorAll(".dropdown-option").forEach((o) => o.classList.remove("selected"));
      item.classList.add("selected");
      dd.classList.remove("open");
    });
    menu.appendChild(item);
  });

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".dropdown.open").forEach((o) => {
      if (o !== dd) o.classList.remove("open");
    });
    dd.classList.toggle("open");
  });

  // Sisipkan dropdown & sembunyikan select asli
  select.parentNode.insertBefore(dd, select);
  dd.append(trigger, menu);
  select.style.display = "none";

  // Tutup saat klik di luar
  document.addEventListener("click", () => dd.classList.remove("open"));
}

// Partikel hero — floating sparks dengan breathing pulse (design NXA)
function setupHeroParticles() {
  const wrap = document.getElementById("heroParticles");
  if (!wrap) return;
  const COUNT = 40;
  for (let i = 0; i < COUNT; i++) {
    const size = Math.random() * 4 + 1;
    const s = document.createElement("span");
    s.className = "spark";
    s.style.width = size + "px";
    s.style.height = size + "px";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.opacity = Math.random() * 0.5 + 0.1;
    wrap.appendChild(s);
    s.animate(
      [{ opacity: 0.05 }, { opacity: Math.random() * 0.8 + 0.2 }, { opacity: 0.05 }],
      {
        duration: 2200 + Math.random() * 3800,
        iterations: Infinity,
        delay: Math.random() * 3000,
        easing: "ease-in-out",
      }
    );
  }
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
  next.forEach((w, i) => {
    const el = cardEl(w);
    observeReveal(el, i);
    grid.appendChild(el);
  });
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
        "Halo! 👋 Selamat datang di ChronoStore! Saya asisten AI yang siap bantu Anda menemukan jam tangan idaman. Saya bisa:\n" +
          "• 🎯 Rekomendasi kombinasi (mis. \"rolex warna hitam budget 500 juta\")\n" +
          "• 💰 Rentang harga (mis. \"antara 5 juta sampai 20 juta\")\n" +
          "• 🔍 Cari merek, warna, atau bahan (santai aja kalau typo, saya tetap mengerti)\n" +
          "• 🏆 Jam termurah / termahal\n" +
          "• ⚖️ Bandingkan 2 jam (mis. \"bandingkan seiko dan casio\")\n\n" +
          "Ceritakan saja apa yang Anda cari, saya bantu carikan yang paling pas! 😊"
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
    <small>${formatRupiah(w.harga)}</small><br>
    <small>${escapeHtml(w.warna || "-")} • ${escapeHtml(w.material || "-")}</small></div></div>`;
}

// Tampilkan deskripsi lengkap satu produk sebagai teks tambahan yang lebih detail
function detailNote(w) {
  return w && w.deskripsi ? `<br><small><em>${escapeHtml(w.deskripsi)}</em></small>` : "";
}

// Hasil pencarian terakhir, dipakai untuk pertanyaan lanjutan ("lebih banyak")
let lastResults = [];

// Jarak Levenshtein sederhana untuk menangani typo (mis. "rolx" ~ "rolex")
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Cari item di `list` yang salah satu katanya paling mirip kata dalam `q` (toleransi typo)
function fuzzyFind(q, list) {
  const tokens = q.split(/[^a-z0-9]+/i).filter((t) => t.length >= 3);
  let best = null;
  let bestDist = Infinity;
  for (const item of list) {
    const words = item.toLowerCase().split(/\s+/);
    for (const tok of tokens) {
      for (const w of words) {
        if (Math.abs(w.length - tok.length) > 2) continue;
        const dist = levenshtein(tok, w);
        const threshold = w.length <= 4 ? 1 : 2;
        if (dist <= threshold && dist < bestDist) {
          bestDist = dist;
          best = item;
        }
      }
    }
  }
  return best;
}

// Ubah pecahan angka+satuan ("5 juta", "10jt", "500 ribu") jadi nilai rupiah
function parseAmount(str) {
  const m = str.match(/(\d[\d.,]*)\s*(milyar|miliar|juta|jt|ribu|rb|k)?/);
  if (!m) return null;
  let n = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
  const unit = m[2] || "";
  if (/milyar|miliar/.test(unit)) n *= 1_000_000_000;
  else if (/juta|jt/.test(unit)) n *= 1_000_000;
  else if (/ribu|rb|k/.test(unit)) n *= 1_000;
  if (!n) return null;
  return n;
}

// Deteksi rentang harga ("antara 5 juta sampai 10 juta"), batas maksimal ("maksimal 5 juta"),
// atau harga target/perkiraan ("50 juta", "sekitar 50 juta") yang akan dicari yang paling mendekati
function parseBudgetRange(q) {
  const range = q.match(
    /(?:antara|dari)?\s*(\d[\d.,]*\s*(?:milyar|miliar|juta|jt|ribu|rb|k)?)\s*(?:sampai|hingga|s\.?d\.?|ke|-)\s*(\d[\d.,]*\s*(?:milyar|miliar|juta|jt|ribu|rb|k)?)/
  );
  if (range) {
    const min = parseAmount(range[1]);
    const max = parseAmount(range[2]);
    if (min !== null && max !== null) {
      return { min: Math.min(min, max), max: Math.max(min, max), mode: "range" };
    }
  }
  const single = q.match(
    /(\d[\d.,]*)\s*(milyar|miliar|juta|jt|ribu|rb|k)?/
  );
  if (single) {
    const isMaxKeyword = /(maksimal|\bmax\b|kurang dari|dibawah|di bawah)/.test(q);
    const hasBudgetContext =
      isMaxKeyword ||
      /(budget|sekitar|harga|punya uang|dana|modal|kira-kira|kurang lebih)/.test(q) ||
      single[2];
    if (hasBudgetContext) {
      const n = parseAmount(single[0]);
      if (n !== null && n >= 1000) {
        return isMaxKeyword ? { max: n, mode: "max" } : { target: n, mode: "target" };
      }
    }
  }
  return null;
}

// Cari satu produk berdasarkan teks bebas (merek+model, atau cuma merek) untuk fitur bandingkan
function findBestMatch(text) {
  const t = text.toLowerCase();
  const found = ALL.find((w) => `${w.merek} ${w.model}`.toLowerCase().includes(t));
  if (found) return found;
  const brandList = [...new Set(ALL.map((w) => w.merek))];
  const brand =
    brandList.find((b) => t.includes(b.toLowerCase())) || fuzzyFind(t, brandList);
  if (brand) {
    return [...ALL.filter((w) => w.merek === brand)].sort(
      (a, b) => a.harga - b.harga
    )[0];
  }
  return null;
}

// Otak asisten AI: analisis maksud pengguna (mendukung kombinasi kriteria & toleransi typo)
function respond(qRaw) {
  const q = qRaw.toLowerCase().trim();

  // Sapaan
  if (/\b(halo|hai|hi|hello|pagi|siang|sore|malam)\b/.test(q)) {
    return botSay(
      "Halo juga! 😊 Senang bisa mengobrol dengan Anda. Mau cari jam tangan seperti apa hari ini? Boleh sebutkan merek, warna, bahan, atau budget yang Anda inginkan, nanti saya carikan yang paling pas."
    );
  }

  // Terima kasih
  if (/(terima kasih|makasih|thanks|thx)/.test(q)) {
    return botSay(
      "Sama-sama! 🙏 Senang bisa membantu. Kalau masih ada yang ingin dicari atau ditanyakan, jangan sungkan ya!"
    );
  }

  // Bantuan
  if (/\b(bantuan|help|bisa apa|fitur)\b/.test(q)) {
    return botSay(
      "Dengan senang hati! Saya bisa bantu:\n" +
        "• 🎯 Rekomendasi kombinasi (mis. \"rolex warna hitam budget 500 juta\")\n" +
        "• 💰 Rentang harga (mis. \"antara 5 juta sampai 20 juta\")\n" +
        "• 🏆 Jam termurah / termahal, bisa dikombinasi merek (mis. \"omega termahal\")\n" +
        "• ⚖️ Bandingkan 2 jam lengkap dengan analisisnya (mis. \"bandingkan rolex dan omega\")\n" +
        "• 📋 Daftar semua merek/warna/bahan yang tersedia\n\n" +
        "Tinggal ketik saja seperti mengobrol biasa, saya akan coba pahami maksud Anda 😊"
    );
  }

  // Daftar merek / warna / bahan yang tersedia
  if (/(merek|brand)\b.*(apa saja|tersedia|ada apa)/.test(q)) {
    const brands = [...new Set(ALL.map((w) => w.merek))].sort();
    return botSay(
      `Kami punya ${brands.length} merek pilihan, di antaranya: ${brands.join(", ")}. Ada merek favorit yang ingin dicoba? 😊`
    );
  }
  if (/warna\b.*(apa saja|tersedia|ada apa)/.test(q)) {
    const colors = [...new Set(ALL.map((w) => w.warna).filter(Boolean))].sort();
    return botSay(`Untuk warna, tersedia pilihan: ${colors.join(", ")}. Warna mana yang paling Anda sukai? 🎨`);
  }
  if (/(bahan|material)\b.*(apa saja|tersedia|ada apa)/.test(q)) {
    const materials = [...new Set(ALL.map((w) => w.material).filter(Boolean))].sort();
    return botSay(`Bahan yang tersedia antara lain: ${materials.join(", ")}. Mau saya carikan yang bahannya sesuai selera Anda? ⌨️`);
  }

  // Perbandingan dua produk: "bandingkan X dan Y" / "X vs Y"
  const cmp = q.match(/(?:bandingkan|compare)\s+(.+?)\s+(?:dan|dengan|vs\.?|,)\s+(.+)/);
  if (cmp) {
    const a = findBestMatch(cmp[1].trim());
    const b = findBestMatch(cmp[2].trim());
    if (a && b && a.id !== b.id) {
      const diff = Math.abs(a.harga - b.harga);
      const cheaper = a.harga <= b.harga ? a : b;
      const pricier = a.harga <= b.harga ? b : a;
      const sameMaterial = (a.material || "").toLowerCase() === (b.material || "").toLowerCase();
      pushMsg(
        "Tentu, ini perbandingannya! ⚖️" +
          miniCard(a) +
          miniCard(b) +
          detailNote(a) +
          detailNote(b) +
          `<br><br>💡 <strong>${escapeHtml(cheaper.merek + " " + cheaper.model)}</strong> lebih hemat ${formatRupiah(diff)} dibanding <strong>${escapeHtml(pricier.merek + " " + pricier.model)}</strong>.` +
          (sameMaterial
            ? " Bahannya sama-sama serupa, jadi tinggal sesuaikan dengan selera warna dan budget Anda! 😊"
            : " Bahan keduanya berbeda, jadi bisa disesuaikan dengan gaya yang Anda cari."),
        "bot"
      );
      return;
    }
    botSay(
      "Hmm, maaf saya belum menemukan salah satu (atau kedua) produk yang ingin dibandingkan 🙏. Coba sebutkan nama merek atau model yang lebih spesifik ya."
    );
    return;
  }

  // Jumlah / berapa produk
  if (/(berapa|jumlah).*(jam|produk|barang|stok)/.test(q)) {
    const brands = new Set(ALL.map((w) => w.merek)).size;
    return botSay(
      `Saat ini ChronoStore punya ${ALL.length} jam tangan pilihan dari ${brands} merek berbeda 😊. Mau saya bantu cari yang sesuai budget atau merek favorit Anda?`
    );
  }

  // Kumpulkan semua kriteria yang disebut dalam satu kalimat (bisa gabungan merek+warna+bahan+harga)
  const brandList = [...new Set(ALL.map((w) => w.merek))];
  const colorList = [...new Set(ALL.map((w) => w.warna).filter(Boolean))];
  const materialList = [...new Set(ALL.map((w) => w.material).filter(Boolean))];

  const brandHit =
    brandList.find((b) => q.includes(b.toLowerCase())) || fuzzyFind(q, brandList);
  const colorHit =
    colorList.find((c) => q.includes(c.toLowerCase())) || fuzzyFind(q, colorList);
  const materialHit =
    materialList.find((m) => q.includes(m.toLowerCase())) || fuzzyFind(q, materialList);
  const budget = parseBudgetRange(q);

  let scope = ALL;
  const applied = [];
  if (brandHit) {
    scope = scope.filter((w) => w.merek === brandHit);
    applied.push(`merek ${brandHit}`);
  }
  if (colorHit) {
    scope = scope.filter((w) => (w.warna || "").toLowerCase() === colorHit.toLowerCase());
    applied.push(`warna ${colorHit}`);
  }
  if (materialHit) {
    scope = scope.filter(
      (w) => (w.material || "").toLowerCase() === materialHit.toLowerCase()
    );
    applied.push(`bahan ${materialHit}`);
  }
  if (budget && (budget.mode === "range" || budget.mode === "max")) {
    if (budget.min != null) {
      scope = scope.filter((w) => w.harga >= budget.min);
      applied.push(`min ${formatRupiah(budget.min)}`);
    }
    if (budget.max != null) {
      scope = scope.filter((w) => w.harga <= budget.max);
      applied.push(`maks ${formatRupiah(budget.max)}`);
    }
  }

  const wantsCheapest = /(termurah|paling murah|\bmurah\b)/.test(q);
  const wantsPriciest = /(termahal|paling mahal|mewah|termewah)/.test(q);

  // Harga target/perkiraan ("50 juta", "sekitar 50 juta"): cari yang harganya paling mendekati,
  // bukan sekadar di bawah nilai tersebut
  if (budget && budget.mode === "target" && !wantsCheapest && !wantsPriciest) {
    if (scope.length === 0) {
      botSay(
        `Maaf ya, saya belum menemukan jam yang cocok dengan ${applied.join(", ") || "kriteria itu"} 🙏. Coba longgarkan sedikit kriterianya, saya bantu carikan yang lain.`
      );
      return;
    }
    const withDiff = scope
      .map((w) => ({ w, diff: Math.abs(w.harga - budget.target) }))
      .sort((a, b) => a.diff - b.diff);
    const exactCount = withDiff.filter((x) => x.diff === 0).length;
    const top5 = withDiff.slice(0, 5).map((x) => x.w);
    lastResults = withDiff.map((x) => x.w);
    const extraLabel = applied.length ? ` (${applied.join(", ")})` : "";
    if (exactCount > 0) {
      pushMsg(
        `Kabar baik! 🎉 Ditemukan ${exactCount} jam dengan harga tepat ${formatRupiah(budget.target)}${extraLabel}:` +
          top5.map(miniCard).join("") +
          detailNote(top5[0]),
        "bot"
      );
    } else {
      pushMsg(
        `Belum ada yang harganya pas ${formatRupiah(budget.target)}${extraLabel}, tapi ini pilihan yang paling mendekati ya 👇:` +
          top5.map(miniCard).join("") +
          detailNote(top5[0]),
        "bot"
      );
    }
    return;
  }

  if (wantsCheapest || wantsPriciest) {
    if (scope.length === 0) {
      botSay(
        `Maaf, belum ada jam yang cocok dengan ${applied.join(", ") || "kriteria itu"} untuk dicek harganya 🙏. Coba kriteria lain, ya?`
      );
      return;
    }
    const sorted = [...scope].sort((a, b) =>
      wantsCheapest ? a.harga - b.harga : b.harga - a.harga
    );
    const top5 = sorted.slice(0, 5);
    lastResults = sorted;
    const label = applied.length ? ` untuk ${applied.join(", ")}` : "";
    pushMsg(
      `Ini ${top5.length} jam ${wantsCheapest ? "termurah" : "termahal"}${label} yang saya temukan 😊:` +
        top5.map(miniCard).join("") +
        detailNote(top5[0]),
      "bot"
    );
    return;
  }

  if (applied.length > 0) {
    scope = [...scope].sort((a, b) => a.harga - b.harga);
    lastResults = scope;
    if (scope.length === 0) {
      botSay(
        `Maaf, saya belum menemukan jam yang cocok dengan ${applied.join(", ")} 🙏. Coba longgarkan salah satu kriteria, misalnya budget dinaikkan sedikit atau warnanya lebih fleksibel, ya!`
      );
      return;
    }
    const intro = scope.length === 1 ? "Ketemu satu yang pas nih!" : `Asyik, ada ${scope.length} pilihan yang cocok`;
    pushMsg(
      `${intro} dengan ${applied.join(", ")} 🔎:` +
        scope.slice(0, 5).map(miniCard).join("") +
        detailNote(scope.length === 1 ? scope[0] : null) +
        (scope.length > 5
          ? `<br><small>...dan ${scope.length - 5} lainnya, ketik "lainnya" untuk lihat lebih banyak ya 😉</small>`
          : ""),
      "bot"
    );
    return;
  }

  // Follow-up sederhana terhadap hasil pencarian sebelumnya
  if (/(lainnya|lebih banyak|selanjutnya)/.test(q) && lastResults.length > 5) {
    pushMsg(
      `Baik, ini pilihan lainnya untuk Anda 👇:` + lastResults.slice(5, 10).map(miniCard).join(""),
      "bot"
    );
    return;
  }

  // Pencarian langsung berdasarkan nama produk (merek+model), tidak peduli huruf besar/kecil
  if (q.length >= 3) {
    const modelMatches = ALL.filter((w) =>
      `${w.merek} ${w.model}`.toLowerCase().includes(q)
    );
    if (modelMatches.length > 0) {
      lastResults = modelMatches;
      pushMsg(
        `Ditemukan ${modelMatches.length} jam yang cocok dengan "${escapeHtml(qRaw.trim())}" 🔍:` +
          modelMatches.slice(0, 5).map(miniCard).join("") +
          detailNote(modelMatches.length === 1 ? modelMatches[0] : null) +
          (modelMatches.length > 5
            ? `<br><small>...dan ${modelMatches.length - 5} lainnya, coba ketik "lainnya" untuk lihat lagi.</small>`
            : ""),
        "bot"
      );
      return;
    }
  }

  // Rekomendasi umum
  if (/(rekomendasi|saran|bagus|recommend)/.test(q)) {
    const pick = [...ALL].sort(() => Math.random() - 0.5).slice(0, 3);
    lastResults = pick;
    pushMsg(
      "Beberapa pilihan menarik yang mungkin Anda suka ✨:" + pick.map(miniCard).join(""),
      "bot"
    );
    return;
  }

  // Fallback: kalau ada nama merek yang mirip (typo), tawarkan koreksi
  const maybeBrand = fuzzyFind(q, brandList);
  if (maybeBrand) {
    botSay(`Hmm, apakah maksud Anda "${maybeBrand}"? 🤔 Coba ketik ulang, mis. "ada ${maybeBrand}?"`);
    return;
  }

  botSay(
    "Maaf, saya belum paham maksud Anda 🙏. Tapi tenang, coba tanya dengan gaya seperti ini ya:\n" +
      "• \"rolex warna hitam budget 500 juta\"\n" +
      "• \"antara 5 juta sampai 20 juta\"\n" +
      "• \"bandingkan seiko dan casio\"\n" +
      "• \"jam bahan titanium\"\n\n" +
      "Saya siap bantu carikan yang paling pas untuk Anda! 😊"
  );
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
