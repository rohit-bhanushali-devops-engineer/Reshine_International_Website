/**
 * scripts.js
 * Professional, Modular JavaScript for Reshine International Website
 * 
 * Features:
 * - Modular architecture with clear separation of concerns
 * - Performance optimizations (debouncing, throttling, event delegation)
 * - Enhanced accessibility support
 * - Error handling and graceful degradation
 * - No external dependencies (pure vanilla JavaScript)
 */

'use strict';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function to limit function execution frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @param {number} threshold - Threshold percentage (0-1)
 * @returns {boolean} True if element is in viewport
 */
function isInViewport(element, threshold = 0) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top >= -threshold * rect.height &&
    rect.left >= -threshold * rect.width &&
    rect.bottom <= windowHeight + threshold * rect.height &&
    rect.right <= windowWidth + threshold * rect.width
  );
}

/**
 * Smooth scroll to element with offset
 * @param {Element} element - Target element
 * @param {number} offset - Offset in pixels
 */
function smoothScrollTo(element, offset = 0) {
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

// ============================================
// NAVIGATION MODULE
// ============================================

const Navigation = (function() {
  'use strict';
  
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('primary-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const header = document.querySelector('.site-header');
  
  /**
   * Initialize mobile menu
   */
  function initMobileMenu() {
    if (!hamburger || !menu) return;
    
    hamburger.addEventListener('click', toggleMenu);
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (menu.style.display === 'block' && 
          !hamburger.contains(e.target) && 
          !menu.contains(e.target)) {
        closeMenu();
      }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });
  }
  
  /**
   * Toggle mobile menu
   */
  function toggleMenu() {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    menu.style.display = expanded ? '' : 'block';
    document.body.style.overflow = expanded ? '' : 'hidden';
  }
  
  /**
   * Close mobile menu
   */
  function closeMenu() {
    if (hamburger.getAttribute('aria-expanded') === 'true') {
      hamburger.click();
    }
  }
  
  /**
   * Initialize smooth scrolling for navigation links (same-page anchors)
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function(e) {
        const hash = this.getAttribute('href');
        if (hash.length > 1 && hash !== '#') {
          const target = document.querySelector(hash);
          if (target) {
            e.preventDefault();
            const headerHeight = header ? header.offsetHeight : 0;
            smoothScrollTo(target, headerHeight);
            
            // Update URL without triggering scroll
            if (history.pushState) {
              history.pushState(null, null, hash);
            }
            
            // Close mobile menu if open
            if (hamburger && window.getComputedStyle(hamburger).display !== 'none' && 
                hamburger.getAttribute('aria-expanded') === 'true') {
              closeMenu();
            }
          }
        }
      });
    });
  }
  
  /**
   * Update active navigation link based on current page
   */
  function updateActiveLink() {
    if (!navLinks.length) return;
    
    // Get current page path
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Remove active class from all links
    navLinks.forEach(link => {
      link.classList.remove('active');
      
      // Get link's target page
      const linkHref = link.getAttribute('href');
      const linkPage = linkHref.split('/').pop();
      
      // Set active if it matches current page
      if (linkPage === currentPage || 
          (currentPage === '' && linkPage === 'index.html') ||
          (currentPage === 'index.html' && linkPage === 'index.html')) {
        link.classList.add('active');
      }
    });
    
    // Also handle same-page section navigation (for pages with multiple sections)
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0) {
      const scrollPos = window.pageYOffset + 150;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            // Only update if it's a same-page anchor link
            if (linkHref.startsWith('#') && linkHref === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }
  }
  
  /**
   * Prefetch likely navigation paths for better performance
   */
  function initPrefetching() {
    if (!('IntersectionObserver' in window)) return;
    
    // Select navigation links that are internal (not external URLs, mailto, tel, or hash links)
    const allLinks = document.querySelectorAll('.nav-link, .footer-links a, .cta');
    const navLinks = Array.from(allLinks).filter(link => {
      const href = link.getAttribute('href');
      return href && 
             !href.startsWith('http://') && 
             !href.startsWith('https://') && 
             !href.startsWith('mailto:') && 
             !href.startsWith('tel:') && 
             !href.startsWith('#') &&
             (href.endsWith('.html') || href === 'index.html' || href === '/');
    });
    
    if (navLinks.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          const href = link.getAttribute('href');
          
          // Prefetch the page
          if (href) {
            const linkElement = document.createElement('link');
            linkElement.rel = 'prefetch';
            linkElement.href = href;
            document.head.appendChild(linkElement);
          }
          
          observer.unobserve(link);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    navLinks.forEach(link => {
      observer.observe(link);
    });
  }
  
  /**
   * Initialize header scroll effect
   */
  function initHeaderScroll() {
    if (!header) return;
    
    const handleScroll = throttle(() => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 4px 20px rgba(11, 37, 69, 0.1)';
      } else {
        header.style.background = 'linear-gradient(0deg, rgba(255,255,255,0.8), rgba(255,255,255,0.8))';
        header.style.boxShadow = '0 2px 8px rgba(11, 37, 69, 0.06)';
      }
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  /**
   * Initialize all navigation features
   */
  function init() {
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    updateActiveLink(); // Initial call for current page
    initPrefetching(); // Prefetch likely navigation paths
    
    // Update active link on scroll (for same-page sections)
    window.addEventListener('scroll', throttle(() => {
      const sections = document.querySelectorAll('section[id]');
      if (sections.length > 0) {
        updateActiveLink();
      }
    }, 100), { passive: true });
  }
  
  return {
    init: init,
    closeMenu: closeMenu
  };
})();

// ============================================
// ACCORDION MODULE
// ============================================

const Accordion = (function() {
  'use strict';
  
  /**
   * Setup accordion functionality
   * @param {string} rootSelector - CSS selector for accordion root
   * @param {boolean} allowMultiple - Allow multiple panels open at once
   */
  function setup(rootSelector, allowMultiple = false) {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    
    const toggles = root.querySelectorAll('.accordion-toggle');
    
    toggles.forEach(btn => {
      btn.addEventListener('click', () => togglePanel(btn, rootSelector, allowMultiple, toggles));
      
      // Keyboard support
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }
  
  /**
   * Toggle accordion panel
   */
  function togglePanel(btn, rootSelector, allowMultiple, allToggles) {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const panel = btn.nextElementSibling;
    
    if (!panel || !panel.classList.contains('accordion-panel')) return;
    
    // Close other accordions if not allowing multiple
    if (!expanded && !allowMultiple && rootSelector === '#faq-accordion') {
      allToggles.forEach(otherBtn => {
        if (otherBtn !== btn && otherBtn.getAttribute('aria-expanded') === 'true') {
          closePanel(otherBtn);
        }
      });
    }
    
    btn.setAttribute('aria-expanded', String(!expanded));
    
    if (!expanded) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    } else {
      panel.style.maxHeight = null;
    }
  }
  
  /**
   * Close accordion panel
   */
  function closePanel(btn) {
    const panel = btn.nextElementSibling;
    if (panel && panel.classList.contains('accordion-panel')) {
      btn.setAttribute('aria-expanded', 'false');
      panel.style.maxHeight = null;
    }
  }
  
  /**
   * Initialize all accordions
   */
  function init() {
    setup('#services-accordion', false);
    setup('#faq-accordion', false);
  }
  
  return {
    init: init,
    setup: setup
  };
})();

// ============================================
// CAROUSEL MODULE
// ============================================

const Carousel = (function() {
  'use strict';
  
  let carouselInstance = null;
  
  /**
   * Initialize testimonial carousel
   */
  function init() {
    const track = document.querySelector('.carousel-track');
    if (!track) return;
    
    const prev = document.querySelector('.carousel-prev');
    const next = document.querySelector('.carousel-next');
    if (!prev || !next) return;
    
    const items = Array.from(track.children);
    if (items.length === 0) return;
    
    let index = 0;
    let isTransitioning = false;
    const dotsContainer = document.querySelector('.carousel-dots');
    
    // Create dots
    if (dotsContainer) {
      items.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });
    }
    
    function updateButtons() {
      prev.disabled = index === 0;
      next.disabled = index === items.length - 1;
      prev.setAttribute('aria-disabled', String(index === 0));
      next.setAttribute('aria-disabled', String(index === items.length - 1));
    }
    
    function updateDots() {
      const dots = document.querySelectorAll('.carousel-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }
    
    function update() {
      if (items.length === 0) return;
      const itemWidth = items[0].offsetWidth;
      const gap = parseInt(getComputedStyle(track).gap) || 16;
      const width = itemWidth + gap;
      track.style.transform = `translateX(${-index * width}px)`;
      updateButtons();
      updateDots();
      
      // Update aria-live for screen readers
      items.forEach((item, i) => {
        item.setAttribute('aria-hidden', i !== index ? 'true' : 'false');
      });
    }
    
    function goToNext() {
      if (isTransitioning || index >= items.length - 1) return;
      isTransitioning = true;
      index++;
      update();
      setTimeout(() => { isTransitioning = false; }, 400);
    }
    
    function goToPrev() {
      if (isTransitioning || index <= 0) return;
      isTransitioning = true;
      index--;
      update();
      setTimeout(() => { isTransitioning = false; }, 400);
    }
    
    function goToSlide(i) {
      if (isTransitioning || i === index || i < 0 || i >= items.length) return;
      isTransitioning = true;
      index = i;
      update();
      setTimeout(() => { isTransitioning = false; }, 400);
    }
    
    next.addEventListener('click', goToNext);
    prev.addEventListener('click', goToPrev);
    
    // Keyboard support
    const carousel = track.closest('.carousel');
    if (carousel) {
      carousel.setAttribute('tabindex', '0');
      carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          goToNext();
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToPrev();
        }
      });
    }
    
    // Debounced resize handler
    const handleResize = debounce(update, 250);
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    update();
    setTimeout(update, 300);
  }
  
  return {
    init: init
  };
})();

