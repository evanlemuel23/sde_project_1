/* ============================================================
   CAMBRIDGE INSTITUTE OF TECHNOLOGY - MAIN JAVASCRIPT
   Vanilla ES6+ - No dependencies
   ============================================================ */

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Debounce function to limit event firing
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function for performance
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Get current page name from URL
 */
function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.split("/").pop() || "index.html";
  return page;
}

/**
 * Animate count-up numbers
 */
function animateCountUp(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
}

// ============================================================
// CUSTOM CURSOR GLOW EFFECT
// ============================================================

class CustomCursor {
  constructor() {
    this.cursorEl = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.init();
  }

  init() {
    // Create cursor element with text
    this.cursorEl = document.createElement("div");
    this.cursorEl.classList.add("custom-cursor");
    this.cursorEl.textContent = "CiT";

    document.body.appendChild(this.cursorEl);

    // Enable only on non-mobile devices
    if (!this.isMobileDevice()) {
      document.body.classList.add("cursor-enabled");
    }

    // Event listeners
    document.addEventListener("mousemove", (e) => this.onMouseMove(e));
    document.addEventListener("mousedown", () => this.onClick());
    document.addEventListener("mouseup", () => this.onMouseUp());
  }

  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    // Move the custom text cursor
    this.cursorEl.style.left = this.mouseX + "px";
    this.cursorEl.style.top = this.mouseY + "px";
  }

  onClick() {
    // optionally add click effect (scale down)
    this.cursorEl.style.transform = "translate(-50%, -50%) scale(0.8)";
  }

  onMouseUp() {
    this.cursorEl.style.transform = "translate(-50%, -50%) scale(1)";
  }

  // animate method removed; only a simple text cursor follows the mouse
}

// ============================================================
// SCROLL-TRIGGERED ANIMATIONS
// ============================================================

class ScrollAnimator {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    const options = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // For statistics, trigger count-up
          if (entry.target.classList.contains("stat-number")) {
            this.triggerCountUp(entry.target);
          }
        }
      });
    }, options);

    // Observe all animate-on-scroll elements
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      this.observer.observe(el);
    });
  }

  triggerCountUp(element) {
    const target = parseInt(element.dataset.target || element.textContent);
    if (!isNaN(target) && element.dataset.animated !== "true") {
      element.dataset.animated = "true";
      animateCountUp(element, target);
    }
  }

  observe(element) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }
}

// ============================================================
// PARTICLE SYSTEM (Canvas-based)
// ============================================================

class ParticleSystem {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.animationId = null;
    this.resize();
    this.init();
  }

  init() {
    window.addEventListener("resize", () => this.resize());
    // Create initial particles
    this.createParticles(30);
    this.animate();
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  createParticles(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;

      // Draw particle
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fillStyle = "#00509e";
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.globalAlpha = 1;

    // Connect nearby particles
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          this.ctx.globalAlpha = distance / 500;
          this.ctx.strokeStyle = "#00509e";
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
          this.ctx.globalAlpha = 1;
        }
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// ============================================================
// CAROUSEL DRAG SCROLL
// ============================================================

class Carousel {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.isDragging = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.init();
  }

  init() {
    this.container.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.container.addEventListener("mouseleave", () => this.onMouseLeave());
    this.container.addEventListener("mouseup", () => this.onMouseUp());
    this.container.addEventListener("mousemove", (e) => this.onMouseMove(e));

    // Touch support
    this.container.addEventListener("touchstart", (e) => this.onTouchStart(e));
    this.container.addEventListener("touchend", () => this.onMouseUp());
    this.container.addEventListener("touchmove", (e) => this.onTouchMove(e));
  }

  onMouseDown(e) {
    this.isDragging = true;
    this.startX = e.pageX - this.container.offsetLeft;
    this.scrollLeft = this.container.scrollLeft;
    this.container.style.cursor = "grabbing";
  }

  onMouseLeave() {
    this.isDragging = false;
    this.container.style.cursor = "grab";
  }

  onMouseUp() {
    this.isDragging = false;
    this.container.style.cursor = "grab";
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    const x = e.pageX - this.container.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.container.scrollLeft = this.scrollLeft - walk;
  }

  onTouchStart(e) {
    this.isDragging = true;
    this.startX = e.touches[0].pageX - this.container.offsetLeft;
    this.scrollLeft = this.container.scrollLeft;
  }

  onTouchMove(e) {
    if (!this.isDragging) return;
    const x = e.touches[0].pageX - this.container.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.container.scrollLeft = this.scrollLeft - walk;
  }
}

