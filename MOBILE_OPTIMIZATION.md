# Мобильная адаптация сайта ЦифраМаркет

## 📱 Обзор улучшений

Этот документ содержит рекомендации по оптимизации проекта **papaka** для мобильных устройств.

---

## 1. КРИТИЧЕСКИЕ ИЗМЕНЕНИЯ В HTML

### 1.1 Добавить в `index.html` (в `<head>`):

```html
<!-- Viewport meta (уже есть, но убедитесь!) -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<!-- Для iOS notch devices -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<!-- Disable zoom (опционально) -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
```

### 1.2 Добавить Mobile Navigation Bar (footer nav для мобильных)

Добавить перед `</body>`:

```html
<!-- Mobile Bottom Navigation -->
<nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">
  <button class="mobile-nav-item active" data-page="home" onclick="navigateTo('/')">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    </svg>
    <span>Главная</span>
  </button>
  <button class="mobile-nav-item" data-page="search" onclick="openSearch()">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
    <span>Поиск</span>
  </button>
  <button class="mobile-nav-item" data-page="cart" onclick="location.href='/cart.html'">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
    <span>Корзина</span>
  </button>
  <button class="mobile-nav-item" data-page="favorites" onclick="location.href='/favorite.html'">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
    <span>Избранное</span>
  </button>
  <button class="mobile-nav-item" data-page="account" onclick="location.href('/account.html')">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
    <span>Аккаунт</span>
  </button>
</nav>
```

---

## 2. CSS ОПТИМИЗАЦИЯ

### 2.1 Создать файл `app/static/css/mobile-enhanced.css`:

```css
/* ======================== TOUCH-FRIENDLY COMPONENTS ======================== */

/* Убрать tap highlight */
button, a, input, select {
  -webkit-tap-highlight-color: transparent;
}

/* Min touch target 44x44px (Apple HIG) */
button, .btn, .chip, .payment-chip {
  min-height: 44px;
  min-width: 44px;
}

/* Предотвратить zoom при фокусе input */
input, textarea, select {
  font-size: 16px !important;
}

/* ======================== BOTTOM NAVIGATION ======================== */
@media (max-width: 480px) {
  body {
    padding-bottom: 70px;
  }

  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: linear-gradient(180deg, rgba(15, 23, 36, 0.98), rgba(6, 6, 19, 0.99));
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 50;
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.3);
  }

  .mobile-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100%;
    cursor: pointer;
    color: rgba(230, 238, 248, 0.6);
    font-size: 10px;
    gap: 2px;
    border: none;
    background: transparent;
    padding: 0;
    transition: all 0.2s ease;
    user-select: none;
  }

  .mobile-nav-item:active {
    background: rgba(43, 92, 255, 0.1);
  }

  .mobile-nav-item.active {
    color: var(--accent-1);
  }

  .mobile-nav-item svg {
    width: 24px;
    height: 24px;
    stroke-width: 2;
  }
}

/* ======================== SAFE AREA SUPPORT (notched devices) ======================== */
@supports (padding: max(0px)) {
  body {
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
    padding-bottom: max(70px, env(safe-area-inset-bottom));
  }

  .site-header {
    padding-top: env(safe-area-inset-top);
  }

  .mobile-nav {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .modal-panel {
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}

/* ======================== FORM OPTIMIZATION ======================== */
@media (max-width: 768px) {
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="number"],
  textarea {
    font-size: 16px;
    padding: 12px;
    border-radius: 8px;
  }

  input:focus {
    font-size: 16px;
  }
}

/* ======================== MODAL IMPROVEMENTS ======================== */
@media (max-width: 768px) {
  .modal {
    padding: 0;
    align-items: flex-end;
  }

  .modal-panel {
    width: 100%;
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    max-height: 90vh;
  }

  /* Drag handle */
  .modal-panel::before {
    content: "";
    display: block;
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    margin: 8px auto;
  }
}

/* ======================== SWIPE SCROLLING ======================== */
@media (max-width: 768px) {
  .filter-toolbar, .sort-menu, .preview-thumbs, .modal-body {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }

  .preview-thumbs {
    scroll-snap-type: x mandatory;
  }

  .preview-thumbs img {
    scroll-snap-align: center;
    scroll-snap-stop: always;
  }
}

/* ======================== PERFORMANCE ======================== */
@media (max-width: 768px) {
  .card, .modal, .btn, .chip {
    will-change: transform;
    transform: translateZ(0);
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

/* ======================== LANDSCAPE MODE ======================== */
@media (max-height: 500px) and (orientation: landscape) {
  .preview-hero {
    display: none;
  }

  .mobile-nav {
    height: 48px;
  }

  .mobile-nav-item svg {
    width: 20px;
    height: 20px;
  }
}

/* ======================== SCROLLBAR STYLING ======================== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
```

### 2.2 Добавить ссылку в `index.html` (в `<head>`):

```html
<link rel="stylesheet" href="/app/static/css/mobile-enhanced.css">
```

