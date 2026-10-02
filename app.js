// The English Tribe - app logic

let currentLang = localStorage.getItem('et-lang') || 'en';
let currentTweaks = { ...TWEAKS };

function applyTranslations(lang) {
  const t = window.TRANSLATIONS[lang];
  if (!t) return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      el.innerHTML = t[key];
    }
  });
  // Update html lang
  document.documentElement.lang = lang;

  // Update both lang switcher buttons and tweaks lang buttons
  document.querySelectorAll('.lang-switch button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  document.querySelectorAll('[data-tweak="language"] .tweak-opt').forEach(b => {
    b.classList.toggle('active', b.dataset.val === lang);
  });

  currentLang = lang;
  localStorage.setItem('et-lang', lang);
}

// Wire up language switcher
document.querySelectorAll('.lang-switch button').forEach(btn => {
  btn.addEventListener('click', () => {
    applyTranslations(btn.dataset.lang);
  });
});

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  q.addEventListener('click', () => {
    item.classList.toggle('open');
  });
});

// Apply initial tweaks
function applyTweaks(t) {
  document.body.classList.toggle('graph', t.graphPaper === true || t.graphPaper === 'true');
  document.body.classList.toggle('accent-blue', t.accent === 'blue');
  document.body.classList.toggle('no-doodles', !(t.showDoodles === true || t.showDoodles === 'true'));

  // Hide/show stickers and background doodles
  const show = (t.showDoodles === true || t.showDoodles === 'true');
  document.querySelectorAll('.sticker, .doodle, .section-sticker, .ribbon, .contact-bg-stickers').forEach(el => {
    el.style.display = show ? '' : 'none';
  });

  // Language
  if (t.language && t.language !== currentLang) {
    applyTranslations(t.language);
  }

  // Update tweak panel button states
  Object.entries(t).forEach(([key, val]) => {
    document.querySelectorAll(`[data-tweak="${key}"] .tweak-opt`).forEach(btn => {
      btn.classList.toggle('active', btn.dataset.val === String(val));
    });
  });
}

// Wire up tweaks panel
document.querySelectorAll('#tweaks .tweak-opts').forEach(group => {
  const key = group.dataset.tweak;
  group.querySelectorAll('.tweak-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      let val = btn.dataset.val;
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      currentTweaks[key] = val;
      applyTweaks(currentTweaks);
      // Persist to host
      const edit = {};
      edit[key] = val;
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: edit }, '*');
    });
  });
});

// Tweaks edit mode protocol
window.addEventListener('message', e => {
  if (!e.data || !e.data.type) return;
  if (e.data.type === '__activate_edit_mode') {
    document.getElementById('tweaks').classList.add('show');
  } else if (e.data.type === '__deactivate_edit_mode') {
    document.getElementById('tweaks').classList.remove('show');
  }
});

// Announce edit mode available
window.parent.postMessage({ type: '__edit_mode_available' }, '*');

// Initialize
applyTranslations(currentLang);
applyTweaks(currentTweaks);
