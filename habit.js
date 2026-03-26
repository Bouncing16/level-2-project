window.onload = () => {
  const loggedInUser = sessionStorage.getItem("sessionUser");
  if (loggedInUser) renderApp(loggedInUser);
};

function showScreen(id) {
  ["signup-screen", "login-screen", "app-screen"].forEach((s) => document.getElementById(s).classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function notify(msg, type = "success") {
  const colors = { success: "#10b981", error: "#ef4444", warn: "#f59e0b" };
  Toastify({
    text: msg,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: { background: colors[type] || colors.success, borderRadius: "10px" }
  }).showToast();
}

function handleSignup() {
  const username = document.getElementById("s-username").value.trim();
  const fname = document.getElementById("s-firstname").value.trim();
  const lname = document.getElementById("s-lastname").value.trim();
  const email = document.getElementById("s-email").value.trim();
  const pass = document.getElementById("s-pass").value;
  const gender = document.getElementById("s-gender").value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!username || !fname || !lname || !email || !pass || !gender) return notify("Fill all fields!", "error");
  if (!emailRegex.test(email)) return notify("Invalid Email!", "error");
  if (localStorage.getItem(email)) return notify("User already exists!", "error");

  localStorage.setItem(email, JSON.stringify({ username, firstName: fname, lastName: lname, password: btoa(pass), gender, habits: [] }));
  notify("Account created! Please login.");
  showScreen("login-screen");
}

function handleLogin() {
  const email = document.getElementById("l-email").value.trim();
  const pass = document.getElementById("l-pass").value;
  const stored = JSON.parse(localStorage.getItem(email));
  if (stored && stored.password === btoa(pass)) {
    sessionStorage.setItem("sessionUser", email);
    renderApp(email);
  } else notify("Invalid email or password", "error");
}

function renderApp(email) {
  const user = JSON.parse(localStorage.getItem(email));
  document.getElementById("user-display").innerText = `Hi, ${user.username}!`;
  const today = new Date().toDateString();
  const pending = user.habits.filter(h => h.lastUpdated !== today);
  if (pending.length > 0) notify(`Don't forget! ${pending.length} habit(s) left today.`, "warn");
  showScreen("app-screen");
  renderHabits();
}

function logout() { 
  sessionStorage.removeItem("sessionUser"); 
  location.reload(); 
}

function addHabit() {
  const email = sessionStorage.getItem("sessionUser");
  const nameInput = document.getElementById("habit-name");
  const name = nameInput.value.trim();
  if (!name) return;
  const data = JSON.parse(localStorage.getItem(email));
  if (data.habits.some(h => h.name.toLowerCase() === name.toLowerCase())) return notify("Already tracking this!", "error");

  data.habits.push({ name, streak: 0, lastUpdated: null, weeklyHits: 0 });
  localStorage.setItem(email, JSON.stringify(data));
  nameInput.value = "";
  notify("Habit added!");
  renderHabits();
}

function completeHabit(index) {
  const email = sessionStorage.getItem("sessionUser");
  const data = JSON.parse(localStorage.getItem(email));
  const habit = data.habits[index];
  if (habit.lastUpdated === new Date().toDateString()) return notify("Already checked in!", "warn");

  habit.streak += 1;
  habit.weeklyHits = Math.min(habit.weeklyHits + 1, 7);
  habit.lastUpdated = new Date().toDateString();
  localStorage.setItem(email, JSON.stringify(data));
  notify("Check-in successful!");
  renderHabits();
}

function resetStreak(index) {
  const email = sessionStorage.getItem("sessionUser");
  const data = JSON.parse(localStorage.getItem(email));
  data.habits[index].streak = 0;
  data.habits[index].weeklyHits = 0;
  localStorage.setItem(email, JSON.stringify(data));
  notify("Streak reset.", "warn");
  renderHabits();
}

function deleteHabit(index) {
  if (!confirm("Delete this habit?")) return;
  const email = sessionStorage.getItem("sessionUser");
  const data = JSON.parse(localStorage.getItem(email));
  data.habits.splice(index, 1);
  localStorage.setItem(email, JSON.stringify(data));
  notify("Habit deleted.", "error");
  renderHabits();
}

function renderHabits() {
  const email = sessionStorage.getItem("sessionUser");
  const container = document.getElementById("habit-container");
  const data = JSON.parse(localStorage.getItem(email));
  container.innerHTML = "";
  if(!data.habits) return;
  data.habits.forEach((h, i) => {
    const percent = (h.weeklyHits / 7) * 100;
    container.innerHTML += `
      <div class="habit-item">
        <div style="display:flex; justify-content:space-between"><strong>${h.name}</strong><span>🔥 ${h.streak}</span></div>
        <div class="progress-bg"><div class="progress-fill" style="width:${percent}%"></div></div>
        <small>Weekly: ${h.weeklyHits}/7</small>
        <div style="display:flex; gap:10px; margin-top:15px;">
          <button onclick="completeHabit(${i})" style="background:#10b981; width:auto; padding:10px 20px; border:none; border-radius:8px; color:white; cursor:pointer;">Check In</button>
          <button onclick="resetStreak(${i})" style="background:#f59e0b; width:auto; padding:10px 20px; border:none; border-radius:8px; color:white; cursor:pointer;">Reset</button>
          <button onclick="deleteHabit(${i})" style="background:#ef4444; width:auto; padding:10px 20px; border:none; border-radius:8px; color:white; cursor:pointer;">Delete</button>
        </div>
      </div>`;
  });
}