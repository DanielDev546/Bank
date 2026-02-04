const modal = document.getElementById("authModal");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

function openAuth() {
  modal.classList.remove("hidden");
}

function closeAuth() {
  modal.classList.add("hidden");
}

function showLogin() {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");

  loginTab.classList.add("active");
  registerTab.classList.remove("active");
}

function showRegister() {
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");

  registerTab.classList.add("active");
  loginTab.classList.remove("active");
}

// REGISTER
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const user = {
    name: document.getElementById("regName").value,
    email: document.getElementById("regEmail").value,
    password: document.getElementById("regPassword").value
  };

  localStorage.setItem("fintechUser", JSON.stringify(user));
  alert("Account created successfully!");
  showLogin();
});

// LOGIN
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const savedUser = JSON.parse(localStorage.getItem("fintechUser"));

  if (!savedUser) {
    alert("No account found. Please register.");
    showRegister();
    return;
  }

  const loginEmail = document.getElementById("loginEmail").value;
  const loginPassword = document.getElementById("loginPassword").value;

  if (loginEmail === savedUser.email && loginPassword === savedUser.password) {
    localStorage.setItem("loggedIn", "true");
    alert("Login successful!");
    closeAuth();
  } else {
    alert("Invalid credentials");
  }
});

// CTA HANDLER
function handleCTA() {
  if (localStorage.getItem("loggedIn") === "true") {
    window.location.href = "/dashboard.html";
  } else {
    openAuth();
  }
}

// Close modal if you click outside the card
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeAuth();
});
