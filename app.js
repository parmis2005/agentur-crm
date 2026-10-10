const STORAGE_KEY = "digitalVisionCrm.v1";

const statuses = [
  { key: "Neu", probability: 10 },
  { key: "Qualifiziert", probability: 30 },
  { key: "Angebot", probability: 55 },
  { key: "Verhandlung", probability: 75 },
  { key: "Gewonnen", probability: 100 },
  { key: "Verloren", probability: 0 },
];

const services = ["Website", "SEO", "Ads", "Branding", "Automation", "Content"];
const sources = ["Empfehlung", "Website", "LinkedIn", "Instagram", "Kaltakquise", "Event"];

const sampleLeads = [
  {
    id: createId(),
    name: "Mara Klein",
    company: "Klein & Partner",
    email: "mara@klein-partner.de",
    phone: "+49 30 5550 184",
    status: "Angebot",
    service: "Website",
    source: "Empfehlung",
    priority: "Hoch",
    value: 8600,
    probability: 55,
    nextAction: "Angebot besprechen",
    nextActionDate: daysFromNow(1),
    notes: "Relaunch fuer Kanzlei. Fokus: Vertrauen, klare Leistungen, schnelle Kontaktaufnahme.",
    activities: [
      { id: createId(), text: "Discovery Call abgeschlossen", date: daysFromNow(-2) },
    ],
    createdAt: daysFromNow(-12),
    updatedAt: daysFromNow(-2),
  },
  {
    id: createId(),
    name: "Jonas Mertens",
    company: "Urban Fit Studio",
    email: "jonas@urbanfit.de",
    phone: "+49 40 2219 510",
    status: "Qualifiziert",
    service: "Ads",
    source: "Instagram",
    priority: "Mittel",
    value: 3200,
    probability: 30,
    nextAction: "Media-Budget klaeren",
    nextActionDate: daysFromNow(0),
    notes: "Will neue Mitglieder fuer Januar-Kampagne gewinnen.",
    activities: [],
    createdAt: daysFromNow(-7),
    updatedAt: daysFromNow(-1),
  },
  {
    id: createId(),
    name: "Elena Vogt",
    company: "Vogt Immobilien",
    email: "elena@vogt-immobilien.de",
    phone: "+49 69 3334 901",
    status: "Verhandlung",
    service: "Automation",
    source: "LinkedIn",
    priority: "Hoch",
    value: 12400,
    probability: 75,
    nextAction: "Vertrag finalisieren",
    nextActionDate: daysFromNow(2),
    notes: "CRM-Automation plus Lead-Nurturing. Datenschutzfragen offen.",
    activities: [
      { id: createId(), text: "Technische Anforderungen gesammelt", date: daysFromNow(-4) },
    ],
    createdAt: daysFromNow(-18),
    updatedAt: daysFromNow(-1),
  },
  {
    id: createId(),
    name: "Rami Saleh",
    company: "Nordlicht Cafe",
    email: "rami@nordlicht.example",
    phone: "+49 421 980 771",
    status: "Neu",
    service: "SEO",
    source: "Website",
    priority: "Niedrig",
    value: 2400,
    probability: 10,
    nextAction: "Erstgespraech terminieren",
    nextActionDate: daysFromNow(4),
    notes: "Lokale Sichtbarkeit fuer zwei Standorte.",
    activities: [],
    createdAt: daysFromNow(-1),
    updatedAt: daysFromNow(-1),
  },
  {
    id: createId(),
    name: "Nina Hartmann",
    company: "Lumen Home",
    email: "nina@lumenhome.de",
    phone: "+49 89 4451 208",
    status: "Gewonnen",
    service: "Branding",
    source: "Empfehlung",
    priority: "Mittel",
    value: 6800,
    probability: 100,
    nextAction: "Kickoff vorbereiten",
    nextActionDate: daysFromNow(3),
    notes: "Corporate Design und Shop-Visuals.",
    activities: [{ id: createId(), text: "Anzahlung eingegangen", date: daysFromNow(-3) }],
    createdAt: daysFromNow(-23),
    updatedAt: daysFromNow(-3),
  },
];

