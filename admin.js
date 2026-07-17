// ===== Logika halaman admin (GET, POST, PUT, PATCH, DELETE) =====
const form = document.getElementById("watchForm");
const alertBox = document.getElementById("alertBox");
const adminList = document.getElementById("adminList");
const fotoInput = document.getElementById("foto");
const imgPreview = document.getElementById("imgPreview");
const editIdInput = document.getElementById("editId");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const reloadBtn = document.getElementById("reloadBtn");
const apiLog = document.getElementById("apiLog");

renderList();
logApi("GET", "/watches", `Memuat ${apiGetWatches().length} data saat halaman dibuka.`);

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

// Muat ulang daftar secara eksplisit (GET)
reloadBtn.addEventListener("click", () => {
  renderList();
  logApi("GET", "/watches", "Daftar dimuat ulang secara manual.");
  showAlert("Daftar berhasil dimuat ulang.", "success");
});

// Batal mode edit
cancelEditBtn.addEventListener("click", () => cancelEdit());

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const merek = document.getElementById("merek").value.trim();
  const model = document.getElementById("model").value.trim();
  const harga = Number(document.getElementById("harga").value);

  if (!merek || !model || !harga || harga <= 0) {
    return showAlert("Merek, model, dan harga wajib diisi dengan benar.", "error");
  }

  const data = {
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

  const editId = editIdInput.value;
  if (editId) {
    // Mode edit -> PUT (ganti seluruh field)
    apiPutWatch(editId, data);
    logApi("PUT", `/watches/${editId}`, `"${merek} ${model}" diperbarui penuh.`);
    showAlert(`"${merek} ${model}" berhasil diperbarui! ✏️`, "success");
    cancelEdit();
  } else {
    // Mode tambah -> POST
    apiPostWatch(data);
    logApi("POST", "/watches", `"${merek} ${model}" ditambahkan.`);
    showAlert(`"${merek} ${model}" berhasil ditambahkan! 🎉`, "success");
    form.reset();
    imgPreview.classList.remove("show");
  }

  renderList();
});

function renderList() {
  const custom = apiGetWatches();
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
      <div class="admin-item-actions">
        <button type="button" class="btn-edit" title="Edit penuh (PUT)">✏️</button>
        <button type="button" class="btn-patch" title="Ubah harga saja (PATCH)">⚡</button>
        <button type="button" class="btn-delete" title="Hapus (DELETE)">🗑️</button>
      </div>`;
    item.querySelector(".btn-edit").addEventListener("click", () => startEdit(w));
    item.querySelector(".btn-patch").addEventListener("click", () => patchHarga(w));
    item.querySelector(".btn-delete").addEventListener("click", () => removeWatch(w.id));
    adminList.appendChild(item);
  }
}

function startEdit(w) {
  editIdInput.value = w.id;
  document.getElementById("merek").value = w.merek;
  document.getElementById("model").value = w.model;
  document.getElementById("warna").value = w.warna === "-" ? "" : w.warna;
  document.getElementById("material").value = w.material === "-" ? "" : w.material;
  document.getElementById("harga").value = w.harga;
  document.getElementById("deskripsi").value = w.deskripsi;
  fotoInput.value = w.foto;
  imgPreview.src = w.foto;
  imgPreview.classList.add("show");

  formTitle.textContent = "✏️ Edit Jam Tangan";
  submitBtn.textContent = "Update Jam Tangan (PUT)";
  cancelEditBtn.style.display = "inline-block";
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelEdit() {
  editIdInput.value = "";
  form.reset();
  imgPreview.classList.remove("show");
  formTitle.textContent = "➕ Tambah Jam Tangan";
  submitBtn.textContent = "Simpan Jam Tangan (POST)";
  cancelEditBtn.style.display = "none";
}

function patchHarga(w) {
  const input = prompt(`Masukkan harga baru untuk "${w.merek} ${w.model}":`, w.harga);
  if (input === null) return;
  const harga = Number(input);
  if (!harga || harga <= 0) {
    return showAlert("Harga tidak valid.", "error");
  }
  apiPatchWatch(w.id, { harga });
  logApi("PATCH", `/watches/${w.id}`, `Harga "${w.merek} ${w.model}" diubah menjadi ${formatRupiah(harga)}.`);
  renderList();
  showAlert("Harga berhasil diperbarui (PATCH).", "success");
}

function removeWatch(id) {
  if (!confirm("Hapus jam tangan ini?")) return;
  apiDeleteWatch(id);
  logApi("DELETE", `/watches/${id}`, "Jam tangan dihapus.");
  if (editIdInput.value === id) cancelEdit();
  renderList();
  showAlert("Jam tangan dihapus.", "success");
}

function showAlert(msg, type) {
  alertBox.textContent = msg;
  alertBox.className = "alert show " + type;
  setTimeout(() => alertBox.classList.remove("show"), 3500);
}

function logApi(method, endpoint, message) {
  const entry = document.createElement("li");
  entry.className = "api-log-item method-" + method.toLowerCase();
  const time = new Date().toLocaleTimeString("id-ID");
  entry.innerHTML = `<span class="method-badge">${method}</span> <code>${endpoint}</code> <span class="log-msg">${escapeHtml(message)}</span> <span class="log-time">${time}</span>`;
  apiLog.prepend(entry);
  while (apiLog.children.length > 8) {
    apiLog.removeChild(apiLog.lastChild);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
