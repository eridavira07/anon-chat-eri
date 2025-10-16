import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, onChildAdded } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const chatList = document.getElementById("adminMessageList");
const postList = document.getElementById("adminPostList");
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

function escapeHTML(str=""){
  return str.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function renderChatItem(data,key){
  const li = document.createElement("li");
  li.className="admin-item";

  const time = new Date(data.time).toLocaleString("id-ID");
  li.innerHTML=`
    <div>
      <b style="color:#00ff66">${escapeHTML(data.name)}</b>: ${escapeHTML(data.text)}
      <div class="time">${time}</div>
    </div>
    <button class="delete-btn" data-key="${key}" data-type="chat">Hapus</button>
  `;
  chatList.appendChild(li);
}

function renderPostItem(data,key){
  const li = document.createElement("li");
  li.className="admin-item";

  const time = new Date(data.time).toLocaleString("id-ID");
  const thumbHtml = data.thumb ? `<img src="${data.thumb}" class="thumb-preview" onclick="window.open('${data.original}')">` : "";
  li.innerHTML=`
    <div>
      <b style="color:#FFFF00">Eri Davira - Admin</b>: ${escapeHTML(data.status)}<br>
      ${thumbHtml}
      <div class="time">${time}</div>
    </div>
    <button class="delete-btn" data-key="${key}" data-type="post">Hapus</button>
  `;
  postList.appendChild(li);
}

function attachDeleteButtons(){
  document.querySelectorAll(".delete-btn").forEach(btn=>{
    btn.onclick=()=>{
      if(confirm("Yakin hapus item ini?")){
        const type=btn.dataset.type;
        const key=btn.dataset.key;
        if(type==="chat") remove(ref(db,"chat/"+key));
        else remove(ref(db,"adminPost/"+key));
      }
    };
  });
}

// Listener chat realtime
onChildAdded(chatRef,(snapshot)=>{
  renderChatItem(snapshot.val(),snapshot.key);
  attachDeleteButtons();
});

// Listener admin post realtime
onChildAdded(adminPostRef,(snapshot)=>{
  renderPostItem(snapshot.val(),snapshot.key);
  attachDeleteButtons();
});

// Posting admin
postBtn.onclick=()=>{
  const thumb=thumbInput.value.trim();
  const original=originalInput.value.trim();
  const status=statusInput.value.trim();
  if(!status) return alert("Teks/status tidak boleh kosong");
  push(adminPostRef,{thumb, original, status, time:Date.now()});
  thumbInput.value=""; originalInput.value=""; statusInput.value="";
};