let state = loadState();
let editingLeadId = null;
let selectedPipelineService = "all";

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  hydrateSelects();
  bindEvents();
  renderAll();
  if (window.lucide) window.lucide.createIcons();
});

function cacheElements() {
  Object.assign(els, {
    todayLabel: document.querySelector("#todayLabel"),
    viewTitle: document.querySelector("#viewTitle"),
    globalSearch: document.querySelector("#globalSearch"),
    metricsGrid: document.querySelector("#metricsGrid"),
    hotLeadStack: document.querySelector("#hotLeadStack"),
    focusTaskList: document.querySelector("#focusTaskList"),
    pipelineBoard: document.querySelector("#pipelineBoard"),
    leadTableBody: document.querySelector("#leadTableBody"),
    taskColumns: document.querySelector("#taskColumns"),
    statusChart: document.querySelector("#statusChart"),
    sourceChart: document.querySelector("#sourceChart"),
    monthlyGoal: document.querySelector("#monthlyGoal"),
    goalProgress: document.querySelector("#goalProgress"),
    goalCopy: document.querySelector("#goalCopy"),
    statusFilter: document.querySelector("#statusFilter"),
    sourceFilter: document.querySelector("#sourceFilter"),
    sortSelect: document.querySelector("#sortSelect"),
    leadDialog: document.querySelector("#leadDialog"),
    leadForm: document.querySelector("#leadForm"),
    leadDialogTitle: document.querySelector("#leadDialogTitle"),
    deleteLeadButton: document.querySelector("#deleteLeadButton"),
    activityArea: document.querySelector("#activityArea"),
    activityInput: document.querySelector("#activityInput"),
    activityList: document.querySelector("#activityList"),
    toast: document.querySelector("#toast"),
  });
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-lead]");
    const advanceButton = event.target.closest("[data-advance-lead]");
    const completeButton = event.target.closest("[data-complete-task]");

    if (editButton) openLeadDialog(editButton.dataset.editLead);
    if (advanceButton) advanceLead(advanceButton.dataset.advanceLead);
    if (completeButton) completeTask(completeButton.dataset.completeTask);
  });

  document.querySelectorAll(".nav-item, [data-view-shortcut]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view || button.dataset.viewShortcut));
  });

  document.querySelector("#openLeadModal").addEventListener("click", () => openLeadDialog());
  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => els.leadDialog.close());
  });

  els.globalSearch.addEventListener("input", renderAll);
  els.statusFilter.addEventListener("change", renderLeads);
  els.sourceFilter.addEventListener("change", renderLeads);
  els.sortSelect.addEventListener("change", renderLeads);
  els.monthlyGoal.addEventListener("input", () => {
    state.settings.monthlyGoal = Number(els.monthlyGoal.value || 0);
    saveState();
    renderInsights();
  });

  els.leadForm.addEventListener("submit", saveLeadFromForm);
  els.deleteLeadButton.addEventListener("click", deleteCurrentLead);
  document.querySelector("#addActivityButton").addEventListener("click", addActivity);
  document.querySelector("#exportCsvButton").addEventListener("click", exportCsv);
  document.querySelector("#backupJsonButton").addEventListener("click", backupJson);
  document.querySelector("#restoreJsonInput").addEventListener("change", restoreJson);
  document.querySelector("#importCsvInput").addEventListener("change", importCsv);

  document.querySelector("#pipelineFilter").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-service]");
    if (!button) return;
    selectedPipelineService = button.dataset.service;
    document.querySelectorAll("#pipelineFilter button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderPipeline();
  });
}

