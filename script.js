const pageConfig = {
  couple: { from: "CZG", to: "LFY" },
  birthday: { date: "2026-07-28", mode: "fixed" },
  playlist: [
    { title: "生日快乐", artist: "CZG 给小颖宝宝", src: "assets/music/happy-birthday.mp3" }
  ],
  giftCard: {
    unlockCode: "0226",
    cardNumber: "请在 script.js 里填写卡号",
    cardPassword: "请在 script.js 里填写卡密"
  }
};

const $ = (selector) => document.querySelector(selector);

const countdownEls = {
  days: $("#days"),
  hours: $("#hours"),
  minutes: $("#minutes"),
  seconds: $("#seconds"),
  note: $("#countdownNote")
};
const birthdayRevealMessage = $("#birthdayRevealMessage");
const gatedSections = document.querySelectorAll("[data-birthday-gated]");

const birthdayDate = new Date(`${pageConfig.birthday.date}T00:00:00+08:00`);
const birthdayEnd = new Date(`${pageConfig.birthday.date}T23:59:59+08:00`);
const localPreviewHosts = new Set(["", "localhost", "127.0.0.1", "::1"]);
const previewParams = new URLSearchParams(window.location.search);
const isPreviewMode = localPreviewHosts.has(window.location.hostname) && previewParams.get("preview") === "1";

function isBirthdayUnlocked(now = new Date()) {
  return isPreviewMode || now.getTime() >= birthdayDate.getTime();
}

