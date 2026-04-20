/* ─── THEME ───────────────────────────────────────── */
function toggleTheme() {
  const isLight = document.body.classList.toggle("light");
  document.getElementById("themeBtn").textContent = isLight ? "☀️" : "🌙";
  localStorage.setItem("pcms-theme", isLight ? "light" : "dark");
}

function applyStoredTheme() {
  if (localStorage.getItem("pcms-theme") === "light") {
    document.body.classList.add("light");
    const btn = document.getElementById("themeBtn");
    if (btn) btn.textContent = "☀️";
  }
}

/* ─── TOAST ───────────────────────────────────────── */
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}

/* ─── AUTH ────────────────────────────────────────── */
function doLogin() {
  const u = document.getElementById("uname").value.trim();
  const p = document.getElementById("pword").value;
  const err = document.getElementById("loginErr");
  if (u === "PCMS" && p === "12345678") {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    startDashboard();
  } else {
    err.textContent = "Incorrect username or password. Please try again.";
    document.getElementById("pword").value = "";
    setTimeout(() => (err.textContent = ""), 3500);
  }
}

function doLogout() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("loginPage").style.display = "flex";
  document.getElementById("uname").value = "";
  document.getElementById("pword").value = "";
}

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    document.getElementById("loginPage").style.display !== "none"
  )
    doLogin();
});

/* ─── CLOCK & GREETING ────────────────────────────── */
function tickClock() {
  const now = new Date();
  const h = now.getHours(),
    m = now.getMinutes(),
    s = now.getSeconds();
  const pad = (v) => (v < 10 ? "0" + v : v);
  const h12 = h % 12 || 12;
  const ap = h >= 12 ? "PM" : "AM";
  document.getElementById("navClock").textContent =
    `${h12}:${pad(m)}:${pad(s)} ${ap}`;
  const greet =
    h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  document.getElementById("navGreet").textContent = greet + ", Victor";
  checkNightSchedule(h);
}

/* ─── CHART ───────────────────────────────────────── */
let chart,
  powerData = [],
  currentData = [],
  timeLabels = [];
const MAX = 20;

function initChart() {
  const ctx = document.getElementById("energyChart").getContext("2d");
  const powerGrad = ctx.createLinearGradient(0, 0, 0, 160);
  powerGrad.addColorStop(0, "rgba(245,158,11,0.25)");
  powerGrad.addColorStop(1, "rgba(245,158,11,0)");
  const currGrad = ctx.createLinearGradient(0, 0, 0, 160);
  currGrad.addColorStop(0, "rgba(96,165,250,0.2)");
  currGrad.addColorStop(1, "rgba(96,165,250,0)");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: timeLabels,
      datasets: [
        {
          label: "Power (W)",
          data: powerData,
          borderColor: "#f59e0b",
          backgroundColor: powerGrad,
          borderWidth: 2,
          pointRadius: 2.5,
          pointBackgroundColor: "#f59e0b",
          tension: 0.45,
          fill: true,
        },
        {
          label: "Current (A×100)",
          data: currentData,
          borderColor: "#60a5fa",
          backgroundColor: currGrad,
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.45,
          fill: true,
          borderDash: [4, 3],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400, easing: "easeOutQuart" },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#192236",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          titleColor: "#94a3b8",
          bodyColor: "#e2e8f0",
          padding: 10,
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y;
              return ctx.datasetIndex === 0
                ? ` Power: ${v.toFixed(1)} W`
                : ` Current: ${(v / 100).toFixed(2)} A`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.04)", drawBorder: false },
          ticks: {
            color: "#475569",
            font: { size: 10, family: "JetBrains Mono" },
            maxTicksLimit: 5,
          },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.04)", drawBorder: false },
          ticks: {
            color: "#475569",
            font: { size: 10, family: "JetBrains Mono" },
            maxTicksLimit: 5,
          },
        },
      },
    },
  });
}

/* ─── LIVE SIMULATION ─────────────────────────────── */
let powerBase = 300,
  phaseDrift = 0;