// ============================================================
// NAVIGATION MANAGEMENT
// ============================================================

class Navigation {
  constructor() {
    this.hamburger = document.querySelector(".hamburger");
    this.navMenu = document.querySelector(".navbar-nav");
    this.navLinks = document.querySelectorAll(".nav-link");
    this.init();
  }

  init() {
    // Hamburger menu toggle
    if (this.hamburger) {
      this.hamburger.addEventListener("click", () => this.toggleMenu());
    }

    // Close menu on link click
    this.navLinks.forEach((link) => {
      link.addEventListener("click", () => this.closeMenu());
      // Set active state based on current page
      const currentPage = getCurrentPage();
      const href = link.getAttribute("href");
      if (
        (currentPage === "index.html" && href === "index.html") ||
        (href === currentPage)
      ) {
        this.removeActiveState();
        link.classList.add("active");
      }
    });
  }

  toggleMenu() {
    this.hamburger.classList.toggle("active");
    this.navMenu.classList.toggle("active");
  }

  closeMenu() {
    this.hamburger.classList.remove("active");
    this.navMenu.classList.remove("active");
  }

  removeActiveState() {
    this.navLinks.forEach((link) => link.classList.remove("active"));
  }
}

// ============================================================
// MAGNETIC BUTTON EFFECT
// ============================================================

class MagneticButton {
  constructor(buttonSelector) {
    this.buttons = document.querySelectorAll(buttonSelector);
    this.init();
  }

  init() {
    this.buttons.forEach((button) => {
      button.addEventListener("mousemove", (e) => this.onMouseMove(e, button));
      button.addEventListener("mouseleave", (e) => this.onMouseLeave(e, button));
    });
  }

  onMouseMove(e, button) {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = rect.width / 2;

    if (distance < maxDistance) {
      const strength = 1 - distance / maxDistance;
      button.style.transform = `translate(${x * strength * 0.2}px, ${
        y * strength * 0.2
      }px)`;
    }
  }

  onMouseLeave(e, button) {
    button.style.transform = "translate(0, 0)";
  }
}

// ============================================================
// PAGE TRANSITION HANDLER
// ============================================================

class PageLoader {
  constructor() {
    this.init();
  }

  init() {
    // Handle all navigation links
    document.querySelectorAll('a[href$=".html"]').forEach((link) => {
      link.addEventListener("click", (e) => this.handleNavigation(e, link));
    });
  }

  handleNavigation(e, link) {
    const href = link.getAttribute("href");

    // Don't prevent default for external links or current page
    if (
      href.startsWith("http") ||
      href === getCurrentPage() ||
      href.startsWith("#")
    ) {
      return;
    }

    e.preventDefault();

    // Fade out current page
    document.body.classList.add("page-fade-out");

    // Wait for fade out, then navigate
    setTimeout(() => {
      window.location.href = href;
    }, 300);
  }
}

// ============================================================
// MARQUEE AUTO-SCROLL
// ============================================================

class Marquee {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    // Clone items for seamless loop
    const items = this.container.innerHTML;
    this.container.innerHTML = items + items;
  }
}

// ============================================================
// SCROLL PARALLAX EFFECT
// ============================================================

class Parallax {
  constructor() {
    this.elements = document.querySelectorAll("[data-parallax]");
    if (this.elements.length === 0) return;

    window.addEventListener("scroll", () => this.onScroll());
  }

  onScroll() {
    const scrolled = window.pageYOffset;

    this.elements.forEach((element) => {
      const speed = element.dataset.parallax || 0.5;
      element.style.backgroundPosition = `center ${scrolled * speed}px`;
    });
  }
}

// ============================================================
// SMOOTH SCROLL BEHAVIOR
// ============================================================

class SmoothScroll {
  constructor() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => this.handleScroll(e));
    });
  }

  handleScroll(e) {
    const href = e.currentTarget.getAttribute("href");
    if (href === "#") return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }
}