// ============================================
// FORM VALIDATION MODULE
// ============================================

const FormValidation = (function() {
  'use strict';
  
  /**
   * Show error message for field
   */
  function showError(field, message) {
    const errorId = 'error-' + field.id;
    const errorElement = document.getElementById(errorId);
    
    if (errorElement) {
      errorElement.textContent = message || '';
      errorElement.setAttribute('role', message ? 'alert' : '');
    }
    
    if (message) {
      field.setAttribute('aria-invalid', 'true');
      field.classList.add('error-field');
    } else {
      field.removeAttribute('aria-invalid');
      field.classList.remove('error-field');
    }
  }
  
  /**
   * Validate field based on rules
   */
  function validateField(field, rules) {
    const value = field.value.trim();
    
    if (rules.required && !value) {
      showError(field, rules.required);
      return false;
    }
    
    if (value && rules.pattern && !rules.pattern.test(value)) {
      showError(field, rules.patternError);
      return false;
    }
    
    if (value && rules.minLength && value.length < rules.minLength) {
      showError(field, rules.minLengthError);
      return false;
    }
    
    showError(field, '');
    return true;
  }
  
  /**
   * Initialize contact form validation
   */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    const submitBtn = form.querySelector('button[type="submit"]');
    const success = document.getElementById('form-success');
    
    if (!name || !email || !message || !submitBtn || !success) return;
    
    // Validation rules
    const rules = {
      name: { required: 'Please enter your name' },
      email: {
        required: 'Please enter your email',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternError: 'Please enter a valid email address'
      },
      message: {
        required: 'Please enter a message',
        minLength: 10,
        minLengthError: 'Message must be at least 10 characters'
      }
    };
    
    // Real-time validation on blur
    [name, email, message].forEach(field => {
      if (field) {
        field.addEventListener('blur', () => {
          validateField(field, rules[field.id]);
        });
      }
    });
    
    // Form submission
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Validate all fields
      let isValid = true;
      isValid = validateField(name, rules.name) && isValid;
      isValid = validateField(email, rules.email) && isValid;
      isValid = validateField(message, rules.message) && isValid;
      
      if (!isValid) {
        const firstError = form.querySelector('[aria-invalid="true"]');
        if (firstError) {
          firstError.focus();
        }
        return;
      }
      
      // Disable submit button
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = 'Sending...';
      } else {
        submitBtn.textContent = 'Sending...';
      }
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message
        success.hidden = false;
        success.focus();
        
        // Reset form
        form.reset();
        
        // Clear all errors
        [name, email, message].forEach(field => {
          if (field) showError(field, '');
        });
        
        // Scroll to success message
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Hide success after delay
        setTimeout(() => {
          success.hidden = true;
        }, 5000);
        
      } catch (error) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error';
        errorMsg.setAttribute('role', 'alert');
        errorMsg.textContent = 'Sorry, there was an error sending your message. Please try again or contact us directly.';
        errorMsg.style.marginTop = '0.5rem';
        form.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 5000);
      } finally {
        submitBtn.disabled = false;
        if (btnText) {
          btnText.textContent = 'Send Message';
        } else {
          submitBtn.textContent = 'Send Message';
        }
      }
    });
  }
  
  /**
   * Initialize quick quote form
   */
  function initQuickQuoteForm() {
    const form = document.getElementById('quick-quote-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
      
      // Simulate form submission
      setTimeout(() => {
        const successMsg = document.createElement('div');
        successMsg.className = 'success';
        successMsg.setAttribute('role', 'status');
        successMsg.setAttribute('aria-live', 'polite');
        successMsg.style.marginTop = '1rem';
        successMsg.textContent = 'Thank you! We\'ll send you a detailed quote promptly.';
        form.appendChild(successMsg);
        
        // Reset form
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Scroll to success message
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Remove success message after 5 seconds
        setTimeout(() => {
          successMsg.remove();
        }, 5000);
      }, 1500);
    });
  }
  
  /**
   * Initialize all forms
   */
  function init() {
    initContactForm();
    initQuickQuoteForm();
  }
  
  return {
    init: init,
    validateField: validateField,
    showError: showError
  };
})();

