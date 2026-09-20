/**
 * Audio Controller for Gukki's Birthday Surprise
 * - Song: "Thozhi" from Hey Sinamika
 * - Path: assets/music/thozhi.mp3
 * - One persistent audio instance
 * - Plays smoothly after user interaction ("Open" or "Start")
 * - Gentle volume fade-in to 30%
 * - Interactive Music On / Off toggle with animated visualizer
 * - Completely silent and error-free if audio is missing or unsupported
 */

class SurpriseAudioController {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.targetVolume = 0.30; // 30% as requested
    this.fadeInterval = null;
    this.toggleBtn = document.getElementById('musicToggleBtn');
    this.musicLabel = document.getElementById('musicLabel');
    this.visualizerBars = document.querySelectorAll('.music-visualizer .bar');

    this.initAudio();
    this.bindEvents();
  }

  initAudio() {
    try {
      this.audio = new Audio();
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.audio.volume = 0; // Starts at 0 for gentle fade-in

      // Primary source: mp3
      const sourceMp3 = document.createElement('source');
      sourceMp3.src = '/assets/music/thozhi.mp3';
      sourceMp3.type = 'audio/mpeg';

      this.audio.appendChild(sourceMp3);

      // Error handler to prevent broken experience
      this.audio.addEventListener('error', (e) => {
        // Silently handle missing audio without breaking UI
        this.updateVisualizer(false);
      });
    } catch (err) {
      this.audio = null;
    }
  }

  bindEvents() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }
  }

  /**
   * Start playback after user interaction
   */
  start() {
    if (!this.audio || this.isPlaying) return;

    // Attempt playback
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.fadeIn(this.targetVolume, 2500); // 2.5s gentle volume ramp
          this.updateVisualizer(true);
        })
        .catch(() => {
          // Autoplay policy or missing audio: silent degrade
          this.isPlaying = false;
          this.updateVisualizer(false);
        });
    }
  }

  /**
   * Toggle music pause/play
   */
  toggle() {
    if (!this.audio) return;

    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (!this.audio) return;
    this.audio
      .play()
      .then(() => {
        this.isPlaying = true;
        this.fadeIn(this.targetVolume, 1000);
        this.updateVisualizer(true);
      })
      .catch(() => {
        this.isPlaying = false;
        this.updateVisualizer(false);
      });
  }

  pause() {
    if (!this.audio) return;
    this.fadeOut(() => {
      this.audio.pause();
      this.isPlaying = false;
      this.updateVisualizer(false);
    });
  }

  fadeIn(targetVol, duration = 1500) {
    if (!this.audio) return;
    clearInterval(this.fadeInterval);
    const stepTime = 50;
    const stepCount = duration / stepTime;
    const volIncrement = targetVol / stepCount;

    this.fadeInterval = setInterval(() => {
      if (this.audio.volume + volIncrement < targetVol) {
        this.audio.volume = Math.min(1, this.audio.volume + volIncrement);
      } else {
        this.audio.volume = targetVol;
        clearInterval(this.fadeInterval);
      }
    }, stepTime);
  }

  fadeOut(callback, duration = 600) {
    if (!this.audio) {
      if (callback) callback();
      return;
    }
    clearInterval(this.fadeInterval);
    const stepTime = 40;
    const stepCount = duration / stepTime;
    const volDecrement = this.audio.volume / stepCount;

    this.fadeInterval = setInterval(() => {
      if (this.audio.volume - volDecrement > 0.02) {
        this.audio.volume = Math.max(0, this.audio.volume - volDecrement);
      } else {
        this.audio.volume = 0;
        clearInterval(this.fadeInterval);
        if (callback) callback();
      }
    }, stepTime);
  }

  updateVisualizer(active) {
    if (this.toggleBtn) {
      if (active) {
        this.toggleBtn.classList.add('playing');
        this.toggleBtn.setAttribute('aria-label', 'Music is playing. Tap to mute.');
        if (this.musicLabel) this.musicLabel.textContent = 'Music On';
      } else {
        this.toggleBtn.classList.remove('playing');
        this.toggleBtn.setAttribute('aria-label', 'Music is muted. Tap to play.');
        if (this.musicLabel) this.musicLabel.textContent = 'Music Off';
      }
    }
  }
}

// Instantiate globally when DOM is ready
window.audioController = null;
document.addEventListener('DOMContentLoaded', () => {
  window.audioController = new SurpriseAudioController();
});