// ============================================================
// TYPING EFFECT (for hero title)
// ============================================================

class TypingEffect {
  constructor(elementSelector, text, speed = 50) {
    this.element = document.querySelector(elementSelector);
    if (!this.element) return;

    this.text = text || this.element.textContent;
    this.speed = speed;
    this.init();
  }

  init() {
    this.element.textContent = "";
    this.typeText(0);
  }

  typeText(index) {
    if (index < this.text.length) {
      this.element.textContent += this.text[index];
      setTimeout(() => this.typeText(index + 1), this.speed);
    }
  }
}

// ============================================================
// STATS COUNTER ANIMATION
// ============================================================

class StatsCounter {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.stats = this.container.querySelectorAll(".stat-number");
    this.observer = null;
    this.init();
  }

  init() {
    const options = {
      threshold: 0.5,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateStats();
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    this.observer.observe(this.container);
  }

  animateStats() {
    this.stats.forEach((stat) => {
      const target = parseInt(stat.dataset.target) || parseInt(stat.textContent);
      animateCountUp(stat, target);
    });
  }
}

// ============================================================
// FORM HANDLER
// ============================================================

class FormHandler {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    if (!this.form) return;

    this.init();
  }

  init() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  handleSubmit(e) {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    // Log to console (in production, send to server)
    console.log("Form submitted:", data);

    // Show success message
    const successMsg = document.createElement("div");
    successMsg.textContent = "Form submitted successfully!";
    successMsg.style.cssText = `
      padding: 1rem;
      background: #00509e;
      color: #001f3f;
      border-radius: 8px;
      margin-top: 1rem;
      text-align: center;
      font-weight: bold;
    `;

    this.form.appendChild(successMsg);

    // Reset form
    this.form.reset();

    // Remove message after 3 seconds
    setTimeout(() => successMsg.remove(), 3000);
  }
}

// ============================================================
// MODAL HANDLER
// ============================================================

class Modal {
  constructor(triggerSelector, modalSelector) {
    this.trigger = document.querySelector(triggerSelector);
    this.modal = document.querySelector(modalSelector);
    if (!this.trigger || !this.modal) return;

    this.init();
  }

  init() {
    this.trigger.addEventListener("click", () => this.open());

    // Close on background click
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  open() {
    this.modal.style.display = "flex";
    this.modal.classList.add("visible");
  }

  close() {
    this.modal.classList.remove("visible");
    setTimeout(() => {
      this.modal.style.display = "none";
    }, 300);
  }
}

// ============================================================
// INITIALIZATION - DOCUMENT READY
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("Cambridge Institute of Technology - Website Loading");

  // Initialize custom cursor
  new CustomCursor();

  // Initialize scroll animations
  new ScrollAnimator();

  // Initialize particle system (on hero pages)
  const heroCanvas = document.querySelector(".hero-canvas");
  if (heroCanvas) {
    new ParticleSystem(heroCanvas);
  }

  // Initialize carousels
  new Carousel(".carousel-container");
  new Carousel(".testimonials-container");

  // Initialize navigation
  new Navigation();

  // Initialize magnetic buttons
  new MagneticButton(".btn");

  // Initialize page loader
  new PageLoader();

  // Initialize marquee
  new Marquee(".marquee-container");

  // Initialize parallax
  new Parallax();

  // Initialize smooth scroll
  new SmoothScroll();

  // Initialize stats counter
  const heroStats = document.querySelector(".hero-stats");
  if (heroStats) {
    new StatsCounter(".hero-stats");
  }

  // Initialize forms
  document.querySelectorAll("form").forEach((form) => {
    new FormHandler(form);
  });

  // Page transition animation
  document.body.classList.add("page-transitioning");
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  // Destroy particle systems if they exist
  document.querySelectorAll("canvas").forEach((canvas) => {
    if (canvas.particleSystem) {
      canvas.particleSystem.destroy();
    }
  });
});

// ============================================================
// PERFORMANCE OPTIMIZATION - Prevent layout thrashing
// ============================================================

// Batch DOM reads and writes
const batchDOMUpdates = () => {
  requestAnimationFrame(() => {
    // All DOM updates happen here
  });
};

// Lazy load images
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add("loaded");
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}
