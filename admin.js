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
const chatRef = ref(db,"chat");
const adminPostRef = ref(db,"adminPost");

const list = document.getElementById("adminMessageList");
const thumbInput = document.getElementById("thumbInput");
const originalInput = document.getElementById("originalInput");
const statusInput = document.getElementById("statusInput");
const postBtn = document.getElementById("postBtn");

const SECRET_KEY = "admin-eri-2025";
const urlParams = new URLSearchParams(window.location.search);
if(urlParams.get("key") !== SECRET_KEY){
  document.body.innerHTML = "<h1 style='color:red;text-align:center;'>403 FORBIDDEN</h1>";
  throw new Error("Akses ditolak");
}

// Escape HTML
function escapeHTML(str=""){
  return str.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

// Render item
function renderItem(data,key,type="chat"){
  const li = document.createElement("li");
  li.className="admin-item";

  const time = new Date(data.time).toLocaleString("id-ID");
  const thumbHtml = data.thumb ? `<img src="${data.thumb}" class="thumb-preview" onclick="window.open('${data.original}')">` : "";
  const textContent = escapeHTML(data.text || data.status || "");
  const name = type==="post" ? "Eri Davira - Admin" : data.name;

  li.innerHTML = `
    <div>
      <b style="color:${type==="post"?"#FFFF00":"#00ff66"}">${escapeHTML(name)}</b>: ${textContent}<br>
      ${thumbHtml}
      <div class="time">${time}</div>
    </div>
    <button class="delete-btn" data-key="${key}" data-type="${type}">Hapus</button>
  `;
  list.appendChild(li);
}

// Ambil data gabungan chat + post admin
function fetchAll(){
  list.innerHTML="";
  const combined = [];

  onValue(chatRef,(snapshot)=>{
    if(snapshot.exists()){
      snapshot.forEach(c=> combined.push({data:c.val(), key:c.key, type:"chat"}));
    }
    onValue(adminPostRef,(snapshot2)=>{
      if(snapshot2.exists()){
        snapshot2.forEach(c=> combined.push({data:c.val(), key:c.key, type:"post"}));
      }
      combined.sort((a,b)=> (a.data.time||0)-(b.data.time||0));
      list.innerHTML="";
      combined.forEach(item=> renderItem(item.data,item.key,item.type));
      attachDeleteButtons();
    }, {onlyOnce:true});
  }, {onlyOnce:true});
}

// Tombol hapus
function attachDeleteButtons(){
  document.querySelectorAll(".delete-btn").forEach(btn=>{
    btn.onclick = ()=>{
      if(confirm("Yakin hapus item ini?")){
        const type = btn.dataset.type;
        const key = btn.dataset.key;
        if(type==="chat") remove(ref(db,"chat/"+key));
        else remove(ref(db,"adminPost/"+key));
      }
    };
  });
}

// Tombol posting admin
postBtn.onclick = ()=>{
  const thumb = thumbInput.value.trim();
  const original = originalInput.value.trim();
  const status = statusInput.value.trim();
  if(!status) return alert("Teks/status tidak boleh kosong");
  push(adminPostRef,{thumb, original, status, time: Date.now()});
  thumbInput.value=""; originalInput.value=""; statusInput.value="";
};

// Inisialisasi
fetchAll();
