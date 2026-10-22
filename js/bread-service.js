/* ============================================================
   BREADBACKEND INTEGRATION & CLOUD-SYNC ENGINE
   Project: ProView (/proview)
   Base URL: https://kaidaz18.duckdns.org/api/v1/proview
   SDK URL:  https://kaidaz18.duckdns.org/sdk/bread-client.js
============================================================ */

const BREAD_BASE_URL = "https://kaidaz18.duckdns.org/api/v1/proview";
const BREAD_API_KEY = "pk_live_kzIciEsEmutDNA22zmUkx14Y";

// Load external BreadClient SDK asynchronously after initial paint so page load is never blocked
(function loadBreadSdkAsync() {
  if (typeof window !== "undefined" && !document.querySelector('script[data-bread-sdk]')) {
    const s = document.createElement("script");
    s.src = "https://kaidaz18.duckdns.org/sdk/bread-client.js";
    s.async = true;
    s.defer = true;
    s.setAttribute("data-bread-sdk", "true");
    document.head.appendChild(s);
  }
})();

function fetchWithTimeout(url, options = {}, timeoutMs = 2000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

if (typeof window.BreadClient === "undefined") {
  window.BreadClient = class BreadClientFast {
    constructor(config) {
      this.baseUrl = (config && config.baseUrl) || BREAD_BASE_URL;
      this.apiKey = (config && config.apiKey) || BREAD_API_KEY;
      this.token = localStorage.getItem("proview_bread_token") || null;

      this.auth = {
        signup: async (email, password) => {
          const res = await this._request("/auth/signup", {
            method: "POST",
            body: JSON.stringify({ email, password })
          });
          if (res && res.token) {
            this.token = res.token;
            localStorage.setItem("proview_bread_token", res.token);
          }
          return res.user || res;
        },
        login: async (email, password) => {
          const res = await this._request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
          });
          if (res && res.token) {
            this.token = res.token;
            localStorage.setItem("proview_bread_token", res.token);
          }
          return res;
        },
        me: async () => {
          return await this._request("/auth/me", { method: "GET" });
        }
      };

      this.files = {
        upload: async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const headers = { "x-api-key": this.apiKey };
          if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
          const response = await fetchWithTimeout(
            `${this.baseUrl}/files`,
            {
              method: "POST",
              headers,
              body: formData
            },
            8000
          );
          if (!response.ok) throw new Error(`Upload failed (${response.status})`);
          return await response.json();
        },
        list: async () => {
          return await this._request("/files", { method: "GET" });
        },
        delete: async (filename) => {
          return await this._request(`/files/${encodeURIComponent(filename)}`, {
            method: "DELETE"
          });
        }
      };
    }

    collection(name) {
      return {
        create: async (data) =>
          this._request(`/collections/${encodeURIComponent(name)}`, {
            method: "POST",
            body: JSON.stringify(data)
          }),
        get: async () =>
          this._request(`/collections/${encodeURIComponent(name)}`, {
            method: "GET"
          }),
        getById: async (id) =>
          this._request(`/collections/${encodeURIComponent(name)}/${encodeURIComponent(id)}`, {
            method: "GET"
          }),
        update: async (id, data) =>
          this._request(`/collections/${encodeURIComponent(name)}/${encodeURIComponent(id)}`, {
            method: "PUT",
            body: JSON.stringify(data)
          }),
        delete: async (id) =>
          this._request(`/collections/${encodeURIComponent(name)}/${encodeURIComponent(id)}`, {
            method: "DELETE"
          })
      };
    }

    async _request(path, options = {}) {
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        ...(options.headers || {})
      };
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }
      const response = await fetchWithTimeout(`${this.baseUrl}${path}`, {
        ...options,
        headers
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(errText || `HTTP ${response.status}`);
      }
      return await response.json();
    }
  };
}

const bread = new window.BreadClient({
  baseUrl: BREAD_BASE_URL,
  apiKey: BREAD_API_KEY
});

window.bread = bread;

