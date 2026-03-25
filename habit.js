window.onload = () => {
  const loggedInUser = sessionStorage.getItem("sessionUser");
  if (loggedInUser) renderApp(loggedInUser);
};

function showScreen(id) {
  ["signup-screen", "login-screen", "app-screen"].forEach((s) =>
    document.getElementById(s).classList.add("hidden"),
  );
  document.getElementById(id).classList.remove("hidden");
}

function handleSignup() {
  const username = document.getElementById("s-username").value.trim();
  const fname = document.getElementById("s-firstname").value.trim();
  const lname = document.getElementById("s-lastname").value.trim();
  const email = document.getElementById("s-email").value.trim();
  const pass = document.getElementById("s-pass").value;
  const gender = document.getElementById("s-gender").value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!username || !fname || !lname || !email || !pass || !gender)
    return alert("Fill all fields!");
  if (!emailRegex.test(email))
    return alert("Invalid Email! Must be a real email address.");
  if (localStorage.getItem(email)) return alert("User already exists!");

  localStorage.setItem(
    email,
    JSON.stringify({
      username,
      firstName: fname,
      lastName: lname,
      password: btoa(pass),
      gender,
      habits: [],
    }),
  );
  alert("Account created! Please login.");
  showScreen("login-screen");
}

function handleLogin() {
  const email = document.getElementById("l-email").value.trim();
  const pass = document.getElementById("l-pass").value;
  const stored = JSON.parse(localStorage.getItem(email));
  if (stored && stored.password === btoa(pass)) {
    sessionStorage.setItem("sessionUser", email);
    renderApp(email);
  } else alert("Invalid email or password");
}

function renderApp(email) {
  const user = JSON.parse(localStorage.getItem(email));
  document.getElementById("user-display").innerText = `Hi, ${user.username}!`;

  const today = new Date().toDateString();
  const pending = user.habits.filter((h) => h.lastUpdated !== today);
  if (pending.length > 0) {
    alert(
      `Don't forget! You have ${pending.length} habit(s) to complete today.`,
    );
  }

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
  const isDuplicate = data.habits.some(
    (h) => h.name.toLowerCase() === name.toLowerCase(),
  );

  if (isDuplicate) {
    alert("You are already tracking this habit!");
    return;
  }

  data.habits.push({ name, streak: 0, lastUpdated: null, weeklyHits: 0 });
  localStorage.setItem(email, JSON.stringify(data));
  nameInput.value = "";
  renderHabits();
}

function completeHabit(index) {
  const email = sessionStorage.getItem("sessionUser");
  const data = JSON.parse(localStorage.getItem(email));
  const habit = data.habits[index];
  const today = new Date().toDateString();
  if (habit.lastUpdated === today) return alert("Already checked in today!");

  habit.streak += 1;
  habit.weeklyHits = Math.min(habit.weeklyHits + 1, 7);
  habit.lastUpdated = today;
  localStorage.setItem(email, JSON.stringify(data));
  renderHabits();
}

function resetStreak(index) {
  const email = sessionStorage.getItem("sessionUser");
  const data = JSON.parse(localStorage.getItem(email));
  data.habits[index].streak = 0;
  data.habits[index].weeklyHits = 0;
  localStorage.setItem(email, JSON.stringify(data));
  renderHabits();
}

function deleteHabit(index) {
  if (!confirm("Are you sure you want to delete this habit?")) return;
  const email = sessionStorage.getItem("sessionUser");
  const data = JSON.parse(localStorage.getItem(email));

  data.habits.splice(index, 1);

  localStorage.setItem(email, JSON.stringify(data));
  renderHabits();
}

function renderHabits() {
  const email = sessionStorage.getItem("sessionUser");
  const container = document.getElementById("habit-container");
  const data = JSON.parse(localStorage.getItem(email));
  container.innerHTML = "";
  if (!data.habits) return;

  data.habits.forEach((h, i) => {
    const percent = (h.weeklyHits / 7) * 100;
    container.innerHTML += `
      <div class="habit-item">
        <div style="display:flex; justify-content:space-between">
          <strong style="font-size: 1.2rem;">${h.name}</strong>
          <span>🔥 ${h.streak}</span>
        </div>
        <div class="progress-bg"><div class="progress-fill" style="width:${percent}%"></div></div>
        <small>Weekly Progress: ${h.weeklyHits}/7</small>
        <div style="display:flex; gap:10px; margin-top:15px; flex-wrap: wrap;">
          <button onclick="completeHabit(${i})" style="background:#10b981; width: auto; padding: 10px 20px; border:none; border-radius:8px; color:white; cursor:pointer;">Check In</button>
          <button onclick="resetStreak(${i})" style="background:#f59e0b; width: auto; padding: 10px 20px; border:none; border-radius:8px; color:white; cursor:pointer;">Reset</button>
          <button onclick="deleteHabit(${i})" style="background:#ef4444; width: auto; padding: 10px 20px; border:none; border-radius:8px; color:white; cursor:pointer;">Delete</button>
        </div>
      </div>`;
  });
}
