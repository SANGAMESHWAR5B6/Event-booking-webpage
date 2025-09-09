/* ===============================
   Smart Event Booking — TechVille
   Frontend-only SPA using LocalStorage
   AENEXZ Tech Major Project — Features:
   - Dynamic events (filter/sort/search)
   - Modal booking with validation & seat updates
   - My Bookings with cancellation + seat restore
   - Hidden Admin Panel (Ctrl + Shift + A) with CRUD
   - Theme toggle persisted
   - Custom 404 section for invalid routes
   - No page reloads; SPA routing via hash
   =============================== */

/* ---------- Storage Keys ---------- */
const KEYS = {
  EVENTS: "sv_events",
  BOOKINGS: "sv_bookings",
  THEME: "sv_theme",
};

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const fmtINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/* ---------- Seed data (only if empty) ---------- */
function seedIfEmpty() {
  const existing = JSON.parse(localStorage.getItem(KEYS.EVENTS) || "[]");
  if (existing.length) return;

  const demo = [
    { id: uid(), name: "Tech Conference 2025", category: "Tech", date: "2025-09-15", price: 1499, availableSeats: 120, description: "Flagship TechVille conference on AI, Cloud, Security." },
    { id: uid(), name: "AI & Robotics Expo", category: "Tech", date: "2025-10-01", price: 999, availableSeats: 200, description: "Showcase of cutting-edge AI robots and startups." },
    { id: uid(), name: "Music Fest", category: "Music", date: "2025-10-20", price: 799, availableSeats: 350, description: "Open-air concert with indie and electronic artists." },
    { id: uid(), name: "Startup Pitch Night", category: "Business", date: "2025-09-25", price: 499, availableSeats: 80, description: "Early-stage founders pitch to TechVille angels." },
    { id: uid(), name: "Design & UX Summit", category: "Design", date: "2025-11-05", price: 1299, availableSeats: 140, description: "Talks and workshops on modern product design." },
  ];
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(demo));
}

/* ---------- State ---------- */
const state = {
  route: "#/",
  events: [],
  bookings: [],
  filters: {
    category: "all",
    sortBy: "date_asc",
    search: "",
  },
};

/* ---------- Load / Save ---------- */
function loadAll() {
  state.events = JSON.parse(localStorage.getItem(KEYS.EVENTS) || "[]");
  state.bookings = JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || "[]");
}
function saveEvents() {
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(state.events));
}
function saveBookings() {
  localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(state.bookings));
}

/* ---------- Theme ---------- */
(function initTheme() {
  const saved = localStorage.getItem(KEYS.THEME) || "light";
  document.documentElement.setAttribute("data-theme", saved);
})();
$("#themeToggle").addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(KEYS.THEME, next);
});

/* ---------- Year footer ---------- */
$("#year").textContent = new Date().getFullYear();

/* ---------- Routing ---------- */
function parseRoute() {
  const hash = location.hash || "#/";
  state.route = hash;

  // Route patterns: #/ , #/bookings , #/event/:id
  const parts = hash.slice(2).split("/"); // after "#/"
  if (hash === "#/" || hash === "") return { name: "home" };
  if (hash.startsWith("#/bookings")) return { name: "bookings" };
  if (hash.startsWith("#/event/")) return { name: "event", id: parts[1] || "" };
  return { name: "404" };
}

function showView(id) {
  $$(".view").forEach(v => v.classList.add("hidden"));
  $(id).classList.remove("hidden");
}

function routeToCurrent() {
  const route = parseRoute();

  // Controls bar only on home
  $("#controlsBar").classList.toggle("hidden", route.name !== "home");

  if (route.name === "home") {
    showView("#homeView");
    renderHome();
    return;
  }

  if (route.name === "bookings") {
    showView("#bookingsView");
    renderBookings();
    return;
  }

  if (route.name === "event") {
    const ev = state.events.find(e => e.id === route.id);
    if (!ev) {
      showView("#notFoundView");
      return;
    }
    showView("#eventView");
    renderEventDetails(ev);
    return;
  }

  showView("#notFoundView");
}

window.addEventListener("hashchange", routeToCurrent);

/* ---------- Rendering: Home (list with filters/sort) ---------- */
function categoriesFromEvents() {
  const set = new Set(state.events.map(e => e.category));
  return ["all", ...Array.from(set)];
}
function setupCategoryFilterOptions() {
  const sel = $("#filterCategory");
  const cur = sel.value || "all";
  sel.innerHTML = "";
  categoriesFromEvents().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat; opt.textContent = cat[0].toUpperCase() + cat.slice(1);
    sel.appendChild(opt);
  });
  sel.value = cur; // keep selection if possible
}