const ProViewBackend = {
  cloudConnected: false,
  lastSyncTime: null,

  _getLocalList(collectionName) {
    try {
      const raw = localStorage.getItem(`proview_col_${collectionName}`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  _saveLocalList(collectionName, items) {
    try {
      localStorage.setItem(`proview_col_${collectionName}`, JSON.stringify(items));
    } catch (_) {}
  },

  async handleSignup(email, password, profileMeta = {}) {
    let cloudUser = null;
    try {
      const res = await bread.auth.signup(email, password);
      cloudUser = res && res.user ? res.user : res;
      this.cloudConnected = true;
      try {
        await bread.auth.login(email, password);
      } catch (_) {}
    } catch (err) {
      try {
        const loginRes = await bread.auth.login(email, password);
        cloudUser = loginRes && loginRes.user ? loginRes.user : loginRes;
        this.cloudConnected = true;
      } catch (_) {}
    }

    const userObj = {
      id: (cloudUser && (cloudUser.id || cloudUser._id)) || "usr_" + Date.now(),
      email: email.trim(),
      churchName: profileMeta.churchName || "Grace Sanctuary Fellowship",
      ccliLicense: profileMeta.ccliLicense || "CCLI #11482903",
      role: profileMeta.role || "Admin & Worship Director",
      plan: "100% Free Forever",
      createdAt: new Date().toISOString(),
      cloudSynced: this.cloudConnected
    };

    localStorage.setItem("proview_active_user", JSON.stringify(userObj));

    try {
      await bread.collection("profiles").create(userObj);
      this.cloudConnected = true;
    } catch (_) {}

    return userObj;
  },

  async handleLogin(email, password) {
    let session = null;
    try {
      session = await bread.auth.login(email, password);
      this.cloudConnected = true;
    } catch (_) {}

    const saved = this.getStoredUser();
    const userObj = {
      id: (session && session.user && (session.user.id || session.user._id)) || (saved && saved.id) || "usr_" + Date.now(),
      email: email.trim(),
      churchName: (saved && saved.churchName) || "Grace Sanctuary Fellowship",
      ccliLicense: (saved && saved.ccliLicense) || "CCLI #11482903",
      role: (saved && saved.role) || "Admin & Worship Director",
      plan: "100% Free Forever",
      cloudSynced: this.cloudConnected
    };

    localStorage.setItem("proview_active_user", JSON.stringify(userObj));
    return { user: userObj, session };
  },

  async getCurrentUser() {
    try {
      const me = await bread.auth.me();
      if (me && (me.email || (me.user && me.user.email))) {
        this.cloudConnected = true;
        const rawUser = me.user || me;
        const local = this.getStoredUser() || {};
        const merged = {
          ...local,
          ...rawUser,
          churchName: local.churchName || "Grace Sanctuary Fellowship",
          ccliLicense: local.ccliLicense || "CCLI #11482903",
          plan: "100% Free Forever"
        };
        localStorage.setItem("proview_active_user", JSON.stringify(merged));
        return merged;
      }
    } catch (_) {}
    return this.getStoredUser();
  },

  getStoredUser() {
    try {
      const raw = localStorage.getItem("proview_active_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  logout() {
    localStorage.removeItem("proview_active_user");
    localStorage.removeItem("proview_bread_token");
  },

  async createDocument(collectionName, payload) {
    const docWithMeta = {
      ...payload,
      updatedAt: new Date().toISOString()
    };
    try {
      const created = await bread.collection(collectionName).create(docWithMeta);
      this.cloudConnected = true;
      this.lastSyncTime = new Date();
      const finalDoc = {
        ...docWithMeta,
        ...(created || {}),
        id: (created && (created.id || created._id)) || payload.id || `doc_${Date.now()}`
      };
      const list = this._getLocalList(collectionName);
      this._saveLocalList(collectionName, [finalDoc, ...list.filter(i => i.id !== finalDoc.id)]);
      return finalDoc;
    } catch (err) {
      const fallbackDoc = { ...docWithMeta, id: payload.id || `doc_${Date.now()}` };
      const list = this._getLocalList(collectionName);
      this._saveLocalList(collectionName, [fallbackDoc, ...list.filter(i => i.id !== fallbackDoc.id)]);
      return fallbackDoc;
    }
  },

  async fetchCollection(collectionName) {
    try {
      const res = await bread.collection(collectionName).get();
      this.cloudConnected = true;
      this.lastSyncTime = new Date();
      const items = Array.isArray(res) ? res : (res && Array.isArray(res.data || res.items) ? (res.data || res.items) : []);
      if (items.length > 0) {
        this._saveLocalList(collectionName, items);
        return items;
      }
    } catch (_) {}
    return this._getLocalList(collectionName);
  },

  async updateDocument(collectionName, id, updates) {
    try {
      const updated = await bread.collection(collectionName).update(id, updates);
      this.cloudConnected = true;
      this.lastSyncTime = new Date();
      const list = this._getLocalList(collectionName).map(item =>
        item.id === id ? { ...item, ...updates, ...(updated || {}) } : item
      );
      this._saveLocalList(collectionName, list);
      return updated;
    } catch (_) {
      const list = this._getLocalList(collectionName).map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      this._saveLocalList(collectionName, list);
      return { id, ...updates };
    }
  },

  async deleteDocument(collectionName, id) {
    try {
      await bread.collection(collectionName).delete(id);
      this.cloudConnected = true;
    } catch (_) {}
    const list = this._getLocalList(collectionName).filter(item => item.id !== id);
    this._saveLocalList(collectionName, list);
    return true;
  },

  async uploadMediaFile(file) {
    try {
      const result = await bread.files.upload(file);
      this.cloudConnected = true;
      const filename = result.filename || result.name || file.name;
      const fileUrl = `${BREAD_BASE_URL}/files/${filename}`;
      const mediaEntry = {
        filename,
        originalName: file.name,
        size: file.size,
        type: file.type || "image/jpeg",
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
        cloudHosted: true
      };
      const existing = this._getLocalList("uploaded_files");
      this._saveLocalList("uploaded_files", [mediaEntry, ...existing]);
      return mediaEntry;
    } catch (_) {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const mediaEntry = {
        filename: safeName,
        originalName: file.name,
        size: file.size,
        type: file.type || "image/png",
        url: dataUrl,
        publicEndpointUrl: `${BREAD_BASE_URL}/files/${safeName}`,
        uploadedAt: new Date().toISOString(),
        cloudHosted: false
      };
      const existing = this._getLocalList("uploaded_files");
      this._saveLocalList("uploaded_files", [mediaEntry, ...existing]);
      return mediaEntry;
    }
  },

  async listMediaFiles() {
    try {
      const res = await bread.files.list();
      this.cloudConnected = true;
      const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.files) ? res.files : []);
      const mapped = rawList.map(f => {
        const fname = typeof f === "string" ? f : (f.filename || f.name);
        return {
          filename: fname,
          originalName: (f && f.originalName) || fname,
          url: `${BREAD_BASE_URL}/files/${fname}`,
          type: (f && f.type) || (/\.(mp4|webm|mov)$/i.test(fname) ? "video/mp4" : "image/jpeg"),
          cloudHosted: true
        };
      });
      const localOnly = this._getLocalList("uploaded_files").filter(
        loc => !mapped.some(m => m.filename === loc.filename)
      );
      return [...mapped, ...localOnly];
    } catch (_) {
      return this._getLocalList("uploaded_files");
    }
  },

  async deleteMediaFile(filename) {
    try {
      await bread.files.delete(filename);
      this.cloudConnected = true;
    } catch (_) {}
    const filtered = this._getLocalList("uploaded_files").filter(f => f.filename !== filename);
    this._saveLocalList("uploaded_files", filtered);
    return true;
  },

  async checkConnection() {
    try {
      const res = await fetchWithTimeout(
        `${BREAD_BASE_URL}/collections/posts`,
        { headers: { "x-api-key": BREAD_API_KEY } },
        1500
      );
      if (res.ok || res.status === 401 || res.status === 404) {
        this.cloudConnected = true;
        return true;
      }
    } catch (_) {
      this.cloudConnected = false;
    }
    return this.cloudConnected;
  }
};

window.ProViewBackend = ProViewBackend;