function updateReadings() {
  phaseDrift += 0.18;
  const loadFactor =
    (loadState[25] ? 60 : 0) +
    (loadState[26] ? 60 : 0) +
    (loadState[27] ? 120 : 0) +
    (loadState[14] ? 120 : 0);

  const rawPower =
    loadFactor > 0
      ? loadFactor + Math.sin(phaseDrift) * 18 + (Math.random() - 0.5) * 10
      : 8 + Math.random() * 4;
  const volt =
    223 + Math.sin(phaseDrift * 0.3) * 3 + (Math.random() - 0.5) * 1.5;
  const curr = rawPower / volt;
  const energy =
    parseFloat(document.getElementById("se").textContent) +
    rawPower / 1000 / 1800;

  document.getElementById("sv").textContent = volt.toFixed(1);
  document.getElementById("sc").textContent = curr.toFixed(2);
  document.getElementById("sp").textContent = Math.round(rawPower);
  document.getElementById("se").textContent = energy.toFixed(3);

  const now = new Date();
  const lbl = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  powerData.push(parseFloat(rawPower.toFixed(1)));
  currentData.push(parseFloat((curr * 100).toFixed(2)));
  timeLabels.push(lbl);
  if (powerData.length > MAX) {
    powerData.shift();
    currentData.shift();
    timeLabels.shift();
  }
  if (chart) chart.update("none");
}

/* ─── LOAD STATE ──────────────────────────────────── */
const loadState = { 25: false, 26: false, 27: false, 14: false };

function setLoad(pin, on) {
  const h = new Date().getHours();
  const isNight = h >= 0 && h < 6;
  if (on && isNight && (pin === 27 || pin === 14)) {
    document.getElementById(`tg${pin}`).checked = false;
    showToast("⏱  Sockets are scheduled off until 6:00 AM");
    return;
  }
  loadState[pin] = on;
  applyLoadUI(pin, on);
}

function applyLoadUI(pin, on) {
  loadState[pin] = on;
  const card = document.getElementById(`lc${pin}`);
  const dot = document.getElementById(`dot${pin}`);
  const lbl = document.getElementById(`lbl${pin}`);
  const tog = document.getElementById(`tg${pin}`);
  card.classList.toggle("on", on);
  dot.className = `status-dot ${on ? "on" : "off"}`;
  lbl.textContent = on ? "On" : "Off";
  lbl.style.color = on ? "var(--green)" : "";
  tog.checked = on;
}

/* ─── NIGHT SCHEDULE ──────────────────────────────── */
let _lastNightState = null;
function checkNightSchedule(h) {
  const sched = document.getElementById("schedOn").checked;
  const isNight = sched && h >= 0 && h < 6;
  if (isNight === _lastNightState) return;
  _lastNightState = isNight;

  [27, 14].forEach((pin) => {
    const lockEl = document.getElementById(`lock${pin}`);
    if (isNight) {
      applyLoadUI(pin, false);
      document.getElementById(`tg${pin}`).disabled = true;
      lockEl.style.display = "block";
    } else {
      document.getElementById(`tg${pin}`).disabled = false;
      lockEl.style.display = "none";
    }
  });

  if (isNight) showToast("🌙 Schedule active — sockets switched off");
  updateScheduleUI();
}

function updateScheduleUI() {
  const sched = document.getElementById("schedOn").checked;
  const h = new Date().getHours();
  const isNight = sched && h >= 0 && h < 6;
  const led = document.getElementById("schedLed");
  const txt = document.getElementById("schedStatusText");

  if (!sched) {
    led.className = "sched-led standby";
    txt.textContent = "Schedule disabled — sockets follow manual control only";
  } else if (isNight) {
    led.className = "sched-led active";
    txt.textContent = "Schedule active now — non-essential loads are off";
  } else {
    led.className = "sched-led armed";
    txt.textContent = "Schedule armed — will activate at midnight";
  }

  if (!sched) {
    [27, 14].forEach((pin) => {
      document.getElementById(`tg${pin}`).disabled = false;
      document.getElementById(`lock${pin}`).style.display = "none";
    });
  }
  checkNightSchedule(h);
}

/* ─── INIT ────────────────────────────────────────── */
function startDashboard() {
  initChart();
  tickClock();
  updateReadings();
  updateScheduleUI();
  setInterval(tickClock, 1000);
  setInterval(updateReadings, 2000);
}

applyStoredTheme();
