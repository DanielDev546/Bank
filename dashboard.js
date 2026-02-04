// ===========================
// 1) AUTH & PATH LOGIC
// ===========================
const user = JSON.parse(localStorage.getItem("fintechUser"));

if (!localStorage.getItem("loggedIn") || !user) {
  const isGitHub = window.location.hostname.includes("github.io");
  window.location.href = isGitHub ? "/DanBank/index.html" : "index.html";
}

document.getElementById("userEmailSidebar").textContent = user.email;

const userKey = `data_${user.email}`;
let userData = JSON.parse(localStorage.getItem(userKey)) || {
  cards: [],
  transactions: [],
  activeCardIndex: 0
};

function saveData() {
  localStorage.setItem(userKey, JSON.stringify(userData));
}

// ===========================
// 2) SIDEBAR LOGIC
// ===========================
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  sidebar.classList.toggle("sidebar-closed");
  overlay.classList.toggle("hidden");
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });

  // close sidebar on mobile
  if (window.innerWidth <= 900) {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!sidebar.classList.contains("sidebar-closed")) {
      sidebar.classList.add("sidebar-closed");
      overlay.classList.add("hidden");
    }
  }
}

// ===========================
// 3) CARDS LOGIC
// ===========================
function renderCards() {
  const container = document.getElementById("cards");
  container.innerHTML = "";

  if (userData.cards.length === 0) {
    container.innerHTML = `<p class="muted" style="font-size: 13px; font-style: italic;">No cards added yet.</p>`;
    document.getElementById("balance").textContent = "₦0";
    document.getElementById("activeCardName").textContent = "No Active Card";
    return;
  }

  userData.cards.forEach((card, idx) => {
    const isActive = idx === userData.activeCardIndex;

    const div = document.createElement("div");
    div.className = `card-item ${isActive ? "active" : ""}`;
    div.onclick = () => {
      userData.activeCardIndex = idx;
      saveData();
      renderCards();
      renderChart();
    };

    div.innerHTML = `<span>${card.name}</span><b>₦${card.balance.toLocaleString()}</b>`;
    container.appendChild(div);
  });

  const active = userData.cards[userData.activeCardIndex];
  document.getElementById("balance").textContent = `₦${active.balance.toLocaleString()}`;
  document.getElementById("activeCardName").textContent = `Current: ${active.name}`;
}

function addCard() {
  const name = prompt("Card Name:");
  if (!name) return;

  userData.cards.push({ name, balance: 0 });
  userData.activeCardIndex = userData.cards.length - 1;

  saveData();
  renderCards();
  pushNotification(`New card added: ${name}`);
}

// ===========================
// 4) MONEY LOGIC
// ===========================
function sendMoney() {
  const bank = document.getElementById("bankSelect").value;
  const recipient = document.getElementById("recipientName").value.trim();
  const amount = Number(document.getElementById("sendAmount").value);

  const card = userData.cards[userData.activeCardIndex];

  if (!card) return alert("Add/select a card first.");
  if (!bank) return alert("Choose a bank.");
  if (!recipient) return alert("Enter recipient name.");
  if (!amount || amount <= 0) return alert("Enter a valid amount.");
  if (amount > card.balance) return alert("Insufficient funds.");

  card.balance -= amount;

  userData.transactions.unshift({
    type: "sent",
    amount,
    date: new Date().toLocaleDateString(),
    cardName: card.name,
    meta: `To ${recipient} (${bank})`
  });

  saveData();
  renderCards();
  renderTransactions();
  renderChart();

  document.getElementById("sendAmount").value = "";
  document.getElementById("recipientName").value = "";

  pushNotification(`Sent ₦${amount.toLocaleString()} to ${recipient} (${bank}).`);
}

function receiveMoney() {
  const amount = Number(document.getElementById("receiveAmount").value);
  const card = userData.cards[userData.activeCardIndex];

  if (!card) return alert("Add/select a card first.");
  if (!amount || amount <= 0) return alert("Enter a valid amount.");

  card.balance += amount;

  userData.transactions.unshift({
    type: "received",
    amount,
    date: new Date().toLocaleDateString(),
    cardName: card.name,
    meta: `Top up`
  });

  saveData();
  renderCards();
  renderTransactions();
  renderChart();

  document.getElementById("receiveAmount").value = "";

  pushNotification(`Deposited ₦${amount.toLocaleString()} to ${card.name}.`);
}

// ===========================
// 5) TRANSACTIONS
// ===========================
function renderTransactions() {
  const list = document.getElementById("transactions");
  const filter = document.getElementById("filterType").value;

  let tx = userData.transactions;

  if (filter !== "all") {
    tx = tx.filter(t => t.type === filter);
  }

  if (tx.length === 0) {
    list.innerHTML = `<li class="muted" style="font-size:13px; font-style:italic;">No transactions yet.</li>`;
    return;
  }

  list.innerHTML = tx.map(t => `
    <li class="tx">
      <span class="tx-type ${t.type === "sent" ? "tx-sent" : "tx-received"}">
        ${t.type.toUpperCase()}
      </span>
      <span>₦${t.amount.toLocaleString()}</span>
    </li>
  `).join("");
}

document.getElementById("filterType").addEventListener("change", renderTransactions);

// ===========================
// 6) CHART LOGIC
// ===========================
let chart;

function renderChart() {
  const canvas = document.getElementById("spendingChart");
  const ctx = canvas.getContext("2d");

  const sent = userData.transactions
    .filter(t => t.type === "sent")
    .reduce((sum, t) => sum + t.amount, 0);

  const received = userData.transactions
    .filter(t => t.type === "received")
    .reduce((sum, t) => sum + t.amount, 0);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Sent", "Received"],
      datasets: [{
        data: [sent, received],
        backgroundColor: ["#f87171", "#4ade80"]
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#ffffff" }
        }
      }
    }
  });
}

// ===========================
// 7) NOTIFICATIONS
// ===========================
function pushNotification(message) {
  const list = document.getElementById("notifications");
  const li = document.createElement("li");

  li.textContent = `${new Date().toLocaleTimeString()} — ${message}`;
  list.prepend(li);

  // keep max 6 notifications
  while (list.children.length > 6) {
    list.removeChild(list.lastChild);
  }
}

// ===========================
// 8) LOGOUT
// ===========================
function logout() {
  localStorage.removeItem("loggedIn");
  const isGitHub = window.location.hostname.includes("github.io");
  window.location.href = isGitHub ? "/DanBank/index.html" : "index.html";
}

// ===========================
// INIT
// ===========================
renderCards();
renderTransactions();
renderChart();
