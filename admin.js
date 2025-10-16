// admin.js

// Import yang diperlukan
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// === Konfigurasi Firebase kamu (sama seperti script.js) ===
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
const messageList = document.getElementById("adminMessageList");

// --- Bagian 1: Perlindungan Akses Rahasia Sederhana ---
const SECRET_KEY = "admin-eri-2025"; // Ganti dengan kunci rahasia yang kuat!
const urlParams = new URLSearchParams(window.location.search);
const accessKey = urlParams.get('key');

if (accessKey !== SECRET_KEY) {
    alert("Akses Ditolak. Kunci Rahasia tidak valid.");
    document.body.innerHTML = '<h1 style="color: red; text-align: center;">403 FORBIDDEN</h1>';
    throw new Error("Akses admin tidak sah");
}
// Jika kunci benar, lanjutkan.

// --- Bagian 2: Fungsi Hapus Pesan ---
function deleteMessage(key) {
    if (confirm(`Yakin ingin menghapus pesan dengan ID: ${key}?`)) {
        remove(ref(db, "chat/" + key))
            .then(() => {
                console.log(`Pesan ${key} berhasil dihapus.`);
            })
            .catch((error) => {
                console.error("Gagal menghapus pesan:", error);
                alert("Gagal menghapus pesan. Cek konsol.");
            });
    }
}

// --- Bagian 3: Tampilkan Semua Pesan Secara Realtime ---
onValue(chatRef, (snapshot) => {
    messageList.innerHTML = ""; // Bersihkan daftar lama
    
    if (!snapshot.exists()) {
        messageList.innerHTML = '<li class="note" style="text-align: center;">Tidak ada pesan saat ini.</li>';
        return;
    }

    // Iterasi semua pesan
    snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const data = childSnapshot.val();
        
        const time = new Date(data.time).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        const listItem = document.createElement("li");
        listItem.className = "admin-item";
        
        listItem.innerHTML = `
            <div class="item-content">
                <span class="name">${data.name}</span>: ${data.text}
                <span class="time">${time} | ID: ${key}</span>
            </div>
            <button class="delete-btn" data-key="${key}">HAPUS</button>
        `;
        
        messageList.appendChild(listItem);
    });

    // Pasang listener pada tombol hapus setelah semua pesan dimuat
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const key = e.target.getAttribute('data-key');
            deleteMessage(key);
        });
    });
});