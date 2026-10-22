/* ============================================================
   PROVIEW — MULTI-PAGE APPLICATION CONTROLLER
   Fast-loading, clean architecture for:
     - index.html     (Overview)
     - operator.html  (Project Operator Page: Left Sidebar + Right Preview + Live FOH/BOH Menu)
     - foh.html       (Front of House Output Window — Fullscreenable)
     - stage.html     (Back of House / BOH Stage Output — No Background, Shows Next Lyric & Time)
     - admin.html     (Admin Page — Preparation Hub)
     - features.html  (Features, Comparison & Smart Reflow Demo)
     - scripture.html (Instant Scripture Engine)
     - media.html     (Media Library)
     - account.html   (Free Sanctuary Account)
============================================================ */

(function applySavedThemeImmediately() {
  const savedTheme = localStorage.getItem("proview_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
})();

const ProViewApp = {
  churchProfile: null,
  backgrounds: [],
  songs: [],
  scriptureLibrary: [],
  services: [],
  uploadedFiles: [],

  // Admin selection state
  selectedServiceId: "service-sunday-morning",
  selectedSongId: "song-10000-reasons",

  // Operator & Live Output state (synced across Operator, FOH, and BOH)
  operatorServiceId: "service-sunday-morning",
  operatorActiveItemId: "item-sermon-series",
  operatorActiveSlideIndex: 0,
  displayOverride: "none", // "none" | "blackout" | "clear-text"
  operatorMicroOverrides: {}, // { [slideId]: { text } }
  editingSlideId: null,

  // Video playback state for singular video items (synced to FOH)
  videoPlaying: false,
  videoCurrentTime: 0,
  videoDuration: 180,
  videoInterval: null,

  // BOH Stage Timer
  stageTimerSeconds: 2100, // 35:00
  stageTimerRunning: false,
  stageTimerInterval: null,

  broadcastChannel: null,

  init() {
    const def = window.PROVIEW_DEFAULTS;

    // Ensure localStorage schema upgrades cleanly if default data version changed
    const storedVersion = localStorage.getItem("proview_data_version");
    if (storedVersion !== def.DataVersion) {
      localStorage.setItem("proview_data_version", def.DataVersion);
      localStorage.setItem("proview_master_services", JSON.stringify(def.services));
      localStorage.setItem("proview_master_songs", JSON.stringify(def.songs));
    }

    this.churchProfile = JSON.parse(localStorage.getItem("proview_profile") || "null") || { ...def.churchProfile };
    this.backgrounds = [...def.backgrounds];
    this.scriptureLibrary = [...def.scriptureLibrary];

    const savedSongs = JSON.parse(localStorage.getItem("proview_master_songs") || "null");
    this.songs = savedSongs && savedSongs.length ? savedSongs : JSON.parse(JSON.stringify(def.songs));

    const savedServices = JSON.parse(localStorage.getItem("proview_master_services") || "null");
    this.services = savedServices && savedServices.length ? savedServices : JSON.parse(JSON.stringify(def.services));

    this.loadLiveOperatorState();

    // Cross-window sync for FOH and BOH displays
    if ("BroadcastChannel" in window) {
      this.broadcastChannel = new BroadcastChannel("proview_stage_sync");
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === "SYNC_STATE") {
          this.applyRemoteSync(event.data.payload);
        }
      };
    }

    window.addEventListener("storage", (e) => {
      if (e.key === "proview_live_operator_state" && e.newValue) {
        try {
          this.applyRemoteSync(JSON.parse(e.newValue));
        } catch (_) {}
      } else if (e.key === "proview_master_services" && e.newValue) {
        try {
          this.services = JSON.parse(e.newValue);
          this.renderCurrentPage();
        } catch (_) {}
      } else if (e.key === "proview_theme") {
        this.updateThemeUI();
      }
    });

    // Close Live dropdown when clicking outside
    document.addEventListener("click", (e) => {
      const menu = document.getElementById("live-dropdown-menu");
      const wrapper = document.getElementById("live-menu-wrapper");
      if (menu && wrapper && !wrapper.contains(e.target)) {
        menu.classList.remove("open");
      }
    });

    window.addEventListener("keydown", (e) => this.handleGlobalKeydown(e));

    // Clock tick
    setInterval(() => this.updateClocks(), 1000);
    this.updateClocks();

    this.updateThemeUI();
    this.renderCurrentPage();
    this.updateAuthUI();

    // Non-blocking background cloud sync after page has already rendered
    setTimeout(() => this.syncWithBreadBackend(), 80);
  },

  renderCurrentPage() {
    this.renderLandingReflowDemo();
    this.renderAdminServicesTab();
    this.renderAdminSongsTab();
    this.renderAdminScriptureTab();
    this.renderAdminMediaTab();
    this.renderAdminSettingsTab();
    this.renderOperatorWorkspace();
    this.renderFOHScreen();
    this.renderBOHScreen();
    this.renderAccountPageProfile();
  },

  // ============================================================
  // THEME TOGGLE (LIGHT DEFAULT + DARK OPTION)
  // ============================================================
  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("proview_theme", next);
    this.updateThemeUI();
  },

  updateThemeUI() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    document.documentElement.setAttribute("data-theme", current);
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) {
      btn.innerHTML = current === "dark" ? "☀️ Light" : "🌙 Dark";
    }
  },

  // ============================================================
  // LIVE MENU & FOH / BOH OUTPUT WINDOWS + FULLSCREEN
  // ============================================================
  toggleLiveMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById("live-dropdown-menu");
    if (menu) {
      menu.classList.toggle("open");
    }
  },

  openFOHWindow() {
    this.saveLiveOperatorState();
    this.broadcastStageSync();
    const win = window.open(
      "foh.html",
      "ProView_FOH_Output",
      "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes"
    );
    const menu = document.getElementById("live-dropdown-menu");
    if (menu) menu.classList.remove("open");
    if (!win) {
      window.open("foh.html", "_blank");
    } else {
      this.showToast("Opened FOH Output window. Drag it to your main screen and click Fullscreen.");
    }
  },

  openBOHWindow() {
    this.saveLiveOperatorState();
    this.broadcastStageSync();
    const win = window.open(
      "stage.html",
      "ProView_BOH_Output",
      "width=1200,height=700,menubar=no,toolbar=no,location=no,status=no,resizable=yes"
    );
    const menu = document.getElementById("live-dropdown-menu");
    if (menu) menu.classList.remove("open");
    if (!win) {
      window.open("stage.html", "_blank");
    } else {
      this.showToast("Opened BOH Stage Output window. Drag it to your secondary screen and click Fullscreen.");
    }
  },

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        this.showToast("Fullscreen is ready — use browser fullscreen if restricted by iframe.");
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  },

  // ============================================================
  // PROJECT OPERATOR PAGE (LEFT SIDEBAR + RIGHT PREVIEW)
  // ============================================================
  loadLiveOperatorState() {
    try {
      const saved = JSON.parse(localStorage.getItem("proview_live_operator_state") || "null");
      if (saved) {
        this.operatorServiceId = saved.operatorServiceId || this.operatorServiceId;
        this.operatorActiveItemId = saved.operatorActiveItemId || this.operatorActiveItemId;
        this.operatorActiveSlideIndex = saved.operatorActiveSlideIndex ?? 0;
        this.displayOverride = saved.displayOverride || "none";
        this.operatorMicroOverrides = saved.operatorMicroOverrides || {};
        this.videoPlaying = Boolean(saved.videoPlaying);
        this.videoCurrentTime = Number(saved.videoCurrentTime || 0);
        this.videoDuration = Number(saved.videoDuration || 180);
        this.stageTimerSeconds = Number(saved.stageTimerSeconds || 2100);
      }
    } catch (_) {}
  },

  saveLiveOperatorState() {
    const state = {
      operatorServiceId: this.operatorServiceId,
      operatorActiveItemId: this.operatorActiveItemId,
      operatorActiveSlideIndex: this.operatorActiveSlideIndex,
      displayOverride: this.displayOverride,
      operatorMicroOverrides: this.operatorMicroOverrides,
      videoPlaying: this.videoPlaying,
      videoCurrentTime: this.videoCurrentTime,
      videoDuration: this.videoDuration,
      stageTimerSeconds: this.stageTimerSeconds
    };
    localStorage.setItem("proview_live_operator_state", JSON.stringify(state));
  },

  broadcastStageSync() {
    this.saveLiveOperatorState();
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: "SYNC_STATE",
        payload: {
          operatorServiceId: this.operatorServiceId,
          operatorActiveItemId: this.operatorActiveItemId,
          operatorActiveSlideIndex: this.operatorActiveSlideIndex,
          displayOverride: this.displayOverride,
          operatorMicroOverrides: this.operatorMicroOverrides,
          videoPlaying: this.videoPlaying,
          videoCurrentTime: this.videoCurrentTime,
          videoDuration: this.videoDuration,
          stageTimerSeconds: this.stageTimerSeconds
        }
      });
    }
  },

  applyRemoteSync(payload) {
    if (!payload) return;
    Object.assign(this, payload);
    this.renderOperatorWorkspace();
    this.renderFOHScreen();
    this.renderBOHScreen();
  },

  getActiveOperatorService() {
    return this.services.find(s => s.id === this.operatorServiceId) || this.services[0];
  },

  getActiveOperatorItem() {
    const srv = this.getActiveOperatorService();
    if (!srv || !srv.items.length) return null;
    return srv.items.find(i => i.id === this.operatorActiveItemId) || srv.items[0];
  },

  getActiveOperatorSlide() {
    const item = this.getActiveOperatorItem();
    if (!item || !item.slides || !item.slides.length) return null;
    const idx = Math.max(0, Math.min(this.operatorActiveSlideIndex, item.slides.length - 1));
    return item.slides[idx];
  },

  isSingularItem(item) {
    if (!item) return false;
    return item.type === "video" || item.singular === true || (item.type === "media" && (!item.slides || item.slides.length <= 1));
  },

  // --- Left Sidebar Top: Church Services (Select, Add, Delete) ---
  selectOperatorService(serviceId) {
    this.operatorServiceId = serviceId;
    const srv = this.getActiveOperatorService();
    this.operatorActiveItemId = srv && srv.items[0] ? srv.items[0].id : null;
    this.operatorActiveSlideIndex = 0;
    this.stopVideoLoop();
    this.broadcastStageSync();
    this.renderOperatorWorkspace();
  },

  toggleAddServiceForm() {
    const form = document.getElementById("operator-add-service-form");
    if (form) {
      form.classList.toggle("open");
      const input = document.getElementById("operator-new-service-title");
      if (form.classList.contains("open") && input) input.focus();
    }
  },

  async addOperatorService(event) {
    event.preventDefault();
    const titleInput = document.getElementById("operator-new-service-title");
    const dateInput = document.getElementById("operator-new-service-date");
    const title = titleInput ? titleInput.value.trim() : "";
    if (!title) return;

    const newService = {
      id: "service-" + Date.now(),
      title,
      date: (dateInput && dateInput.value.trim()) || "Sunday Service",
      leadPastor: "Worship Team",
      items: [
        {
          id: "item-welcome-" + Date.now(),
          type: "sermon",
          title: "Welcome & Announcements",
          subtitle: "2 Slides",
          bgId: "bg-sanctuary-amber",
          stageNotes: "Welcome congregation.",
          slides: [
            {
              id: "sl-w1-" + Date.now(),
              label: "Welcome",
              text: `Welcome to ${title}\nWe are glad you are here today!`,
              bgId: "bg-sanctuary-amber",
              fontScale: 100
            },
            {
              id: "sl-w2-" + Date.now(),
              label: "Next Steps",
              text: "Connect with us after service in the Welcome Center.",
              bgId: "bg-sanctuary-amber",
              fontScale: 100
            }
          ]
        }
      ]
    };

    this.services.unshift(newService);
    this.operatorServiceId = newService.id;
    this.operatorActiveItemId = newService.items[0].id;
    this.operatorActiveSlideIndex = 0;

    if (titleInput) titleInput.value = "";
    if (dateInput) dateInput.value = "";
    const form = document.getElementById("operator-add-service-form");
    if (form) form.classList.remove("open");

    this.saveMasterServices();
    this.broadcastStageSync();
    this.renderOperatorWorkspace();
    this.showToast(`Added service "${title}"`);
  },

  deleteOperatorService(serviceId, event) {
    if (event) event.stopPropagation();
    if (this.services.length <= 1) {
      this.showToast("At least one church service must remain.");
      return;
    }
    const target = this.services.find(s => s.id === serviceId);
    this.services = this.services.filter(s => s.id !== serviceId);
    if (this.operatorServiceId === serviceId) {
      this.operatorServiceId = this.services[0].id;
      this.operatorActiveItemId = this.services[0].items[0] ? this.services[0].items[0].id : null;
      this.operatorActiveSlideIndex = 0;
    }
    this.saveMasterServices();
    this.broadcastStageSync();
    this.renderOperatorWorkspace();
    if (target) this.showToast(`Deleted service "${target.title}"`);
  },

  // --- Left Sidebar Bottom: Service Items (Select, Add, Delete) ---
  selectOperatorPlaylistItem(itemId) {
    this.operatorActiveItemId = itemId;
    this.operatorActiveSlideIndex = 0;
    this.editingSlideId = null;

    const item = this.getActiveOperatorItem();
    if (item && item.type === "video") {
      this.videoDuration = item.duration || 180;
      this.videoCurrentTime = 0;
      this.stopVideoLoop();
    } else {
      this.stopVideoLoop();
    }

    this.broadcastStageSync();
    this.renderOperatorWorkspace();
  },

  toggleAddItemForm() {
    const form = document.getElementById("operator-add-item-form");
    if (form) {
      form.classList.toggle("open");
      const input = document.getElementById("operator-new-item-title");
      if (form.classList.contains("open") && input) input.focus();
    }
  },

  addOperatorItem(event) {
    event.preventDefault();
    const srv = this.getActiveOperatorService();
    if (!srv) return;

    const typeEl = document.getElementById("operator-new-item-type");
    const titleEl = document.getElementById("operator-new-item-title");
    const contentEl = document.getElementById("operator-new-item-content");

    const type = (typeEl && typeEl.value) || "sermon";
    const title = (titleEl && titleEl.value.trim()) || "New Service Item";
    const rawContent = (contentEl && contentEl.value.trim()) || title;

    let newItem;
    if (type === "video") {
      newItem = {
        id: "item-vid-" + Date.now(),
        type: "video",
        singular: true,
        title,
        subtitle: "Video • 02:00 Duration",
        duration: 120,
        videoStyle: "countdown",
        bgId: "bg-deep-worship",
        stageNotes: `Video playing: ${title}`,
        slides: [
          {
            id: "sl-v-" + Date.now(),
            label: "Video Feed",
            text: rawContent,
            bgId: "bg-deep-worship",
            fontScale: 100
          }
        ]
      };
    } else if (type === "media") {
      newItem = {
        id: "item-med-" + Date.now(),
        type: "media",
        singular: true,
        title,
        subtitle: "Singular Graphic",
        bgId: "bg-sanctuary-amber",
        stageNotes: title,
        slides: [
          {
            id: "sl-m-" + Date.now(),
            label: "Graphic",
            text: rawContent,
            bgId: "bg-sanctuary-amber",
            fontScale: 100
          }
        ]
      };
    } else {
      const blocks = rawContent.split(/\n\s*\n/).filter(Boolean);
      const slideBlocks = blocks.length > 0 ? blocks : [rawContent];
      newItem = {
        id: "item-" + Date.now(),
        type,
        title,
        subtitle: `${slideBlocks.length} Slides`,
        bgId: type === "song" ? "bg-sanctuary-amber" : type === "scripture" ? "bg-deep-worship" : "bg-sermon-clean",
        stageNotes: `${title}`,
        slides: slideBlocks.map((txt, i) => ({
          id: `sl-${Date.now()}-${i}`,
          label: type === "song" ? `Verse ${i + 1}` : `Slide ${i + 1}`,
          text: txt.trim(),
          bgId: type === "song" ? "bg-sanctuary-amber" : "bg-sermon-clean",
          fontScale: 100
        }))
      };
    }

    srv.items.push(newItem);
    this.operatorActiveItemId = newItem.id;
    this.operatorActiveSlideIndex = 0;

    if (titleEl) titleEl.value = "";
    if (contentEl) contentEl.value = "";
    const form = document.getElementById("operator-add-item-form");
    if (form) form.classList.remove("open");

    this.saveMasterServices();
    this.broadcastStageSync();
    this.renderOperatorWorkspace();
    this.showToast(`Added "${title}" to ${srv.title}`);
  },

  deleteOperatorItem(itemId, event) {
    if (event) event.stopPropagation();
    const srv = this.getActiveOperatorService();
    if (!srv) return;
    if (srv.items.length <= 1) {
      this.showToast("A service needs at least one item.");
      return;
    }
    srv.items = srv.items.filter(i => i.id !== itemId);
    if (this.operatorActiveItemId === itemId) {
      this.operatorActiveItemId = srv.items[0].id;
      this.operatorActiveSlideIndex = 0;
    }
    this.saveMasterServices();
    this.broadcastStageSync();
    this.renderOperatorWorkspace();
  },

  // --- Right Area: Multi-Slide Selection & Singular Video Transport Controls ---
  triggerOperatorSlide(slideIdx) {
    this.operatorActiveSlideIndex = slideIdx;
    this.displayOverride = "none";
    this.broadcastStageSync();
    this.renderOperatorWorkspace();
  },

  nextSlide() {
    const item = this.getActiveOperatorItem();
    if (!item || !item.slides) return;
    if (this.operatorActiveSlideIndex < item.slides.length - 1) {
      this.triggerOperatorSlide(this.operatorActiveSlideIndex + 1);
    }
  },

  prevSlide() {
    if (this.operatorActiveSlideIndex > 0) {
      this.triggerOperatorSlide(this.operatorActiveSlideIndex - 1);
    }
  },

  // Video Controls (Play, Pause, Restart, Timeline Seek)
  playOperatorVideo() {
    const item = this.getActiveOperatorItem();
    if (!item) return;
    this.displayOverride = "none";
    this.videoDuration = item.duration || 180;
    if (this.videoCurrentTime >= this.videoDuration) {
      this.videoCurrentTime = 0;
    }
    this.videoPlaying = true;

    const vidEl = document.getElementById("operator-native-video");
    if (vidEl) vidEl.play().catch(() => {});

    this.startVideoLoop();
    this.broadcastStageSync();
    this.renderOperatorWorkspace();
  },

  pauseOperatorVideo() {
    this.videoPlaying = false;
    const vidEl = document.getElementById("operator-native-video");
    if (vidEl) vidEl.pause();
    this.stopVideoLoop();
    this.broadcastStageSync();
    this.renderOperatorWorkspace();
  },

  restartOperatorVideo() {
    const item = this.getActiveOperatorItem();
    this.videoDuration = (item && item.duration) || 180;
    this.videoCurrentTime = 0;
    this.videoPlaying = true;
    this.displayOverride = "none";

    const vidEl = document.getElementById("operator-native-video");
    if (vidEl) {
      vidEl.currentTime = 0;
      vidEl.play().catch(() => {});
    }

    this.startVideoLoop();
    this.broadcastStageSync();
    this.renderOperatorWorkspace();
  },

  seekOperatorVideo(newSeconds) {
    const sec = Math.max(0, Math.min(Number(newSeconds) || 0, this.videoDuration));
    this.videoCurrentTime = sec;
    const vidEl = document.getElementById("operator-native-video");
    if (vidEl && Math.abs(vidEl.currentTime - sec) > 0.5) {
      vidEl.currentTime = sec;
    }
    this.broadcastStageSync();
    this.updateVideoTimelineDOM();
    this.renderFOHScreen();
  },

  startVideoLoop() {
    if (this.videoInterval) clearInterval(this.videoInterval);
    this.videoInterval = setInterval(() => {
      if (!this.videoPlaying) return;
      this.videoCurrentTime = Math.min(this.videoDuration, +(this.videoCurrentTime + 0.25).toFixed(2));
      if (this.videoCurrentTime >= this.videoDuration) {
        this.videoPlaying = false;
        this.stopVideoLoop();
      }
      this.broadcastStageSync();
      this.updateVideoTimelineDOM();
    }, 250);
  },

  stopVideoLoop() {
    this.videoPlaying = false;
    if (this.videoInterval) {
      clearInterval(this.videoInterval);
      this.videoInterval = null;
    }
  },

  formatSeconds(sec) {
    const total = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  },

  updateVideoTimelineDOM() {
    const slider = document.getElementById("operator-video-timeline");
    const timeLabel = document.getElementById("operator-video-time-label");
    const heroClock = document.getElementById("operator-video-stage-clock");
    const statusPill = document.getElementById("operator-video-status-pill");

    if (slider && document.activeElement !== slider) {
      slider.max = this.videoDuration;
      slider.value = this.videoCurrentTime;
    }
    if (timeLabel) {
      timeLabel.textContent = `${this.formatSeconds(this.videoCurrentTime)} / ${this.formatSeconds(this.videoDuration)}`;
    }
    if (heroClock) {
      const remaining = Math.max(0, this.videoDuration - this.videoCurrentTime);
      heroClock.textContent = this.formatSeconds(remaining);
    }
    if (statusPill) {
      statusPill.textContent = this.videoPlaying ? "● PLAYING ON FOH" : "PAUSED";
      statusPill.style.color = this.videoPlaying ? "#34D399" : "#A1A1AA";
    }
  },

  // --- Quick Edit Slide Modal/Inline ---
  openQuickSlideEdit(slideId, event) {
    if (event) event.stopPropagation();
    this.editingSlideId = this.editingSlideId === slideId ? null : slideId;
    this.renderOperatorWorkspace();
  },

  saveQuickSlideEdit(slideId) {
    const input = document.getElementById(`quick-edit-textarea-${slideId}`);
    if (input) {
      this.operatorMicroOverrides[slideId] = { text: input.value };
    }
    this.editingSlideId = null;
    this.broadcastStageSync();
    this.renderOperatorWorkspace();
    this.showToast("Updated live slide text.");
  },

  setDisplayOverride(mode) {
    this.displayOverride = this.displayOverride === mode ? "none" : mode;
    this.broadcastStageSync();
    this.renderOperatorWorkspace();
    this.renderFOHScreen();
  },

  getEffectiveSlideData(slide, parentItem) {
    if (!slide) return null;
    const override = this.operatorMicroOverrides[slide.id] || {};
    const bgId = slide.bgId || (parentItem && parentItem.bgId) || "bg-sanctuary-amber";
    const bgObj = this.backgrounds.find(b => b.id === bgId) || this.backgrounds[0];

    return {
      id: slide.id,
      label: slide.label,
      text: override.text !== undefined ? override.text : slide.text,
      bgCss: bgObj.css,
      bgName: bgObj.name
    };
  },

  // --- Render Project Operator Workspace ---
  renderOperatorWorkspace() {
    const servicesListEl = document.getElementById("operator-services-list");
    const itemsListEl = document.getElementById("operator-items-list");
    const previewContainer = document.getElementById("operator-preview-area");
    if (!servicesListEl || !itemsListEl || !previewContainer) return;

    const activeService = this.getActiveOperatorService();
    if (!activeService) return;
    this.operatorServiceId = activeService.id;

    const activeItem = this.getActiveOperatorItem();
    if (activeItem) this.operatorActiveItemId = activeItem.id;

    // 1. Render Top of Left Sidebar: Church Services
    servicesListEl.innerHTML = this.services
      .map(srv => {
        const isSelected = srv.id === activeService.id;
        return `
          <div class="sidebar-row-item ${isSelected ? "active" : ""}" onclick="ProViewApp.selectOperatorService('${srv.id}')">
            <div class="sidebar-row-main">
              <div class="sidebar-row-title">${this.escapeHtml(srv.title)}</div>
              <div class="sidebar-row-sub">${this.escapeHtml(srv.date)} • ${srv.items.length} items</div>
            </div>
            <button
              type="button"
              class="sidebar-delete-btn"
              title="Delete Service"
              onclick="ProViewApp.deleteOperatorService('${srv.id}', event)"
            >×</button>
          </div>
        `;
      })
      .join("");

    // 2. Render Underneath in Left Sidebar: Items in the Selected Service
    itemsListEl.innerHTML = activeService.items
      .map(item => {
        const isSelected = activeItem && item.id === activeItem.id;
        const badgeClass =
          item.type === "song"
            ? "badge-song"
            : item.type === "scripture"
            ? "badge-scripture"
            : item.type === "sermon"
            ? "badge-sermon"
            : "badge-video";
        const typeLabel =
          item.type === "song"
            ? "Lyrics"
            : item.type === "scripture"
            ? "Scripture"
            : item.type === "sermon"
            ? "Sermon"
            : item.type === "video"
            ? "Video"
            : "Media";

        return `
          <div class="sidebar-row-item ${isSelected ? "active" : ""}" onclick="ProViewApp.selectOperatorPlaylistItem('${item.id}')">
            <div class="sidebar-row-main">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                <span class="cue-type-badge ${badgeClass}">${typeLabel}</span>
              </div>
              <div class="sidebar-row-title">${this.escapeHtml(item.title)}</div>
            </div>
            <button
              type="button"
              class="sidebar-delete-btn"
              title="Remove Item"
              onclick="ProViewApp.deleteOperatorItem('${item.id}', event)"
            >×</button>
          </div>
        `;
      })
      .join("");

    // 3. Render Right of Sidebar: Item Preview (Multi-Slide Grid OR Singular Piece with Controls)
    if (!activeItem) {
      previewContainer.innerHTML = `<div class="card">Select or add a service item on the left sidebar.</div>`;
      return;
    }

    const isSingular = this.isSingularItem(activeItem);

    if (isSingular && activeItem.type === "video") {
      // Singular Video Item with Interactive Timeline, Play, Pause, Restart
      const slide = activeItem.slides[0] || { text: activeItem.title };
      const eff = this.getEffectiveSlideData(slide, activeItem);
      const remaining = Math.max(0, (this.videoDuration || 180) - (this.videoCurrentTime || 0));

      previewContainer.innerHTML = `
        <div class="operator-item-header">
          <div>
            <span class="cue-type-badge badge-video" style="margin-bottom:6px;display:inline-block;">SINGULAR VIDEO ITEM</span>
            <h1 style="font-size:1.65rem;">${this.escapeHtml(activeItem.title)}</h1>
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-sm btn-outline" onclick="ProViewApp.setDisplayOverride('blackout')">
              ${this.displayOverride === "blackout" ? "● Blackout Active" : "Blackout Screen"}
            </button>
          </div>
        </div>

        <div class="singular-preview-container">
          <div class="singular-stage-box" style="background:${eff.bgCss};">
            ${
              activeItem.videoUrl
                ? `<video id="operator-native-video" src="${this.escapeHtml(activeItem.videoUrl)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"></video>`
                : ""
            }
            <div style="position:relative;z-index:2;max-width:680px;">
              <div id="operator-video-status-pill" class="font-mono" style="font-size:0.78rem;font-weight:700;margin-bottom:14px;color:${this.videoPlaying ? "#34D399" : "#A1A1AA"};">
                ${this.videoPlaying ? "● PLAYING ON FOH" : "PAUSED"}
              </div>
              <div style="font-size:clamp(1.5rem,2.6vw,2.3rem);font-weight:700;line-height:1.3;white-space:pre-line;margin-bottom:16px;">
                ${this.escapeHtml(eff.text)}
              </div>
              <div id="operator-video-stage-clock" class="font-mono" style="font-size:clamp(2.2rem,4vw,3.4rem);font-weight:700;letter-spacing:0.04em;color:#FBBF24;">
                ${this.formatSeconds(remaining)}
              </div>
            </div>
          </div>

          <div class="video-controls-card">
            <div class="video-timeline-row">
              <span class="font-mono" style="font-size:0.82rem;color:var(--text-secondary);">Timeline</span>
              <input
                type="range"
                id="operator-video-timeline"
                class="video-timeline-slider"
                min="0"
                max="${this.videoDuration || 180}"
                step="0.25"
                value="${this.videoCurrentTime || 0}"
                oninput="ProViewApp.seekOperatorVideo(this.value)"
              />
              <span id="operator-video-time-label" class="font-mono" style="font-size:0.84rem;font-weight:600;min-width:105px;text-align:right;">
                ${this.formatSeconds(this.videoCurrentTime)} / ${this.formatSeconds(this.videoDuration)}
              </span>
            </div>

            <div class="video-buttons-row">
              <div style="display:flex;gap:10px;">
                <button type="button" class="btn btn-emerald" onclick="ProViewApp.playOperatorVideo()">
                  ▶ Play
                </button>
                <button type="button" class="btn btn-outline" onclick="ProViewApp.pauseOperatorVideo()">
                  ⏸ Pause
                </button>
                <button type="button" class="btn btn-outline" onclick="ProViewApp.restartOperatorVideo()">
                  ↺ Restart
                </button>
              </div>
              <span class="font-mono" style="font-size:0.78rem;color:var(--text-muted);">
                Synced with FOH Output
              </span>
            </div>
          </div>
        </div>
      `;
    } else if (isSingular) {
      // Singular Graphic / Single Media Piece
      const slide = activeItem.slides[0] || { id: "s-single", label: "Graphic", text: activeItem.title };
      const eff = this.getEffectiveSlideData(slide, activeItem);

      previewContainer.innerHTML = `
        <div class="operator-item-header">
          <div>
            <span class="cue-type-badge badge-media" style="margin-bottom:6px;display:inline-block;">SINGULAR MEDIA PIECE</span>
            <h1 style="font-size:1.65rem;">${this.escapeHtml(activeItem.title)}</h1>
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-sm btn-emerald" onclick="ProViewApp.triggerOperatorSlide(0)">
              ● Send to Big Screen
            </button>
            <button class="btn btn-sm btn-outline" onclick="ProViewApp.setDisplayOverride('blackout')">
              ${this.displayOverride === "blackout" ? "Restore Screen" : "Blackout"}
            </button>
          </div>
        </div>

        <div class="singular-preview-container">
          <div class="singular-stage-box" style="background:${eff.bgCss};" onclick="ProViewApp.triggerOperatorSlide(0)">
            <div style="font-size:clamp(1.6rem,2.8vw,2.5rem);font-weight:700;line-height:1.35;white-space:pre-line;max-width:700px;">
              ${this.escapeHtml(eff.text)}
            </div>
          </div>
        </div>
      `;
    } else {
      // Multi-Slide Item (Sermon Slides, Music Lyrics, Scripture Readings) -> Display in a Clean Grid
      previewContainer.innerHTML = `
        <div class="operator-item-header">
          <div>
            <span class="cue-type-badge badge-sermon" style="margin-bottom:6px;display:inline-block;">
              ${activeItem.type.toUpperCase()} • ${activeItem.slides.length} SLIDES
            </span>
            <h1 style="font-size:1.65rem;">${this.escapeHtml(activeItem.title)}</h1>
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <button class="btn btn-sm btn-outline" onclick="ProViewApp.prevSlide()">← Prev</button>
            <button class="btn btn-sm btn-emerald" onclick="ProViewApp.nextSlide()">Next →</button>
            <button class="btn btn-sm btn-outline" onclick="ProViewApp.setDisplayOverride('clear-text')">
              ${this.displayOverride === "clear-text" ? "Restore Text" : "Clear Text"}
            </button>
            <button class="btn btn-sm btn-outline" onclick="ProViewApp.setDisplayOverride('blackout')">
              ${this.displayOverride === "blackout" ? "Restore Screen" : "Blackout"}
            </button>
          </div>
        </div>

        <p style="color:var(--text-secondary);font-size:0.92rem;margin-top:-12px;">
          Click any slide below to project it onto the big screen (FOH) and stage screen (BOH).
        </p>

        <div class="slide-cue-grid">
          ${activeItem.slides
            .map((sl, idx) => {
              const eff = this.getEffectiveSlideData(sl, activeItem);
              const isLive = idx === this.operatorActiveSlideIndex && this.displayOverride === "none";
              const isEditing = this.editingSlideId === sl.id;

              return `
                <div
                  class="slide-cue-card ${isLive ? "live-active" : ""}"
                  onclick="ProViewApp.triggerOperatorSlide(${idx})"
                >
                  <div>
                    <div class="slide-card-header">
                      <span class="slide-index-pill font-mono">${isLive ? "● ON SCREEN" : `SLIDE ${idx + 1}`}</span>
                      <span class="slide-section-tag">${this.escapeHtml(eff.label)}</span>
                    </div>
                    ${
                      isEditing
                        ? `
                          <div onclick="event.stopPropagation()">
                            <textarea id="quick-edit-textarea-${sl.id}" class="form-textarea" style="min-height:85px;margin-bottom:8px;">${this.escapeHtml(eff.text)}</textarea>
                            <button type="button" class="btn btn-sm btn-primary" onclick="ProViewApp.saveQuickSlideEdit('${sl.id}')">Save</button>
                          </div>
                        `
                        : `<div class="slide-card-lyrics">${this.escapeHtml(eff.text).replace(/\n/g, "<br>")}</div>`
                    }
                  </div>
                  <div class="slide-card-footer">
                    <span>${this.escapeHtml(eff.bgName)}</span>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline"
                      style="padding:3px 9px;font-size:0.74rem;"
                      onclick="ProViewApp.openQuickSlideEdit('${sl.id}', event)"
                    >${isEditing ? "Close" : "Edit"}</button>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      `;
    }
  },

  // ============================================================
  // FOH OUTPUT SCREEN (foh.html — Front of House Main Projector)
  // ============================================================
  renderFOHScreen() {
    const fohBox = document.getElementById("foh-screen-canvas");
    if (!fohBox) return;

    const item = this.getActiveOperatorItem();
    const slide = this.getActiveOperatorSlide();
    const eff = slide ? this.getEffectiveSlideData(slide, item) : null;

    if (this.displayOverride === "blackout") {
      fohBox.style.background = "#000000";
      fohBox.innerHTML = "";
      return;
    }

    if (item && item.type === "video") {
      const remaining = Math.max(0, (this.videoDuration || 180) - (this.videoCurrentTime || 0));
      fohBox.style.background = eff ? eff.bgCss : "#090D16";
      fohBox.innerHTML = `
        <div style="text-align:center;color:#FFFFFF;padding:48px;max-width:1100px;">
          <div style="font-size:clamp(2.2rem,4vw,4rem);font-weight:700;line-height:1.25;white-space:pre-line;margin-bottom:24px;">
            ${eff ? this.escapeHtml(eff.text) : this.escapeHtml(item.title)}
          </div>
          <div class="font-mono" style="font-size:clamp(3.5rem,7vw,6.5rem);font-weight:700;color:#FBBF24;">
            ${this.formatSeconds(remaining)}
          </div>
        </div>
      `;
      return;
    }

    fohBox.style.background = eff ? eff.bgCss : "#090D16";

    if (this.displayOverride === "clear-text") {
      fohBox.innerHTML = "";
      return;
    }

    const ccliFooter =
      item && item.type === "song"
        ? `CCLI Song #${item.ccliSongNumber || "6016351"} • ${this.churchProfile.ccliLicense}`
        : "";

    fohBox.innerHTML = `
      <div style="text-align:center;color:#FFFFFF;padding:64px;max-width:1200px;">
        <div style="font-size:clamp(2.2rem,4.4vw,4.25rem);font-weight:700;line-height:1.35;white-space:pre-line;text-shadow:0 4px 24px rgba(0,0,0,0.65);">
          ${eff ? this.escapeHtml(eff.text) : ""}
        </div>
      </div>
      ${
        ccliFooter
          ? `<div class="font-mono" style="position:absolute;bottom:24px;left:36px;right:36px;display:flex;justify-content:space-between;color:rgba(255,255,255,0.65);font-size:0.85rem;">
              <span>${this.escapeHtml(ccliFooter)}</span>
              <span>${this.escapeHtml(this.churchProfile.churchName)}</span>
            </div>`
          : ""
      }
    `;
  },

  // ============================================================
  // BOH OUTPUT SCREEN (stage.html — Back of House Stage Monitor)
  // Displays current slide, next lyric sang, time, and presenter/singer info.
  // NO slide background is shown on BOH.
  // ============================================================
  renderBOHScreen() {
    const currEl = document.getElementById("boh-current-text");
    const nextEl = document.getElementById("boh-next-text");
    const nextHeadingEl = document.getElementById("boh-next-heading");
    const infoEl = document.getElementById("boh-extra-info");
    const counterEl = document.getElementById("boh-slide-counter");
    if (!currEl) return;

    const item = this.getActiveOperatorItem();
    const slide = this.getActiveOperatorSlide();
    const eff = slide ? this.getEffectiveSlideData(slide, item) : null;

    if (!item) return;

    if (item.type === "video") {
      const remaining = Math.max(0, (this.videoDuration || 180) - (this.videoCurrentTime || 0));
      currEl.textContent = `${item.title} — ${this.formatSeconds(remaining)} remaining (${this.videoPlaying ? "PLAYING" : "PAUSED"})`;
      if (nextHeadingEl) nextHeadingEl.textContent = "STAGE CUE NOTES";
      if (nextEl) nextEl.textContent = item.stageNotes || "Stand by for next service item.";
      if (counterEl) counterEl.textContent = "VIDEO ITEM";
      if (infoEl) infoEl.textContent = item.stageNotes || "Video Playback";
      return;
    }

    currEl.textContent = eff ? eff.text : "";

    const nextSlideObj =
      item.slides && this.operatorActiveSlideIndex + 1 < item.slides.length
        ? item.slides[this.operatorActiveSlideIndex + 1]
        : null;
    const nextEff = nextSlideObj ? this.getEffectiveSlideData(nextSlideObj, item) : null;

    if (nextHeadingEl) {
      nextHeadingEl.textContent = item.type === "song" ? "NEXT LYRIC SANG:" : "NEXT SLIDE:";
    }

    if (nextEl) {
      nextEl.textContent = nextEff
        ? nextEff.text
        : "End of current item — stand by for next item in service.";
    }

    if (counterEl) {
      counterEl.textContent = `Slide ${this.operatorActiveSlideIndex + 1} of ${item.slides.length}`;
    }

    if (infoEl) {
      const singerInfo = item.key ? `${item.key} • ${item.bpm || ""} • ` : "";
      infoEl.textContent = `${singerInfo}${item.stageNotes || item.title}`;
    }
  },

  updateClocks() {
    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    const bohClock = document.getElementById("boh-live-clock");
    if (bohClock) bohClock.textContent = nowStr;
  },

  toggleStageTimer() {
    this.stageTimerRunning = !this.stageTimerRunning;
    if (this.stageTimerInterval) clearInterval(this.stageTimerInterval);
    if (this.stageTimerRunning) {
      this.stageTimerInterval = setInterval(() => {
        if (this.stageTimerSeconds > 0) this.stageTimerSeconds--;
        const timerEl = document.getElementById("boh-countdown-timer");
        if (timerEl) timerEl.textContent = this.formatSeconds(this.stageTimerSeconds);
      }, 1000);
    }
  },

  resetStageTimer(mins = 35) {
    this.stageTimerRunning = false;
    if (this.stageTimerInterval) clearInterval(this.stageTimerInterval);
    this.stageTimerSeconds = mins * 60;
    const timerEl = document.getElementById("boh-countdown-timer");
    if (timerEl) timerEl.textContent = this.formatSeconds(this.stageTimerSeconds);
  },

  handleGlobalKeydown(e) {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      this.nextSlide();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      this.prevSlide();
    }
  },

  // ============================================================
  // SMART TEXT-FLOW REFLOW & LANDING/FEATURES PREVIEWS
  // ============================================================
  smartReflowText(rawText, maxCharsPerSlide = 140, baseLabel = "Slide") {
    const cleaned = (rawText || "").trim().replace(/\s+/g, " ");
    if (!cleaned) return [{ label: `${baseLabel} 1`, text: "" }];
    if (cleaned.length <= maxCharsPerSlide) {
      return [{ label: `${baseLabel} (1/1)`, text: cleaned }];
    }

    const words = cleaned.split(" ");
    const chunks = [];
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maxCharsPerSlide && current.length > 0) {
        chunks.push(current.trim());
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    return chunks.map((text, idx) => ({
      label: `${baseLabel} (${idx + 1}/${chunks.length})`,
      text
    }));
  },

  renderLandingReflowDemo() {
    const textarea = document.getElementById("landing-reflow-input");
    const slider = document.getElementById("landing-reflow-slider");
    const countBadge = document.getElementById("landing-reflow-char-val");
    const grid = document.getElementById("landing-reflow-output");
    if (!textarea || !slider || !grid) return;

    const maxChars = parseInt(slider.value, 10) || 130;
    if (countBadge) countBadge.textContent = `${maxChars} chars/slide`;

    const slides = this.smartReflowText(textarea.value, maxChars, "Slide");
    grid.innerHTML = slides
      .map(
        (s, i) => `
        <div class="reflow-slide-chip">
          <div class="chip-head">
            <span>SLIDE ${i + 1} OF ${slides.length}</span>
            <span>${s.text.length} chars</span>
          </div>
          <p>${this.escapeHtml(s.text)}</p>
        </div>
      `
      )
      .join("");
  },

  // ============================================================
  // ADMIN PAGE, SCRIPTURE ENGINE, MEDIA, & ACCOUNT
  // ============================================================
  renderAdminServicesTab() {
    const colListEl = document.getElementById("admin-service-collections-list");
    const activeService = this.services.find(s => s.id === this.selectedServiceId) || this.services[0];
    if (!activeService) return;
    this.selectedServiceId = activeService.id;

    if (colListEl) {
      colListEl.innerHTML = this.services
        .map(
          srv => `
          <div class="sidebar-row-item ${srv.id === activeService.id ? "active" : ""}" onclick="ProViewApp.selectAdminService('${srv.id}')">
            <div class="sidebar-row-main">
              <div class="sidebar-row-title">${this.escapeHtml(srv.title)}</div>
              <div class="sidebar-row-sub">${this.escapeHtml(srv.date)} • ${srv.items.length} items</div>
            </div>
          </div>
        `
        )
        .join("");
    }

    const titleHeader = document.getElementById("admin-active-service-title");
    if (titleHeader) titleHeader.textContent = activeService.title;

    const songSelect = document.getElementById("admin-quick-add-song-select");
    if (songSelect) {
      songSelect.innerHTML = this.songs
        .map(s => `<option value="${s.id}">${this.escapeHtml(s.title)}</option>`)
        .join("");
    }

    const orderListEl = document.getElementById("admin-service-order-items");
    if (orderListEl) {
      orderListEl.innerHTML = activeService.items
        .map(
          (item, idx) => `
          <div class="sidebar-row-item" style="border:1px solid var(--border-subtle);padding:14px 16px;">
            <div class="sidebar-row-main">
              <span class="cue-type-badge badge-sermon" style="margin-right:8px;">${this.escapeHtml(item.type)}</span>
              <strong>${this.escapeHtml(item.title)}</strong>
            </div>
            <button class="btn btn-sm btn-outline" onclick="ProViewApp.removeAdminServiceItem(${idx})">Remove</button>
          </div>
        `
        )
        .join("");
    }
  },

  selectAdminService(serviceId) {
    this.selectedServiceId = serviceId;
    this.renderAdminServicesTab();
  },

  removeAdminServiceItem(idx) {
    const srv = this.services.find(s => s.id === this.selectedServiceId);
    if (!srv || srv.items.length <= 1) return;
    srv.items.splice(idx, 1);
    this.saveMasterServices();
    this.renderAdminServicesTab();
  },

  async createNewServiceCollection(event) {
    event.preventDefault();
    const titleEl = document.getElementById("new-service-title");
    const dateEl = document.getElementById("new-service-date");
    const title = titleEl ? titleEl.value.trim() : "";
    if (!title) return;

    const newService = {
      id: "service-" + Date.now(),
      title,
      date: (dateEl && dateEl.value.trim()) || "Sunday Morning",
      items: [
        {
          id: "item-w-" + Date.now(),
          type: "sermon",
          title: "Welcome Slides",
          subtitle: "1 Slide",
          bgId: "bg-sanctuary-amber",
          slides: [{ id: "sl-" + Date.now(), label: "Welcome", text: `Welcome to ${title}`, bgId: "bg-sanctuary-amber" }]
        }
      ]
    };

    this.services.unshift(newService);
    this.selectedServiceId = newService.id;
    if (titleEl) titleEl.value = "";
    if (dateEl) dateEl.value = "";
    this.saveMasterServices();
    this.renderAdminServicesTab();
    this.showToast(`Created service "${title}"`);
  },

  addSongToActiveService() {
    const select = document.getElementById("admin-quick-add-song-select");
    const song = this.songs.find(s => s.id === (select && select.value));
    const srv = this.services.find(s => s.id === this.selectedServiceId);
    if (!song || !srv) return;

    srv.items.push({
      id: "item-song-" + Date.now(),
      type: "song",
      title: song.title,
      subtitle: `CCLI #${song.ccliSongNumber}`,
      ccliSongNumber: song.ccliSongNumber,
      key: song.key,
      bpm: song.bpm,
      bgId: song.defaultBg || "bg-sanctuary-amber",
      stageNotes: song.stageNotes,
      slides: song.sections.map((sec, i) => ({
        id: `sl-s-${Date.now()}-${i}`,
        label: sec.label,
        text: sec.lyrics,
        bgId: song.defaultBg || "bg-sanctuary-amber"
      }))
    });

    this.saveMasterServices();
    this.renderAdminServicesTab();
    this.showToast(`Added "${song.title}" to ${srv.title}`);
  },

  addNestedSermonToService(event) {
    event.preventDefault();
    const titleEl = document.getElementById("sermon-builder-title");
    const pointsEl = document.getElementById("sermon-builder-points");
    const srv = this.services.find(s => s.id === this.selectedServiceId);
    if (!titleEl || !pointsEl || !srv) return;

    const title = titleEl.value.trim();
    const lines = pointsEl.value.split("\n").map(l => l.trim()).filter(Boolean);
    if (!title || !lines.length) return;

    srv.items.push({
      id: "item-serm-" + Date.now(),
      type: "sermon",
      title: `Sermon: ${title}`,
      subtitle: `${lines.length} Slides`,
      bgId: "bg-sermon-clean",
      slides: lines.map((line, i) => ({
        id: `sl-serm-${Date.now()}-${i}`,
        label: `Point ${i + 1}`,
        text: line,
        bgId: "bg-sermon-clean"
      }))
    });

    titleEl.value = "";
    pointsEl.value = "";
    this.saveMasterServices();
    this.renderAdminServicesTab();
    this.showToast(`Added sermon "${title}" to ${srv.title}`);
  },

  renderAdminSongsTab() {
    const listEl = document.getElementById("admin-songs-library-list");
    if (!listEl) return;

    listEl.innerHTML = this.songs
      .map(
        song => `
        <div class="sidebar-row-item" style="border:1px solid var(--border-subtle);padding:14px 16px;">
          <div class="sidebar-row-main">
            <div style="font-weight:700;">${this.escapeHtml(song.title)}</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);">CCLI #${this.escapeHtml(song.ccliSongNumber)} • ${this.escapeHtml(song.authors)}</div>
          </div>
          <span class="cue-type-badge badge-song">${song.sections.length} slides</span>
        </div>
      `
      )
      .join("");
  },

  createNewSongInDatabase(event) {
    event.preventDefault();
    const title = document.getElementById("song-form-title")?.value.trim();
    const authors = document.getElementById("song-form-authors")?.value.trim() || "Worship Team";
    const ccliSongNumber = document.getElementById("song-form-ccli")?.value.trim() || "7000000";
    const rawLyrics = document.getElementById("song-form-lyrics")?.value.trim();
    if (!title || !rawLyrics) return;

    const blocks = rawLyrics.split(/\n\s*\n/).filter(Boolean);
    const newSong = {
      id: "song-" + Date.now(),
      title,
      authors,
      ccliSongNumber,
      key: "G Major",
      bpm: "72 BPM",
      defaultBg: "bg-sanctuary-amber",
      sections: blocks.map((b, i) => ({ label: `Section ${i + 1}`, lyrics: b.trim() }))
    };

    this.songs.unshift(newSong);
    localStorage.setItem("proview_master_songs", JSON.stringify(this.songs));
    document.getElementById("song-form-title").value = "";
    document.getElementById("song-form-lyrics").value = "";
    this.renderAdminSongsTab();
    this.renderAdminServicesTab();
    this.showToast(`Saved "${title}" to song library.`);
  },

  renderAdminScriptureTab() {
    const presetSelect = document.getElementById("scripture-preset-select");
    const translationSelect = document.getElementById("scripture-translation-select");
    const maxCharsSlider = document.getElementById("scripture-reflow-slider");
    const customText = document.getElementById("scripture-custom-textarea");
    const refInput = document.getElementById("scripture-ref-input");
    const targetServiceSelect = document.getElementById("scripture-target-service");

    if (targetServiceSelect && !targetServiceSelect.innerHTML.trim()) {
      targetServiceSelect.innerHTML = this.services
        .map(s => `<option value="${s.id}">${this.escapeHtml(s.title)}</option>`)
        .join("");
    }

    if (!presetSelect || !translationSelect || !maxCharsSlider || !customText) return;

    const maxChars = parseInt(maxCharsSlider.value, 10) || 145;
    const charLabel = document.getElementById("scripture-char-label");
    if (charLabel) charLabel.textContent = `${maxChars} chars / slide`;

    const refTitle = `${refInput.value || "John 3:16-18"} (${translationSelect.value})`;
    const reflowed = this.smartReflowText(customText.value, maxChars, refTitle);

    const previewContainer = document.getElementById("scripture-engine-slides-preview");
    if (previewContainer) {
      previewContainer.innerHTML = reflowed
        .map(
          slide => `
          <div class="reflow-slide-chip">
            <div class="chip-head">
              <span>${this.escapeHtml(slide.label)}</span>
              <span>${slide.text.length} chars</span>
            </div>
            <p>${this.escapeHtml(slide.text)}</p>
          </div>
        `
        )
        .join("");
    }
  },

  loadScripturePreset() {
    const presetSelect = document.getElementById("scripture-preset-select");
    const translationSelect = document.getElementById("scripture-translation-select");
    const customText = document.getElementById("scripture-custom-textarea");
    const refInput = document.getElementById("scripture-ref-input");
    if (!presetSelect || !translationSelect || !customText || !refInput) return;

    const entry = this.scriptureLibrary.find(s => s.reference === presetSelect.value) || this.scriptureLibrary[0];
    if (entry) {
      refInput.value = entry.reference;
      const trans = translationSelect.value || "ESV";
      customText.value = entry.translations[trans] || entry.translations.ESV;
      this.renderAdminScriptureTab();
    }
  },

  pushScriptureToActiveService(launchOperatorAfter = false) {
    const refInput = document.getElementById("scripture-ref-input");
    const translationSelect = document.getElementById("scripture-translation-select");
    const maxCharsSlider = document.getElementById("scripture-reflow-slider");
    const customText = document.getElementById("scripture-custom-textarea");
    const targetServiceSelect = document.getElementById("scripture-target-service");

    const ref = (refInput && refInput.value.trim()) || "John 3:16";
    const trans = (translationSelect && translationSelect.value) || "ESV";
    const maxChars = parseInt(maxCharsSlider?.value || "145", 10);
    const raw = (customText && customText.value.trim()) || "";
    if (!raw) return;

    const targetServiceId = (targetServiceSelect && targetServiceSelect.value) || this.selectedServiceId;
    const activeService = this.services.find(s => s.id === targetServiceId) || this.services[0];
    if (!activeService) return;

    const reflowed = this.smartReflowText(raw, maxChars, `${ref} (${trans})`);
    const scriptureItem = {
      id: "item-scr-" + Date.now(),
      type: "scripture",
      title: `${ref} (${trans})`,
      subtitle: `${reflowed.length} Slides`,
      bgId: "bg-deep-worship",
      stageNotes: `Scripture Reading: ${ref} (${trans})`,
      slides: reflowed.map((r, i) => ({
        id: `scr-sl-${Date.now()}-${i}`,
        label: r.label,
        text: r.text,
        bgId: "bg-deep-worship"
      }))
    };

    activeService.items.push(scriptureItem);
    this.saveMasterServices();
    this.operatorServiceId = activeService.id;
    this.operatorActiveItemId = scriptureItem.id;
    this.operatorActiveSlideIndex = 0;
    this.broadcastStageSync();

    this.showToast(`Added ${ref} (${trans}) to ${activeService.title}`);
    if (launchOperatorAfter) {
      window.location.href = "operator.html";
    }
  },

  renderAdminMediaTab() {
    const builtinGrid = document.getElementById("admin-builtin-backgrounds");
    if (builtinGrid) {
      builtinGrid.innerHTML = this.backgrounds
        .map(
          bg => `
          <div style="border:1px solid var(--border-subtle);border-radius:12px;overflow:hidden;background:var(--bg-surface);">
            <div style="height:120px;background:${bg.css};"></div>
            <div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">
              <strong style="font-size:0.9rem;">${this.escapeHtml(bg.name)}</strong>
              <span class="font-mono" style="font-size:0.74rem;color:var(--text-muted);">${this.escapeHtml(bg.type)}</span>
            </div>
          </div>
        `
        )
        .join("");
    }

    const uploadedGrid = document.getElementById("admin-uploaded-files-grid");
    if (!uploadedGrid) return;

    if (!this.uploadedFiles || !this.uploadedFiles.length) {
      uploadedGrid.innerHTML = `
        <div style="grid-column:1/-1;padding:32px;text-align:center;border:1px dashed var(--border-strong);border-radius:12px;color:var(--text-secondary);">
          No custom media uploaded yet. Choose an image or video on the left to upload.
        </div>
      `;
      return;
    }

    uploadedGrid.innerHTML = this.uploadedFiles
      .map(
        file => `
        <div style="border:1px solid var(--border-subtle);border-radius:12px;overflow:hidden;background:var(--bg-surface);padding:16px;">
          <div style="font-weight:600;margin-bottom:8px;">${this.escapeHtml(file.originalName || file.filename)}</div>
          <button class="btn btn-sm btn-danger" onclick="ProViewApp.deleteUploadedMedia('${this.escapeHtml(file.filename)}')">Delete</button>
        </div>
      `
      )
      .join("");
  },

  async handleMediaUpload(event) {
    event.preventDefault();
    const fileInput = document.getElementById("myFile");
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
    const file = fileInput.files[0];
    const uploaded = await window.ProViewBackend.uploadMediaFile(file);
    this.uploadedFiles = await window.ProViewBackend.listMediaFiles();
    fileInput.value = "";
    this.renderAdminMediaTab();
    this.showToast(`Uploaded "${uploaded.filename}"`);
  },

  async deleteUploadedMedia(filename) {
    await window.ProViewBackend.deleteMediaFile(filename);
    this.uploadedFiles = await window.ProViewBackend.listMediaFiles();
    this.renderAdminMediaTab();
  },

  renderAdminSettingsTab() {
    const churchInput = document.getElementById("settings-church-name");
    const ccliInput = document.getElementById("settings-ccli-number");
    if (churchInput) churchInput.value = this.churchProfile.churchName;
    if (ccliInput) ccliInput.value = this.churchProfile.ccliLicense;
  },

  saveGlobalSettings(event) {
    event.preventDefault();
    this.churchProfile.churchName = document.getElementById("settings-church-name")?.value.trim() || "Grace Sanctuary Fellowship";
    this.churchProfile.ccliLicense = document.getElementById("settings-ccli-number")?.value.trim() || "CCLI #11482903";
    localStorage.setItem("proview_profile", JSON.stringify(this.churchProfile));
    this.showToast("Saved church settings.");
  },

  saveMasterServices() {
    localStorage.setItem("proview_master_services", JSON.stringify(this.services));
  },

  // ============================================================
  // ACCOUNT & CLOUD SYNC
  // ============================================================
  switchAccountTab(mode) {
    const isSignup = mode === "signup";
    document.getElementById("tab-btn-signup")?.classList.toggle("active", isSignup);
    document.getElementById("tab-btn-login")?.classList.toggle("active", !isSignup);
    const extra = document.getElementById("signup-extra-fields");
    if (extra) extra.style.display = isSignup ? "block" : "none";
    const btn = document.getElementById("auth-submit-btn");
    if (btn) btn.textContent = isSignup ? "Create Free Account" : "Sign In";
    const form = document.getElementById("auth-page-form");
    if (form) form.dataset.mode = mode;
  },

  async submitAccountForm(event) {
    event.preventDefault();
    const form = event.target;
    const mode = form.dataset.mode || "signup";
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const churchName = document.getElementById("auth-church")?.value.trim() || "Grace Sanctuary Fellowship";
    const ccliLicense = document.getElementById("auth-ccli")?.value.trim() || "CCLI #11482903";

    let user;
    if (mode === "signup") {
      user = await window.ProViewBackend.handleSignup(email, password, { churchName, ccliLicense });
      this.showToast(`Created free account for ${churchName}`);
    } else {
      const res = await window.ProViewBackend.handleLogin(email, password);
      user = res.user;
      this.showToast(`Signed in as ${user.email}`);
    }

    this.updateAuthUI(user);
    this.renderAccountPageProfile(user);
  },

  updateAuthUI(userObj) {
    const user = userObj || window.ProViewBackend.getStoredUser();
    const navArea = document.getElementById("nav-auth-area");
    if (!navArea) return;
    if (user && user.email) {
      navArea.innerHTML = `<a href="account.html" class="btn btn-sm btn-outline">${this.escapeHtml(user.churchName || user.email)}</a>`;
    } else {
      navArea.innerHTML = `<a href="account.html" class="btn btn-sm btn-primary">Free Account</a>`;
    }
  },

  renderAccountPageProfile(userObj) {
    const card = document.getElementById("active-session-card");
    if (!card) return;
    const user = userObj || window.ProViewBackend.getStoredUser();
    if (user && user.email) {
      card.style.display = "block";
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
          <div>
            <strong>${this.escapeHtml(user.churchName || "Grace Sanctuary")}</strong>
            <div style="font-size:0.86rem;color:var(--text-secondary);">${this.escapeHtml(user.email)}</div>
          </div>
          <div style="display:flex;gap:10px;">
            <a href="operator.html" class="btn btn-sm btn-emerald">Operator Page</a>
            <button class="btn btn-sm btn-outline" onclick="ProViewApp.handleLogout()">Sign Out</button>
          </div>
        </div>
      `;
    } else {
      card.style.display = "none";
    }
  },

  handleLogout() {
    window.ProViewBackend.logout();
    this.updateAuthUI(null);
    this.renderAccountPageProfile(null);
    this.showToast("Signed out.");
  },

  async syncWithBreadBackend() {
    try {
      await window.ProViewBackend.checkConnection();
      const user = await window.ProViewBackend.getCurrentUser();
      this.updateAuthUI(user);
      this.uploadedFiles = await window.ProViewBackend.listMediaFiles();
      this.renderAdminMediaTab();
    } catch (_) {}
  },

  showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
};

window.ProViewApp = ProViewApp;

document.addEventListener("DOMContentLoaded", () => {
  ProViewApp.init();
});
