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
const chatRef = ref(db, "chat");

// === Nama pengguna anonim ===
const name = "Anon-" + Math.floor(Math.random() * 10000);
const adminName = "Eri Davira - Admin";

// === Elemen HTML ===
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

// === Fungsi Escape HTML ===
function escapeHTML(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// === Kirim pesan teks ===
sendBtn.addEventListener("click", () => {
  const text = msgInput.value.trim();
  if (!text) return;
  push(chatRef, { name, text: text.slice(0, 1000), time: Date.now() });
  msgInput.value = "";
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

  // Warna nickname: kuning untuk admin, hijau untuk user
  const isAdmin = data.name === adminName;
  const nameColor = isAdmin ? '#FFFF00' : '#00ffaa';

  msgDiv.innerHTML = `
    <span class="name" style="color:${nameColor}">${escapeHTML(data.name)}</span>: ${escapeHTML(data.text)}
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
