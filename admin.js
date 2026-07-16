// ===== Logika halaman admin =====
const form = document.getElementById("watchForm");
const alertBox = document.getElementById("alertBox");
const adminList = document.getElementById("adminList");
const fotoInput = document.getElementById("foto");
const imgPreview = document.getElementById("imgPreview");

renderList();

// Pratinjau foto saat URL diketik
fotoInput.addEventListener("input", () => {
  const url = fotoInput.value.trim();
  if (url) {
    imgPreview.src = url;
    imgPreview.classList.add("show");
  } else {
    imgPreview.classList.remove("show");
  }
});
imgPreview.addEventListener("error", () => imgPreview.classList.remove("show"));

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const merek = document.getElementById("merek").value.trim();
  const model = document.getElementById("model").value.trim();
  const harga = Number(document.getElementById("harga").value);

  if (!merek || !model || !harga || harga <= 0) {
    return showAlert("Merek, model, dan harga wajib diisi dengan benar.", "error");
  }

  const custom = getCustomWatches();
  const newWatch = {
    id: "c" + Date.now(),
    merek,
    model,
    warna: document.getElementById("warna").value.trim() || "-",
    material: document.getElementById("material").value.trim() || "-",
    harga,
    deskripsi:
      document.getElementById("deskripsi").value.trim() ||
      `${merek} ${model}.`,
    foto:
      fotoInput.value.trim() ||
      "https://via.placeholder.com/400x300?text=" + encodeURIComponent(merek),
  };

  custom.unshift(newWatch);
  saveCustomWatches(custom);

  showAlert(`"${merek} ${model}" berhasil ditambahkan! 🎉`, "success");
  form.reset();
  imgPreview.classList.remove("show");
  renderList();
});

function renderList() {
  const custom = getCustomWatches();
  if (custom.length === 0) {
    adminList.innerHTML =
      '<p style="color:var(--muted);text-align:center;padding:20px;">Belum ada jam tangan yang ditambahkan.</p>';
    return;
  }
  adminList.innerHTML = "";
  for (const w of custom) {
    const item = document.createElement("div");
    item.className = "admin-item";
    item.innerHTML = `
      <img src="${w.foto}" alt="" onerror="this.src='https://via.placeholder.com/50?text=?'">
      <div class="info">
        <strong>${escapeHtml(w.merek)} ${escapeHtml(w.model)}</strong>
        <small>${formatRupiah(w.harga)}</small>
      </div>
      <button data-id="${w.id}">Hapus</button>`;
    item.querySelector("button").addEventListener("click", () => removeWatch(w.id));
    adminList.appendChild(item);
  }
}

function removeWatch(id) {
  if (!confirm("Hapus jam tangan ini?")) return;
  const custom = getCustomWatches().filter((w) => w.id !== id);
  saveCustomWatches(custom);
  renderList();
  showAlert("Jam tangan dihapus.", "success");
}

function showAlert(msg, type) {
  alertBox.textContent = msg;
  alertBox.className = "alert show " + type;
  setTimeout(() => alertBox.classList.remove("show"), 3500);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
