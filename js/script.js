const music = document.getElementById("bg-music");

  function tryPlayMusic() {
    music.play().catch(() => {});
  }
  ["click", "touchstart", "input", "scroll"].forEach(evt => {
    window.addEventListener(evt, tryPlayMusic, { once: true });
  });
  window.addEventListener("load", () => {
    setTimeout(() => {
      music.play().catch(() => {});
    }, 800);
  });

  let secretClicks = 0;
  document.getElementById("main-card").addEventListener("click", () => {
    secretClicks++;
    if (secretClicks === 5) {
      showPopup("🎉 Սոսը մեծ սիրով սպասում է ձեզ 🎉");
      secretClicks = 0;
    }
    setTimeout(() => secretClicks = 0, 2000);
  });

  function startCountdown() {
    const targetDate = new Date("2025-11-27T18:00:00");
    const countdownEl = document.getElementById("countdown");

    function updateCountdown() {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        countdownEl.innerHTML = "🎉 Տոնակատարությունը սկսվել է 🎉";
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      countdownEl.innerHTML = `Մնացել է՝ <b>${days}</b> օր <b>${hours}</b> ժամ <b>${minutes}</b> րոպե <b>${seconds}</b> վայրկյան`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
  startCountdown();

document.getElementById("status").addEventListener("change", function () {
  const status = this.value;
  const fields = document.getElementById("extra-fields");

  if (status === "Այո") {
    fields.style.display = "block";
  } else if (status === "Ոչ") {
    fields.style.display = "none";
    document.getElementById("rsvpForm").reset();
    document.getElementById("rsvpForm").style.display = "none";
    document.querySelector("h3").style.display = "none";
    const directionsLink = document.querySelector('a[href*="maps"]');
    if (directionsLink) directionsLink.style.display = "none";
    showPopup("Հուսով ենք կհանդիպենք հաջորդ տարի 😉😉", false);
  }
});

document.getElementById("rsvpForm").addEventListener("submit", function(e){
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  let phone = document.getElementById("phone").value.trim();
  const count = document.getElementById("count").value.trim();
  const status = document.getElementById("status").value;

  if (!name || !phone || !count || !status) {
    showPopup("Խնդրում ենք լրացնել բոլոր պարտադիր նշված դաշտերը։");
    return;
  }

  phone = phone.replace(/\D/g, "");
  if (phone.startsWith("0")) phone = "374" + phone.slice(1);
  if (phone.startsWith("3740")) phone = "374" + phone.slice(4);

  const sheetAPI = "https://sheetdb.io/api/v1/73phymm5nctlc";

  fetch(`${sheetAPI}/search?phone=${encodeURIComponent(phone)}`)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        showPopup(`Հարգելի <b>${name}</b>, ձեր հրավերն արդեն հաստատված է։ Սիրով կսպասենք ձեզ։`);
        document.getElementById("rsvpForm").reset();
        document.getElementById("rsvpForm").style.display = "none";
        document.querySelector("h3").style.display = "none";
        return;
      }

      return fetch(sheetAPI, {
        method: "POST",
        body: JSON.stringify({
          data: [{ name, phone, count, status }]
        }),
        headers: { "Content-Type": "application/json" }
      })
      .then(res => res.json())
      .then(() => {
        document.getElementById("rsvpForm").reset();
        document.getElementById("rsvpForm").style.display = "none";
        document.querySelector("h3").style.display = "none";
        showPopup(`🎉 Հարգելի <b>${name}</b>, դուք հաջողությամբ գրանցվեցիք 🎉`, true);
        generateCalendarFile();
        celebrate();
      });
    })
    .catch(() => {
      showPopup(`Հարգելի <b>${name}</b>, գրանցվելու ընթացքում առաջացել է խնդիր, խնդրում ենք փորձեք կրկին`);
    });
});

