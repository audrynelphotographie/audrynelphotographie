/* ============================================================
   CONSTANTS
   ============================================================ */
const isAvailable = true;
const APK_URL = "https://www.mediafire.com/file/jpjjmx1kz5rlmv4/Audrynelphotographie.apk/file";
const CALENDAR_URL = "https://calendar.google.com/calendar/htmlembed?src=audrymukamurakoze@gmail.com&ctz=Africa/Bujumbura";

let currentClient = null;
let currentPhotos  = [];

/* ============================================================
   TRANSLATIONS
   ============================================================ */
const translations = {
  en: { avail:"Available", notAvail:"Not Available", apkBtn:"DOWNLOAD OUR APP" },
  fr: { avail:"Disponible",    notAvail:"No Disponible", apkBtn:"TÉLÉCHARGER L'APP" },
  rn: { avail:"Kumurongo",    notAvail:"Sindikumurongo", apkBtn:"TELECHARGA APPLICATION" },
  
};

/* ============================================================
   PAGE NAVIGATION
   ============================================================ */
function showPage(page) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('tab-' + page).classList.add('active');
  window.scrollTo(0,0);
}

/* ============================================================
   LOGO ANIMATION
   ============================================================ */
let isWelcome = false;
function animateLogo() {
  const logo = document.getElementById('mainLogo');
  const lang = document.getElementById('langSwitcher').value;
  logo.style.opacity = "0";
  setTimeout(() => {
    logo.innerText = isWelcome ? "Audry Nel" : (translations[lang]?.welcome || "Welcome");
    logo.style.opacity = "1";
    isWelcome = !isWelcome;
  }, 800);
}
setInterval(animateLogo, 4000);

/* ============================================================
   LANGUAGE SWITCHER
   ============================================================ */
function switchLanguage() {
  const lang = document.getElementById('langSwitcher').value;
  const t = translations[lang];
  if (document.getElementById('apkBtnHome')) document.getElementById('apkBtnHome').innerText = t.apkBtn;
  updateStatusUI();
}

/* ============================================================
   STATUS BOX
   ============================================================ */
function updateStatusUI() {
  const lang = document.getElementById('langSwitcher').value;
  const t = translations[lang];
  const statusLabel = document.getElementById('statusLabel');
  const dot = document.getElementById('dotIndicator');
  if (isAvailable) {
    statusLabel.innerText = t.avail;
    dot.style.background = "#25d366";
    dot.style.boxShadow = "0 0 8px #25d366";
  } else {
    statusLabel.innerText = t.notAvail;
    dot.style.background = "#ff4d4d";
    dot.style.boxShadow = "0 0 8px #ff4d4d";
  }
}

/* ============================================================
   CALENDAR
   ============================================================ */
function toggleCalendar() {
  const overlay = document.getElementById('calendar-overlay');
  const frame   = document.getElementById('googleCal');
  if (overlay.style.display === 'block') {
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
  } else {
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    frame.src = CALENDAR_URL;
  }
}

/* ============================================================
   LOADING BUTTON
   ============================================================ */
function startLoading(btn) {
  btn.classList.add('btn-loading');
  if (btn.tagName === 'A') setTimeout(() => btn.classList.remove('btn-loading'), 3000);
}

