// ─── AdEarn Core ──────────────────────────────────────────────
const WHATSAPP_NUMBER = '919999999999'; // ← Change to your number
const WITHDRAW_THRESHOLD = 100;
const AD_WATCH_DURATION = 5; // seconds

const Storage = {
  get: k => localStorage.getItem(k),
  set: (k, v) => localStorage.setItem(k, v),
  getNum: k => parseInt(localStorage.getItem(k)) || 0,
};

// ─── User ID ──────────────────────────────────────────────────
function initUser() {
  let uid = Storage.get('adearn_uid');
  if (!uid) {
    uid = 'USER-' + Math.floor(100000 + Math.random() * 900000);
    Storage.set('adearn_uid', uid);
  }
  return uid;
}

// ─── Points ───────────────────────────────────────────────────
function getPoints() { return Storage.getNum('adearn_points'); }
function addPoints(n) {
  const p = getPoints() + n;
  Storage.set('adearn_points', p);
  return p;
}

// ─── Daily Bonus ──────────────────────────────────────────────
function checkDailyBonus() {
  const today = new Date().toDateString();
  return Storage.get('adearn_bonus_date') === today;
}
function claimDailyBonus() {
  Storage.set('adearn_bonus_date', new Date().toDateString());
  return addPoints(20);
}

// ─── Stats ────────────────────────────────────────────────────
function getAdsWatched() { return Storage.getNum('adearn_ads'); }
function incAdsWatched() { Storage.set('adearn_ads', getAdsWatched() + 1); }

// ─── UI Updates ───────────────────────────────────────────────
function animateCount(el, from, to, duration) {
  const start = performance.now();
  el.classList.remove('points-bounce');
  void el.offsetWidth;
  el.classList.add('points-bounce');
  const step = ts => {
    const p = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * ease);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function updateProgress(points) {
  const next = Math.ceil(points / WITHDRAW_THRESHOLD) * WITHDRAW_THRESHOLD || WITHDRAW_THRESHOLD;
  const pct = Math.min((points % WITHDRAW_THRESHOLD) / WITHDRAW_THRESHOLD * 100, 100);
  const fill = document.getElementById('progressFill');
  const pctEl = document.getElementById('progressPct');
  const nextEl = document.getElementById('progressNext');
  if (fill) fill.style.width = pct + '%';
  if (pctEl) pctEl.textContent = Math.round(pct) + '%';
  if (nextEl) nextEl.textContent = next;
}

function refreshDashboard() {
  const uid = initUser();
  const pts = getPoints();
  const ads = getAdsWatched();

  const elUid = document.getElementById('userId');
  const elPts = document.getElementById('totalPoints');
  const elAds = document.getElementById('adsWatched');
  const elUidBar = document.getElementById('userIdBar');

  if (elUid) elUid.textContent = uid;
  if (elUidBar) elUidBar.textContent = uid;
  if (elPts) elPts.textContent = pts;
  if (elAds) elAds.textContent = ads;

  updateProgress(pts);

  const bonusBtn = document.getElementById('bonusBtn');
  if (bonusBtn) {
    const claimed = checkDailyBonus();
    bonusBtn.disabled = claimed;
    bonusBtn.querySelector('.btn-text').textContent = claimed
      ? '✓ Daily Bonus Claimed' : '🎁 Daily Bonus +20 pts';
  }
}

// ─── Toast ────────────────────────────────────────────────────
let toastTimeout;
function showToast(msg, icon = '✨') {
  let t = document.getElementById('toast');
  if (!t) return;
  clearTimeout(toastTimeout);
  t.querySelector('.toast-icon').textContent = icon;
  t.querySelector('.toast-msg').textContent = msg;
  t.classList.add('show');
  toastTimeout = setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── Confetti ─────────────────────────────────────────────────
function launchConfetti() {
  const colors = ['#00f5ff','#7c3aed','#f59e0b','#22c55e','#f43f5e','#ffffff'];
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      c.className = 'confetti-piece';
      c.style.cssText = `
        left:${Math.random()*100}vw;
        top:${Math.random()*20}vh;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        width:${6+Math.random()*8}px;
        height:${6+Math.random()*8}px;
        border-radius:${Math.random()>0.5?'50%':'2px'};
        animation-duration:${1.5+Math.random()*1.5}s;
        animation-delay:${Math.random()*0.3}s;
      `;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3000);
    }, i * 25);
  }
}

