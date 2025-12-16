
// Theme toggle (Neon / Dark / Light) and mobile nav
(function(){
  const toggle = document.getElementById('theme-toggle');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  const THEMES = ['neon', 'dark', 'light', 'arcade', 'joey'];
  const LABELS = {
    neon: '🟢 Neon',
    dark: '🌙 Dark',
    light: '☀️ Light',
    arcade: '🕹️ Arcade',
    joey: '🎨 Joey'
  };

  function applyTheme(theme) {
    const html = document.documentElement;
    html.classList.remove('theme-arcade', 'theme-dark', 'theme-light', 'theme-joey');
    if (theme === 'dark') html.classList.add('theme-dark');
    if (theme === 'light') html.classList.add('theme-light');
    if (theme === 'arcade') html.classList.add('theme-arcade');
    if (theme === 'joey') html.classList.add('theme-joey');
    // neon uses default variables (no class)
    if (toggle) toggle.textContent = LABELS[theme] || LABELS.neon;
    localStorage.setItem('jg-theme', theme);
  }

  // restore saved theme
  const savedTheme = localStorage.getItem('jg-theme') || 'neon';
  if (THEMES.includes(savedTheme)) applyTheme(savedTheme);

  // click cycles through themes
  toggle && toggle.addEventListener('click', function(){
    const current = localStorage.getItem('jg-theme') || 'neon';
    const idx = THEMES.indexOf(current);
    const next = THEMES[(idx + 1) % THEMES.length];
    applyTheme(next);
  });

  // mobile nav
  navToggle && navToggle.addEventListener('click', function(){
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', (!expanded).toString());
    navMenu.classList.toggle('open');
  });
})();

// Gallery slide-in panel + carousel controls
(function(){
  const openBtn = document.getElementById('open-gallery');
  const overlay = document.getElementById('galleryOverlay');
  const closeBtn = document.getElementById('galleryClose');
  const carousel = document.getElementById('galleryCarousel');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');

  if (!overlay || !carousel) return;

  // make overlay focusable for keyboard events
  overlay.setAttribute('tabindex', '-1');

  function openGallery(){
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    // focus the overlay so it receives keyboard events
    overlay.focus();
    document.body.style.overflow = 'hidden';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    // set initial preview to centered/first
    updatePreviewToCenter();
  }

  function closeGallery(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
  }

  openBtn && openBtn.addEventListener('click', openGallery);
  closeBtn && closeBtn.addEventListener('click', closeGallery);

  // selection helpers
  let selectedIndex = 0;
  function getItems(){ return Array.from(carousel.querySelectorAll('.carousel-item')); }
  function selectIndex(index){
    const items = getItems();
    if (!items.length) return;
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    const item = items[clamped];
    const img = item.querySelector('img');
    if (img) {
      setPreview(img);
      item.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      selectedIndex = clamped;
    }
  }

  prev && prev.addEventListener('click', () => selectIndex(selectedIndex - 1));
  next && next.addEventListener('click', () => selectIndex(selectedIndex + 1));

  // keyboard navigation
  overlay.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowRight') selectIndex(selectedIndex + 1);
    if (e.key === 'ArrowLeft') selectIndex(selectedIndex - 1);
  });

  // allow clicking overlay background to close
  overlay.addEventListener('click', function(e){
    if (e.target === overlay) closeGallery();
  });
  
  // preview area elements
  const previewImg = document.getElementById('galleryPreview');
  const previewCaption = document.getElementById('galleryPreviewCaption');

  function setPreview(imgEl){
    if (!imgEl || !previewImg) return;
    const src = imgEl.getAttribute('src');
    const alt = imgEl.getAttribute('alt') || '';
    previewImg.src = src;
    previewImg.alt = 'Preview: ' + alt;
    if (previewCaption) previewCaption.textContent = alt.replace(/ background$/i, '');
    // mark selected item
    const items = getItems();
    items.forEach(item => item.classList.remove('selected'));
    const parent = imgEl.closest('.carousel-item');
    if (parent) {
      parent.classList.add('selected');
      selectedIndex = items.indexOf(parent);
    }
  }

  // click on thumbnails updates preview
  carousel.querySelectorAll('img').forEach((img, idx) => {
    img.addEventListener('click', function(){
      setPreview(this);
      // center the clicked item
      const item = this.closest('.carousel-item');
      if (item) item.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      selectedIndex = idx;
    });
  });

  // pick the centered item after scrolling (debounced)
  let scrollTimer = null;
  function updatePreviewToCenter(){
    const items = getItems();
    if (!items.length) return;
    const carouselRect = carousel.getBoundingClientRect();
    const centerX = carouselRect.left + carouselRect.width / 2;
    let closest = null;
    let closestDist = Infinity;
    items.forEach(item => {
      const img = item.querySelector('img');
      const r = item.getBoundingClientRect();
      const itemCenter = r.left + r.width / 2;
      const dist = Math.abs(itemCenter - centerX);
      if (dist < closestDist) { closestDist = dist; closest = img; }
    });
    if (closest) {
      setPreview(closest);
      // update selectedIndex based on closest
      const parent = closest.closest('.carousel-item');
      const itemsList = getItems();
      selectedIndex = itemsList.indexOf(parent);
    }
  }

  carousel.addEventListener('scroll', function(){
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updatePreviewToCenter, 150);
  });
})();
