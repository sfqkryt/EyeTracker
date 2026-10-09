document.addEventListener("DOMContentLoaded", () => {

  const navItems = document.querySelectorAll(".nav-item");
  const screens  = document.querySelectorAll(".screen");

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.screen;

      navItems.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      screens.forEach((s) => s.classList.remove("active"));
      const screen = document.getElementById("screen-" + target);
      if (screen) screen.classList.add("active");

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".switch input").forEach((sw) => {
    sw.addEventListener("change", (e) => {
      const name = e.target.closest(".card")?.querySelector(".label")?.textContent.trim()
                   || "переключатель";
      console.log(`[switch] "${name}" → ${e.target.checked ? "включено" : "выключено"}`);
    });
  });

  const range = document.querySelector(".range");
  const bigNumber = document.querySelector(".big-number");
  const progressFill = document.querySelector(".progress-fill");

  if (range) {
    // восстановление из localStorage
    const saved = localStorage.getItem("eyeLoad");
    if (saved !== null) {
      range.value = saved;
      updateLoadUI(saved);
    }

    range.addEventListener("input", (e) => {
      const v = e.target.value;
      updateLoadUI(v);
      localStorage.setItem("eyeLoad", v);
    });
  }

  function updateLoadUI(value) {
    if (bigNumber) bigNumber.innerHTML = `${value}<span>%</span>`;
    if (progressFill) progressFill.style.width = value + "%";
  }


  const timerEl   = document.querySelector("#screen-training .timer");
  const btnStart  = document.querySelector("#screen-training .btn-primary");
  const btnPause  = document.querySelector("#screen-training .btn-ghost.wide");
  const timerRing = document.querySelector(".timer-circle");

  let totalSeconds = 20;
  let seconds = totalSeconds;
  let interval = null;

  function renderTimer() {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    if (timerEl) timerEl.textContent = `${m}:${s}`;

    // прогресс кольца
    if (timerRing) {
      const deg = (seconds / totalSeconds) * 360;
      timerRing.style.background =
        `conic-gradient(var(--accent) 0deg ${deg}deg, #1a2942 ${deg}deg 360deg)`;
    }
  }

  function startTimer() {
    if (interval) return;
    if (seconds === 0) seconds = totalSeconds;

    if (btnStart) btnStart.textContent = "▶ Идёт…";
    interval = setInterval(() => {
      seconds--;
      renderTimer();
      if (seconds <= 0) {
        clearInterval(interval);
        interval = null;
        if (btnStart) btnStart.textContent = "▶ Заново";
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!interval) return;
    clearInterval(interval);
    interval = null;
    if (btnStart) btnStart.textContent = "▶ Продолжить";
    console.log("[timer] пауза на", seconds, "сек");
  }

  btnStart?.addEventListener("click", startTimer);
  btnPause?.addEventListener("click", pauseTimer);

  renderTimer();


  const gestureButtons = document.querySelectorAll("#screen-gestures .btn-ghost");
  const gestureCards   = document.querySelectorAll("#screen-gestures .gesture-card");

  gestureButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const gesture = btn.textContent.trim();

      // подсветка кнопки
      gestureButtons.forEach((b) => b.style.background = "transparent");
      btn.style.background = "#143d38";
      btn.style.color = "var(--accent)";

      // подсветка соответствующей карточки
      gestureCards.forEach((c) => {
        const title = c.querySelector(".g-title")?.textContent.toLowerCase() || "";
        const match = title.includes(gesture.toLowerCase().slice(0, 4));
        c.style.borderColor = match ? "var(--accent)" : "var(--border)";
      });

      console.log(`[gesture] выбран: ${gesture}`);
    });
  });

  /* =====================================================
     6. ЭКРАН «СВОИ» — добавление и удаление жестов
     ===================================================== */
  const inputName  = document.querySelector("#screen-custom .input[type='text']");
  const selectMove = document.querySelector("#screen-custom select.input");
  const btnAdd     = document.querySelector("#screen-custom .btn-primary.full");
  const cardList   = document.querySelectorAll("#screen-custom .card")[2]; // карточка «Мои жесты»

  // загрузка из localStorage
  let customGestures = JSON.parse(localStorage.getItem("customGestures") || "[]");

  function renderGestures() {
    if (!cardList) return;

    // сохраняем заголовок
    cardList.innerHTML = `<p class="label">☰ Мои жесты</p>`;

    if (customGestures.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted small";
      empty.textContent = "Пока нет своих жестов. Добавьте первый.";
      cardList.appendChild(empty);
      return;
    }

    customGestures.forEach((g, i) => {
      const row = document.createElement("div");
      row.className = "row-between";
      row.style.marginTop = "10px";
      row.style.padding = "10px 12px";
      row.style.background = "var(--bg-card-2)";
      row.style.border = "1px solid var(--border)";
      row.style.borderRadius = "12px";

      row.innerHTML = `
        <div>
          <p style="font-size:14px;font-weight:600;">${g.name}</p>
          <p class="muted small">${g.move}</p>
        </div>
        <button class="icon-btn" data-index="${i}" title="Удалить"
                style="width:34px;height:34px;font-size:14px;">✕</button>
      `;
      cardList.appendChild(row);
    });

    // кнопки удаления
    cardList.querySelectorAll("button[data-index]").forEach((b) => {
      b.addEventListener("click", () => {
        const idx = Number(b.dataset.index);
        customGestures.splice(idx, 1);
        localStorage.setItem("customGestures", JSON.stringify(customGestures));
        renderGestures();
        console.log("[custom] жест удалён, осталось:", customGestures.length);
      });
    });
  }

  btnAdd?.addEventListener("click", () => {
    const name = inputName?.value.trim();
    const move = selectMove?.value;

    if (!name) {
      inputName?.focus();
      inputName.style.borderColor = "#e05a5a";
      setTimeout(() => { inputName.style.borderColor = "var(--border)"; }, 1200);
      return;
    }

    customGestures.push({ name, move });
    localStorage.setItem("customGestures", JSON.stringify(customGestures));

    if (inputName) inputName.value = "";
    renderGestures();
    console.log("[custom] добавлен жест:", name, "/", move);
  });

  renderGestures();

  const settingsBtn = document.querySelector(".app-header .icon-btn");
  settingsBtn?.addEventListener("click", () => {
    alert("EyeTrack Pro\n\nСимулятор активен.\nВерсия: 1.0.0\n\nПереключайте вкладки нижним меню.");
  });

  console.log("%cEyeTrack Pro запущен", "color:#5ee6c8;font-weight:bold;");
});