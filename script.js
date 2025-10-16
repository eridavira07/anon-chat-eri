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

function escapeHTML(str=""){
  return str.replaceAll("&","&amp;")
            .replaceAll("<","&lt;")
            .replaceAll(">","&gt;")
            .replaceAll('"',"&quot;")
            .replaceAll("'","&#039;");
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

function renderMessage(container, data, isAdminPost=false){
  const msgDiv = document.createElement("div");
  msgDiv.className="msg";

  const time = new Date(data.time).toLocaleString("id-ID",{
    hour:"2-digit", minute:"2-digit", day:"2-digit", month:"short"
  });

  const nameColor = (data.name?.includes("Admin") || isAdminPost) ? "#FFFF00" : "#00ff66";
  const thumbHtml = data.thumb ? `<img src="${data.thumb}" class="chat-thumb" onclick="window.open('${data.original}')" alt="Admin Post">` : "";

  msgDiv.innerHTML=`
    <span class="name" style="color:${nameColor}">${escapeHTML(data.name || "Eri Davira - Admin")}</span>: ${escapeHTML(data.text || data.status || "")}
    ${thumbHtml}
    <span class="time">${time}</span>
  `;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

onChildAdded(chatRef,(snapshot)=>{
  const data = snapshot.val();
  if(!data) return;
  renderMessage(messages, data, false);
});

onChildAdded(adminPostRef,(snapshot)=>{
  const data = snapshot.val();
  if(!data) return;
  renderMessage(messages, data, true);
});