function hydrateSelects() {
  const selectOptions = (items, includeAll = false) =>
    `${includeAll ? '<option value="all">Alle</option>' : ""}${items
      .map((item) => `<option value="${escapeHtml(item.key || item)}">${escapeHtml(item.key || item)}</option>`)
      .join("")}`;

  document.querySelector("#status").innerHTML = selectOptions(statuses);
  document.querySelector("#service").innerHTML = selectOptions(services);
  document.querySelector("#source").innerHTML = selectOptions(sources);
  els.statusFilter.innerHTML = selectOptions(statuses, true);
  els.sourceFilter.innerHTML = selectOptions(sources, true);
  els.monthlyGoal.value = state.settings.monthlyGoal;
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {
      leads: sampleLeads,
      settings: { monthlyGoal: 15000, currency: "EUR" },
    };
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      leads: Array.isArray(parsed.leads) ? parsed.leads : sampleLeads,
      settings: { monthlyGoal: 15000, currency: "EUR", ...(parsed.settings || {}) },
    };
  } catch {
    return {
      leads: sampleLeads,
      settings: { monthlyGoal: 15000, currency: "EUR" },
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderAll() {
  els.todayLabel.textContent = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
  renderDashboard();
  renderPipeline();
  renderLeads();
  renderTasks();
  renderInsights();
  if (window.lucide) window.lucide.createIcons();
}

function switchView(view) {
  const titles = {
    dashboard: "Übersicht",
    pipeline: "Pipeline",
    leads: "Leads",
    tasks: "Aufgaben",
    insights: "Insights",
  };

  document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
  document.querySelector(`#${view}View`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });
  els.viewTitle.textContent = titles[view];
}

function getVisibleLeads() {
  const query = els.globalSearch.value.trim().toLowerCase();
  return state.leads.filter((lead) => {
    const haystack = [lead.name, lead.company, lead.email, lead.phone, lead.status, lead.service, lead.source]
      .join(" ")
      .toLowerCase();
    return !query || haystack.includes(query);
  });
}

function renderDashboard() {
  const leads = getVisibleLeads();
  const openLeads = leads.filter((lead) => !["Gewonnen", "Verloren"].includes(lead.status));
  const pipelineValue = sum(openLeads.map((lead) => lead.value));
  const weightedValue = sum(openLeads.map((lead) => lead.value * ((lead.probability || 0) / 100)));
  const wonValue = sum(leads.filter((lead) => lead.status === "Gewonnen").map((lead) => lead.value));
  const overdue = leads.filter((lead) => isBeforeToday(lead.nextActionDate) && lead.status !== "Gewonnen").length;

  els.metricsGrid.innerHTML = [
    metric("Offene Leads", openLeads.length, `${leads.length} Kontakte gesamt`),
    metric("Pipeline", formatCurrency(pipelineValue), "Nicht gewonnene Deals"),
    metric("Forecast", formatCurrency(weightedValue), "Nach Wahrscheinlichkeit"),
    metric("Gewonnen", formatCurrency(wonValue), `${overdue} ueberfaellige Aktionen`),
  ].join("");

  const hotLeads = [...openLeads]
    .sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority) || dateValue(a.nextActionDate) - dateValue(b.nextActionDate))
    .slice(0, 5);

  els.hotLeadStack.innerHTML =
    hotLeads.map(renderLeadCard).join("") || emptyState("Noch keine aktiven Chancen.");

  const focusTasks = [...openLeads]
    .filter((lead) => lead.nextAction && lead.nextActionDate)
    .sort((a, b) => dateValue(a.nextActionDate) - dateValue(b.nextActionDate))
    .slice(0, 6);

  els.focusTaskList.innerHTML =
    focusTasks.map(renderTaskCard).join("") || emptyState("Keine faelligen Follow-ups.");
}

function renderPipeline() {
  const leads = getVisibleLeads().filter(
    (lead) => selectedPipelineService === "all" || lead.service === selectedPipelineService,
  );

  els.pipelineBoard.innerHTML = statuses
    .map((status) => {
      const columnLeads = leads.filter((lead) => lead.status === status.key);
      const total = sum(columnLeads.map((lead) => lead.value));
      return `
        <section class="pipeline-column" data-status="${escapeHtml(status.key)}">
          <div class="pipeline-heading">
            <span>${escapeHtml(status.key)}</span>
            <span>${columnLeads.length} / ${formatCurrency(total)}</span>
          </div>
          ${columnLeads.map(renderPipelineCard).join("") || emptyState("Leer")}
        </section>
      `;
    })
    .join("");

  bindPipelineDrag();
}

