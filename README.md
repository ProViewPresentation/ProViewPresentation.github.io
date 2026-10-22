# ProView — Next-Generation Church Presentation Software

**ProView** is a 100% free, purpose-built church presentation platform engineered specifically for houses of worship. It eliminates the clunkiness of secular slide tools like PowerPoint and the steep learning curves and heavy hardware requirements of legacy church software—combining fluid speed, intuitive multi-layered management, and a decoupled dual-interface workflow.

---

## 1. How ProView Works

ProView operates on a **decoupled permission and dual-workspace architecture**, separating deep structural preparation during the week from real-time Sunday-morning execution:

* **The Database Core:** All songs, media files (photos, loops, background videos), Bible translations, and sermon elements are stored in a centralized, cloud-synced BreadBackend (`/api/v1/proview`) or local database.
* **The Service Organizer:** Services are built as chronological **"Collections"** (*Sunday Morning Traditional*, *Youth Night*, *Midweek Bible Study*). Items can be reordered, grouped, and nested effortlessly.
* **The Live Engine:** When **Go Live** is clicked, ProView transitions into a high-performance rendering engine that outputs customized feeds to main projection screens, stage confidence monitors, and NDI/video streams.

---

## 2. Core Features

* **Seamless Multi-Media Integration:** Blends text slides, lyrics, background loops, high-resolution photos, and foreground videos without stuttering or format conversion delays.
* **Smart Collection & Sermon Builder:** Create nested slide collections grouping an entire sermon series, scripture references, and presentation points under a single parent folder.
* **Built-In Copyright & CCLI Automation:** Automatically tracks and appends CCLI license numbers, song titles, and author credits to the bottom corner of lyric slides.
* **Instant Scripture Engine:** Pulls verses from multiple Bible translations (ESV, NIV, KJV, NLT) on the fly, auto-formatting them across slides based on user-defined character length preferences.

---

## 3. Dual Workspaces: Admin Page vs. Project Operator Page

1. **The Admin Page (The Control & Creation Hub):** Where 90% of preparation, song importing, media library management (`bread.files`), global theme setup, and service collection mapping happens ahead of time.
2. **The Project Operator Page (The Live Execution Hub):** Built for volunteers and projectionists during a live service. Includes **On-the-Fly Micro-Editing Capabilities** (adjusting slide text density, splitting overflowing slides with Smart Text-Flow Reflow, swapping backgrounds, or injecting emergency slides) while keeping master templates 100% protected.
3. **Crowd-Sourced Stage View Sync:** Real-time confidence monitor for pastors and worship musicians with live clock, segment countdown timer, next-slide preview, and private stage notes.
