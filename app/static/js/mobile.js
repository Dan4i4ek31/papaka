// Mobile-specific optimizations for ЦифраМаркет
// Touch handling, navigation, performance improvements

class MobileOptimizer {
  constructor() {
    this.currentPage = this.detectCurrentPage();
    this.isMobile = window.innerWidth <= 768;
    this.init();
  }

  init() {
    this.setupMobileNav();
    this.setupTouchHandlers();
    this.setupOrientationChange();
    this.setupFormOptimizations();
    this.setupScrollSnapping();
  }

  // ==================== PAGE DETECTION ====================
  detectCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('index') || path === '/' || path === '') return 'home';
    if (path.includes('cart')) return 'cart';
    if (path.includes('favorite')) return 'favorites';
    if (path.includes('account')) return 'account';
    if (path.includes('chat')) return 'chat';
    if (path.includes('auth')) return 'auth';
    return 'home';
  }

  // ==================== MOBILE NAVIGATION ====================
  setupMobileNav() {
    const navContainer = document.getElementById('mobileNav');
    if (!navContainer) return;

    // Update active state
    this.updateMobileNav(this.currentPage);

    // Setup click handlers
    navContainer.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const page = item.dataset.page;
        this.updateMobileNav(page);
      });
    });
  }

  updateMobileNav(page) {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    navItems.forEach(item => {
      if (item.dataset.page === page) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // ==================== TOUCH HANDLERS ====================
  setupTouchHandlers() {
    // Touch feedback for interactive elements
    document.addEventListener('touchstart', (e) => {
      const target = e.target.closest('button, a, .chip, .card, .payment-chip');
      if (target) {
        target.style.opacity = '0.85';
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const target = e.target.closest('button, a, .chip, .card, .payment-chip');
      if (target) {
        target.style.opacity = '1';
      }
    }, { passive: true });

    // Swipe navigation
    this.setupSwipeNavigation();
  }

  setupSwipeNavigation() {
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    }, false);
  }

  handleSwipe(startX, endX) {
    const diff = startX - endX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diff) > threshold) {
      // Swipe detected, but let's not interfere with native scrolling
      // This is primarily for future enhancements
    }
  }

  // ==================== ORIENTATION CHANGE ====================
  setupOrientationChange() {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.isMobile = window.innerWidth <= 768;
        // Scroll to top on orientation change
        window.scrollTo(0, 0);
      }, 100);
    });

    // Also handle resize for responsiveness
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.isMobile = window.innerWidth <= 768;
      }, 250);
    });
  }

  // ==================== FORM OPTIMIZATIONS ====================
  setupFormOptimizations() {
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      // Prevent auto-zoom on iOS
      input.addEventListener('focus', () => {
        if (this.isMobile) {
          document.body.style.zoom = 1;
        }
      });

      // Handle input type="email" on mobile
      if (input.type === 'email') {
        input.setAttribute('inputmode', 'email');
        input.setAttribute('autocomplete', 'email');
      }

      // Handle phone numbers
      if (input.type === 'tel') {
        input.setAttribute('inputmode', 'tel');
        input.setAttribute('autocomplete', 'tel');
      }

      // Handle numbers
      if (input.type === 'number') {
        input.setAttribute('inputmode', 'numeric');
      }
    });
  }

  // ==================== SCROLL SNAPPING ====================
  setupScrollSnapping() {
    // Smooth scrolling for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      });
    });
  }

  // ==================== VIEWPORT LOCK (for modals) ====================
  lockViewport() {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }

  unlockViewport() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }

  // ==================== UTILITY FUNCTIONS ====================

  // Check if device supports hover
  static supportsHover() {
    return window.matchMedia('(hover: hover)').matches;
  }

  // Check if device is iPad
  static isIPad() {
    return /iPad|Mac/.test(navigator.userAgent);
  }

  // Get viewport height (accounting for mobile UI)
  static getViewportHeight() {
    return window.visualViewport?.height || window.innerHeight;
  }

  // Detect notch support
  static hasNotch() {
    return CSS.supports('padding: max(0px)');
  }
}

// ==================== PERFORMANCE MONITORING ====================

class PerformanceMonitor {
  static logMetrics() {
    if (!window.performance) return;

    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

      const metrics = {
        'Total Load Time': pageLoadTime + 'ms',
        'DOM Content Loaded': (perfData.domContentLoadedEventEnd - perfData.navigationStart) + 'ms',
        'First Paint': (perfData.responseStart - perfData.navigationStart) + 'ms'
      };

      console.log('%cPerformance Metrics', 'color: #2b5cff; font-weight: bold;', metrics);
    });
  }

  static observeFirstContentfulPaint() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log('%cFirst Contentful Paint: ' + entry.renderTime + 'ms', 'color: #7b61ff;');
          }
        });
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      } catch (e) {
        console.warn('PerformanceObserver not supported');
      }
    }
  }
}

// ==================== AUTO-INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  const optimizer = new MobileOptimizer();
  window.mobileOptimizer = optimizer;

  // Log performance metrics in development
  if (window.location.hostname === 'localhost') {
    PerformanceMonitor.logMetrics();
    PerformanceMonitor.observeFirstContentfulPaint();
  }

  // Debug info
  console.log('%cЦифраМаркет Mobile Optimizer', 'color: #2b5cff; font-size: 14px; font-weight: bold;');
  console.log('Device Type:', MobileOptimizer.isIPad() ? 'iPad/Mac' : 'Phone/Tablet');
  console.log('Has Notch:', MobileOptimizer.hasNotch());
  console.log('Viewport Height:', MobileOptimizer.getViewportHeight() + 'px');
  console.log('Supports Hover:', MobileOptimizer.supportsHover() ? 'Yes' : 'No');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MobileOptimizer, PerformanceMonitor };
}
