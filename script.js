// script.js
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
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// === Konfigurasi Firebase kamu ===
const firebaseConfig = {
  apiKey: "AIzaSyCkUOL3hfMg8I8ZUF-GX4QThe_0Cql39O8",
  authDomain: "anon-chat-eri.firebaseapp.com",
  databaseURL:
    "https://anon-chat-eri-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "anon-chat-eri",
  storageBucket: "anon-chat-eri.firebasestorage.app",
  messagingSenderId: "770226352457",
  appId: "1:770226352457:web:43d01526df75e5e49cea98",
  measurementId: "G-2YRM1KMDDM",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app); 
const chatRef = ref(db, "chat");

// Buat nama anonim acak
const name = "Anon-" + Math.floor(Math.random() * 10000);

// Elemen HTML
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const imageUpload = document.getElementById("imageUpload");
const imageLabel = document.getElementById("imageLabel");

// Escape HTML biar aman
function escapeHTML(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Fungsi upload gambar
async function uploadImageAndSend(file, text) {
  if (!file) return;

  sendBtn.disabled = true;
  sendBtn.textContent = "Mengunggah...";
  imageLabel.style.opacity = '0.5';

  try {
    const filePath = `chat_images/${name}_${Date.now()}_${file.name}`;
    const imageRef = storageRef(storage, filePath);
    const snapshot = await uploadBytes(imageRef, file);
    const imageUrl = await getDownloadURL(snapshot.ref);

    push(chatRef, { 
      name, 
      text: text.slice(0, 1000), 
      time: Date.now(),
      imageUrl
    });

    msgInput.value = "";
    imageUpload.value = ""; 
  } catch (error) {
    console.error("Gagal mengirim gambar:", error);
    alert("Gagal mengunggah gambar. Cek konsol.");
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "KIRIM";
    imageLabel.style.opacity = '1';
  }
}

// Kirim pesan
sendBtn.addEventListener("click", () => {
  const text = msgInput.value.trim();
  const imageFile = imageUpload.files[0];
  if (!text && !imageFile) return;
  if (imageFile) uploadImageAndSend(imageFile, text);
  else {
    push(chatRef, { name, text: text.slice(0, 1000), time: Date.now() });
    msgInput.value = "";
  }
});
msgInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendBtn.click(); });

// Tampilkan pesan
onChildAdded(chatRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;
  const now = Date.now();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  if (now - (data.time || 0) > threeDays) {
    remove(ref(db, "chat/" + snapshot.key));
    return;
  }
  const msgBox = document.getElementById("messages");
  const p = document.createElement("div");
  p.className = "msg";

  const time = new Date(data.time).toLocaleString("id-ID", {
    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short",
  });

  let contentHTML = escapeHTML(data.text);
  if (data.imageUrl) {
    contentHTML = `
      <img src="${data.imageUrl}" class="chat-image" onclick="window.open(this.src)" alt="Gambar dari ${data.name}" />
      <br>${contentHTML}
    `;
  }

  p.innerHTML = `
    <span class="name">${escapeHTML(data.name)}</span>: ${contentHTML}
    <span class="time">${time}</span>
  `;

  msgBox.appendChild(p);
  msgBox.scrollTop = msgBox.scrollHeight;
});

// Bersihkan pesan lama (>3 hari)
(async () => {
  const snapshot = await get(chatRef);
  if (!snapshot.exists()) return;
  const now = Date.now();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  snapshot.forEach((child) => {
    const data = child.val();
    if (now - (data.time || 0) > threeDays)
      remove(ref(db, "chat/" + child.key));
  });
})();
