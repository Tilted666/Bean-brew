/* =========================================================
   Bean & Brew — скрипты
   1. Смена фона шапки при прокрутке.
   2. Появление блоков при скролле (IntersectionObserver).
   3. Плавная анимация аккордеона меню (открытие и закрытие).
   4. Закрытие мобильного меню после клика по ссылке.
   ========================================================= */

// ---------- 1. Фон шапки при прокрутке ----------
const header = document.getElementById('siteHeader');
let headerTicking = false;

function updateHeaderOnScroll() {
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

function onScroll() {
  if (headerTicking) return;
  headerTicking = true;
  requestAnimationFrame(function () {
    updateHeaderOnScroll();
    headerTicking = false;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
updateHeaderOnScroll();

// ---------- 2. Появление блоков при прокрутке ----------
const fadeElements = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      // после появления блок больше не нужно отслеживать
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15
});

fadeElements.forEach(function (el) {
  observer.observe(el);
});

// ---------- 3. Анимация аккордеона меню ----------
// Браузер по умолчанию мгновенно скрывает содержимое <details>,
// как только убирается атрибут "open" — из-за этого закрытие
// происходило без анимации. Поэтому мы сами управляем атрибутом
// "open" и высотой блока с содержимым через JavaScript.

// ---------- 3. Анимация аккордеона меню ----------
const menuCategories = document.querySelectorAll('.menu-category');

menuCategories.forEach(function (details) {
  const summary = details.querySelector('summary');
  const content = details.querySelector('.menu-content');

  content.style.height = details.hasAttribute('open') ? 'auto' : '0px';

  summary.addEventListener('click', function (event) {
    event.preventDefault();
    if (details.hasAttribute('open')) {
      closeMenuCategory(details, content);
    } else {
      openMenuCategory(details, content);
    }
  });
});

// Снимаем «висящий» обработчик от предыдущего клика,
// чтобы race condition не сработал (см. пункт 4)
function cancelPendingTransition(content) {
  if (content._onTransitionEnd) {
    content.removeEventListener('transitionend', content._onTransitionEnd);
    content._onTransitionEnd = null;
  }
}

function openMenuCategory(details, content) {
  cancelPendingTransition(content);

  details.setAttribute('open', '');
  const targetHeight = content.scrollHeight + 'px';
  content.style.height = '0px';

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      content.style.height = targetHeight;
    });
  });

  const onEnd = function (event) {
    // Ключевое: только своё событие и только по height
    if (event.target !== content || event.propertyName !== 'height') return;
    content.style.height = 'auto';
    content.removeEventListener('transitionend', onEnd);
    content._onTransitionEnd = null;
  };

  content._onTransitionEnd = onEnd;
  content.addEventListener('transitionend', onEnd);
}

function closeMenuCategory(details, content) {
  cancelPendingTransition(content);

  content.style.height = content.scrollHeight + 'px';

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      content.style.height = '0px';
    });
  });

  const onEnd = function (event) {
    if (event.target !== content || event.propertyName !== 'height') return;
    details.removeAttribute('open');
    content.removeEventListener('transitionend', onEnd);
    content._onTransitionEnd = null;
  };

  content._onTransitionEnd = onEnd;
  content.addEventListener('transitionend', onEnd);
}

// ---------- 4. Закрываем мобильное меню после клика по ссылке ----------
const burgerCheckbox = document.getElementById('burger-toggle');
const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    if (burgerCheckbox) {
      burgerCheckbox.checked = false;
    }
  });
});
