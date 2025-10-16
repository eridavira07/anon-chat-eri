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
const chatRef = ref(db, "chat");

// Buat nama anonim acak
const name = "Anon-" + Math.floor(Math.random() * 10000);

// Escape HTML biar aman
function escapeHTML(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Kirim pesan
document.getElementById("sendBtn").addEventListener("click", () => {
  const msgInput = document.getElementById("msgInput");
  const text = msgInput.value.trim();
  if (!text) return;

  const limited = text.slice(0, 1000);
  push(chatRef, { name, text: limited, time: Date.now() });
  msgInput.value = "";
});

// Tampilkan pesan realtime dan hapus otomatis jika >3 hari
onChildAdded(chatRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const now = Date.now();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  const age = now - (data.time || 0);

  if (age > threeDays) {
    remove(ref(db, "chat/" + snapshot.key));
    return;
  }

  const msgBox = document.getElementById("messages");
  const p = document.createElement("div");
  p.className = "msg";

  const time = new Date(data.time).toLocaleString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });

  p.innerHTML = `
    <span class="name">${escapeHTML(data.name)}</span>: ${escapeHTML(
    data.text
  )}<span class="time">${time}</span>
  `;

  msgBox.appendChild(p);
  msgBox.scrollTop = msgBox.scrollHeight;
});

// Saat halaman dibuka, bersihkan pesan lama (>3 hari)
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
