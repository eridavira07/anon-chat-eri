// === Import Firebase ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  remove,
  get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// === Konfigurasi Firebase ===
const firebaseConfig = {
  apiKey: "AIzaSyC6eQQ5KmfNeE-MbbGztfgxUr-Q388QKg4",
  authDomain: "anon-chat-eri.firebaseapp.com",
  databaseURL: "https://anon-chat-eri-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "anon-chat-eri",
  storageBucket: "anon-chat-eri.appspot.com",
  messagingSenderId: "770226352457",
  appId: "1:770226352457:web:43d01526df75e5e49cea98",
  measurementId: "G-2YRM1KMDDM"
};

// === Inisialisasi Firebase ===
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);
const chatRef = ref(db, "chat");

// === Nama pengguna anonim ===
const name = "Anon-" + Math.floor(Math.random() * 10000);

// === Elemen HTML ===
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const imageInput = document.getElementById("imageInput");
const imageLabel = document.getElementById("imageLabel");

// === Elemen untuk preview ===
const previewContainer = document.createElement("div");
previewContainer.id = "previewContainer";
previewContainer.style.margin = "8px 0";
previewContainer.style.textAlign = "center";
messages.insertAdjacentElement("afterend", previewContainer);

// === Fungsi Escape HTML ===
function escapeHTML(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// === Preview gambar sebelum dikirim ===
imageInput.addEventListener("change", () => {
  previewContainer.innerHTML = "";
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.createElement("img");
    img.src = e.target.result;
    img.alt = "Preview Gambar";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "200px";
    img.style.border = "1px solid rgba(0,255,102,0.2)";
    img.style.borderRadius = "8px";
    img.style.marginTop = "6px";
    img.style.cursor = "pointer";
    img.onclick = () => window.open(img.src);
    previewContainer.appendChild(img);
  };
  reader.readAsDataURL(file);
});

// === Upload gambar dan kirim pesan ===
async function uploadImageAndSend(file, text) {
  if (!file) return;

  sendBtn.disabled = true;
  sendBtn.textContent = "Mengunggah...";
  imageLabel.style.opacity = '0.5';

  try {
    const path = `chat_images/${name}_${Date.now()}_${file.name}`;
    const imgRef = sRef(storage, path);

    const snapshot = await uploadBytes(imgRef, file);
    const imageUrl = await getDownloadURL(snapshot.ref);

    await push(chatRef, {
      name,
      text: text.slice(0, 1000),
      time: Date.now(),
      imageUrl
    });

    msgInput.value = "";
    imageInput.value = "";
    previewContainer.innerHTML = ""; // hapus preview setelah terkirim
  } catch (err) {
    alert("Gagal mengunggah gambar!");
    console.error(err);
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "KIRIM";
    imageLabel.style.opacity = '1';
  }
}

// === Kirim pesan teks atau gambar ===
sendBtn.addEventListener("click", () => {
  const text = msgInput.value.trim();
  const file = imageInput.files[0];

  if (!text && !file) return;

  if (file) {
    uploadImageAndSend(file, text);
  } else {
    push(chatRef, { name, text: text.slice(0, 1000), time: Date.now() });
    msgInput.value = "";
  }
});

// === Enter untuk kirim ===
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// === Tampilkan pesan secara realtime ===
onChildAdded(chatRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const now = Date.now();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  if (now - (data.time || 0) > threeDays) {
    remove(ref(db, "chat/" + snapshot.key));
    return;
  }

  const msgDiv = document.createElement("div");
  msgDiv.className = "msg";

  const time = new Date(data.time).toLocaleString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });

  let content = escapeHTML(data.text);
  if (data.imageUrl) {
    content = `
      <img src="${data.imageUrl}" class="chat-image" onclick="window.open(this.src)" alt="gambar"><br>${content}
    `;
  }

  msgDiv.innerHTML = `
    <span class="name">${escapeHTML(data.name)}</span>: ${content}
    <span class="time">${time}</span>
  `;

  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
});

// === Hapus otomatis pesan lama (>3 hari) ===
(async () => {
  const snapshot = await get(chatRef);
  if (!snapshot.exists()) return;
  const now = Date.now();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  snapshot.forEach((child) => {
    const data = child.val();
    if (now - (data.time || 0) > threeDays) {
      remove(ref(db, "chat/" + child.key));
    }
  });
})();