function renderLeads() {
  const status = els.statusFilter.value || "all";
  const source = els.sourceFilter.value || "all";
  const sort = els.sortSelect.value || "nextAction";
  const leads = getVisibleLeads()
    .filter((lead) => status === "all" || lead.status === status)
    .filter((lead) => source === "all" || lead.source === source)
    .sort((a, b) => {
      if (sort === "value") return b.value - a.value;
      if (sort === "updatedAt") return dateValue(b.updatedAt) - dateValue(a.updatedAt);
      if (sort === "company") return a.company.localeCompare(b.company);
      return dateValue(a.nextActionDate) - dateValue(b.nextActionDate);
    });

  els.leadTableBody.innerHTML =
    leads
      .map(
        (lead) => `
          <tr>
            <td>
              <strong>${escapeHtml(lead.name)}</strong>
              <div class="table-subline">${escapeHtml(lead.email || "Keine E-Mail")}</div>
            </td>
            <td>${escapeHtml(lead.company)}</td>
            <td>${statusBadge(lead.status)}</td>
            <td>${serviceBadge(lead.service)}</td>
            <td>
              <strong>${formatCurrency(lead.value)}</strong>
              <div class="table-subline">${lead.probability || 0}% Forecast</div>
            </td>
            <td>
              <strong>${escapeHtml(lead.nextAction || "Offen")}</strong>
              <div class="table-subline">${formatDate(lead.nextActionDate)}</div>
            </td>
            <td>
              <button class="secondary-button" data-edit-lead="${lead.id}">
                <i data-lucide="pencil"></i>
                Bearbeiten
              </button>
            </td>
          </tr>
        `,
      )
      .join("") || `<tr><td colspan="7">${emptyState("Keine Leads gefunden.")}</td></tr>`;

}

function renderTasks() {
  const groups = [
    { key: "overdue", title: "Ueberfaellig", filter: (lead) => isBeforeToday(lead.nextActionDate) },
    { key: "today", title: "Heute", filter: (lead) => isToday(lead.nextActionDate) },
    { key: "upcoming", title: "Demnaechst", filter: (lead) => isAfterToday(lead.nextActionDate) },
  ];
  const openLeads = getVisibleLeads().filter((lead) => !["Gewonnen", "Verloren"].includes(lead.status));

  els.taskColumns.innerHTML = groups
    .map((group) => {
      const items = openLeads
        .filter((lead) => lead.nextAction && lead.nextActionDate && group.filter(lead))
        .sort((a, b) => dateValue(a.nextActionDate) - dateValue(b.nextActionDate));
      return `
        <section class="task-column">
          <h2>${group.title}</h2>
          ${items.map(renderTaskCard).join("") || emptyState("Keine Aufgaben.")}
        </section>
      `;
    })
    .join("");
}

function renderInsights() {
  renderChart(els.statusChart, statuses.map((status) => ({
    label: status.key,
    value: sum(state.leads.filter((lead) => lead.status === status.key).map((lead) => lead.value)),
  })));

  renderChart(els.sourceChart, sources.map((source) => ({
    label: source,
    value: sum(state.leads.filter((lead) => lead.source === source).map((lead) => lead.value)),
  })));

  const month = new Date().toISOString().slice(0, 7);
  const wonThisMonth = sum(
    state.leads
      .filter((lead) => lead.status === "Gewonnen" && (lead.updatedAt || "").startsWith(month))
      .map((lead) => lead.value),
  );
  const goal = Number(state.settings.monthlyGoal || 0);
  const percent = goal > 0 ? Math.min(100, Math.round((wonThisMonth / goal) * 100)) : 0;
  els.goalProgress.style.width = `${percent}%`;
  els.goalCopy.textContent = `${formatCurrency(wonThisMonth)} von ${formatCurrency(goal)} erreicht (${percent}%).`;
}