function applyFiltersSortSearch(evts) {
  let list = [...evts];

  // search
  const q = state.filters.search.trim().toLowerCase();
  if (q) list = list.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q) ||
    (e.description || "").toLowerCase().includes(q)
  );

  // filter by category
  if (state.filters.category !== "all") {
    list = list.filter(e => e.category.toLowerCase() === state.filters.category.toLowerCase());
  }

  // sort
  const s = state.filters.sortBy;
  const cmp = {
    date_asc: (a, b) => a.date.localeCompare(b.date),
    date_desc: (a, b) => b.date.localeCompare(a.date),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
  }[s] || ((a, b) => a.date.localeCompare(b.date));
  list.sort(cmp);

  return list;
}

function renderHome() {
  setupCategoryFilterOptions();
  const grid = $("#eventsGrid");
  grid.innerHTML = "";

  const list = applyFiltersSortSearch(state.events);

  if (!list.length) {
    grid.innerHTML = `<div class="card"><p>No events found. Try adjusting filters.</p></div>`;
    return;
  }

  list.forEach(e => {
    const card = document.createElement("article");
    card.className = "card event";

    card.innerHTML = `
      <div class="title">${e.name}</div>
      <div class="kv"><span>Category:</span><strong>${e.category}</strong></div>
      <div class="kv"><span>Date:</span><strong>${e.date}</strong></div>
      <div class="kv"><span>Price:</span><strong>${fmtINR(e.price)}</strong></div>
      <div class="kv"><span>Available Seats:</span><strong>${e.availableSeats}</strong></div>
      <div class="row">
        <a class="btn ghost small" href="#/event/${e.id}">View</a>
        <button class="btn small" data-book="${e.id}" ${e.availableSeats <= 0 ? "disabled" : ""}>Book Now</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Wire book buttons
  $$("[data-book]").forEach(btn => {
    btn.addEventListener("click", () => openBooking(btn.dataset.book));
  });
}

/* ---------- Event Details ---------- */
$("#backHome").addEventListener("click", () => location.hash = "#/");
function renderEventDetails(e) {
  const wrap = $("#eventDetails");
  wrap.innerHTML = `
    <div class="stack">
      <h2>${e.name}</h2>
      <div class="row wrap">
        <span class="chip">Category: ${e.category}</span>
        <span class="chip">Date: ${e.date}</span>
        <span class="chip">Price: ${fmtINR(e.price)}</span>
        <span class="chip">Available: ${e.availableSeats}</span>
      </div>
      <p class="muted">${e.description || "No description provided."}</p>
      <div class="row">
        <button class="btn" id="evBook" ${e.availableSeats <= 0 ? "disabled" : ""}>Book Now</button>
      </div>
    </div>
  `;
  $("#evBook")?.addEventListener("click", () => openBooking(e.id));
}

/* ---------- Booking Modal + Validation ---------- */
const bookingModal = $("#bookingModal");
const bmName = $("#bmName");
const bmTickets = $("#bmTickets");
const bmError = $("#bmError");
let bookingEventId = null;

function openBooking(eventId) {
  const e = state.events.find(x => x.id === eventId);
  if (!e) return;

  bookingEventId = e.id;
  $("#bmEventName").textContent = e.name;
  $("#bmEventDate").textContent = e.date;
  $("#bmEventPrice").textContent = fmtINR(e.price);
  $("#bmEventAvail").textContent = e.availableSeats;

  bmName.value = "";
  bmTickets.value = "";
  bmTickets.max = String(e.availableSeats);
  bmError.textContent = "";

  bookingModal.showModal();
  bmName.focus();
}
function closeBooking() { bookingModal.close(); }

$("#closeBooking").addEventListener("click", closeBooking);
$("#cancelBooking").addEventListener("click", closeBooking);

$("#bookingForm").addEventListener("submit", (ev) => {
  ev.preventDefault();
  bmError.textContent = "";

  const e = state.events.find(x => x.id === bookingEventId);
  if (!e) { bmError.textContent = "Event not found."; return; }

  const name = bmName.value.trim();
  const t = parseInt(bmTickets.value, 10);

  if (!name) { bmError.textContent = "Please enter your name."; return; }
  if (!(t > 0)) { bmError.textContent = "Tickets must be at least 1."; return; }
  if (t > e.availableSeats) { bmError.textContent = "Not enough seats available."; return; }

  // Save booking
  const booking = {
    id: uid(),
    eventId: e.id,
    eventName: e.name,
    eventDate: e.date,
    price: e.price,
    name,
    tickets: t,
    bookedAt: new Date().toISOString(),
  };
  state.bookings.push(booking);
  saveBookings();

  // Update seats
  e.availableSeats -= t;
  saveEvents();

  // Refresh views instantly
  renderHome();
  if (!$("#bookingsView").classList.contains("hidden")) renderBookings();
  if (!$("#eventView").classList.contains("hidden")) renderEventDetails(e);

  closeBooking();
  alert("Booking confirmed!");
});

/* ---------- My Bookings (list + cancel) ---------- */
function renderBookings() {
  const list = $("#bookingsList");
  list.innerHTML = "";

  if (!state.bookings.length) {
    list.innerHTML = `<div class="card"><p>No bookings yet.</p></div>`;
    return;
  }

  state.bookings
    .slice()
    .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
    .forEach(b => {
      const card = document.createElement("div");
      card.className = "card stack";
      card.innerHTML = `
        <div class="row wrap">
          <strong>${b.eventName}</strong>
          <span class="chip">Date: ${b.eventDate}</span>
          <span class="chip">Tickets: ${b.tickets}</span>
          <span class="chip">Paid: ${fmtINR(b.tickets * b.price)}</span>
        </div>
        <div class="row end">
          <button class="btn ghost small" data-cancel="${b.id}">Cancel Booking</button>
        </div>
      `;
      list.appendChild(card);
    });

  $$("[data-cancel]").forEach(btn => {
    btn.addEventListener("click", () => cancelBooking(btn.dataset.cancel));
  });
}

function cancelBooking(bookingId) {
  const idx = state.bookings.findIndex(b => b.id === bookingId);
  if (idx === -1) return;

  const b = state.bookings[idx];
  const ev = state.events.find(e => e.id === b.eventId);
  if (ev) {
    ev.availableSeats += b.tickets; // restore seats
    saveEvents();
  }

  state.bookings.splice(idx, 1);
  saveBookings();

  renderBookings();
  renderHome();
  if (!$("#eventView").classList.contains("hidden") && ev) renderEventDetails(ev);

  alert("Booking cancelled and seats restored.");
}

/* ---------- Filters / Sort / Search wiring ---------- */
$("#filterCategory").addEventListener("change", (e) => {
  state.filters.category = e.target.value;
  renderHome();
});
$("#sortBy").addEventListener("change", (e) => {
  state.filters.sortBy = e.target.value;
  renderHome();
});
$("#searchInput").addEventListener("input", (e) => {
  state.filters.search = e.target.value;
  renderHome();
});
$("#resetFilters").addEventListener("click", () => {
  state.filters = { category: "all", sortBy: "date_asc", search: "" };
  $("#filterCategory").value = "all";
  $("#sortBy").value = "date_asc";
  $("#searchInput").value = "";
  renderHome();
});

/* ---------- Hidden Admin Panel ---------- */
const adminDialog = $("#adminPanel");

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === "a")) {
    e.preventDefault();
    openAdmin();
  }
});
$("#closeAdmin").addEventListener("click", () => adminDialog.close());
$("#addEventBtn").addEventListener("click", () => addEventForm());
$("#seedDemoBtn").addEventListener("click", () => { seedIfEmpty(); loadAll(); routeToCurrent(); });
$("#exportBtn").addEventListener("click", exportJSON);
$("#importInput").addEventListener("change", importJSON);

function openAdmin() {
  renderAdminList();
  adminDialog.showModal();
}

function renderAdminList() {
  const list = $("#adminList");
  list.innerHTML = "";

  // Existing events
  state.events
    .slice()
    .sort((a,b) => a.date.localeCompare(b.date))
    .forEach(e => {
      const card = document.createElement("div");
      card.className = "card stack";
      card.innerHTML = `
        <div class="row wrap">
          <strong>${e.name}</strong>
          <span class="chip">Category: ${e.category}</span>
          <span class="chip">Date: ${e.date}</span>
          <span class="chip">Price: ${fmtINR(e.price)}</span>
          <span class="chip">Seats: ${e.availableSeats}</span>
        </div>
        <p class="muted">${e.description || ""}</p>
        <div class="row end gap">
          <button class="btn ghost small" data-edit="${e.id}">Edit</button>
          <button class="btn ghost small" data-del="${e.id}">Delete</button>
        </div>
      `;
      list.appendChild(card);
    });

  // Wire buttons
  $$("[data-edit]").forEach(btn => btn.addEventListener("click", () => editEventForm(btn.dataset.edit)));
  $$("[data-del]").forEach(btn => btn.addEventListener("click", () => deleteEvent(btn.dataset.del)));
}

function addEventForm() {
  const list = $("#adminList");
  const tmpl = $("#eventFormTemplate").content.cloneNode(true);
  const block = tmpl.querySelector(".event-form");
  block.dataset.mode = "create";
  list.prepend(block);
  wireEventForm(block, null);
}

function editEventForm(eventId) {
  const e = state.events.find(x => x.id === eventId);
  if (!e) return;
  const list = $("#adminList");
  const tmpl = $("#eventFormTemplate").content.cloneNode(true);
  const block = tmpl.querySelector(".event-form");
  block.dataset.mode = "edit";
  block.dataset.id = e.id;

  const inputs = {
    name: block.querySelector('input[name="name"]'),
    category: block.querySelector('input[name="category"]'),
    date: block.querySelector('input[name="date"]'),
    price: block.querySelector('input[name="price"]'),
    availableSeats: block.querySelector('input[name="availableSeats"]'),
    description: block.querySelector('textarea[name="description"]'),
  };
  inputs.name.value = e.name;
  inputs.category.value = e.category;
  inputs.date.value = e.date;
  inputs.price.value = e.price;
  inputs.availableSeats.value = e.availableSeats;
  inputs.description.value = e.description || "";

  list.prepend(block);
  wireEventForm(block, e.id);
}

function wireEventForm(block, existingId) {
  const btnSave = block.querySelector(".ef-save");
  const btnCancel = block.querySelector(".ef-cancel");
  btnCancel.addEventListener("click", () => block.remove());

  btnSave.addEventListener("click", () => {
    const data = Object.fromEntries(
      $$("input, textarea", block).map(el => [el.name, el.value])
    );

    // validation
    if (!data.name || !data.category || !data.date) return alert("Please fill all required fields.");
    const price = parseInt(data.price, 10);
    const seats = parseInt(data.availableSeats, 10);
    if (isNaN(price) || price < 0) return alert("Price must be a non-negative number.");
    if (isNaN(seats) || seats < 0) return alert("Available seats must be a non-negative number.");

    if (existingId) {
      const idx = state.events.findIndex(e => e.id === existingId);
      if (idx !== -1) {
        state.events[idx] = { ...state.events[idx], ...data, price, availableSeats: seats };
      }
    } else {
      state.events.push({
        id: uid(),
        name: data.name,
        category: data.category,
        date: data.date,
        price,
        availableSeats: seats,
        description: data.description || "",
      });
    }

    saveEvents();
    renderAdminList();
    // Reflect changes instantly across app
    renderHome();
    if (!$("#eventView").classList.contains("hidden")) {
      const route = parseRoute();
      const ev = state.events.find(e => e.id === route.id);
      if (ev) renderEventDetails(ev);
    }
  });
}

function deleteEvent(eventId) {
  if (!confirm("Delete this event? This cannot be undone.")) return;
  const idx = state.events.findIndex(e => e.id === eventId);
  if (idx !== -1) {
    state.events.splice(idx, 1);
    saveEvents();
    renderAdminList();
    renderHome();
    const route = parseRoute();
    if (route.name === "event" && route.id === eventId) {
      location.hash = "#/"; // the detail page is gone—route home
    }
  }
}

function exportJSON() {
  const data = {
    events: state.events,
    bookings: state.bookings,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `smart-events-export-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.events)) throw new Error("Invalid file: missing events[]");
      state.events = data.events;
      if (Array.isArray(data.bookings)) state.bookings = data.bookings;
      saveEvents(); saveBookings();
      renderAdminList(); renderHome(); routeToCurrent();
      alert("Import successful.");
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  reader.readAsText(file);
}

/* ---------- Boot ---------- */
seedIfEmpty();
loadAll();

// Initialize controls with loaded data
$("#filterCategory").value = "all";
$("#sortBy").value = "date_asc";
$("#searchInput").value = "";

// Initial route
routeToCurrent();
