// admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const chatRef = ref(db, "chat");
const messageList = document.getElementById("adminMessageList");

// 🔐 Akses rahasia
const SECRET_KEY = "admin-eri-2025";
const urlParams = new URLSearchParams(window.location.search);
const accessKey = urlParams.get('key');
if (accessKey !== SECRET_KEY) {
  alert("Akses Ditolak. Kunci Rahasia tidak valid.");
  document.body.innerHTML = '<h1 style="color:red;text-align:center;">403 FORBIDDEN</h1>';
  throw new Error("Akses admin tidak sah");
}

function deleteMessage(key) {
  if (confirm(`Yakin ingin menghapus pesan dengan ID: ${key}?`)) {
    remove(ref(db, "chat/" + key))
      .then(() => console.log(`Pesan ${key} dihapus.`))
      .catch((error) => {
        console.error("Gagal menghapus pesan:", error);
        alert("Gagal menghapus pesan.");
      });
  }
}

onValue(chatRef, (snapshot) => {
  messageList.innerHTML = "";
  if (!snapshot.exists()) {
    messageList.innerHTML = '<li class="note" style="text-align:center;">Tidak ada pesan saat ini.</li>';
    return;
  }
  snapshot.forEach((childSnapshot) => {
    const key = childSnapshot.key;
    const data = childSnapshot.val();
    const time = new Date(data.time).toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    const imageHtml = data.imageUrl
      ? `<img src="${data.imageUrl}" class="chat-image" style="max-height:100px;max-width:100px;cursor:pointer;" onclick="window.open(this.src)" alt="Gambar">`
      : '';
    const listItem = document.createElement("li");
    listItem.className = "admin-item";
    listItem.innerHTML = `
      <div class="item-content">
        ${imageHtml}
        <span class="name">${data.name}</span>: ${data.text}
        <span class="time">${time} | ID: ${key}</span>
      </div>
      <button class="delete-btn" data-key="${key}">HAPUS</button>
    `;
    messageList.appendChild(listItem);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => deleteMessage(e.target.dataset.key));
  });
});
