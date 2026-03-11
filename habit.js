let sessionUser = null;

function showScreen(id) {
  ["signup-screen", "login-screen", "app-screen"].forEach((s) =>
    document.getElementById(s).classList.add("hidden"),
  );
  document.getElementById(id).classList.remove("hidden");
}

function handleSignup() {
  const email = document.getElementById("s-email").value;
  const pass = document.getElementById("s-pass").value;
  const gender = document.getElementById("s-gender").value;

  if (!email || !pass || !gender) return alert("Please fill all fields");
  if (localStorage.getItem(email)) return alert("User already exists!");

  const userObj = {
    password: btoa(pass),
    gender: gender,
    habits: [],
  };

  localStorage.setItem(email, JSON.stringify(userObj));
  alert("Account created! Please login.");
  showScreen("login-screen");
}

function handleLogin() {
  const email = document.getElementById("l-email").value;
  const pass = document.getElementById("l-pass").value;
  const stored = JSON.parse(localStorage.getItem(email));

  if (stored && stored.password === btoa(pass)) {
    sessionUser = email;
    document.getElementById("user-display").innerText =
      `Hi, ${email.split("@")[0]} (${stored.gender})`;
    showScreen("app-screen");
    renderHabits();
  } else {
    alert("Invalid email or password");
  }
}

function logout() {
  location.reload();
}

function addHabit() {
  const name = document.getElementById("habit-name").value;
  if (!name) return;

  const data = JSON.parse(localStorage.getItem(sessionUser));
  data.habits.push({
    name: name,
    streak: 0,
    lastUpdated: null,
    weeklyHits: 0,
  });

  localStorage.setItem(sessionUser, JSON.stringify(data));
  document.getElementById("habit-name").value = "";
  renderHabits();
}

function completeHabit(index) {
  const data = JSON.parse(localStorage.getItem(sessionUser));
  const habit = data.habits[index];
  const today = new Date().toDateString();

  if (habit.lastUpdated === today) return alert("Already checked in today!");

  habit.streak += 1;
  habit.weeklyHits = Math.min(habit.weeklyHits + 1, 7);
  habit.lastUpdated = today;

  localStorage.setItem(sessionUser, JSON.stringify(data));
  renderHabits();
}

function resetStreak(index) {
  const data = JSON.parse(localStorage.getItem(sessionUser));
  data.habits[index].streak = 0;
  data.habits[index].weeklyHits = 0;
  localStorage.setItem(sessionUser, JSON.stringify(data));
  renderHabits();
}

function renderHabits() {
  const container = document.getElementById("habit-container");
  const data = JSON.parse(localStorage.getItem(sessionUser));
  container.innerHTML = "";

  data.habits.forEach((h, i) => {
    const percent = (h.weeklyHits / 7) * 100;
    container.innerHTML += `
                <div class="habit-item">
                    <div style="display:flex; justify-content:space-between">
                        <strong>${h.name}</strong>
                        <span>🔥 ${h.streak}</span>
                    </div>
                    <div class="progress-bg"><div class="progress-fill" style="width:${percent}%"></div></div>
                    <small>Weekly Progress: ${h.weeklyHits}/7</small>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button onclick="completeHabit(${i})" style="background:#10b981">Check In</button>
                        <button onclick="resetStreak(${i})" style="background:#f59e0b">Reset</button>
                    </div>
                </div>
            `;
  });
}