function updateBirthdayGate(now = new Date()) {
  const unlocked = isBirthdayUnlocked(now);
  birthdayRevealMessage.hidden = !unlocked;
  gatedSections.forEach((section) => {
    section.hidden = !unlocked;
  });
  return unlocked;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${pad(secs)}`;
}

function updateCountdown(now = new Date()) {
  const diff = birthdayDate.getTime() - now.getTime();
  updateBirthdayGate(now);

  if (isPreviewMode) {
    countdownEls.days.textContent = "00";
    countdownEls.hours.textContent = "00";
    countdownEls.minutes.textContent = "00";
    countdownEls.seconds.textContent = "00";
    countdownEls.note.textContent = "本地预览模式：惊喜已临时解锁";
    return;
  }

  if (now <= birthdayEnd && diff <= 0) {
    countdownEls.days.textContent = "00";
    countdownEls.hours.textContent = "00";
    countdownEls.minutes.textContent = "00";
    countdownEls.seconds.textContent = "00";
    countdownEls.note.textContent = "今天就是 LFY 的生日，愿所有祝福都准时抵达";
    return;
  }

  if (diff < 0) {
    countdownEls.days.textContent = "00";
    countdownEls.hours.textContent = "00";
    countdownEls.minutes.textContent = "00";
    countdownEls.seconds.textContent = "00";
    countdownEls.note.textContent = "这份生日惊喜已经送达，祝 LFY 新一岁闪闪发光";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownEls.days.textContent = pad(days);
  countdownEls.hours.textContent = pad(hours);
  countdownEls.minutes.textContent = pad(minutes);
  countdownEls.seconds.textContent = pad(seconds);
  countdownEls.note.textContent = `距离 ${pageConfig.birthday.date} 还有`;
}

updateCountdown();
setInterval(updateCountdown, 1000);

const toast = $("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

const giftButton = $("#revealGiftCard");
const giftForm = $("#giftCodeForm");
const giftInput = $("#giftCodeInput");
const giftSecret = $("#giftCardSecret");
const giftCardNumber = $("#giftCardNumber");
const giftCardPassword = $("#giftCardPassword");

giftButton.addEventListener("click", () => {
  giftButton.hidden = true;
  giftForm.hidden = false;
  giftInput.focus();
});

giftForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (giftInput.value.trim() !== pageConfig.giftCard.unlockCode) {
    showToast("数字不对哦，再想想");
    giftInput.select();
    return;
  }

  giftCardNumber.textContent = pageConfig.giftCard.cardNumber;
  giftCardPassword.textContent = pageConfig.giftCard.cardPassword;
  giftForm.hidden = true;
  giftSecret.hidden = false;
  showToast("小礼物已打开");
});

function createHeart(x, y) {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = "♥";
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  document.body.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove());
}

document.addEventListener("click", (event) => {
  if (event.target.closest("button, input")) return;
  createHeart(event.clientX, event.clientY);
});

$("#openSurprise").addEventListener("click", () => {
  if (!isBirthdayUnlocked()) {
    showToast("还不到时间哦");
    return;
  }

  updateBirthdayGate();
  document.body.classList.add("surprise-opened");
  showToast("亲爱的小颖宝宝生日快乐！今晚的星星都在为你闪烁！");
  playCurrentTrack();
  startFireworksShow();
  $("#letterSection").scrollIntoView({ behavior: "smooth", block: "start" });
});

const audio = $("#audio");
let currentTrackIndex = 0;

function currentTrack() {
  return pageConfig.playlist[currentTrackIndex] || pageConfig.playlist[0];
}

function hasPlayableTrack(track = currentTrack()) {
  return Boolean(track && track.src && track.src.trim());
}

function loadTrack(index) {
  currentTrackIndex = (index + pageConfig.playlist.length) % pageConfig.playlist.length;
  const track = currentTrack();
  audio.src = hasPlayableTrack(track) ? track.src : "";
}

async function playCurrentTrack() {
  if (!isBirthdayUnlocked()) {
    showToast("还不到时间哦");
    return;
  }

  const track = currentTrack();
  if (!hasPlayableTrack(track)) {
    showToast("先把歌曲放进 assets/music/，再更新 playlist 里的 src。");
    return;
  }

  try {
    await audio.play();
  } catch (error) {
    showToast("浏览器没有开始播放，请再点一次打开惊喜。");
  }
}

audio.addEventListener("error", () => {
  audio.pause();
  showToast("生日歌暂时无法播放，请检查文件路径或文件格式。");
});

audio.volume = 0.72;
audio.loop = true;
loadTrack(0);

const skyCanvas = $("#skyCanvas");
const skyCtx = skyCanvas.getContext("2d");
const burstCanvas = $("#burstCanvas");
const burstCtx = burstCanvas.getContext("2d");
let stars = [];
let particles = [];
let sparklerParticles = [];
let sparklerSticks = [];
let width = 0;
let height = 0;
let animationFrame;
let fireworksTimer;
let sparklerTimer;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;

  [skyCanvas, burstCanvas].forEach((canvas) => {
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  });

  skyCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  burstCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(210, Math.floor(width * height / 4800));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.75 + 0.55,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.02 + 0.008
  }));
}

function launchBurst(x, y, amount = 26) {
  for (let i = 0; i < amount; i += 1) {
    const angle = (Math.PI * 2 * i) / amount + Math.random() * 0.24;
    const speed = Math.random() * 4 + 2.2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 58 + Math.random() * 18,
      maxLife: 76,
      size: Math.random() * 2.5 + 1.2,
      color: Math.random() > 0.5 ? [255, 127, 176] : [244, 201, 107]
    });
  }
}

function launchRandomFirework() {
  const x = width * (0.16 + Math.random() * 0.68);
  const y = height * (0.12 + Math.random() * 0.36);
  launchBurst(x, y, 34 + Math.floor(Math.random() * 18));
}

function launchSparkler(x, y, direction = 1) {
  sparklerSticks.push({ x, y, direction, life: 42, maxLife: 42 });

  for (let i = 0; i < 54; i += 1) {
    sparklerParticles.push({
      x,
      y,
      vx: direction * (Math.random() * 2.4 + 0.25) + (Math.random() - 0.5) * 1.2,
      vy: -Math.random() * 5.2 - 1.3,
      life: 34 + Math.random() * 28,
      maxLife: 62,
      size: Math.random() * 1.6 + 0.6,
      tail: Math.random() * 8 + 5,
      color: Math.random() > 0.2 ? [255, 214, 112] : [255, 248, 224]
    });
  }
}

function launchRandomSparkler() {
  const onLeft = Math.random() > 0.5;
  const x = width * (onLeft ? 0.09 + Math.random() * 0.13 : 0.78 + Math.random() * 0.13);
  const y = height * (0.68 + Math.random() * 0.2);
  launchSparkler(x, y, onLeft ? 1 : -1);
}

function startFireworksShow() {
  if (fireworksTimer) return;

  launchBurst(width / 2, height * 0.34, 54);
  launchRandomSparkler();
  setTimeout(launchRandomFirework, 380);
  setTimeout(launchRandomSparkler, 560);
  setTimeout(launchRandomFirework, 760);

  fireworksTimer = setInterval(launchRandomFirework, 1350);
  sparklerTimer = setInterval(launchRandomSparkler, 620);
}

function drawSky() {
  skyCtx.clearRect(0, 0, width, height);
  stars.forEach((star) => {
    star.phase += star.speed;
    const alpha = 0.58 + Math.sin(star.phase) * 0.34;
    skyCtx.shadowColor = "rgba(255, 248, 242, 0.9)";
    skyCtx.shadowBlur = 8;
    skyCtx.beginPath();
    skyCtx.fillStyle = `rgba(255, 248, 242, ${alpha})`;
    skyCtx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    skyCtx.fill();
  });
  skyCtx.shadowBlur = 0;
}

function drawParticles() {
  burstCtx.clearRect(0, 0, width, height);
  particles = particles.filter((particle) => particle.life > 0);
  sparklerParticles = sparklerParticles.filter((particle) => particle.life > 0);
  sparklerSticks = sparklerSticks.filter((stick) => stick.life > 0);

  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.035;
    particle.vx *= 0.985;
    particle.life -= 1;

    const alpha = Math.max(particle.life / particle.maxLife, 0);
    const [red, green, blue] = particle.color;
    burstCtx.beginPath();
    burstCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    burstCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    burstCtx.fill();
  });

  sparklerSticks.forEach((stick) => {
    stick.life -= 1;
    const alpha = Math.max(stick.life / stick.maxLife, 0);
    burstCtx.save();
    burstCtx.globalAlpha = alpha;
    burstCtx.lineWidth = 2;
    burstCtx.strokeStyle = "rgba(255, 231, 172, 0.75)";
    burstCtx.shadowColor = "rgba(244, 201, 107, 0.8)";
    burstCtx.shadowBlur = 18;
    burstCtx.beginPath();
    burstCtx.moveTo(stick.x, stick.y);
    burstCtx.lineTo(stick.x - stick.direction * 22, stick.y + 70);
    burstCtx.stroke();
    burstCtx.restore();
  });

  sparklerParticles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.13;
    particle.vx *= 0.975;
    particle.life -= 1;

    const alpha = Math.max(particle.life / particle.maxLife, 0);
    const [red, green, blue] = particle.color;
    burstCtx.beginPath();
    burstCtx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    burstCtx.lineWidth = particle.size;
    burstCtx.moveTo(particle.x, particle.y);
    burstCtx.lineTo(particle.x - particle.vx * particle.tail, particle.y - particle.vy * particle.tail);
    burstCtx.stroke();
  });
}

function animate() {
  drawSky();
  drawParticles();
  animationFrame = requestAnimationFrame(animate);
}

resizeCanvas();
animate();
window.addEventListener("resize", resizeCanvas);
window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(animationFrame);
  clearInterval(fireworksTimer);
  clearInterval(sparklerTimer);
});