function renderChart(container, rows) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  container.innerHTML = rows
    .filter((row) => row.value > 0)
    .map(
      (row) => `
        <div class="chart-row">
          <strong>${escapeHtml(row.label)}</strong>
          <div class="chart-track"><span style="width:${Math.max(3, (row.value / max) * 100)}%"></span></div>
          <span>${formatCurrency(row.value)}</span>
        </div>
      `,
    )
    .join("") || emptyState("Noch keine Daten.");
}

function renderLeadCard(lead) {
  return `
    <article class="lead-card">
      <div>
        <h3>${escapeHtml(lead.company)}</h3>
        <div class="lead-meta">${escapeHtml(lead.name)} · ${escapeHtml(lead.nextAction || "Keine Aktion")}</div>
        <div class="badge-row">
          ${statusBadge(lead.status)}
          ${serviceBadge(lead.service)}
          <span class="badge gold">${formatCurrency(lead.value)}</span>
        </div>
      </div>
      <button class="icon-button" data-edit-lead="${lead.id}" aria-label="Lead bearbeiten">
        <i data-lucide="arrow-up-right"></i>
      </button>
    </article>
  `;
}

function renderPipelineCard(lead) {
  return `
    <article class="pipeline-card" draggable="true" data-lead-id="${lead.id}">
      <h3>${escapeHtml(lead.company)}</h3>
      <div class="lead-meta">${escapeHtml(lead.name)} · ${formatCurrency(lead.value)}</div>
      <div class="badge-row">
        ${serviceBadge(lead.service)}
        <span class="badge ${lead.priority === "Hoch" ? "rose" : ""}">${escapeHtml(lead.priority)}</span>
      </div>
      <div class="card-actions">
        <button class="secondary-button" data-edit-lead="${lead.id}">
          <i data-lucide="pencil"></i>
        </button>
        <button class="secondary-button" data-advance-lead="${lead.id}">
          <i data-lucide="arrow-right"></i>
        </button>
      </div>
    </article>
  `;
}

function renderTaskCard(lead) {
  return `
    <article class="task-card">
      <h3>${escapeHtml(lead.nextAction || "Follow-up")}</h3>
      <div class="task-meta">${escapeHtml(lead.company)} · ${escapeHtml(lead.name)}</div>
      <div class="badge-row">
        <span class="badge ${isBeforeToday(lead.nextActionDate) ? "rose" : ""}">${formatDate(lead.nextActionDate)}</span>
        ${statusBadge(lead.status)}
      </div>
      <div class="card-actions">
        <button class="secondary-button" data-edit-lead="${lead.id}">
          <i data-lucide="pencil"></i>
          Bearbeiten
        </button>
        <button class="primary-button" data-complete-task="${lead.id}">
          <i data-lucide="check"></i>
          Erledigt
        </button>
      </div>
    </article>
  `;
}

function bindPipelineDrag() {
  document.querySelectorAll(".pipeline-card").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", card.dataset.leadId);
    });
  });

  document.querySelectorAll(".pipeline-column").forEach((column) => {
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      column.classList.add("drag-over");
    });
    column.addEventListener("dragleave", () => column.classList.remove("drag-over"));
    column.addEventListener("drop", (event) => {
      event.preventDefault();
      column.classList.remove("drag-over");
      updateLeadStatus(event.dataTransfer.getData("text/plain"), column.dataset.status);
    });
  });
}

function openLeadDialog(id = null) {
  editingLeadId = id;
  const lead = id ? state.leads.find((item) => item.id === id) : null;
  els.leadDialogTitle.textContent = lead ? `${lead.company} bearbeiten` : "Neuer Lead";
  els.deleteLeadButton.style.display = lead ? "inline-flex" : "none";
  els.activityArea.classList.toggle("active", Boolean(lead));

  const defaults = {
    id: "",
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "Neu",
    service: "Website",
    source: "Website",
    priority: "Mittel",
    value: 2500,
    probability: 10,
    nextAction: "Follow-up",
    nextActionDate: daysFromNow(2),
    notes: "",
    activities: [],
  };
  const data = { ...defaults, ...(lead || {}) };

  Object.entries(data).forEach(([key, value]) => {
    const field = document.querySelector(`#${key}`);
    if (field && key !== "activities") field.value = value ?? "";
  });
  renderActivities(data.activities || []);
  els.leadDialog.showModal();
  if (window.lucide) window.lucide.createIcons();
}