function loadDashboard(client, isRefresh = false) {
  const firstName = client.name.split(' ')[0];
  const mainNav = document.querySelector('nav');
  if (mainNav) mainNav.style.display = 'none';

  // ── Kugenzura expiry ──────────────────────────────────────
  const now      = new Date();
  const exp      = client.expiry ? new Date(client.expiry) : null;
  const diffDays = exp ? Math.ceil((exp - now) / 86400000) : 9999;

  // Niba abonnement yarangiye → ntamanura, areba gusa
  const isExpired    = exp && diffDays <= 0;
  const isSoonExpire = exp && diffDays > 0 && diffDays <= 2;

  // canDownload: Premium + ntarangiye
  const isPremium    = client.plan.toLowerCase() !== 'free';
  const canDownload  = isPremium && !isExpired;

  // ── Format itariki neza (ex: "15 Juil 2026") ─────────────
  function formatDate(d) {
    const months = ['Jan','Fév','Mar','Avr','Mai','Jui','Jul','Aoû','Sep','Oct','Nov','Déc'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  // ── Badges ────────────────────────────────────────────────
  const badgeContainer = document.getElementById('status-badge-container');
  let html = '';

  if (isExpired) {
    // ❌ Abonnement yarangiye — imuhamagarira kugura
    html = `
      <div class="abonnement-expired-box">
        <div class="aeb-icon">🔒</div>
        <div class="aeb-body">
          <div class="aeb-title">Abonnement Yawe yarangiye</div>
          <div class="aeb-sub">Amafoto ntushobora kuyatelecharja.<br>Gura abonnrment kugira ngo ugire access yuzuye.</div>
          <button class="aeb-btn" onclick="showPage('galerie')">🛒 Gura Abonnement Nshya</button>
        </div>
      </div>`;
  } else if (isSoonExpire) {
    // ⚠️ Irangira mu masaha make — glow orange
    const label = diffDays === 1 ? '1 JOUR' : `${diffDays} JOURS`;
    html = `
      <div class="abonnement-soon-box" onclick="showPage('galerie')">
        <span class="expire-dot"></span>
        <span>⚠️ Abonnement irangira dans <strong>${label}</strong> — <u>Subira ubwishyu</u></span>
      </div>`;
    if (isPremium) {
      html += `<br><span class="premium-badge">✨ PREMIUM ACTIVE · Expire le ${formatDate(exp)}</span>`;
    }
  } else if (isPremium && exp) {
    // ✅ Premium + itariki izohera igaragara
    html = `<span class="premium-badge">✨ PREMIUM ACTIVE · Expire le ${formatDate(exp)}</span>`;
  } else if (isPremium) {
    html = `<span class="premium-badge">✨ PREMIUM DOWNLOAD ACTIVE</span>`;
  } else {
    // Free plan
    html = `<span class="expired-badge" onclick="showPage('galerie')">⚠️ FREE PLAN — DOWNLOAD LOCKED</span>`;
  }

  badgeContainer.innerHTML = html;

  // ── Avatar ────────────────────────────────────────────────
  const avatarBox = document.getElementById('dash-avatar');
  if (avatarBox) {
    avatarBox.innerHTML = `<img src="https://i.ibb.co/9HRHHgxQ/logo1.jpg" alt="Logo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  }

  const welcomeFirst = document.getElementById('welcome-first');
  if (welcomeFirst) welcomeFirst.textContent = firstName;

  const codeBadge = document.getElementById('client-code-badge');
  if (codeBadge) codeBadge.textContent = 'Code : ' + client.code;

  // ── Grid ya amafoto ───────────────────────────────────────
  currentPhotos = client.photos.map((url, i) => ({ url, title: `Photo_${i + 1}` }));
  const grid = document.getElementById('t-photo-grid');
  if (grid) {
    grid.innerHTML = '';
    client.photos.forEach((photoUrl, i) => {
      const div = document.createElement('div');
      div.className = 't-photo-item';
      const photoTitle = `Photo_${i + 1}`;

      // Iyo yarangiye: areba gusa ariko ntamanura
      // Iyo expired: voir isubizwa kuri modal ya block, download nayo
      const viewAction     = isExpired ? `showExpiredModal()` : `openModal(${i})`;
      
      // AHAKURIKIRA HAHINDUTSE: Uhita uhamagara doSingleDownload directly hatabaye popup ya Ask
      const downloadAction = canDownload
        ? `doSingleDownload('${photoUrl}','${photoTitle}')`
        : `showExpiredModal()`;
        
      const downloadLabel  = canDownload ? '↓ DL' : '🔒';
      const dlBg    = canDownload ? '#c4965a' : isExpired ? 'rgba(120,30,30,0.9)' : 'rgba(60,40,40,0.9)';
      const dlColor = canDownload ? '#0d0b0b' : '#cc6666';

      div.innerHTML = `
        <div class="photo-skeleton">
          <div class="camera-loader">
            <div class="cam-body">
              <div class="cam-lens">
                <div class="cam-lens-inner"></div>
              </div>
              <div class="cam-flash"></div>
            </div>
            <div class="cam-shutter"></div>
          </div>
        </div>
        <img class="lazy-img" data-src="${photoUrl}" alt="${photoTitle}">
        ${canDownload ? `<input type="checkbox" class="photo-checkbox" value="${photoUrl}" data-title="${photoTitle}" onchange="updateSelection()" style="position:absolute;top:5px;left:5px;z-index:10;width:14px;height:14px;accent-color:#c4965a;">` : ''}
        <div class="t-photo-overlay">
          <button class="t-photo-btn view-btn" onclick="${viewAction}">👁 Voir</button>
          <button class="t-photo-btn" onclick="${downloadAction}" style="background:${dlBg};color:${dlColor};">
            ${downloadLabel}
          </button>
        </div>`;
      grid.appendChild(div);
    });
  }

  // ── Lazy loading na IntersectionObserver ─────────────────
  const lazyImgs = grid.querySelectorAll('.lazy-img');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const skeleton = img.previousElementSibling;
      img.src = img.dataset.src;
      img.onload = () => {
        img.classList.add('loaded');
        if (skeleton && skeleton.classList.contains('photo-skeleton')) {
          skeleton.style.opacity = '0';
          setTimeout(() => skeleton.remove(), 350);
        }
      };
      img.onerror = () => {
        if (skeleton && skeleton.classList.contains('photo-skeleton')) {
          skeleton.style.opacity = '0';
          setTimeout(() => skeleton.remove(), 350);
        }
      };
      obs.unobserve(img);
    });
  }, { rootMargin: '80px', threshold: 0.05 });

  lazyImgs.forEach(img => observer.observe(img));

  document.getElementById('login-view').style.display = 'none';
  document.getElementById('dashboard-view').style.display = 'block';
  if (!isRefresh) window.scrollTo(0, 0);
}
/* ============================================================
   T.HTML LOGIN LOGIC
   ============================================================ */
function doLogin() {
  const nameInput = document.getElementById('input-name');
  const codeInput = document.getElementById('input-code');
  const name = nameInput.value.trim().toLowerCase();
  const code = codeInput.value.trim();
  const err  = document.getElementById('error-msg');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  const loginBtn = document.getElementById('loginBtn');

  err.style.display = 'none';

  if (!name || !code) {
    err.textContent = 'Veuillez remplir tous les champs.';
    err.style.display = 'block'; 
    return;
  }

  // 1. Tangira Animation ya Loading
  loginBtn.disabled = true; 
  btnText.textContent = "Checking...";
  btnLoader.style.display = "inline-block";
  loginBtn.style.opacity = "0.8";

  // 2. Tegereza amasegonda abiri (2000ms)
  setTimeout(() => {
    const db = typeof CLIENTS !== 'undefined' ? CLIENTS : [];
    const found = db.find(c =>
      c.name.trim().toLowerCase() === name &&
      c.code.trim() === code.trim()
    );

    if (!found) {
      err.textContent = 'Nom ou code incorrect. Veuillez réessayer.';
      err.style.display = 'block';
      btnText.textContent = "ACCÉDER À MES PHOTOS";
      btnLoader.style.display = "none";
      loginBtn.disabled = false;
      loginBtn.style.opacity = "1";
      return;
    }

    // Niba byakunze, injira muri Dashboard
    currentClient = found;
    loadDashboard(found);
    
    // Garura buto ku miterere isanzwe
    btnText.textContent = "ACCÉDER À MES PHOTOS";
    btnLoader.style.display = "none";
    loginBtn.disabled = false;
    loginBtn.style.opacity = "1";
    
  }, 2000); 
}


function doLogout() {
  currentClient = null;

  // 3. Garura Header nyamukuru (nav) iyo umukiriya asohotse
  const mainNav = document.querySelector('nav');
  if (mainNav) mainNav.style.display = 'flex';

  document.getElementById('login-view').style.display     = 'flex';
  document.getElementById('dashboard-view').style.display = 'none';
  document.getElementById('input-name').value = '';
  document.getElementById('input-code').value = '';
  document.getElementById('error-msg').style.display = 'none';
  window.scrollTo(0,0);
}

/* ============================================================
   SELECTION & DOWNLOAD
   ============================================================ */
function updateSelection() {
  const selected = document.querySelectorAll('.photo-checkbox:checked');
  const statBox  = document.getElementById('stat-selected');
  document.getElementById('selected-count').textContent = selected.length;
  statBox.style.display = selected.length > 0 ? 'block' : 'none';
}

function updateCircleLoader(percent, msg) {
  const container = document.getElementById('circle-loader-container');
  const circle    = document.getElementById('progress-circle');
  const text      = document.getElementById('percent-text');
  const msgLabel  = document.getElementById('loader-msg');
  container.style.display = 'flex';
  msgLabel.textContent = msg || "Téléchargement...";
  circle.style.strokeDashoffset = 283 - (percent / 100) * 283;
  text.textContent = Math.round(percent) + "%";
  if (percent >= 100) {
    text.textContent = "Done";
    msgLabel.textContent = "Terminé !";
    setTimeout(() => { container.style.display = 'none'; circle.style.strokeDashoffset = 283; }, 1500);
  }
}

/* ============================================================
   SELECTION & DOWNLOAD (WITH PREMIUM LOCK)
   ============================================================ */

/* ============================================================
   EXPIRED BLOCK MODAL
   ============================================================ */
function showExpiredModal() {
  document.getElementById('expired-block-modal').style.display = 'flex';
}
function closeExpiredModal() {
  document.getElementById('expired-block-modal').style.display = 'none';
}

/* ============================================================
   PHOTO CONFIRM MODAL (Yes / No)
   ============================================================ */
let _pendingDLUrl   = null;
let _pendingDLTitle = null;

function askDownload(url, title) {
  // Niba expired → block
  if (!canClientDownload()) { showExpiredModal(); return; }

  _pendingDLUrl   = url;
  _pendingDLTitle = title;

  // Shyira ifoto muri preview ya modal
  const prev = document.getElementById('dl-confirm-preview');
  if (prev) prev.src = url;
  const nm = document.getElementById('dl-confirm-name');
  if (nm) nm.textContent = title;

  document.getElementById('dl-confirm-modal').style.display = 'flex';
}

function confirmDownloadYes() {
  document.getElementById('dl-confirm-modal').style.display = 'none';
  if (_pendingDLUrl) doSingleDownload(_pendingDLUrl, _pendingDLTitle);
}

function confirmDownloadNo() {
  document.getElementById('dl-confirm-modal').style.display = 'none';
  _pendingDLUrl = _pendingDLTitle = null;
}

/* ── helper: reba niba ashobora kumanura ── */
function canClientDownload() {
  if (!currentClient) return false;
  if (currentClient.plan.toLowerCase() === 'free') return false;
  if (currentClient.expiry) {
    const diffDays = Math.ceil((new Date(currentClient.expiry) - new Date()) / 86400000);
    if (diffDays <= 0) return false;
  }
  return true;
}

/* ── Download umwe + progress 0→100 ── */
async function doSingleDownload(url, title) {
  // Progress igaragara vuba
  showSingleProgress(title);

  try {
    const res  = await fetch(url);
    const blob = await res.blob();

    // Animate 0 → 100%
    await animateSingleProgress(0, 100, 600);

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = title.replace(/\s/g, '_') + '.jpg';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch {
    // AHAKURIKIRA HAHINDUTSE: Igihe fetch igize ikibazo, ukoresha invisible link mu kureba ko yijana mwi fone directement aho gufungura tab nshya ya window.open
    const a = document.createElement('a');
    a.href = url;
    a.download = title.replace(/\s/g, '_') + '.jpg';
    a.target = '_self'; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    setTimeout(hideSingleProgress, 1200);
  }
}

function showSingleProgress(title) {
  let el = document.getElementById('single-dl-progress');
  if (!el) {
    el = document.createElement('div');
    el.id = 'single-dl-progress';
    document.body.appendChild(el);
  }
  el.innerHTML = `
    <div class="sdl-inner">
      <div class="sdl-title">📥 ${title}</div>
      <div class="sdl-bar-wrap"><div class="sdl-bar" id="sdl-bar"></div></div>
      <div class="sdl-pct" id="sdl-pct">0%</div>
    </div>`;
  el.style.display = 'flex';
}

function hideSingleProgress() {
  const el = document.getElementById('single-dl-progress');
  if (el) el.style.display = 'none';
}

async function animateSingleProgress(from, to, ms) {
  const bar = document.getElementById('sdl-bar');
  const pct = document.getElementById('sdl-pct');
  const steps = 40;
  const inc   = (to - from) / steps;
  const delay = ms / steps;
  let cur = from;
  for (let i = 0; i <= steps; i++) {
    cur = Math.min(to, from + inc * i);
    if (bar) bar.style.width = cur + '%';
    if (pct) pct.textContent  = Math.round(cur) + '%';
    await new Promise(r => setTimeout(r, delay));
  }
}

/* ── triggerDownload (gardé pour compatibilité) ── */
async function triggerDownload(url, title) {
  if (!canClientDownload()) { showExpiredModal(); return; }
  await doSingleDownload(url, title);
}

async function downloadAll() {
  if (!currentClient) return;

  if (!canClientDownload()) {
    showExpiredModal();
    return;
  }

  const photos = currentClient.photos;
  const total = photos.length;
  if (!confirm(`Télécharger les ${total} photos en ZIP ?`)) return;

  // Koresha JSZip niba itararangiye guterwa
  if (typeof JSZip === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    document.head.appendChild(s);
    await new Promise(res => { s.onload = res; });
  }

  const zip = new JSZip();
  const folder = zip.folder('AudryNel_Photos');

  for (let i = 0; i < total; i++) {
    updateCircleLoader(((i + 1) / total) * 80, `Préparation ${i + 1}/${total}...`);
    try {
      const res = await fetch(photos[i]);
      const blob = await res.blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      folder.file(`Photo_${String(i + 1).padStart(3, '0')}.${ext}`, blob);
    } catch (e) {
      console.warn('Skip photo', i, e);
    }
    await new Promise(r => setTimeout(r, 100));
  }

  updateCircleLoader(90, 'Compression ZIP...');
  const content = await zip.generateAsync({ type: 'blob' }, (meta) => {
    updateCircleLoader(90 + meta.percent * 0.1, 'Compression ZIP...');
  });

  updateCircleLoader(100, 'Téléchargement...');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = `AudryNel_${currentClient.name.replace(/\s/g,'_')}_Photos.zip`;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
}

async function downloadSelected() {
  if (!currentClient) return;

  if (!canClientDownload()) {
    showExpiredModal();
    return;
  }

  const selected = document.querySelectorAll('.photo-checkbox:checked');
  const total = selected.length;
  if (total === 0) return;
  
  for (let i = 0; i < total; i++) {
    updateCircleLoader(((i+1)/total)*100, `Sélection ${i+1}/${total}`);
    const cb = selected[i];
    await triggerDownload(cb.value, cb.getAttribute('data-title'));
    await new Promise(r => setTimeout(r, 800));
  }
}
function goBackToClientDash() {
    const savedClient = localStorage.getItem('currentClient');
    if (savedClient) {
        // Niba yinjiye, musubize kuri Dashboard view
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('dashboard-view').style.display = 'block';
        showPage('home'); // Cyangwa izina rya page nini (Login/Home)
    } else {
        // Niba atari yinjiye, musubize kuri Login isanzwe
        showPage('home');
    }
    window.scrollTo(0,0);
}

/* ============================================================
   T.HTML PHOTO MODAL
   ============================================================ */
function openModal(i) {
  const photo = currentPhotos[i];
  document.getElementById('t-modal-img').src     = photo.url;
  document.getElementById('t-modal-title').textContent = photo.title;
  
  // AHAKURIKIRA HAHINDUTSE: Buto yo kuri Modal nayo ihita ihamagara doSingleDownload direct ngo ifoto itangire kumanuka muri background
  document.getElementById('t-modal-dl-btn').onclick = function(e) {
    e.preventDefault();
    doSingleDownload(photo.url, photo.title);
  };
  
  document.getElementById('t-modal').classList.add('open');
}
function closeModal() { document.getElementById('t-modal').classList.remove('open'); }

/* ============================================================
   CONTACT MODAL (TARIF)
   ============================================================ */
function openContactModal() { document.getElementById('contactModal').style.display = 'flex'; }
function closeContactModal() { document.getElementById('contactModal').style.display = 'none'; }

/* ============================================================
   PAY MODAL (PAYMENT)
   ============================================================ */
function openPayModal(plan, price) {
  document.getElementById('payModal').style.display = 'flex';
  document.getElementById('planName').innerText = "Plan: " + plan;
  document.getElementById('planPrice').innerText = "Igiciro: " + price;
}
function closePayModal() { document.getElementById('payModal').style.display = 'none'; }

/* ============================================================
   GLOBAL CLICK CLOSES MODALS
   ============================================================ */
window.addEventListener('click', function(e) {
  if (e.target === document.getElementById('contactModal')) closeContactModal();
  if (e.target === document.getElementById('payModal')) closePayModal();
  if (e.target === document.getElementById('t-modal')) closeModal();
});

/* ============================================================
   NOTIFICATION
   ============================================================ */
function showNotif(msg) {
  const n = document.getElementById('notif');
  n.textContent = msg; n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3000);
}

/* ============================================================
   LIGHTBOX (for non-dashboard use)
   ============================================================ */
function openLightbox(img) {
  document.getElementById('lightbox-img').src = img.src;
  document.getElementById('lightbox').style.display = 'flex';
}

/* ============================================================
   INIT
   ============================================================ */
window.onload = function() {
  switchLanguage();
};
