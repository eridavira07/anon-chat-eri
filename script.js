import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const adminPostRef = ref(db, "adminPost");

const name = "Anon-" + Math.floor(Math.random()*10000);

const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const adminPosts = document.getElementById("adminPosts");

function escapeHTML(str="") {
  return str.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

// Kirim pesan user
sendBtn.onclick = ()=>{
  const text = msgInput.value.trim();
  if(!text) return;
  push(chatRef,{ name, text: text.slice(0,1000), time: Date.now() });
  msgInput.value="";
};
msgInput.addEventListener("keypress",(e)=>{ if(e.key==="Enter") sendBtn.click(); });

// Render chat
onChildAdded(chatRef,(snapshot)=>{
  const data = snapshot.val();
  if(!data) return;

  const now = Date.now();
  const threeDays = 3*24*60*60*1000;
  if(now - (data.time||0) > threeDays){
    remove(ref(db,"chat/"+snapshot.key));
    return;
  }

  const msgDiv = document.createElement("li");
  msgDiv.className="msg";
  const time = new Date(data.time).toLocaleString("id-ID",{ hour:"2-digit", minute:"2-digit", day:"2-digit", month:"short" });
  const color = data.name.includes("Admin")?"#FFFF00": "#00ff66";

  msgDiv.innerHTML=`<b style="color:${color}">${escapeHTML(data.name)}</b>: ${escapeHTML(data.text)} <span class="time">${time}</span>`;
  
  messages.prepend(msgDiv);
});

// Render admin post
onChildAdded(adminPostRef,(snapshot)=>{
  const data = snapshot.val();
  if(!data) return;

  const li = document.createElement("li");
  li.className="admin-post";
  li.innerHTML = `
    <img src="${data.thumb}" onclick="window.open('${data.original}')">
    <div class="post-text">${escapeHTML(data.status)}</div>
  `;
  adminPosts.prepend(li);
});
