(function () {
  'use strict';

  var pages = ['home', 'info', 'dishes', 'menu', 'social'];
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var statusEl = document.getElementById('openStatus');
  var toastEl = document.getElementById('toast');
  var lightbox = document.getElementById('lightbox');
  var toastTimer;

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2000);
  }

  function navigate(page, updateHash) {
    if (pages.indexOf(page) === -1) page = 'home';
    sections.forEach(function (section) {
      section.classList.toggle('active', section.id === page);
    });
    tabs.forEach(function (tab) {
      var active = tab.dataset.target === page;
      tab.classList.toggle('active', active);
      if (active) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    document.title = '綠之屋｜' + ({
      home: '餐廳介紹', info: '營業資訊', dishes: '套餐與單點', menu: '菜單', social: '社群帳號'
    }[page]);
    if (updateHash && location.hash !== '#' + page) {
      history.replaceState(null, '', '#' + page);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { navigate(tab.dataset.target, true); });
  });
  document.querySelectorAll('[data-go]').forEach(function (button) {
    button.addEventListener('click', function () { navigate(button.dataset.go, true); });
  });
  window.addEventListener('hashchange', function () {
    navigate(location.hash.replace('#', ''), false);
  });

  // 營業狀態：週二～週五 10:30–20:00，其餘日子店休
  function updateStatus() {
    var now = new Date();
    var day = now.getDay();
    var minutes = now.getHours() * 60 + now.getMinutes();
    var closedDay = day === 0 || day === 1 || day === 6;
    var open = !closedDay && minutes >= 630 && minutes < 1200;
    statusEl.textContent = closedDay ? '今日公休' : (open ? '營業中' : '休息中');
    statusEl.classList.toggle('closed', !open);
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  // 菜單放大
  var openMenu = document.getElementById('openMenu');
  var closeMenu = document.getElementById('closeMenu');
  var zoomMenu = document.getElementById('zoomMenu');
  if (openMenu && lightbox) {
    openMenu.addEventListener('click', function () { lightbox.hidden = false; });
    closeMenu.addEventListener('click', function () {
      lightbox.hidden = true;
      lightbox.classList.remove('zoom');
      zoomMenu.textContent = '放大 2×';
    });
    zoomMenu.addEventListener('click', function () {
      var zoomed = lightbox.classList.toggle('zoom');
      zoomMenu.textContent = zoomed ? '縮小' : '放大 2×';
    });
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) lightbox.hidden = true;
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        lightbox.hidden = true;
        lightbox.classList.remove('zoom');
        zoomMenu.textContent = '放大 2×';
      }
    });
  }

  // 複製 LINE ID
  var copyBtn = document.getElementById('copyLine');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var id = '@905axunh';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id)
          .then(function () { showToast('已複製 LINE ID'); })
          .catch(function () { fallbackCopy(id); });
      } else {
        fallbackCopy(id);
      }
    });
  }
  function fallbackCopy(text) {
    var input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    try { document.execCommand('copy'); showToast('已複製 LINE ID'); }
    catch (error) { showToast('請長按 ID 手動複製'); }
    document.body.removeChild(input);
  }

  navigate(location.hash.replace('#', ''), false);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* 離線快取不可用時不影響使用 */ });
    });
  }
})();