---

## 3. JAVASCRIPT ОПТИМИЗАЦИЯ

### 3.1 Добавить в `app/static/js/app.js`:

```javascript
// ==================== MOBILE NAVIGATION ====================
function updateMobileNav(page) {
  const items = document.querySelectorAll('.mobile-nav-item');
  items.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });
}

function navigateTo(page) {
  const pageMap = {
    '/': 'home',
    '/cart.html': 'cart',
    '/favorite.html': 'favorites',
    '/account.html': 'account',
    '/chat.html': 'chat'
  };
  const pageKey = Object.keys(pageMap).find(key => window.location.pathname.includes(pageMap[key]));
  updateMobileNav(pageMap[pageKey] || 'home');
}

function openSearch() {
  document.getElementById('search').focus();
}

// Инициализировать при загрузке
document.addEventListener('DOMContentLoaded', () => {
  updateMobileNav('home');
});

// ==================== TOUCH IMPROVEMENTS ====================

// Добавить tactile feedback при клике
document.addEventListener('touchstart', (e) => {
  if (e.target.closest('button, a, .chip, .card')) {
    e.target.closest('button, a, .chip, .card').style.opacity = '0.8';
  }
}, true);

document.addEventListener('touchend', (e) => {
  if (e.target.closest('button, a, .chip, .card')) {
    e.target.closest('button, a, .chip, .card').style.opacity = '1';
  }
}, true);

// ==================== FORM AUTO-ZOOM FIX ====================
document.addEventListener('focusin', (e) => {
  if (e.target.matches('input, textarea, select')) {
    // Prevent iOS auto-zoom
    document.body.style.zoom = 1;
  }
});

// ==================== VIEWPORT ORIENTATION CHANGE ====================
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);
});
```

---

## 4. СТРУКТУРА УЛУЧШЕНИЙ

### Текущее состояние (`styles.css`):
- ✅ Базовые media queries (480px, 768px, 1024px)
- ✅ Flexible grid layout
- ❌ Нет bottom navigation
- ❌ Нет touch optimizations
- ❌ Нет safe area support
- ❌ Нет swipe scrolling

### После улучшений:
- ✅ Bottom navigation bar для мобильных
- ✅ Touch-friendly компоненты (44x44px min)
- ✅ Safe area поддержка (iPhone X+)
- ✅ Smooth swipe scrolling
- ✅ Оптимизированные модалы для мобильных
- ✅ Улучшенные формы
- ✅ GPU acceleration

---

## 5. ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ

### Обновить:
1. `app/templates/index.html` - добавить mobile nav
2. `app/templates/cart.html` - добавить mobile nav
3. `app/templates/auth.html` - добавить mobile nav
4. `app/templates/account.html` - добавить mobile nav
5. `app/templates/favorite.html` - добавить mobile nav
6. `app/templates/chat.html` - добавить mobile nav

### Создать новый:
1. `app/static/css/mobile-enhanced.css` - новые мобильные стили

### Обновить:
1. `app/static/js/app.js` - добавить мобильные функции

---

## 6. ТЕСТИРОВАНИЕ

### Проверить на устройствах:
- iPhone 12/13 (390x844)
- iPhone SE (375x667)
- Samsung Galaxy A10 (360x800)
- iPad (768x1024)
- Desktop (1920x1080)

### DevTools эмуляция:
- Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)
- Throttle CPU (2-3x)
- Test touch interactions

### Критические проверки:
- ✅ Все кнопки 44x44px minimum
- ✅ Нет горизонтального скролла
- ✅ Модалы правильно открываются
- ✅ Формы работают без zoom
- ✅ Bottom nav видна на всех экранах
- ✅ Safe area работает на notched devices

---

## 7. PERFORMANCE TIPS

### Для быстрой мобильной загрузки:

1. **Lazy loading изображений:**
```html
<img src="..." loading="lazy" alt="...">
```

2. **Compress images:**
- WebP format
- Responsive srcset
- SVG для иконок

3. **Критические CSS:**
```html
<link rel="preload" href="/app/static/css/mobile-enhanced.css" as="style">
```

4. **Defer JavaScript:**
```html
<script defer src="/app/static/js/app.js"></script>
```

---

## 8. БРАУЗЕРНАЯ СОВМЕСТИМОСТЬ

- ✅ iOS Safari 12+
- ✅ Chrome Mobile 88+
- ✅ Firefox Mobile 88+
- ✅ Samsung Internet 14+
- ✅ Edge Mobile 90+

---

## 9. СЛЕДУЮЩИЕ ШАГИ

1. Создать файл `mobile-enhanced.css`
2. Обновить `index.html` с bottom nav
3. Добавить мобильные функции в `app.js`
4. Протестировать на реальных устройствах
5. Добавить service worker для offline (PWA)
6. Оптимизировать изображения

---

**Статус:** 📋 Ready for implementation
**Автор:** AI Assistant
**Дата:** 2025-12-19
