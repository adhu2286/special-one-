/**
 * Gukki's Birthday Surprise - Main Application Controller
 * Handles scenes, transitions, photo gallery, adventure timeline, envelope opening,
 * keyboard/touch navigation, and celebration effects.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State — start at -1 so goToScene(0) properly activates Scene 1
  let currentSceneIndex = -1;
  const scenes = Array.from(document.querySelectorAll('.scene'));
  const totalScenes = scenes.length;
  const progressBar = document.getElementById('sceneProgressBar');
  const chapterNumber = document.getElementById('chapterNumber');

  // Photo gallery state
  let currentPhotoIndex = 0;
  const photos = Array.from(document.querySelectorAll('.polaroid-card'));
  const totalPhotos = photos.length;
  const photoPrevBtn = document.getElementById('photoPrevBtn');
  const photoNextBtn = document.getElementById('photoNextBtn');
  const photoDots = document.querySelectorAll('.photo-dot');
  const photoEndingText = document.getElementById('photoEndingText');
  const photoAdvanceBtn = document.getElementById('photoAdvanceBtn');

  // Adventure timeline state
  let activeStopIndex = 0;
  const stops = Array.from(document.querySelectorAll('.adventure-stop'));

  // Envelope state
  let isEnvelopeOpen = false;

  // --- Scene Navigation ---
  function goToScene(index) {
    if (index < 0 || index >= totalScenes) return;

    const previousIndex = currentSceneIndex;
    currentSceneIndex = index;

    scenes.forEach((scene, i) => {
      if (i === index) {
        scene.classList.remove('leaving');
        scene.classList.add('active');
      } else if (i === previousIndex && previousIndex !== index) {
        scene.classList.remove('active');
        scene.classList.add('leaving');
        setTimeout(() => {
          scene.classList.remove('leaving');
        }, 600);
      } else {
        scene.classList.remove('active', 'leaving');
      }
    });

    updateSceneIndicators();

    // Trigger scene-specific reveals
    onSceneEnter(index);

    // Scroll smoothly to top of active scene
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextScene() {
    if (currentSceneIndex < totalScenes - 1) {
      goToScene(currentSceneIndex + 1);
    }
  }

  function prevScene() {
    if (currentSceneIndex > 0) {
      goToScene(currentSceneIndex - 1);
    }
  }

  function updateSceneIndicators() {
    if (progressBar) {
      const progressPercent = ((currentSceneIndex + 1) / totalScenes) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }
    if (chapterNumber) {
      chapterNumber.textContent = `${currentSceneIndex + 1} / ${totalScenes}`;
    }

    // Hide progress indicators on initial mystery scene
    const navHeader = document.querySelector('.top-nav-bar');
    if (navHeader) {
      if (currentSceneIndex === 0) {
        navHeader.classList.add('hidden-on-scene-1');
      } else {
        navHeader.classList.remove('hidden-on-scene-1');
      }
    }
  }

  // --- Scene-Specific Logic ---
  function onSceneEnter(index) {
    // Scene 2: Birthday reveal animations
    if (index === 1) {
      createConfettiStardust();
    }

    // Scene 5: Reset and trigger adventure stops
    if (index === 4) {
      revealAdventureStops();
    }

    // Scene 6: Refresh active photo
    if (index === 5) {
      updatePhotoViewer();
    }

    // Scene 8: Reset envelope if re-entered
    if (index === 7 && !isEnvelopeOpen) {
      // ready to open
    }
  }

  // --- Adventure Stops Controller ---
  function revealAdventureStops() {
    stops.forEach((stop, idx) => {
      stop.classList.remove('active', 'revealed');
      setTimeout(() => {
        stop.classList.add('revealed');
        if (idx === 0) stop.classList.add('active');
      }, (idx + 1) * 350);
    });

    // Make stops interactive
    stops.forEach((stop, idx) => {
      stop.onclick = () => {
        stops.forEach((s) => s.classList.remove('active'));
        stop.classList.add('active');
        activeStopIndex = idx;
      };
    });
  }

  // --- Photo Gallery Logic (Strict Polaroid Presentation) ---
  function updatePhotoViewer() {
    photos.forEach((card, idx) => {
      if (idx === currentPhotoIndex) {
        card.classList.add('active');
        card.setAttribute('aria-hidden', 'false');
      } else {
        card.classList.remove('active');
        card.setAttribute('aria-hidden', 'true');
      }
    });

    // Update dots
    photoDots.forEach((dot, idx) => {
      if (idx === currentPhotoIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update button states
    if (photoPrevBtn) {
      photoPrevBtn.style.opacity = currentPhotoIndex === 0 ? '0.4' : '1';
      photoPrevBtn.style.pointerEvents = currentPhotoIndex === 0 ? 'none' : 'auto';
    }

    // Once user reaches the 3rd photo, reveal reflection
    if (currentPhotoIndex === totalPhotos - 1) {
      if (photoEndingText) photoEndingText.classList.add('visible');
      if (photoAdvanceBtn) photoAdvanceBtn.classList.add('visible');
    }
  }

  if (photoNextBtn) {
    photoNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentPhotoIndex < totalPhotos - 1) {
        currentPhotoIndex++;
        updatePhotoViewer();
      }
    });
  }

  if (photoPrevBtn) {
    photoPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
        updatePhotoViewer();
      }
    });
  }

  // Dot clicks
  photoDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      currentPhotoIndex = idx;
      updatePhotoViewer();
    });
  });

  // Tap on photo card to advance
  photos.forEach((photoCard) => {
    photoCard.addEventListener('click', () => {
      if (currentPhotoIndex < totalPhotos - 1) {
        currentPhotoIndex++;
        updatePhotoViewer();
      }
    });
  });

  // --- Envelope & Letter Mechanics (Scene 8) ---
  const envelopeContainer = document.getElementById('envelopeContainer');
  const openLetterBtn = document.getElementById('openLetterBtn');
  const letterLetterSheet = document.getElementById('letterSheet');
  const letterAdvanceBtn = document.getElementById('letterAdvanceBtn');

  if (openLetterBtn && envelopeContainer) {
    openLetterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isEnvelopeOpen) return;

      isEnvelopeOpen = true;
      openLetterBtn.style.opacity = '0';
      openLetterBtn.style.pointerEvents = 'none';

      envelopeContainer.classList.add('open');

      // Reveal paper sliding out
      setTimeout(() => {
        if (letterLetterSheet) {
          letterLetterSheet.classList.add('unfolded');
          // Auto smooth scroll down to letter text
          setTimeout(() => {
            letterLetterSheet.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 600);
        }
        if (letterAdvanceBtn) {
          setTimeout(() => {
            letterAdvanceBtn.classList.add('visible');
          }, 1800);
        }
      }, 700);
    });
  }

  // --- Button Navigation Bindings ---
  // Scene 1: "Open"
  const openSecretBtn = document.getElementById('openSecretBtn');
  if (openSecretBtn) {
    openSecretBtn.addEventListener('click', () => {
      if (window.audioController) {
        window.audioController.start();
      }
      nextScene();
    });
  }

  // Scene 2: "Start"
  const startJourneyBtn = document.getElementById('startJourneyBtn');
  if (startJourneyBtn) {
    startJourneyBtn.addEventListener('click', () => {
      if (window.audioController) {
        window.audioController.start();
      }
      nextScene();
    });
  }

  // Scene 3: "Continue"
  const noteContinueBtn = document.getElementById('noteContinueBtn');
  if (noteContinueBtn) {
    noteContinueBtn.addEventListener('click', nextScene);
  }

  // Scene 4: "Our Adventure →"
  const metContinueBtn = document.getElementById('metContinueBtn');
  if (metContinueBtn) {
    metContinueBtn.addEventListener('click', nextScene);
  }

  // Scene 5: "Our Memories →"
  const adventureContinueBtn = document.getElementById('adventureContinueBtn');
  if (adventureContinueBtn) {
    adventureContinueBtn.addEventListener('click', nextScene);
  }

  // Scene 6: "Why You're Special →"
  if (photoAdvanceBtn) {
    photoAdvanceBtn.addEventListener('click', nextScene);
  }

  // Scene 7: "Read Adii's Letter →"
  const specialAdvanceBtn = document.getElementById('specialAdvanceBtn');
  if (specialAdvanceBtn) {
    specialAdvanceBtn.addEventListener('click', nextScene);
  }

  // Scene 8: "Final Note 💜"
  if (letterAdvanceBtn) {
    letterAdvanceBtn.addEventListener('click', nextScene);
  }

  // Scene 9: "Replay Experience ↺"
  const replayBtn = document.getElementById('replayBtn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      // Reset states
      currentPhotoIndex = 0;
      isEnvelopeOpen = false;
      if (openLetterBtn) {
        openLetterBtn.style.opacity = '1';
        openLetterBtn.style.pointerEvents = 'auto';
      }
      if (envelopeContainer) envelopeContainer.classList.remove('open');
      if (letterLetterSheet) letterLetterSheet.classList.remove('unfolded');
      if (photoEndingText) photoEndingText.classList.remove('visible');
      if (photoAdvanceBtn) photoAdvanceBtn.classList.remove('visible');

      goToScene(0);
    });
  }

  // --- Keyboard & Touch Gestures ---
  window.addEventListener('keydown', (e) => {
    // Only allow keyboard arrow navigation if not on letter scene or text input
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      if (currentSceneIndex !== 5) {
        // Not in photo scene (allow next)
        nextScene();
      } else if (currentPhotoIndex < totalPhotos - 1) {
        currentPhotoIndex++;
        updatePhotoViewer();
      } else {
        nextScene();
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (currentSceneIndex !== 5) {
        prevScene();
      } else if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
        updatePhotoViewer();
      } else {
        prevScene();
      }
    }
  });

  // Mobile Touch Swipe Handling
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  window.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchend',
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleGesture();
    },
    { passive: true }
  );

  function handleGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Horizontal swipe on photo gallery
    if (currentSceneIndex === 5 && Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0 && currentPhotoIndex < totalPhotos - 1) {
        currentPhotoIndex++;
        updatePhotoViewer();
      } else if (deltaX > 0 && currentPhotoIndex > 0) {
        currentPhotoIndex--;
        updatePhotoViewer();
      }
    }
  }

  // --- Subtle Stardust Celebration Effect for Scene 2 ---
  function createConfettiStardust() {
    const burstContainer = document.getElementById('celebrationBurst');
    if (!burstContainer) return;
    burstContainer.innerHTML = '';

    const count = 35;
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'stardust-sparkle';
      const angle = (Math.PI * 2 * i) / count;
      const distance = 80 + Math.random() * 120;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const delay = Math.random() * 0.3;
      const duration = 1.2 + Math.random() * 0.8;

      sparkle.style.setProperty('--tx', `${tx}px`);
      sparkle.style.setProperty('--ty', `${ty}px`);
      sparkle.style.animationDelay = `${delay}s`;
      sparkle.style.animationDuration = `${duration}s`;

      burstContainer.appendChild(sparkle);
    }
  }

  // --- Initialize First Scene ---
  // Remove the 'active' class from all scenes first, then call goToScene(0)
  scenes.forEach(s => s.classList.remove('active', 'leaving'));
  goToScene(0);
});
