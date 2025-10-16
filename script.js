import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const name = "Anon-" + Math.floor(Math.random()*10000);

const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const adminPosts = document.getElementById("adminPosts");

function escapeHTML(str=""){
  return str.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

sendBtn.addEventListener("click", ()=>{
  const text = msgInput.value.trim();
  if(!text) return;
  push(chatRef, { name, text: text.slice(0,1000), time: Date.now() });
  msgInput.value="";
});

msgInput.addEventListener("keypress",(e)=>{
  if(e.key==="Enter") sendBtn.click();
});

function renderMessage(container, data, isAdmin=false){
  const msgDiv = document.createElement("div");
  msgDiv.className="msg";
  const time = new Date(data.time).toLocaleString("id-ID",{
    hour:"2-digit", minute:"2-digit", day:"2-digit", month:"short"
  });
  const nameColor = isAdmin ? "#FFFF00" : "#00ff66";

  msgDiv.innerHTML=`
    <span class="name" style="color:${nameColor}">${escapeHTML(data.name)}</span>: ${escapeHTML(data.text || data.status || "")}
    <span class="time">${time}</span>
  `;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

// Render chat
onChildAdded(chatRef,(snapshot)=>{
  const data = snapshot.val();
  if(!data) return;
  const isAdmin = data.name?.includes("Admin");
  renderMessage(messages,data,isAdmin);
});

// Render admin posts
onChildAdded(adminPostRef,(snapshot)=>{
  const data = snapshot.val();
  if(!data) return;
  const postDiv = document.createElement("div");
  postDiv.className="admin-post";
  postDiv.innerHTML=`
    <div class="post-thumb" onclick="window.open('${data.original}')">
      <img src="${data.thumb}" alt="Admin Post">
    </div>
    <div class="post-text">${escapeHTML(data.status)}</div>
  `;
  adminPosts.appendChild(postDiv);
});
