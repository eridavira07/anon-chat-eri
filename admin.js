import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const chatRef = ref(db, "chat");
const list = document.getElementById("adminMessageList");

const SECRET_KEY = "admin-eri-2025";
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("key") !== SECRET_KEY) {
  document.body.innerHTML = "<h1 style='color:red;text-align:center;'>403 FORBIDDEN</h1>";
  throw new Error("Akses ditolak");
}

onValue(chatRef, (snapshot) => {
  list.innerHTML = "";
  if (!snapshot.exists()) {
    list.innerHTML = "<li class='note' style='text-align:center;'>Tidak ada pesan.</li>";
    return;
  }

  snapshot.forEach((child) => {
    const data = child.val();
    const li = document.createElement("li");
    li.className = "admin-item";

    const time = new Date(data.time).toLocaleString("id-ID");

    li.innerHTML = `
      <div>
        <b>${data.name}</b>: ${data.text || "(kosong)"}
        <div class="time">${time}</div>
      </div>
      <button class="delete-btn" data-key="${child.key}">Hapus</button>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = () => {
      if (confirm("Yakin hapus pesan ini?")) remove(ref(db, "chat/" + btn.dataset.key));
    };
  });
});