function saveLeadFromForm(event) {
  event.preventDefault();
  const form = new FormData(els.leadForm);
  const existing = editingLeadId ? state.leads.find((lead) => lead.id === editingLeadId) : null;
  const status = String(form.get("status"));
  const statusDefault = statuses.find((item) => item.key === status)?.probability || 0;
  const payload = {
    id: editingLeadId || createId(),
    name: String(form.get("name")).trim(),
    company: String(form.get("company")).trim(),
    email: String(form.get("email")).trim(),
    phone: String(form.get("phone")).trim(),
    status,
    service: String(form.get("service")),
    source: String(form.get("source")),
    priority: String(form.get("priority")),
    value: Number(form.get("value") || 0),
    probability: Number(form.get("probability") || statusDefault),
    nextAction: String(form.get("nextAction")).trim(),
    nextActionDate: String(form.get("nextActionDate")),
    notes: String(form.get("notes")).trim(),
    activities: existing?.activities || [],
    createdAt: existing?.createdAt || todayIso(),
    updatedAt: todayIso(),
  };

  if (existing) {
    state.leads = state.leads.map((lead) => (lead.id === existing.id ? payload : lead));
  } else {
    state.leads.unshift(payload);
  }

  saveState();
  els.leadDialog.close();
  renderAll();
  showToast("Lead gespeichert.");
}

function deleteCurrentLead() {
  if (!editingLeadId) return;
  const lead = state.leads.find((item) => item.id === editingLeadId);
  const confirmed = window.confirm(`${lead.company} wirklich loeschen?`);
  if (!confirmed) return;
  state.leads = state.leads.filter((item) => item.id !== editingLeadId);
  saveState();
  els.leadDialog.close();
  renderAll();
  showToast("Lead geloescht.");
}

function addActivity() {
  if (!editingLeadId || !els.activityInput.value.trim()) return;
  const lead = state.leads.find((item) => item.id === editingLeadId);
  (lead.activities ||= []).unshift({
    id: createId(),
    text: els.activityInput.value.trim(),
    date: todayIso(),
  });
  lead.updatedAt = todayIso();
  els.activityInput.value = "";
  saveState();
  renderActivities(lead.activities);
  renderAll();
}

function renderActivities(activities) {
  els.activityList.innerHTML =
    activities
      .map(
        (activity) => `
          <div class="activity-item">
            <div>
              <strong>${escapeHtml(activity.text)}</strong>
              <small>${formatDate(activity.date)}</small>
            </div>
          </div>
        `,
      )
      .join("") || emptyState("Noch keine Aktivitaeten.");
}

function advanceLead(id) {
  const lead = state.leads.find((item) => item.id === id);
  const index = statuses.findIndex((status) => status.key === lead.status);
  const next = statuses[Math.min(index + 1, statuses.length - 1)];
  updateLeadStatus(id, next.key);
}

function updateLeadStatus(id, status) {
  const lead = state.leads.find((item) => item.id === id);
  if (!lead || lead.status === status) return;
  lead.status = status;
  lead.probability = statuses.find((item) => item.key === status)?.probability ?? lead.probability;
  lead.updatedAt = todayIso();
  (lead.activities ||= []).unshift({
    id: createId(),
    text: `Status geaendert zu ${status}`,
    date: todayIso(),
  });
  saveState();
  renderAll();
  showToast("Pipeline aktualisiert.");
}