// ─── Ad Modal ─────────────────────────────────────────────────
let adTimerInterval;

function openAdModal() {
  const overlay = document.getElementById('adOverlay');
  const timerFill = document.getElementById('timerFill');
  const timerNum = document.getElementById('timerNum');
  const watchBtn = document.getElementById('watchBtn');
  if (!overlay) return;

  overlay.classList.add('active');
  watchBtn.classList.add('loading');
  watchBtn.querySelector('.btn-text').textContent = 'Watching Ad...';

  let t = AD_WATCH_DURATION;
  const circumference = 188.5;
  timerNum.textContent = t;
  timerFill.style.strokeDashoffset = circumference;

  clearInterval(adTimerInterval);
  adTimerInterval = setInterval(() => {
    t--;
    timerNum.textContent = t;
    const offset = circumference * (t / AD_WATCH_DURATION);
    timerFill.style.strokeDashoffset = offset;

    if (t <= 0) {
      clearInterval(adTimerInterval);
      overlay.classList.remove('active');
      watchBtn.classList.remove('loading');
      watchBtn.querySelector('.btn-text').textContent = '▶ Watch Ad  +10 Points';

      const prev = getPoints();
      incAdsWatched();
      const newPts = addPoints(10);

      const elPts = document.getElementById('totalPoints');
      if (elPts) animateCount(elPts, prev, newPts, 600);
      updateProgress(newPts);

      launchConfetti();
      showToast('+10 Points Earned! Keep watching!', '💰');
    }
  }, 1000);
}

function closeAdModal() {
  clearInterval(adTimerInterval);
  const overlay = document.getElementById('adOverlay');
  const watchBtn = document.getElementById('watchBtn');
  if (overlay) overlay.classList.remove('active');
  if (watchBtn) {
    watchBtn.classList.remove('loading');
    watchBtn.querySelector('.btn-text').textContent = '▶ Watch Ad  +10 Points';
  }
}

// ─── Daily Bonus Action ───────────────────────────────────────
function handleDailyBonus() {
  if (checkDailyBonus()) return;
  const prev = getPoints();
  const newPts = claimDailyBonus();
  const elPts = document.getElementById('totalPoints');
  if (elPts) animateCount(elPts, prev, newPts, 800);
  updateProgress(newPts);
  refreshDashboard();
  launchConfetti();
  showToast('+20 Daily Bonus! Come back tomorrow!', '🎁');
}

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  refreshDashboard();

  const watchBtn = document.getElementById('watchBtn');
  if (watchBtn) watchBtn.addEventListener('click', openAdModal);

  const bonusBtn = document.getElementById('bonusBtn');
  if (bonusBtn) bonusBtn.addEventListener('click', handleDailyBonus);

  const closeBtn = document.getElementById('closeAdModal');
  if (closeBtn) closeBtn.addEventListener('click', closeAdModal);

  // Withdraw page
  const withdrawBtn = document.getElementById('withdrawBtn');
  if (withdrawBtn) {
    withdrawBtn.addEventListener('click', () => {
      const uid = initUser();
      const pts = getPoints();
      const msg = encodeURIComponent(
        `Hello,\n\nWithdrawal Request\n\nUser ID : ${uid}\nPoints : ${pts}\n\nI have completed genuine ad watching.\nPlease process my withdrawal request.\nI will attach the withdrawal page screenshot.`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    });
  }

  // Withdraw page user info
  const wUid = document.getElementById('wUserId');
  const wPts = document.getElementById('wPoints');
  if (wUid) wUid.textContent = initUser();
  if (wPts) wPts.textContent = getPoints();
});
