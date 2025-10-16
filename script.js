import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCkUOL3hfMg8I8ZUF-GX4QThe_0Cql39O8",
    authDomain: "anon-chat-eri.firebaseapp.com",
    databaseURL: "https://anon-chat-eri-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "anon-chat-eri",
    storageBucket: "anon-chat-eri.firebasestorage.app",
    messagingSenderId: "770226352457",
    appId: "1:770226352457:web:43d01526df75e5e49cea98",
    measurementId: "G-2YRM1KMDDM"
  };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const chatRef = ref(db, "chat");

// Nama anonim random
const name = "Anon-" + Math.floor(Math.random() * 10000);

// Event kirim pesan
document.getElementById("sendBtn").addEventListener("click", () => {
  const msgInput = document.getElementById("msgInput");
  const text = msgInput.value.trim();
  if (text) {
    push(chatRef, { name, text, time: Date.now() });
    msgInput.value = "";
  }
});

// Tampilkan pesan baru secara real-time
onChildAdded(chatRef, (snapshot) => {
  const data = snapshot.val();
  const msgBox = document.getElementById("messages");
  const p = document.createElement("p");
  p.innerHTML = `<b>${data.name}</b>: ${data.text}`;
  msgBox.appendChild(p);
  msgBox.scrollTop = msgBox.scrollHeight;
});
