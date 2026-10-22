/* ============================================================
   PROVIEW — MAIN APPLICATION CONTROLLER
   Dual-Workspace Engine: Landing + Admin Hub + Operator Live Deck + Stage Sync
============================================================ */

const ProViewApp = {
  currentView: "landing",
  activeAdminTab: "services",

  // Master Database State (Admin Hub)
  churchProfile: null,
  backgrounds: [],
  songs: [],
  scriptureLibrary: [],
  services: [],
  uploadedFiles: [],

  // Active Selection in Admin
  selectedServiceId: "service-sunday-morning",
  selectedSongId: "song-10000-reasons",

  // Operator Live Engine State (Decoupled from Master Templates!)
  operatorServiceId: "service-sunday-morning",
  operatorActiveItemId: "item-song-1",
  operatorActiveSlideIndex: 0,
  isLiveOnAir: true,
  displayOverride: "none", // "none" | "blackout" | "clear-text" | "logo"
  nurseryAlertCode: "",
  operatorMicroOverrides: {}, // { [slideId]: { text, fontScale, bgId, customBgUrl } }

  // Stage View Countdown State
  stageTimerSeconds: 2100, // 35:00 sermon timer
  stageTimerRunning: false,
  stageTimerInterval: null,
  customStageMessage: "",

  // Broadcast Channel for Crowd-Sourced Stage View Sync across tabs
  broadcastChannel: null,

  async init() {
    // Load defaults merged with local/cloud state
    const def = window.PROVIEW_DEFAULTS;
    this.churchProfile = JSON.parse(localStorage.getItem("proview_profile") || "null") || { ...def.churchProfile };
    this.backgrounds = [...def.backgrounds];
    this.scriptureLibrary = [...def.scriptureLibrary];

    const savedSongs = JSON.parse(localStorage.getItem("proview_master_songs") || "null");
    this.songs = savedSongs && savedSongs.length ? savedSongs : JSON.parse(JSON.stringify(def.songs));

    const savedServices = JSON.parse(localStorage.getItem("proview_master_services") || "null");
    this.services = savedServices && savedServices.length ? savedServices : JSON.parse(JSON.stringify(def.services));

    // Setup cross-tab BroadcastChannel for Stage View Sync
    if ("BroadcastChannel" in window) {
      this.broadcastChannel = new BroadcastChannel("proview_stage_sync");
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === "SYNC_STATE") {
          this.applyRemoteSync(event.data.payload);
        }
      };
    }

    // Bind global keyboard shortcuts for Operator view
    window.addEventListener("keydown", (e) => this.handleGlobalKeydown(e));

    // Initialize Clock for Stage View
    setInterval(() => this.updateClocks(), 1000);
    this.updateClocks();

    // Check URL hash or query param for direct workspace launch
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view") || (window.location.hash ? window.location.hash.replace("#", "") : "");
    if (["landing", "admin", "operator", "stage"].includes(viewParam)) {
      this.switchView(viewParam, false);
    } else {
      this.switchView("landing", false);
    }

    // Render all UI views initially
    this.renderHeroInteractivePreview();
    this.renderLandingReflowDemo();
    this.renderAdminWorkspace();
    this.renderOperatorWorkspace();
    this.renderStageView();
    this.updateAuthUI();

    // Connect to BreadBackend asynchronously
    this.syncWithBreadBackend();
  },

  async syncWithBreadBackend() {
    const statusEl = document.getElementById("cloud-status-indicator");
    const statusText = document.getElementById("cloud-status-text");

    const isOnline = await window.ProViewBackend.checkConnection();
    const user = await window.ProViewBackend.getCurrentUser();
    this.updateAuthUI(user);

    // Fetch cloud songs & services if available
    const cloudSongs = await window.ProViewBackend.fetchCollection("proview_songs");
    if (cloudSongs && cloudSongs.length > 0) {
      const existingIds = new Set(cloudSongs.map(s => s.id));
      const merged = [...cloudSongs, ...this.songs.filter(s => !existingIds.has(s.id))];
      this.songs = merged;
      localStorage.setItem("proview_master_songs", JSON.stringify(this.songs));
    }

    const cloudServices = await window.ProViewBackend.fetchCollection("proview_services");
    if (cloudServices && cloudServices.length > 0) {
      const existingIds = new Set(cloudServices.map(s => s.id));
      const merged = [...cloudServices, ...this.services.filter(s => !existingIds.has(s.id))];
      this.services = merged;
      localStorage.setItem("proview_master_services", JSON.stringify(this.services));
    }

    this.uploadedFiles = await window.ProViewBackend.listMediaFiles();

    if (statusEl && statusText) {
      statusEl.classList.add("connected");
      statusText.textContent = isOnline
        ? "Cloud Live"
        : "Cloud Ready";
    }

    this.renderAdminWorkspace();
    this.renderOperatorWorkspace();
  },

  // ============================================================
  // SMART TEXT-FLOW REFLOW ALGORITHM
  // Dynamically splits long scripture or sermon blocks into uniform sub-slides
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
    if (current.trim()) {
      chunks.push(current.trim());
    }

    return chunks.map((text, idx) => ({
      label: `${baseLabel} (${idx + 1}/${chunks.length})`,
      text
    }));
  },

  // ============================================================
  // VIEW SWITCHING & NAVIGATION
  // ============================================================
  switchView(viewName, updateHistory = true) {
    this.currentView = viewName;
    document.querySelectorAll(".app-view").forEach(el => {
      el.classList.toggle("active-view", el.id === `view-${viewName}`);
    });

    // Update top workspace pills
    const pills = {
      landing: { id: "pill-landing", cls: "active-landing" },
      admin: { id: "pill-admin", cls: "active-admin" },
      operator: { id: "pill-operator", cls: "active-operator" },
      stage: { id: "pill-stage", cls: "active-stage" }
    };

    Object.entries(pills).forEach(([key, cfg]) => {
      const btn = document.getElementById(cfg.id);
      if (btn) {
        btn.classList.remove("active-landing", "active-admin", "active-operator", "active-stage");
        if (key === viewName) btn.classList.add(cfg.cls);
      }
    });

    if (updateHistory) {
      window.history.replaceState(null, "", `#${viewName}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (viewName === "admin") this.renderAdminWorkspace();
    if (viewName === "operator") this.renderOperatorWorkspace();
    if (viewName === "stage") this.renderStageView();
  },

  switchAdminTab(tabName) {
    this.activeAdminTab = tabName;
    document.querySelectorAll(".subbar-tab").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });
    document.querySelectorAll(".admin-module").forEach(mod => {
      mod.classList.toggle("active-module", mod.id === `admin-mod-${tabName}`);
    });
  },

  // ============================================================
  // LANDING PAGE INTERACTIVE DEMOS
  // ============================================================
  heroSlideIdx: 0,
  heroMode: "operator",

  renderHeroInteractivePreview() {
    const heroSlides = [
      {
        tag: "Chorus • 10,000 Reasons",
        text: "Bless the Lord, O my soul, O my soul\nWorship His holy name\nSing like never before, O my soul\nI'll worship Your holy name",
        ccli: "CCLI Song #6016351 • License #11482903"
      },
      {
        tag: "Isaiah 40:31 (ESV) • Reflow 3/3",
        text: "but they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary.",
        ccli: "English Standard Version (ESV) • Auto-Formatted"
      },
      {
        tag: "Sermon Point 1 • Unshakeable Hope",
        text: "1. God's Perspective Outlasts Our Exhaustion\nOur weariness is real, but His everlasting strength is never depleted.",
        ccli: "Sermon Series: Unshakeable Hope (Part 3)"
      }
    ];

    const active = heroSlides[this.heroSlideIdx] || heroSlides[0];
    const lyricEl = document.getElementById("hero-stage-lyric");
    const ccliEl = document.getElementById("hero-stage-ccli-left");
    const stripEl = document.getElementById("hero-cue-strip");

    if (lyricEl) lyricEl.innerText = active.text;
    if (ccliEl) ccliEl.innerText = active.ccli;

    if (stripEl) {
      stripEl.innerHTML = heroSlides
        .map(
          (s, idx) => `
        <button class="mini-cue-btn ${idx === this.heroSlideIdx ? "active" : ""}" onclick="ProViewApp.selectHeroSlide(${idx})">
          <span class="mini-cue-tag">${s.tag}</span>
          <span class="mini-cue-text">${s.text.replace(/\n/g, " • ")}</span>
        </button>
      `
        )
        .join("");
    }
  },

  selectHeroSlide(idx) {
    this.heroSlideIdx = idx;
    this.renderHeroInteractivePreview();
  },

  renderLandingReflowDemo() {
    const textarea = document.getElementById("landing-reflow-input");
    const slider = document.getElementById("landing-reflow-slider");
    const countBadge = document.getElementById("landing-reflow-char-val");
    const grid = document.getElementById("landing-reflow-output");
    if (!textarea || !slider || !grid) return;

    const maxChars = parseInt(slider.value, 10) || 130;
    if (countBadge) countBadge.textContent = `${maxChars} chars/slide`;

    const slides = this.smartReflowText(textarea.value, maxChars, "Rom 8:38-39");
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
  // ACCOUNT CREATION & AUTHENTICATION (100% FREE FOREVER)
  // ============================================================
  openAuthModal(mode = "signup") {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.classList.add("open");
    this.switchAuthTab(mode);
  },

  closeAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.classList.remove("open");
  },

  switchAuthTab(mode) {
    const isSignup = mode === "signup";
    document.getElementById("tab-btn-signup")?.classList.toggle("active", isSignup);
    document.getElementById("tab-btn-login")?.classList.toggle("active", !isSignup);
    const extraFields = document.getElementById("signup-extra-fields");
    if (extraFields) extraFields.style.display = isSignup ? "block" : "none";
    const submitBtn = document.getElementById("auth-submit-btn");
    if (submitBtn) {
      submitBtn.textContent = isSignup
        ? "Create Free Sanctuary Account"
        : "Sign In to ProView Workspace";
    }
    const form = document.getElementById("auth-modal-form");
    if (form) form.dataset.mode = mode;
  },

  async submitModalAuth(event) {
    event.preventDefault();
    const form = event.target;
    const mode = form.dataset.mode || "signup";
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const churchName = document.getElementById("auth-church")?.value.trim() || "Grace Sanctuary Fellowship";
    const ccliLicense = document.getElementById("auth-ccli")?.value.trim() || "CCLI #11482903";
    const role = document.getElementById("auth-role")?.value || "Admin & Worship Pastor";

    const btn = document.getElementById("auth-submit-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Connecting to BreadBackend...";
    }

    try {
      let user;
      if (mode === "signup") {
        user = await window.ProViewBackend.handleSignup(email, password, {
          churchName,
          ccliLicense,
          role
        });
        this.churchProfile.churchName = churchName;
        this.churchProfile.ccliLicense = ccliLicense;
        localStorage.setItem("proview_profile", JSON.stringify(this.churchProfile));
        this.showToast(`Welcome to ProView, ${churchName}! Free account created & synced.`);
      } else {
        const res = await window.ProViewBackend.handleLogin(email, password);
        user = res.user;
        this.showToast(`Signed in as ${user.email}`);
      }

      this.updateAuthUI(user);
      this.closeAuthModal();
      this.renderAdminWorkspace();
      this.renderOperatorWorkspace();
    } catch (err) {
      this.showToast(`Auth notice: ${err.message}`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = mode === "signup" ? "Create Free Sanctuary Account" : "Sign In to ProView Workspace";
      }
    }
  },

  async submitInlineLandingSignup(event) {
    event.preventDefault();
    const email = document.getElementById("inline-signup-email").value.trim();
    const password = document.getElementById("inline-signup-password").value;
    const churchName = document.getElementById("inline-signup-church").value.trim() || "New Life Fellowship";
    const ccliLicense = document.getElementById("inline-signup-ccli").value.trim() || "CCLI #11482903";
    const targetWorkspace = document.getElementById("inline-signup-workspace").value || "admin";

    const btn = document.getElementById("inline-signup-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Creating Free Account on BreadBackend...";
    }

    try {
      const user = await window.ProViewBackend.handleSignup(email, password, {
        churchName,
        ccliLicense,
        role: targetWorkspace === "admin" ? "Admin & Worship Pastor" : "Project Operator"
      });
      this.churchProfile.churchName = churchName;
      this.churchProfile.ccliLicense = ccliLicense;
      localStorage.setItem("proview_profile", JSON.stringify(this.churchProfile));
      this.updateAuthUI(user);
      this.showToast(`Account created for ${churchName}! Launching ${targetWorkspace.toUpperCase()} Hub...`);
      this.switchView(targetWorkspace);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Create 100% Free Account & Launch ProView";
      }
    }
  },

  updateAuthUI(userObj) {
    const user = userObj || window.ProViewBackend.getStoredUser();
    const navArea = document.getElementById("nav-auth-area");
    if (!navArea) return;

    if (user && user.email) {
      navArea.innerHTML = `
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="text-align:right;line-height:1.35;">
            <div style="font-size:0.9rem;font-weight:700;color:var(--text-primary);">${this.escapeHtml(user.churchName || user.email)}</div>
            <div class="font-mono" style="font-size:0.74rem;color:var(--accent-emerald);">FREE • ${this.escapeHtml(user.email)}</div>
          </div>
          <button class="btn btn-sm btn-outline" onclick="ProViewApp.handleLogout()">Sign Out</button>
        </div>
      `;
    } else {
      navArea.innerHTML = `
        <button class="btn btn-sm btn-outline" onclick="ProViewApp.openAuthModal('login')">Log In</button>
        <button class="btn btn-sm btn-amber" onclick="ProViewApp.openAuthModal('signup')">Free Account</button>
      `;
    }
  },

  handleLogout() {
    window.ProViewBackend.logout();
    this.updateAuthUI(null);
    this.showToast("Signed out of ProView account.");
  },

  // ============================================================
  // ADMIN PAGE: THE CONTROL & CREATION HUB
  // ============================================================
  renderAdminWorkspace() {
    this.renderAdminServicesTab();
    this.renderAdminSongsTab();
    this.renderAdminScriptureTab();
    this.renderAdminMediaTab();
    this.renderAdminSettingsTab();
  },

  // 1. Admin Service Organizer & Smart Collection Builder
  renderAdminServicesTab() {
    const colListEl = document.getElementById("admin-service-collections-list");
    const activeService = this.services.find(s => s.id === this.selectedServiceId) || this.services[0];
    if (!activeService) return;
    this.selectedServiceId = activeService.id;

    if (colListEl) {
      colListEl.innerHTML = this.services
        .map(
          srv => `
        <button class="collection-item-btn ${srv.id === activeService.id ? "active" : ""}" onclick="ProViewApp.selectAdminService('${srv.id}')">
          <div>
            <div style="font-weight:700;font-size:1rem;margin-bottom:4px;">${this.escapeHtml(srv.title)}</div>
            <div class="font-mono" style="font-size:0.78rem;color:var(--text-secondary);">${this.escapeHtml(srv.date)}</div>
          </div>
          <span class="font-mono" style="font-size:0.78rem;padding:5px 12px;border-radius:99px;background:rgba(255,255,255,0.06);">
            ${srv.items.length} cues
          </span>
        </button>
      `
        )
        .join("");
    }

    const titleHeader = document.getElementById("admin-active-service-title");
    const metaHeader = document.getElementById("admin-active-service-meta");
    if (titleHeader) titleHeader.textContent = activeService.title;
    if (metaHeader) {
      metaHeader.textContent = `${activeService.date} • Lead: ${activeService.leadPastor || "Worship Team"} • ${activeService.items.length} Service Items`;
    }

    // Populate Quick-Add Song dropdown in Service Organizer
    const songSelect = document.getElementById("admin-quick-add-song-select");
    if (songSelect) {
      songSelect.innerHTML = this.songs
        .map(s => `<option value="${s.id}">${this.escapeHtml(s.title)} (CCLI #${this.escapeHtml(s.ccliSongNumber)})</option>`)
        .join("");
    }

    const orderListEl = document.getElementById("admin-service-order-items");
    if (orderListEl) {
      orderListEl.innerHTML = activeService.items
        .map((item, idx) => {
          const badgeClass =
            item.type === "song"
              ? "badge-song"
              : item.type === "scripture"
              ? "badge-scripture"
              : item.type === "sermon"
              ? "badge-sermon"
              : "badge-media";

          return `
          <div class="service-cue-row">
            <div class="cue-left">
              <span class="font-mono" style="color:var(--text-muted);font-size:0.86rem;width:28px;">0${idx + 1}</span>
              <span class="cue-type-badge ${badgeClass}">${item.type}</span>
              <div>
                <div style="font-weight:700;font-size:1.02rem;margin-bottom:3px;">${this.escapeHtml(item.title)}</div>
                <div style="font-size:0.86rem;color:var(--text-secondary);">
                  ${this.escapeHtml(item.subtitle || "")} • <strong>${item.slides.length} slides</strong>
                </div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <button class="btn btn-sm btn-outline" title="Move Up" onclick="ProViewApp.moveServiceItem(${idx}, -1)">↑</button>
              <button class="btn btn-sm btn-outline" title="Move Down" onclick="ProViewApp.moveServiceItem(${idx}, 1)">↓</button>
              <button class="btn btn-sm btn-cyan" onclick="ProViewApp.sendServiceItemToOperator('${activeService.id}', '${item.id}')">Cue in Operator</button>
              <button class="btn btn-sm btn-danger" onclick="ProViewApp.removeServiceItem(${idx})">✕</button>
            </div>
          </div>
        `;
        })
        .join("");
    }
  },

  selectAdminService(serviceId) {
    this.selectedServiceId = serviceId;
    this.renderAdminServicesTab();
  },

  async createNewServiceCollection(event) {
    event.preventDefault();
    const titleInput = document.getElementById("new-service-title");
    const dateInput = document.getElementById("new-service-date");
    const pastorInput = document.getElementById("new-service-pastor");

    const title = titleInput.value.trim();
    if (!title) return;

    const newService = {
      id: "service-" + Date.now(),
      title,
      date: dateInput.value.trim() || "Upcoming Gathering",
      leadPastor: pastorInput.value.trim() || "Worship Team",
      techDirector: "Tech Team",
      items: [
        {
          id: "item-wel-" + Date.now(),
          type: "media",
          title: `${title} — Welcome Loop`,
          subtitle: "Sanctuary Gold Rays",
          bgId: "bg-sanctuary-amber",
          stageNotes: "5-minute countdown before service start.",
          slides: [
            {
              id: "sl-" + Date.now(),
              label: "Welcome",
              text: `Welcome to ${title}\n${this.churchProfile.churchName}`,
              bgId: "bg-sanctuary-amber",
              fontScale: 100
            }
          ]
        }
      ]
    };

    this.services.unshift(newService);
    this.selectedServiceId = newService.id;
    this.operatorServiceId = newService.id;
    this.saveMasterServices();
    await window.ProViewBackend.createDocument("proview_services", newService);

    titleInput.value = "";
    dateInput.value = "";
    this.renderAdminServicesTab();
    this.renderOperatorWorkspace();
    this.showToast(`Created Service Collection "${title}" & synced to BreadBackend!`);
  },

  async addSongToActiveService() {
    const select = document.getElementById("admin-quick-add-song-select");
    if (!select) return;
    const song = this.songs.find(s => s.id === select.value);
    const activeService = this.services.find(s => s.id === this.selectedServiceId);
    if (!song || !activeService) return;

    const newItem = {
      id: "item-song-" + Date.now(),
      type: "song",
      title: song.title,
      subtitle: `CCLI #${song.ccliSongNumber} • ${song.authors}`,
      ccliSongNumber: song.ccliSongNumber,
      authors: song.authors,
      bgId: song.defaultBg || "bg-sanctuary-amber",
      stageNotes: `${song.key || "Key of G"} • ${song.bpm || "72 BPM"} • ${song.stageNotes || ""}`,
      slides: song.sections.map((sec, i) => ({
        id: `sl-${Date.now()}-${i}`,
        label: sec.label,
        text: sec.lyrics,
        bgId: song.defaultBg || "bg-sanctuary-amber",
        fontScale: 100
      }))
    };

    activeService.items.push(newItem);
    this.saveMasterServices();
    await window.ProViewBackend.updateDocument("proview_services", activeService.id, activeService);
    this.renderAdminServicesTab();
    this.renderOperatorWorkspace();
    this.showToast(`Added "${song.title}" with CCLI #${song.ccliSongNumber} to ${activeService.title}.`);
  },

  async addNestedSermonToService(event) {
    event.preventDefault();
    const seriesTitle = document.getElementById("sermon-builder-title").value.trim();
    const scriptureRef = document.getElementById("sermon-builder-scripture").value.trim();
    const rawPoints = document.getElementById("sermon-builder-points").value.trim();
    const notes = document.getElementById("sermon-builder-notes").value.trim();

    if (!seriesTitle || !rawPoints) return;
    const activeService = this.services.find(s => s.id === this.selectedServiceId);
    if (!activeService) return;

    const pointLines = rawPoints
      .split(/\n+/)
      .map(l => l.trim())
      .filter(Boolean);

    const slides = [
      {
        id: `serm-title-${Date.now()}`,
        label: "Sermon Title",
        text: `${seriesTitle}\n${scriptureRef ? "Scripture Focus: " + scriptureRef : ""}`,
        bgId: "bg-sermon-clean",
        fontScale: 105
      },
      ...pointLines.map((pt, idx) => ({
        id: `serm-pt-${Date.now()}-${idx}`,
        label: `Point ${idx + 1}`,
        text: pt,
        bgId: "bg-sermon-clean",
        fontScale: 100
      }))
    ];

    const sermonItem = {
      id: "item-sermon-" + Date.now(),
      type: "sermon",
      title: `Sermon Folder: ${seriesTitle}`,
      subtitle: `Nested Sermon Collection • ${slides.length} sub-slides`,
      bgId: "bg-sermon-clean",
      stageNotes: notes || "35:00 Sermon Timer • Stage Confidence Sync active.",
      slides
    };

    activeService.items.push(sermonItem);
    this.saveMasterServices();
    await window.ProViewBackend.updateDocument("proview_services", activeService.id, activeService);

    document.getElementById("sermon-builder-title").value = "";
    document.getElementById("sermon-builder-scripture").value = "";
    document.getElementById("sermon-builder-points").value = "";
    this.renderAdminServicesTab();
    this.renderOperatorWorkspace();
    this.showToast(`Nested Sermon Folder "${seriesTitle}" added (${slides.length} slides)!`);
  },

  moveServiceItem(index, direction) {
    const activeService = this.services.find(s => s.id === this.selectedServiceId);
    if (!activeService) return;
    const target = index + direction;
    if (target < 0 || target >= activeService.items.length) return;
    const temp = activeService.items[index];
    activeService.items[index] = activeService.items[target];
    activeService.items[target] = temp;
    this.saveMasterServices();
    this.renderAdminServicesTab();
    this.renderOperatorWorkspace();
  },

  removeServiceItem(index) {
    const activeService = this.services.find(s => s.id === this.selectedServiceId);
    if (!activeService) return;
    activeService.items.splice(index, 1);
    this.saveMasterServices();
    this.renderAdminServicesTab();
    this.renderOperatorWorkspace();
  },

  sendServiceItemToOperator(serviceId, itemId) {
    this.operatorServiceId = serviceId;
    this.operatorActiveItemId = itemId;
    this.operatorActiveSlideIndex = 0;
    this.switchView("operator");
    this.broadcastStageSync();
  },

  // 2. Admin Song & CCLI Automation Library
  renderAdminSongsTab() {
    const listEl = document.getElementById("admin-songs-library-list");
    if (!listEl) return;

    listEl.innerHTML = this.songs
      .map(
        song => `
      <div class="service-cue-row ${song.id === this.selectedSongId ? "active-cue" : ""}" style="cursor:pointer;" onclick="ProViewApp.selectAdminSong('${song.id}')">
        <div>
          <div style="font-weight:700;font-size:1.04rem;margin-bottom:4px;">${this.escapeHtml(song.title)}</div>
          <div class="font-mono" style="font-size:0.78rem;color:var(--accent-amber);">
            CCLI #${this.escapeHtml(song.ccliSongNumber)} • ${this.escapeHtml(song.authors)}
          </div>
          <div style="font-size:0.84rem;color:var(--text-secondary);margin-top:4px;">
            ${song.sections.length} slide sections • ${this.escapeHtml(song.key || "G Major")}
          </div>
        </div>
        <span class="cue-type-badge badge-song">${song.sections.length} slides</span>
      </div>
    `
      )
      .join("");

    const selected = this.songs.find(s => s.id === this.selectedSongId) || this.songs[0];
    if (selected) {
      const previewEl = document.getElementById("admin-song-ccli-preview");
      if (previewEl) {
        previewEl.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
            <div>
              <h4 style="font-size:1.25rem;margin-bottom:4px;">${this.escapeHtml(selected.title)}</h4>
              <p class="font-mono" style="font-size:0.82rem;color:var(--accent-amber);">
                Author Credits: ${this.escapeHtml(selected.authors)} • CCLI Song #${this.escapeHtml(selected.ccliSongNumber)}
              </p>
            </div>
            <span class="brand-badge-free">CCLI Compliant</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;">
            ${selected.sections
              .map(
                sec => `
              <div style="background:var(--bg-obsidian);border:1px solid var(--border-subtle);border-radius:14px;padding:20px;">
                <div class="font-mono" style="font-size:0.75rem;color:var(--accent-cyan);margin-bottom:10px;">${this.escapeHtml(sec.label)}</div>
                <div style="font-size:0.92rem;white-space:pre-line;margin-bottom:16px;line-height:1.6;">${this.escapeHtml(sec.lyrics)}</div>
                <div class="font-mono" style="font-size:0.7rem;color:var(--text-muted);border-top:1px solid var(--border-subtle);padding-top:10px;">
                  "${this.escapeHtml(selected.title)}" • CCLI #${this.escapeHtml(selected.ccliSongNumber)} • ${this.escapeHtml(this.churchProfile.ccliLicense)}
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        `;
      }
    }
  },

  selectAdminSong(songId) {
    this.selectedSongId = songId;
    this.renderAdminSongsTab();
  },

  async createNewSongInDatabase(event) {
    event.preventDefault();
    const title = document.getElementById("song-form-title").value.trim();
    const authors = document.getElementById("song-form-authors").value.trim() || "Worship Ministry";
    const ccliSongNumber = document.getElementById("song-form-ccli").value.trim() || "7000000";
    const key = document.getElementById("song-form-key").value.trim() || "G Major";
    const rawLyrics = document.getElementById("song-form-lyrics").value.trim();

    if (!title || !rawLyrics) return;

    const rawBlocks = rawLyrics.split(/\n\s*\n/).filter(Boolean);
    const sections = rawBlocks.map((block, idx) => {
      const lines = block.trim().split("\n");
      let label = `Section ${idx + 1}`;
      let body = block.trim();
      if (/^\[.*\]$/.test(lines[0].trim()) || /^(Verse|Chorus|Bridge|Tag|Intro|Outro)/i.test(lines[0].trim())) {
        label = lines[0].trim().replace(/^\[|\]$/g, "");
        body = lines.slice(1).join("\n").trim() || lines[0];
      }
      return { label, lyrics: body };
    });

    const newSong = {
      id: "song-" + Date.now(),
      title,
      authors,
      ccliSongNumber,
      copyright: `© ${new Date().getFullYear()} ${authors}`,
      key,
      bpm: "72 BPM",
      defaultBg: "bg-sanctuary-amber",
      stageNotes: `Key: ${key} • CCLI #${ccliSongNumber}`,
      sections
    };

    this.songs.unshift(newSong);
    this.selectedSongId = newSong.id;
    localStorage.setItem("proview_master_songs", JSON.stringify(this.songs));
    await window.ProViewBackend.createDocument("proview_songs", newSong);

    document.getElementById("song-form-title").value = "";
    document.getElementById("song-form-authors").value = "";
    document.getElementById("song-form-ccli").value = "";
    document.getElementById("song-form-lyrics").value = "";

    this.renderAdminSongsTab();
    this.renderAdminServicesTab();
    this.showToast(`Saved "${title}" (CCLI #${ccliSongNumber}) to Master Database!`);
  },

  // 3. Admin Instant Scripture Engine + Smart Text-Flow Reflow
  renderAdminScriptureTab() {
    const presetSelect = document.getElementById("scripture-preset-select");
    const translationSelect = document.getElementById("scripture-translation-select");
    const maxCharsSlider = document.getElementById("scripture-reflow-slider");
    const customText = document.getElementById("scripture-custom-textarea");
    const refInput = document.getElementById("scripture-ref-input");

    if (!presetSelect || !translationSelect || !maxCharsSlider || !customText) return;

    const maxChars = parseInt(maxCharsSlider.value, 10) || 145;
    const charLabel = document.getElementById("scripture-char-label");
    if (charLabel) charLabel.textContent = `${maxChars} characters / slide`;

    const refTitle = `${refInput.value || "John 3:16-18"} (${translationSelect.value})`;
    const reflowed = this.smartReflowText(customText.value, maxChars, refTitle);

    const previewContainer = document.getElementById("scripture-engine-slides-preview");
    if (previewContainer) {
      previewContainer.innerHTML = reflowed
        .map(
          (slide) => `
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

  async pushScriptureToActiveService() {
    const refInput = document.getElementById("scripture-ref-input");
    const translationSelect = document.getElementById("scripture-translation-select");
    const maxCharsSlider = document.getElementById("scripture-reflow-slider");
    const customText = document.getElementById("scripture-custom-textarea");

    const ref = (refInput && refInput.value.trim()) || "John 3:16";
    const trans = (translationSelect && translationSelect.value) || "ESV";
    const maxChars = parseInt(maxCharsSlider?.value || "145", 10);
    const raw = (customText && customText.value.trim()) || "";
    if (!raw) return;

    const reflowed = this.smartReflowText(raw, maxChars, `${ref} (${trans})`);
    const activeService = this.services.find(s => s.id === this.selectedServiceId) || this.services[0];
    if (!activeService) return;

    const scriptureItem = {
      id: "item-scr-" + Date.now(),
      type: "scripture",
      title: `Scripture: ${ref} (${trans})`,
      subtitle: `Instant Scripture Engine • ${reflowed.length} Auto-Reflowed Slides`,
      bgId: "bg-deep-worship",
      stageNotes: `Reading from ${ref} (${trans}).`,
      slides: reflowed.map((r, i) => ({
        id: `scr-sl-${Date.now()}-${i}`,
        label: r.label,
        text: r.text,
        bgId: "bg-deep-worship",
        fontScale: 100
      }))
    };

    activeService.items.push(scriptureItem);
    this.saveMasterServices();
    await window.ProViewBackend.updateDocument("proview_services", activeService.id, activeService);

    this.renderAdminServicesTab();
    this.renderOperatorWorkspace();
    this.showToast(`Added ${ref} (${trans}) [${reflowed.length} slides] to ${activeService.title}!`);
  },

  // 4. Admin Master Media Library (Powered by bread.files.upload / list / delete)
  renderAdminMediaTab() {
    const builtinGrid = document.getElementById("admin-builtin-backgrounds");
    if (builtinGrid) {
      builtinGrid.innerHTML = this.backgrounds
        .map(
          bg => `
        <div style="border:1px solid var(--border-subtle);border-radius:14px;overflow:hidden;background:var(--bg-obsidian);">
          <div style="height:125px;background:${bg.css};display:flex;align-items:flex-end;padding:14px;">
            <span class="font-mono" style="font-size:0.74rem;background:rgba(0,0,0,0.65);padding:4px 10px;border-radius:6px;">${this.escapeHtml(bg.type)}</span>
          </div>
          <div style="padding:18px;display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:0.94rem;">${this.escapeHtml(bg.name)}</strong>
            <span class="font-mono" style="font-size:0.74rem;color:var(--accent-emerald);">60fps Ready</span>
          </div>
        </div>
      `
        )
        .join("");
    }

    const uploadedGrid = document.getElementById("admin-uploaded-files-grid");
    if (!uploadedGrid) return;

    if (!this.uploadedFiles || this.uploadedFiles.length === 0) {
      uploadedGrid.innerHTML = `
        <div style="grid-column:1/-1;padding:40px;text-align:center;border:1px dashed var(--border-strong);border-radius:14px;color:var(--text-secondary);">
          No custom media files uploaded yet. Upload a worship photo, background loop, or sermon slide graphic on the left (Max 50MB via BreadBackend <code>bread.files.upload</code>).
        </div>
      `;
      return;
    }

    uploadedGrid.innerHTML = this.uploadedFiles
      .map(
        file => `
      <div style="border:1px solid var(--border-strong);border-radius:14px;overflow:hidden;background:var(--bg-obsidian);">
        <div style="height:140px;background:#050811;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">
          ${
            file.type && file.type.startsWith("video")
              ? `<video src="${file.url}" style="width:100%;height:100%;object-fit:cover;" muted loop autoplay playsinline></video>`
              : `<img src="${file.url}" alt="${this.escapeHtml(file.filename)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />`
          }
          <span class="font-mono" style="position:absolute;top:12px;right:12px;font-size:0.7rem;background:rgba(16,185,129,0.2);border:1px solid var(--accent-emerald);color:#34D399;padding:3px 8px;border-radius:6px;">
            ${file.cloudHosted ? "Cloud URL" : "Synced"}
          </span>
        </div>
        <div style="padding:18px;">
          <div style="font-weight:700;font-size:0.92rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this.escapeHtml(file.filename)}">
            ${this.escapeHtml(file.originalName || file.filename)}
          </div>
          <div class="font-mono" style="font-size:0.72rem;color:var(--text-secondary);margin:6px 0 14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${this.escapeHtml(file.publicEndpointUrl || file.url)}
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-sm btn-cyan" style="flex:1;" onclick="ProViewApp.applyUploadedMediaToActiveSlide('${this.escapeHtml(file.url)}')">Use on Slide</button>
            <button class="btn btn-sm btn-danger" onclick="ProViewApp.deleteUploadedMedia('${this.escapeHtml(file.filename)}')">Delete</button>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  },

  async handleMediaUpload(event) {
    event.preventDefault();
    const fileInput = document.getElementById("myFile");
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      this.showToast("Please choose an image or video file first.");
      return;
    }

    const file = fileInput.files[0];
    const btn = document.getElementById("upload-media-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Uploading via bread.files.upload()...";
    }

    try {
      const uploaded = await window.ProViewBackend.uploadMediaFile(file);
      this.uploadedFiles = await window.ProViewBackend.listMediaFiles();
      fileInput.value = "";
      this.renderAdminMediaTab();
      this.renderOperatorWorkspace();
      this.showToast(`Uploaded "${uploaded.filename}" to ProView Media Library!`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Upload to Cloud Media Library";
      }
    }
  },

  async deleteUploadedMedia(filename) {
    await window.ProViewBackend.deleteMediaFile(filename);
    this.uploadedFiles = await window.ProViewBackend.listMediaFiles();
    this.renderAdminMediaTab();
    this.showToast(`Deleted media file "${filename}".`);
  },

  applyUploadedMediaToActiveSlide(fileUrl) {
    const activeSlide = this.getActiveOperatorSlide();
    if (!activeSlide) return;
    const prev = this.operatorMicroOverrides[activeSlide.id] || {};
    this.operatorMicroOverrides[activeSlide.id] = {
      ...prev,
      customBgUrl: fileUrl
    };
    this.switchView("operator");
    this.renderOperatorWorkspace();
    this.broadcastStageSync();
    this.showToast("Applied uploaded media to active operator slide!");
  },

  // 5. Admin Global Settings & Role Permissions
  renderAdminSettingsTab() {
    const churchInput = document.getElementById("settings-church-name");
    const ccliInput = document.getElementById("settings-ccli-number");
    const fontInput = document.getElementById("settings-global-fontsize");
    if (churchInput) churchInput.value = this.churchProfile.churchName;
    if (ccliInput) ccliInput.value = this.churchProfile.ccliLicense;
    if (fontInput) fontInput.value = this.churchProfile.globalFontSize || 28;
  },

  async saveGlobalSettings(event) {
    event.preventDefault();
    this.churchProfile.churchName = document.getElementById("settings-church-name").value.trim() || "Grace Sanctuary Fellowship";
    this.churchProfile.ccliLicense = document.getElementById("settings-ccli-number").value.trim() || "CCLI #11482903";
    this.churchProfile.globalFontSize = parseInt(document.getElementById("settings-global-fontsize").value, 10) || 28;

    localStorage.setItem("proview_profile", JSON.stringify(this.churchProfile));
    await window.ProViewBackend.createDocument("proview_settings", this.churchProfile);
    this.renderOperatorWorkspace();
    this.showToast("Saved Global Sanctuary Theme & CCLI Settings!");
  },

  saveMasterServices() {
    localStorage.setItem("proview_master_services", JSON.stringify(this.services));
  },

  // ============================================================
  // PROJECT OPERATOR PAGE: THE LIVE EXECUTION HUB
  // ============================================================
  getActiveOperatorService() {
    return this.services.find(s => s.id === this.operatorServiceId) || this.services[0];
  },

  getActiveOperatorItem() {
    const srv = this.getActiveOperatorService();
    if (!srv) return null;
    return srv.items.find(i => i.id === this.operatorActiveItemId) || srv.items[0];
  },

  getActiveOperatorSlide() {
    const item = this.getActiveOperatorItem();
    if (!item || !item.slides.length) return null;
    const idx = Math.max(0, Math.min(this.operatorActiveSlideIndex, item.slides.length - 1));
    return item.slides[idx];
  },

  getEffectiveSlideData(slide, parentItem) {
    if (!slide) return null;
    const override = this.operatorMicroOverrides[slide.id] || {};
    const bgId = override.bgId || slide.bgId || (parentItem && parentItem.bgId) || "bg-sanctuary-amber";
    const bgObj = this.backgrounds.find(b => b.id === bgId) || this.backgrounds[0];

    return {
      id: slide.id,
      label: slide.label,
      text: override.text !== undefined ? override.text : slide.text,
      fontScale: override.fontScale !== undefined ? override.fontScale : (slide.fontScale || 100),
      bgId,
      bgCss: bgObj.css,
      bgName: bgObj.name,
      customBgUrl: override.customBgUrl || null,
      isModified: Object.keys(override).length > 0
    };
  },

  renderOperatorWorkspace() {
    const srv = this.getActiveOperatorService();
    if (!srv) return;
    this.operatorServiceId = srv.id;

    const item = this.getActiveOperatorItem();
    if (item) this.operatorActiveItemId = item.id;

    // 1. Service Selector Dropdown
    const srvSelect = document.getElementById("operator-service-select");
    if (srvSelect) {
      srvSelect.innerHTML = this.services
        .map(s => `<option value="${s.id}" ${s.id === srv.id ? "selected" : ""}>${this.escapeHtml(s.title)} (${this.escapeHtml(s.date)})</option>`)
        .join("");
    }

    // 2. Left Column: Playlist Items
    const playlistEl = document.getElementById("operator-playlist-items");
    if (playlistEl) {
      playlistEl.innerHTML = srv.items
        .map((it, idx) => {
          const active = item && it.id === item.id;
          const badgeClass =
            it.type === "song"
              ? "badge-song"
              : it.type === "scripture"
              ? "badge-scripture"
              : it.type === "sermon"
              ? "badge-sermon"
              : "badge-media";
          return `
          <button class="collection-item-btn ${active ? "active" : ""}" onclick="ProViewApp.selectOperatorPlaylistItem('${it.id}')">
            <div style="min-width:0;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span class="font-mono" style="font-size:0.76rem;color:var(--text-muted);">0${idx + 1}</span>
                <span class="cue-type-badge ${badgeClass}">${it.type}</span>
              </div>
              <div style="font-weight:700;font-size:0.96rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;">
                ${this.escapeHtml(it.title)}
              </div>
              <div style="font-size:0.8rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${this.escapeHtml(it.subtitle || "")}
              </div>
            </div>
            <span class="font-mono" style="font-size:0.78rem;color:var(--text-secondary);">${it.slides.length}</span>
          </button>
        `;
        })
        .join("");
    }

    // 3. Center Column: Slide Cue Grid
    const itemHeader = document.getElementById("operator-active-item-title");
    const itemSub = document.getElementById("operator-active-item-subtitle");
    const cueGrid = document.getElementById("operator-slide-cue-grid");

    if (item && itemHeader && itemSub && cueGrid) {
      itemHeader.textContent = item.title;
      itemSub.textContent = `${item.subtitle || ""}`;

      cueGrid.innerHTML = item.slides
        .map((sl, idx) => {
          const eff = this.getEffectiveSlideData(sl, item);
          const isLive = idx === this.operatorActiveSlideIndex;
          return `
          <button class="slide-cue-card ${isLive ? "live-active" : ""} ${eff.isModified ? "override-modified" : ""}" onclick="ProViewApp.triggerOperatorSlide(${idx})">
            <div>
              <div class="slide-card-header">
                <span class="slide-index-pill">${isLive ? "● ON AIR" : "CUE"} #${idx + 1}</span>
                <span class="slide-section-tag">${this.escapeHtml(eff.label)}</span>
              </div>
              <div class="slide-card-lyrics">${this.escapeHtml(eff.text).replace(/\n/g, "<br>")}</div>
            </div>
            <div class="slide-card-footer">
              <span>${this.escapeHtml(eff.bgName)}</span>
              <span>${eff.fontScale}%</span>
            </div>
          </button>
        `;
        })
        .join("");
    }

    // 4. Populate Micro-Editor Deck for Current Slide
    const activeSlide = this.getActiveOperatorSlide();
    if (activeSlide && item) {
      const eff = this.getEffectiveSlideData(activeSlide, item);
      const microText = document.getElementById("operator-micro-text");
      const microScale = document.getElementById("operator-micro-scale");
      const microScaleLabel = document.getElementById("operator-micro-scale-val");
      const bgSwatches = document.getElementById("operator-bg-swatches");

      if (microText && document.activeElement !== microText) {
        microText.value = eff.text;
      }
      if (microScale) microScale.value = eff.fontScale;
      if (microScaleLabel) microScaleLabel.textContent = `${eff.fontScale}%`;

      if (bgSwatches) {
        bgSwatches.innerHTML = this.backgrounds
          .map(
            bg => `
          <button type="button" class="bg-swatch ${eff.bgId === bg.id && !eff.customBgUrl ? "active" : ""}" style="background:${bg.css};" onclick="ProViewApp.applyOperatorMicroBg('${bg.id}')">
            ${this.escapeHtml(bg.name.split(" ")[0])}
          </button>
        `
          )
          .join("");
      }
    }

    // 5. Right Column: Live Output Monitor & Stage Confidence Monitor
    this.renderLiveOutputMonitors();
  },

  renderLiveOutputMonitors() {
    const item = this.getActiveOperatorItem();
    const activeSlide = this.getActiveOperatorSlide();
    const eff = activeSlide ? this.getEffectiveSlideData(activeSlide, item) : null;

    const screenEl = document.getElementById("operator-live-screen");
    const textEl = document.getElementById("operator-live-text");
    const ccliLeft = document.getElementById("operator-live-ccli-left");
    const ccliRight = document.getElementById("operator-live-ccli-right");
    const nurseryBanner = document.getElementById("operator-nursery-banner");

    if (screenEl && textEl) {
      if (this.displayOverride === "blackout") {
        screenEl.style.background = "#000000";
        textEl.innerHTML = "";
        if (ccliLeft) ccliLeft.textContent = "";
        if (ccliRight) ccliRight.textContent = "";
      } else if (this.displayOverride === "logo") {
        screenEl.style.background = this.backgrounds[0].css;
        textEl.innerHTML = `<div style="font-size:1.35rem;letter-spacing:0.06em;color:var(--accent-amber);">✦ ${this.escapeHtml(this.churchProfile.churchName.toUpperCase())} ✦</div>`;
        if (ccliLeft) ccliLeft.textContent = "";
        if (ccliRight) ccliRight.textContent = "";
      } else if (eff) {
        if (eff.customBgUrl) {
          screenEl.style.background = `url('${eff.customBgUrl}') center/cover no-repeat`;
        } else {
          screenEl.style.background = eff.bgCss;
        }

        if (this.displayOverride === "clear-text") {
          textEl.innerHTML = "";
        } else {
          const basePx = 19 * (eff.fontScale / 100);
          textEl.style.fontSize = `${basePx}px`;
          textEl.innerHTML = this.escapeHtml(eff.text).replace(/\n/g, "<br>");
        }

        if (ccliLeft && ccliRight) {
          if (item && item.type === "song") {
            ccliLeft.textContent = `"${item.title}" • CCLI #${item.ccliSongNumber || ""}`;
            ccliRight.textContent = this.churchProfile.ccliLicense;
          } else if (item && item.type === "scripture") {
            ccliLeft.textContent = eff.label;
            ccliRight.textContent = this.churchProfile.churchName;
          } else {
            ccliLeft.textContent = item ? item.title : "";
            ccliRight.textContent = this.churchProfile.churchName;
          }
        }
      }

      if (nurseryBanner) {
        if (this.nurseryAlertCode) {
          nurseryBanner.style.display = "block";
          nurseryBanner.textContent = `NURSERY ALERT: #${this.nurseryAlertCode}`;
        } else {
          nurseryBanner.style.display = "none";
        }
      }
    }

    const confCurr = document.getElementById("operator-stage-curr");
    const confNext = document.getElementById("operator-stage-next");
    const confNotes = document.getElementById("operator-stage-notes");

    if (confCurr && eff) {
      confCurr.textContent = eff.text.replace(/\n/g, " / ");
    }
    if (confNext && item) {
      const nextSlide = item.slides[this.operatorActiveSlideIndex + 1];
      confNext.textContent = nextSlide
        ? `NEXT: ${nextSlide.text.replace(/\n/g, " / ")}`
        : "NEXT: [End of current item]";
    }
    if (confNotes && item) {
      confNotes.textContent = `NOTES: ${this.customStageMessage || item.stageNotes || "On cue"}`;
    }
  },

  changeOperatorService(serviceId) {
    this.operatorServiceId = serviceId;
    const srv = this.getActiveOperatorService();
    if (srv && srv.items[0]) {
      this.operatorActiveItemId = srv.items[0].id;
    }
    this.operatorActiveSlideIndex = 0;
    this.renderOperatorWorkspace();
    this.broadcastStageSync();
  },

  selectOperatorPlaylistItem(itemId) {
    this.operatorActiveItemId = itemId;
    this.operatorActiveSlideIndex = 0;
    this.displayOverride = "none";
    this.renderOperatorWorkspace();
    this.broadcastStageSync();
  },

  triggerOperatorSlide(slideIndex) {
    this.operatorActiveSlideIndex = slideIndex;
    this.displayOverride = "none";
    this.renderOperatorWorkspace();
    this.renderStageView();
    this.broadcastStageSync();
  },

  nextSlide() {
    const item = this.getActiveOperatorItem();
    if (!item) return;
    if (this.operatorActiveSlideIndex < item.slides.length - 1) {
      this.operatorActiveSlideIndex++;
    } else {
      const srv = this.getActiveOperatorService();
      const currIdx = srv.items.findIndex(i => i.id === item.id);
      if (currIdx >= 0 && currIdx < srv.items.length - 1) {
        this.operatorActiveItemId = srv.items[currIdx + 1].id;
        this.operatorActiveSlideIndex = 0;
      }
    }
    this.displayOverride = "none";
    this.renderOperatorWorkspace();
    this.renderStageView();
    this.broadcastStageSync();
  },

  prevSlide() {
    if (this.operatorActiveSlideIndex > 0) {
      this.operatorActiveSlideIndex--;
      this.displayOverride = "none";
      this.renderOperatorWorkspace();
      this.renderStageView();
      this.broadcastStageSync();
    }
  },

  setDisplayOverride(mode) {
    this.displayOverride = this.displayOverride === mode ? "none" : mode;
    this.renderOperatorWorkspace();
    this.renderStageView();
    this.broadcastStageSync();
  },

  // ============================================================
  // OPERATOR ON-THE-FLY MICRO-EDITING (Protects Master Database!)
  // ============================================================
  applyOperatorMicroText(newText) {
    const slide = this.getActiveOperatorSlide();
    if (!slide) return;
    const prev = this.operatorMicroOverrides[slide.id] || {};
    this.operatorMicroOverrides[slide.id] = { ...prev, text: newText };
    this.renderOperatorWorkspace();
    this.renderStageView();
    this.broadcastStageSync();
  },

  applyOperatorMicroScale(scaleVal) {
    const slide = this.getActiveOperatorSlide();
    if (!slide) return;
    const prev = this.operatorMicroOverrides[slide.id] || {};
    this.operatorMicroOverrides[slide.id] = { ...prev, fontScale: parseInt(scaleVal, 10) || 100 };
    this.renderOperatorWorkspace();
    this.renderStageView();
    this.broadcastStageSync();
  },

  applyOperatorMicroBg(bgId) {
    const slide = this.getActiveOperatorSlide();
    if (!slide) return;
    const prev = this.operatorMicroOverrides[slide.id] || {};
    this.operatorMicroOverrides[slide.id] = { ...prev, bgId, customBgUrl: null };
    this.renderOperatorWorkspace();
    this.renderStageView();
    this.broadcastStageSync();
  },

  splitOverflowingOperatorSlide() {
    const item = this.getActiveOperatorItem();
    const slide = this.getActiveOperatorSlide();
    if (!item || !slide) return;

    const eff = this.getEffectiveSlideData(slide, item);
    const words = eff.text.trim().split(/\s+/);
    if (words.length < 4) {
      this.showToast("Slide text is already concise!");
      return;
    }

    const mid = Math.ceil(words.length / 2);
    const partA = words.slice(0, mid).join(" ");
    const partB = words.slice(mid).join(" ");

    this.operatorMicroOverrides[slide.id] = {
      ...(this.operatorMicroOverrides[slide.id] || {}),
      text: partA,
      fontScale: 100
    };

    const newSubSlide = {
      id: `${slide.id}-split-${Date.now()}`,
      label: `${slide.label} (Part B)`,
      text: partB,
      bgId: eff.bgId,
      fontScale: 100
    };

    item.slides.splice(this.operatorActiveSlideIndex + 1, 0, newSubSlide);
    this.renderOperatorWorkspace();
    this.broadcastStageSync();
    this.showToast("Smart Text-Flow Reflow split overflowing slide into Part A & Part B!");
  },

  resetOperatorSlideOverride() {
    const slide = this.getActiveOperatorSlide();
    if (!slide) return;
    delete this.operatorMicroOverrides[slide.id];
    this.renderOperatorWorkspace();
    this.renderStageView();
    this.broadcastStageSync();
    this.showToast("Reverted slide to Master Admin Template.");
  },

  appendEmergencyOperatorSlide(event) {
    event.preventDefault();
    const labelInput = document.getElementById("emergency-slide-label");
    const textInput = document.getElementById("emergency-slide-text");
    const item = this.getActiveOperatorItem();
    if (!item || !textInput || !textInput.value.trim()) return;

    const newSlide = {
      id: "emerg-" + Date.now(),
      label: (labelInput && labelInput.value.trim()) || "Live Addition",
      text: textInput.value.trim(),
      bgId: item.bgId || "bg-sanctuary-amber",
      fontScale: 100
    };

    item.slides.push(newSlide);
    this.operatorActiveSlideIndex = item.slides.length - 1;
    if (labelInput) labelInput.value = "";
    textInput.value = "";

    this.renderOperatorWorkspace();
    this.renderStageView();
    this.broadcastStageSync();
    this.showToast("Appended last-minute slide directly to active live deck!");
  },

  triggerNurseryAlert() {
    const input = document.getElementById("operator-nursery-input");
    const code = input ? input.value.trim() : "";
    this.nurseryAlertCode = code;
    this.renderLiveOutputMonitors();
    this.broadcastStageSync();
    if (code) {
      this.showToast(`Projected Parent Nursery Pager Alert #${code}`);
    } else {
      this.showToast("Cleared Nursery Alert overlay.");
    }
  },

  // ============================================================
  // CROWD-SOURCED STAGE VIEW SYNC (PASTORS & WORSHIP BAND)
  // ============================================================
  renderStageView() {
    const srv = this.getActiveOperatorService();
    const item = this.getActiveOperatorItem();
    const activeSlide = this.getActiveOperatorSlide();
    const eff = activeSlide ? this.getEffectiveSlideData(activeSlide, item) : null;

    const itemBadge = document.getElementById("stage-full-item-title");
    const currLyric = document.getElementById("stage-full-current-lyric");
    const slideCounter = document.getElementById("stage-full-slide-counter");
    const nextLyric = document.getElementById("stage-full-next-lyric");
    const stageNotes = document.getElementById("stage-full-notes");

    if (itemBadge && item) {
      itemBadge.textContent = `${srv ? srv.title : ""} • ${item.title} (${eff ? eff.label : ""})`;
    }
    if (currLyric) {
      if (this.displayOverride === "blackout") {
        currLyric.textContent = "[MAIN SCREEN BLACKOUT ACTIVE]";
      } else if (eff) {
        currLyric.innerHTML = this.escapeHtml(eff.text).replace(/\n/g, "<br>");
      }
    }
    if (slideCounter && item) {
      slideCounter.textContent = `SLIDE ${this.operatorActiveSlideIndex + 1} OF ${item.slides.length}`;
    }
    if (nextLyric && item) {
      const nextSlide = item.slides[this.operatorActiveSlideIndex + 1];
      nextLyric.innerHTML = nextSlide
        ? this.escapeHtml(nextSlide.text).replace(/\n/g, "<br>")
        : "<em>End of current item — Next playlist cue ready</em>";
    }
    if (stageNotes && item) {
      stageNotes.textContent =
        this.customStageMessage ||
        item.stageNotes ||
        "Confidence Monitor Synced • CCLI & Chord cues locked.";
    }

    this.renderStageCountdownDisplay();
  },

  updateClocks() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const clock1 = document.getElementById("stage-live-clock");
    const clock2 = document.getElementById("operator-stage-clock");
    if (clock1) clock1.textContent = timeStr;
    if (clock2) clock2.textContent = timeStr;
  },

  toggleStageTimer() {
    if (this.stageTimerRunning) {
      clearInterval(this.stageTimerInterval);
      this.stageTimerRunning = false;
    } else {
      this.stageTimerRunning = true;
      this.stageTimerInterval = setInterval(() => {
        if (this.stageTimerSeconds > 0) {
          this.stageTimerSeconds--;
          this.renderStageCountdownDisplay();
        } else {
          clearInterval(this.stageTimerInterval);
          this.stageTimerRunning = false;
        }
      }, 1000);
    }
    this.renderStageCountdownDisplay();
  },

  resetStageTimer(minutes = 35) {
    clearInterval(this.stageTimerInterval);
    this.stageTimerRunning = false;
    this.stageTimerSeconds = minutes * 60;
    this.renderStageCountdownDisplay();
    this.broadcastStageSync();
  },

  renderStageCountdownDisplay() {
    const mins = Math.floor(this.stageTimerSeconds / 60);
    const secs = this.stageTimerSeconds % 60;
    const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    const el1 = document.getElementById("stage-countdown-timer");
    const el2 = document.getElementById("operator-stage-timer");
    if (el1) el1.textContent = formatted;
    if (el2) el2.textContent = formatted;
  },

  sendStageCustomMessage() {
    const input = document.getElementById("operator-stage-msg-input");
    if (!input) return;
    this.customStageMessage = input.value.trim();
    this.renderOperatorWorkspace();
    this.renderStageView();
    this.broadcastStageSync();
    this.showToast("Updated live Stage Confidence Monitor message!");
  },

  broadcastStageSync() {
    if (!this.broadcastChannel) return;
    this.broadcastChannel.postMessage({
      type: "SYNC_STATE",
      payload: {
        operatorServiceId: this.operatorServiceId,
        operatorActiveItemId: this.operatorActiveItemId,
        operatorActiveSlideIndex: this.operatorActiveSlideIndex,
        displayOverride: this.displayOverride,
        nurseryAlertCode: this.nurseryAlertCode,
        operatorMicroOverrides: this.operatorMicroOverrides,
        customStageMessage: this.customStageMessage,
        stageTimerSeconds: this.stageTimerSeconds
      }
    });
  },

  applyRemoteSync(payload) {
    if (!payload) return;
    Object.assign(this, payload);
    this.renderOperatorWorkspace();
    this.renderStageView();
  },

  openStageMonitorWindow() {
    const url = `${window.location.origin}${window.location.pathname}?view=stage`;
    window.open(url, "ProViewStageMonitor", "width=1100,height=720");
    this.showToast("Opened Crowd-Sourced Stage View in new window (Real-time sync active)!");
  },

  handleGlobalKeydown(e) {
    if (this.currentView !== "operator") return;
    const tag = (e.target && e.target.tagName) || "";
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

    if (e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      this.nextSlide();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      this.prevSlide();
    } else if (e.key.toLowerCase() === "b") {
      this.setDisplayOverride("blackout");
    } else if (e.key.toLowerCase() === "c") {
      this.setDisplayOverride("clear-text");
    } else if (e.key.toLowerCase() === "l") {
      this.setDisplayOverride("logo");
    }
  },

  showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.innerHTML = `<span style="color:var(--accent-emerald);font-weight:800;">●</span> <span>${this.escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 250);
    }, 3600);
  },

  escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
};

window.ProViewApp = ProViewApp;
window.addEventListener("DOMContentLoaded", () => ProViewApp.init());
