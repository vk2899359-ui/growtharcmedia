// GrowthArc Media (growtharcmedia.in) Master Interaction & Motion Controller

document.addEventListener('DOMContentLoaded', () => {
  initPageEntrance();
  initVideoFallbacks();
  initHeaderBehavior();
  initHeroMediaZoom();
  initMarqueeScrollMotion();
  initPinnedPortfolioSequence();
  initStickyServicePanels();
  initEnquiryModal();
  initMobileDrawer();
  initScrollToTop();
  initMagneticButtons();
});

// Reset page state on pageshow (ensures back/forward navigation never locks up)
window.addEventListener('pageshow', () => {
  document.body.style.opacity = '1';
});

/* 1. Smooth Page Entrance & Reliable Navigation */
function initPageEntrance() {
  document.body.style.opacity = '1';
}

/* 2. Video Fail-Safe Fallback Controller */
function initVideoFallbacks() {
  const videos = document.querySelectorAll('video');

  videos.forEach(video => {
    // Attempt playback safely
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay prevented or error occurring — show poster
        if (video.poster) {
          video.style.backgroundImage = `url('${video.poster}')`;
        }
      });
    }

    video.addEventListener('error', () => {
      if (video.poster) {
        const posterImg = document.createElement('img');
        posterImg.src = video.poster;
        posterImg.alt = 'GrowthArc Media Reel';
        posterImg.className = 'video-fallback-img';
        if (video.parentNode) {
          video.parentNode.replaceChild(posterImg, video);
        }
      }
    });
  });
}

/* 3. Header Behavior & Scroll Background */
function initHeaderBehavior() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* 4. Hero Video Expansion on Scroll (Strict Controlled Scale: 0.98 -> 1.00 -> 1.01 MAX) */
function initHeroMediaZoom() {
  const heroStage = document.getElementById('heroVideoStage');
  const videoFrame = heroStage ? heroStage.querySelector('.hero-video-frame') : null;
  const videoPlayer = videoFrame ? videoFrame.querySelector('video') : null;

  if (!heroStage || !videoFrame) return;

  window.addEventListener('scroll', () => {
    const rect = heroStage.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight && rect.bottom > 0) {
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
      // Controlled clamp scale: 0.98 to 1.01 MAX (1-2% max change, layout remains completely stable)
      const scale = 0.98 + progress * 0.02;
      videoFrame.style.transform = `scale(${scale})`;

      // Subtle inner Y-parallax (movement inside container without container growth)
      if (videoPlayer) {
        const translateY = (progress - 0.5) * 15;
        videoPlayer.style.transform = `translateY(${translateY}px)`;
      }
    }
  }, { passive: true });
}

/* 4. Marquee Velocity Scroll Motion */
function initMarqueeScrollMotion() {
  const marqueeTrack = document.getElementById('workMarqueeTrack');
  if (!marqueeTrack) return;

  let currentTranslate = 0;
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // Shift marquee relative to scroll delta
    currentTranslate -= delta * 0.4;
    
    // Loop bounds
    if (currentTranslate < -1000) currentTranslate = 0;
    if (currentTranslate > 0) currentTranslate = -1000;

    marqueeTrack.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
  }, { passive: true });
}

/* 5. PINNED PORTFOLIO SCROLL SEQUENCE (300vh Pinned Viewport) */
function initPinnedPortfolioSequence() {
  const sequenceSection = document.getElementById('pinnedPortfolioSection');
  if (!sequenceSection) return;

  const slides = sequenceSection.querySelectorAll('.portfolio-slide');
  const counterEl = sequenceSection.querySelector('.sequence-counter');
  const progressBar = sequenceSection.querySelector('.sequence-progress-inner');
  const countTotal = slides.length;

  if (!slides.length) return;

  window.addEventListener('scroll', () => {
    const rect = sequenceSection.getBoundingClientRect();
    const totalHeight = sequenceSection.offsetHeight - window.innerHeight;
    
    if (totalHeight <= 0) return;

    // Relative progress through the pinned section (0 to 1)
    const scrollProgress = Math.max(0, Math.min(1, -rect.top / totalHeight));

    // Determine active index
    const rawIndex = scrollProgress * countTotal;
    const activeIndex = Math.min(countTotal - 1, Math.floor(rawIndex));

    if (progressBar) {
      progressBar.style.width = `${scrollProgress * 100}%`;
    }

    if (counterEl) {
      counterEl.textContent = `0${activeIndex + 1} / 0${countTotal}`;
    }

    slides.forEach((slide, idx) => {
      const slideProgress = rawIndex - idx;

      if (idx === activeIndex) {
        // Active slide scaling in
        slide.style.opacity = '1';
        slide.style.transform = 'scale(1) translateY(0)';
        slide.style.pointerEvents = 'all';
        slide.classList.add('active');
      } else if (idx < activeIndex) {
        // Past slide sliding out
        slide.style.opacity = '0';
        slide.style.transform = 'scale(0.88) translateY(-40px)';
        slide.style.pointerEvents = 'none';
        slide.classList.remove('active');
      } else {
        // Future slide waiting below
        slide.style.opacity = '0';
        slide.style.transform = 'scale(0.92) translateY(60px)';
        slide.style.pointerEvents = 'none';
        slide.classList.remove('active');
      }
    });
  }, { passive: true });
}

/* 6. Sticky Service Panels Transitions */
function initStickyServicePanels() {
  const serviceRows = document.querySelectorAll('.service-panel-row');
  if (!serviceRows.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.25 });

  serviceRows.forEach(row => observer.observe(row));
}

/* 7. Interactive Lead Enquiry Modal */
function initEnquiryModal() {
  const modal = document.getElementById('enquiryModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const openBtns = document.querySelectorAll('.open-modal-btn');
  const serviceInput = document.getElementById('selectedServiceInput');
  const form = document.getElementById('enquiryForm');
  const successMsg = document.getElementById('formSuccessMessage');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service') || 'General Strategy Inquiry';
      if (serviceInput) serviceInput.value = service;
      
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      if (form) form.style.display = 'flex';
      if (successMsg) successMsg.classList.add('hidden');
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.style.display = 'none';
      if (successMsg) successMsg.classList.remove('hidden');

      setTimeout(() => {
        closeModal();
        form.reset();
      }, 3500);
    });
  }
}

/* 8. Mobile Navigation Drawer */
function initMobileDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const closeBtn = document.getElementById('mobileMenuClose');
  const links = document.querySelectorAll('.mobile-link');

  if (!drawer) return;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  const closeDrawer = () => {
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  links.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* 9. Scroll To Top Button */
function initScrollToTop() {
  const topBtn = document.getElementById('scrollTopBtn');
  if (!topBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      topBtn.style.opacity = '1';
      topBtn.style.pointerEvents = 'all';
    } else {
      topBtn.style.opacity = '0';
      topBtn.style.pointerEvents = 'none';
    }
  }, { passive: true });

  topBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* 10. Magnetic Button Hover Effects */
function initMagneticButtons() {
  const btns = document.querySelectorAll('.btn-cta, .fab-btn');

  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
    });
  });
}