// ============================================
// ANIMATIONS MODULE
// ============================================

const Animations = (function() {
  'use strict';
  
  /**
   * Initialize scroll reveal animations
   */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    const revealElements = document.querySelectorAll(
      '.card, .service, .testimonial, .competencies li, h2, .contact-info, .industry-card, .port-card'
    );
    
    revealElements.forEach(el => {
      el.classList.add('scroll-reveal');
      observer.observe(el);
    });
  }
  
  /**
   * Initialize counter animation for stats
   */
  function initCounterAnimation() {
    const stats = document.querySelectorAll('.stat-number');
    if (stats.length === 0) return;
    
    if (!('IntersectionObserver' in window)) {
      // Fallback: animate immediately
      stats.forEach(stat => {
        const target = parseInt(stat.dataset.target);
        const suffix = stat.textContent.includes('%') ? '%' : '';
        stat.textContent = target + suffix;
      });
      return;
    }
    
    function animateCounter(element, target, suffix = '') {
      let start = 0;
      const duration = 2000;
      const increment = target / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          element.textContent = target + suffix;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(start) + suffix;
        }
      }, 16);
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.target);
          const suffix = entry.target.textContent.includes('%') ? '%' : '';
          animateCounter(entry.target, target, suffix);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
  }
  
  /**
   * Initialize parallax effect for hero image
   */
  function initParallax() {
    const heroImage = document.querySelector('.hero-image img');
    if (!heroImage) return;
    
    const updateParallax = throttle(() => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero');
      if (hero && scrolled < hero.offsetHeight) {
        const parallax = scrolled * 0.3;
        heroImage.style.transform = `translateY(${parallax}px)`;
      }
    }, 16);
    
    window.addEventListener('scroll', updateParallax, { passive: true });
  }
  
  /**
   * Initialize lazy loading images
   */
  function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        img.addEventListener('load', function() {
          this.classList.add('loaded');
        });
        if (img.complete) {
          img.classList.add('loaded');
        }
      });
    }
  }
  
  /**
   * Initialize all animations
   */
  function init() {
    initScrollReveal();
    initCounterAnimation();
    initParallax();
    initLazyImages();
  }
  
  return {
    init: init
  };
})();

