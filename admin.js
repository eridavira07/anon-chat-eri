import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onChildAdded, push, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const adminMsgInput = document.getElementById("adminMsgInput");
const adminSendBtn = document.getElementById("adminSendBtn");

const SECRET_KEY = "admin-eri-2025";
const urlParams = new URLSearchParams(window.location.search);
if(urlParams.get("key") !== SECRET_KEY){
  document.body.innerHTML = "<h1 style='color:red;text-align:center;'>403 FORBIDDEN</h1>";
  throw new Error("Akses ditolak");
}

// Render Chat Admin & User
onChildAdded(chatRef,(snapshot)=>{
  const data = snapshot.val();
  if(!data) return;

  const li = document.createElement("li");
  li.className = "admin-item";

  const time = new Date(data.time).toLocaleString("id-ID");
  li.innerHTML=`
    <div>
      <b style="color:${data.name.includes("Admin")?"#FFFF00":"#00ff66"}">${data.name}</b>: ${data.text}
      <div class="time">${time}</div>
    </div>
    <button class="delete-btn" data-key="${snapshot.key}">Hapus</button>
  `;
  chatList.appendChild(li);

  li.querySelector(".delete-btn").onclick = ()=>{
    if(confirm("Yakin hapus pesan ini?")) remove(ref(db,"chat/"+snapshot.key));
  };
});

// Render Posting Admin
onChildAdded(adminPostRef,(snapshot)=>{
  const data = snapshot.val();
  if(!data) return;

  const li = document.createElement("li");
  li.className = "admin-item";
  li.innerHTML = `
    <div>
      <img src="${data.thumb}" style="width:60px;height:60px;cursor:pointer;border-radius:4px;" onclick="window.open('${data.original}')">
      <div>${data.status}</div>
    </div>
    <button class="delete-btn" data-key="${snapshot.key}">Hapus</button>
  `;
  postList.appendChild(li);

  li.querySelector(".delete-btn").onclick = ()=>{
    if(confirm("Yakin hapus postingan ini?")) remove(ref(db,"adminPost/"+snapshot.key));
  };
});

// Admin mengirim chat
adminSendBtn.onclick = ()=>{
  const text = adminMsgInput.value.trim();
  if(!text) return;
  push(chatRef,{ name:"Eri Davira - Admin", text, time:Date.now() });
  adminMsgInput.value="";
};

// Admin posting status
postBtn.onclick = ()=>{
  const thumb = thumbInput.value.trim();
  const original = originalInput.value.trim();
  const status = statusInput.value.trim();
  if(!thumb || !original || !status) return;
  push(adminPostRef,{ thumb, original, status });
  thumbInput.value="";
  originalInput.value="";
  statusInput.value="";
};
