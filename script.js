import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔥 Ganti dengan konfigurasi Firebase kamu
const firebaseConfig = {
  apiKey: "GANTI_DENGAN_API_KEY",
  authDomain: "GANTI_DENGAN_DOMAIN",
  databaseURL: "GANTI_DENGAN_DATABASE_URL",
  projectId: "GANTI_DENGAN_PROJECT_ID",
  storageBucket: "GANTI_DENGAN_BUCKET",
  messagingSenderId: "GANTI_DENGAN_SENDER_ID",
  appId: "GANTI_DENGAN_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const chatRef = ref(db, "chat");

// Nama anonim
const name = "Anon-" + Math.floor(Math.random() * 10000);

document.getElementById("sendBtn").addEventListener("click", () => {
  const msgInput = document.getElementById("msgInput");
  const text = msgInput.value.trim();
  if (text) {
    push(chatRef, { name, text, time: Date.now() });
    msgInput.value = "";
  }
});

onChildAdded(chatRef, (snapshot) => {
  const data = snapshot.val();
  const msgBox = document.getElementById("messages");
  const p = document.createElement("p");
  p.innerHTML = `<b>${data.name}</b>: ${data.text}`;
  msgBox.appendChild(p);
  msgBox.scrollTop = msgBox.scrollHeight;
});