// ============================================
// RESOURCE DOWNLOAD MODULE
// ============================================

const ResourceDownload = (function() {
  'use strict';
  
  /**
   * Initialize resource download functionality
   */
  function init() {
    const downloadButtons = document.querySelectorAll('.resource-download');
    
    downloadButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        handleDownload(this);
      });
    });
  }
  
  /**
   * Handle download action
   */
  function handleDownload(button) {
    const resourceCard = button.closest('.resource-card');
    const resourceTitle = resourceCard ? resourceCard.querySelector('h3')?.textContent : 'Resource';
    
    // Add loading state
    const originalText = button.textContent;
    button.disabled = true;
    button.classList.add('downloading');
    button.innerHTML = '<span class="download-spinner"></span> Downloading...';
    
    // Simulate download (in real implementation, this would trigger actual file download)
    setTimeout(() => {
      // Show success message
      showDownloadSuccess(resourceCard, resourceTitle);
      
      // Reset button
      button.disabled = false;
      button.classList.remove('downloading');
      button.textContent = originalText;
      
      // In a real implementation, you would trigger the actual download here:
      // const link = document.createElement('a');
      // link.href = '/path/to/resource.pdf';
      // link.download = resourceTitle + '.pdf';
      // link.click();
    }, 1500);
  }
  
  /**
   * Show download success message
   */
  function showDownloadSuccess(card, title) {
    // Remove existing success message if any
    const existingMessage = card.querySelector('.download-success');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    const successMessage = document.createElement('div');
    successMessage.className = 'download-success';
    successMessage.setAttribute('role', 'status');
    successMessage.setAttribute('aria-live', 'polite');
    successMessage.innerHTML = `
      <span class="success-icon">✓</span>
      <span>${title} downloaded successfully!</span>
    `;
    
    card.appendChild(successMessage);
    
    // Remove message after 3 seconds
    setTimeout(() => {
      successMessage.style.opacity = '0';
      successMessage.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        successMessage.remove();
      }, 300);
    }, 3000);
  }
  
  return {
    init: init
  };
})();

// ============================================
// UTILITY MODULES
// ============================================

const Utils = (function() {
  'use strict';
  
  /**
   * Update copyright year
   */
  function updateCopyrightYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }
  
  /**
   * Initialize back to top button
   */
  function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    
    const toggleButton = throttle(() => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, 100);
    
    window.addEventListener('scroll', toggleButton, { passive: true });
    toggleButton(); // Initial call
    
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  /**
   * Initialize all utilities
   */
  function init() {
    updateCopyrightYear();
    initBackToTop();
  }
  
  return {
    init: init
  };
})();

// ============================================
// MAIN INITIALIZATION
// ============================================

/**
 * Initialize all modules when DOM is ready
 */
function init() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }
  
  // Initialize all modules
  Navigation.init();
  Accordion.init();
  Carousel.init();
  FormValidation.init();
  Animations.init();
  ResourceDownload.init();
  Utils.init();
}

// Start initialization
init();
