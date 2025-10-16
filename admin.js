import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// === Fungsi untuk kirim pesan admin ===
const adminName = "Eri Davira - Admin";
const inputBox = document.createElement('div');
inputBox.style.display = 'flex';
inputBox.style.marginTop = '12px';
const inputField = document.createElement('input');
inputField.type = 'text';
inputField.placeholder = 'Ketik pesan admin...';
inputField.style.flex = '1';
inputField.style.padding = '8px';
inputField.style.borderRadius = '4px';
inputField.style.border = '1px solid rgba(0,255,102,0.12)';
const sendBtn = document.createElement('button');
sendBtn.textContent = 'KIRIM';
sendBtn.style.marginLeft = '8px';
sendBtn.style.padding = '8px 12px';
sendBtn.style.borderRadius = '4px';
sendBtn.style.cursor = 'pointer';
sendBtn.style.backgroundColor = '#00ff66';
sendBtn.style.border = 'none';
sendBtn.style.color = '#001a00';
inputBox.appendChild(inputField);
inputBox.appendChild(sendBtn);
document.querySelector('.terminal').appendChild(inputBox);

sendBtn.onclick = () => {
  const text = inputField.value.trim();
  if (!text) return;
  push(chatRef, { name: adminName, text, time: Date.now() });
  inputField.value = '';
};
inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });

onValue(chatRef, (snapshot) => {
  list.innerHTML = '';
  if (!snapshot.exists()) {
    list.innerHTML = "<li class='note' style='text-align:center;'>Tidak ada pesan.</li>";
    return;
  }

  const messagesArray = [];
  snapshot.forEach(child => {
    messagesArray.push({ key: child.key, val: child.val() });
  });
  messagesArray.sort((a,b) => b.val.time - a.val.time);

  messagesArray.forEach(({key, val}) => {
    const li = document.createElement('li');
    li.className = 'admin-item';

    const time = new Date(val.time).toLocaleString('id-ID');
    const isAdmin = val.name === adminName;
    const nameColor = isAdmin ? '#FFFF00' : '#00ffaa'; // kuning untuk admin, hijau untuk lainnya

    li.innerHTML = `
      <div>
        <b style="color:${nameColor}">${val.name}</b>: ${val.text || '(kosong)'}
        <div class="time">${time}</div>
      </div>
      <button class="delete-btn" data-key="${key}">Hapus</button>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => {
      if(confirm('Yakin hapus pesan ini?')) remove(ref(db, 'chat/' + btn.dataset.key));
    };
  });
});