import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const chatRef = ref(db,"chat");

// === Proteksi akses admin ===
const SECRET_KEY = "admin-eri-2025";
const urlParams = new URLSearchParams(window.location.search);
if(urlParams.get("key") !== SECRET_KEY){
  document.body.innerHTML = "<h1 style='color:red;text-align:center;'>403 FORBIDDEN</h1>";
  throw new Error("Akses ditolak");
}

// === Identitas admin ===
const name = "Eri Davira - Admin";

// === Elemen HTML chat ===
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

// Fungsi escape HTML
function escapeHTML(str="") {
  return str.replaceAll("&","&amp;")
            .replaceAll("<","&lt;")
            .replaceAll(">","&gt;")
            .replaceAll('"',"&quot;")
            .replaceAll("'","&#039;");
}

// === Kirim chat admin ===
sendBtn.addEventListener("click", ()=>{
  const text = msgInput.value.trim();
  if(!text) return;
  push(chatRef, { name, text: text.slice(0,1000), time: Date.now() });
  msgInput.value="";
});

msgInput.addEventListener("keypress",(e)=>{
  if(e.key==="Enter") sendBtn.click();
});

// === Tampilkan chat realtime ===
onChildAdded(chatRef, (snapshot)=>{
  const data = snapshot.val();
  if(!data) return;

  const now = Date.now();
  const threeDays = 3*24*60*60*1000;
  if(now-(data.time||0)>threeDays){
    remove(ref(db,"chat/"+snapshot.key));
    return;
  }

  const msgDiv = document.createElement("div");
  msgDiv.className="msg";

  const time = new Date(data.time).toLocaleString("id-ID",{
    hour:"2-digit", minute:"2-digit", day:"2-digit", month:"short"
  });

  msgDiv.innerHTML=`
    <span class="name" style="color:#FFFF00">${escapeHTML(data.name)}</span>: ${escapeHTML(data.text)}
    <span class="time">${time}</span>
  `;

  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
});

// === Hapus otomatis pesan >3 hari ===
(async ()=>{
  const snapshot = await get(chatRef);
  if(!snapshot.exists()) return;
  const now = Date.now();
  const threeDays = 3*24*60*60*1000;
  snapshot.forEach((child)=>{
    const data = child.val();
    if(now-(data.time||0)>threeDays){
      remove(ref(db,"chat/"+child.key));
    }
  });
})();

// === Admin posting ===
const thumbLinkInput = document.getElementById('thumbLink');
const originalLinkInput = document.getElementById('originalLink');
const statusTextInput = document.getElementById('statusText');
const postBtn = document.getElementById('postBtn');
const adminPosts = document.getElementById('adminPosts');

postBtn.addEventListener('click', ()=>{
  const thumbLink = thumbLinkInput.value.trim();
  const originalLink = originalLinkInput.value.trim();
  const statusText = statusTextInput.value.trim();

  if(!thumbLink || !originalLink || !statusText){
    alert('Semua kolom harus diisi!');
    return;
  }

  const container = document.createElement('div');
  container.className = 'admin-post-container';

  const img = document.createElement('img');
  img.src = thumbLink;
  img.className = 'admin-post';
  img.title = statusText;
  img.onclick = ()=> window.open(originalLink);

  const text = document.createElement('div');
  text.className='status-text';
  text.textContent=statusText;

  container.appendChild(img);
  container.appendChild(text);
  adminPosts.appendChild(container);

  // Reset form
  thumbLinkInput.value='';
  originalLinkInput.value='';
  statusTextInput.value='';
});