function completeTask(id) {
  const lead = state.leads.find((item) => item.id === id);
  if (!lead) return;
  (lead.activities ||= []).unshift({
    id: createId(),
    text: `Aufgabe erledigt: ${lead.nextAction}`,
    date: todayIso(),
  });
  lead.nextAction = "Naechster Check-in";
  lead.nextActionDate = daysFromNow(7);
  lead.updatedAt = todayIso();
  saveState();
  renderAll();
  showToast("Aufgabe erledigt.");
}

function exportCsv() {
  const header = [
    "name",
    "company",
    "email",
    "phone",
    "status",
    "service",
    "source",
    "priority",
    "value",
    "probability",
    "nextAction",
    "nextActionDate",
    "notes",
  ];
  const rows = state.leads.map((lead) => header.map((key) => csvCell(lead[key])).join(","));
  downloadFile(`digital-vision-leads-${todayIso()}.csv`, [header.join(","), ...rows].join("\n"), "text/csv");
}

function backupJson() {
  downloadFile(
    `digital-vision-crm-backup-${todayIso()}.json`,
    JSON.stringify(state, null, 2),
    "application/json",
  );
}

function restoreJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!Array.isArray(data.leads)) throw new Error("Invalid backup");
      state = {
        leads: data.leads,
        settings: { monthlyGoal: 15000, currency: "EUR", ...(data.settings || {}) },
      };
      saveState();
      hydrateSelects();
      renderAll();
      showToast("Backup wiederhergestellt.");
    } catch {
      showToast("Backup konnte nicht gelesen werden.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function importCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCsv(String(reader.result));
    if (rows.length < 2) {
      showToast("CSV enthaelt keine Leads.");
      return;
    }
    const header = rows[0].map((item) => item.trim());
    const imported = rows.slice(1).map((row) => {
      const record = Object.fromEntries(header.map((key, index) => [key, row[index] || ""]));
      const status = statuses.some((item) => item.key === record.status) ? record.status : "Neu";
      return {
        id: createId(),
        name: record.name || record.Kontakt || "Unbenannter Lead",
        company: record.company || record.Firma || "Neue Firma",
        email: record.email || "",
        phone: record.phone || "",
        status,
        service: services.includes(record.service) ? record.service : "Website",
        source: sources.includes(record.source) ? record.source : "Website",
        priority: ["Hoch", "Mittel", "Niedrig"].includes(record.priority) ? record.priority : "Mittel",
        value: Number(record.value || 0),
        probability: Number(record.probability || statuses.find((item) => item.key === status)?.probability || 0),
        nextAction: record.nextAction || "Follow-up",
        nextActionDate: record.nextActionDate || daysFromNow(2),
        notes: record.notes || "",
        activities: [],
        createdAt: todayIso(),
        updatedAt: todayIso(),
      };
    });
    state.leads = [...imported, ...state.leads];
    saveState();
    renderAll();
    showToast(`${imported.length} Leads importiert.`);
  };
  reader.readAsText(file);
  event.target.value = "";
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function metric(label, value, caption) {
  return `
    <article class="metric-card">
      <small>${label}</small>
      <strong>${value}</strong>
      <span>${caption}</span>
    </article>
  `;
}

function statusBadge(status) {
  const className = status === "Verloren" ? "rose" : status === "Gewonnen" ? "gold" : "";
  return `<span class="badge ${className}">${escapeHtml(status)}</span>`;
}

function serviceBadge(service) {
  return `<span class="badge">${escapeHtml(service)}</span>`;
}

function emptyState(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: state.settings.currency || "EUR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Kein Datum";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isBeforeToday(value) {
  return value && dateValue(value) < dateValue(todayIso());
}

function isToday(value) {
  return value && dateValue(value) === dateValue(todayIso());
}

function isAfterToday(value) {
  return value && dateValue(value) > dateValue(todayIso());
}

function dateValue(value) {
  return value ? new Date(`${value}T12:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
}

function priorityScore(priority) {
  return { Hoch: 3, Mittel: 2, Niedrig: 1 }[priority] || 0;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => els.toast.classList.remove("visible"), 2200);
}