function generateCalendarFile() {
  const eventTitle = "🎂 Սոսի 5-րդ տարեդարձը 🎂";
  const eventDescription = "Սիրով հրավիրում ենք մասնակցելու Սոսի ծննդյան և մատաղի արարողությանը։";
  const eventLocation = "Կիլիկիո գարդեն";
  const startDate = new Date("2025-11-27T18:00:00+04:00");
  const endDate = new Date("2025-11-27T23:30:00+04:00");

  function formatDateToICS(date) {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  // ICS файл для iCloud
  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${eventTitle}
DESCRIPTION:${eventDescription}
LOCATION:${eventLocation}
DTSTART:${formatDateToICS(startDate)}
DTEND:${formatDateToICS(endDate)}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar" });
  document.getElementById("calendar-link").href = URL.createObjectURL(blob);

  // Google Calendar (веб-ссылка)
  const start = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const googleLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(eventLocation)}&dates=${start}/${end}`;
  const googleLinkEl = document.getElementById("google-calendar-link");

  googleLinkEl.href = googleLink;

  // ✅ Обновлённая проверка платформы
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) {
    // iOS: показываем iCloud, скрываем Google
    document.getElementById("calendar-link").style.display = "inline-block";
    googleLinkEl.style.display = "none";
  } else {
    // Android и десктоп: показываем Google, скрываем iCloud
    document.getElementById("calendar-link").style.display = "none";
    googleLinkEl.style.display = "inline-block";
  }

  // Показываем секцию кнопок
  document.getElementById("calendar-section").style.display = "flex";
}

function celebrate() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  const confetti = [];

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const shapes = ["circle", "square", "triangle", "ribbon"];
  let opacity = 1.0;

  for (let i = 0; i < 180; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 0.5 + 0.5,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltAngleIncrement: (Math.random() * 0.07) + 0.02,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 5 - 2.5,
    });
  }

  function drawConfetti(c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate((c.rotation * Math.PI) / 180);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = c.color;

    switch (c.shape) {
      case "circle": ctx.beginPath(); ctx.arc(0, 0, c.r, 0, Math.PI * 2); ctx.fill(); break;
      case "square": ctx.fillRect(-c.r / 2, -c.r / 2, c.r, c.r); break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(0, -c.r);
        ctx.lineTo(c.r, c.r);
        ctx.lineTo(-c.r, c.r);
        ctx.closePath();
        ctx.fill();
        break;
      case "ribbon":
        ctx.beginPath();
        ctx.ellipse(0, 0, c.r * 1.5, c.r / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  function updateConfetti() {
    for (const c of confetti) {
      c.y += c.d * 7;
      c.x += Math.sin(c.tiltAngle) * 2;
      c.tiltAngle += c.tiltAngleIncrement;
      c.rotation += c.rotationSpeed;
      if (c.y > canvas.height + 20) {
        c.y = -10;
        c.x = Math.random() * canvas.width;
      }
    }
  }

  let animationFrame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach(drawConfetti);
    updateConfetti();
    animationFrame = requestAnimationFrame(animate);
  }

  animate();

  setTimeout(() => {
    const fade = setInterval(() => {
      opacity -= 0.05;
      if (opacity <= 0) {
        clearInterval(fade);
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, 100);
  }, 7000);
}

window.addEventListener("beforeunload", () => {
  music.pause();
  music.currentTime = 0;
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    music.pause();
    music.currentTime = 0;
  }
});

function showPopup(message, showCalendar = false) {
  const popup = document.getElementById("popup");
  const calSection = document.getElementById("calendar-section");

  if (!showCalendar) {
    calSection.style.display = "none";
  } else {
    calSection.style.display = "flex";
  }

  document.getElementById("popup-message").innerHTML = message;
  popup.style.display = "flex";
  popup.setAttribute("aria-hidden", "false");
}

function closePopup() {
  const popup = document.getElementById("popup");
  popup.classList.add("fade-out");
  setTimeout(() => {
    popup.style.display = "none";
    popup.classList.remove("fade-out");
    popup.setAttribute("aria-hidden", "true");
  }, 500);
