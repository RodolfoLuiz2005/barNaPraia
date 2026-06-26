/* Maré Pina Beach Bar - central admin */

const STORAGE_KEYS = {
  products: "marePinaProducts",
  settings: "marePinaSettings",
  serviceRequests: "marePinaServiceRequests",
  tableSessions: "marePinaTableSessions",
  closedTables: "marePinaClosedTables"
};

const DEFAULT_SETTINGS = {
  whatsapp: "5581999999999",
  hours: "Sáb a Qua • 7h às 17h30",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Praia%20do%20Pina%20Recife%20PE"
};

const CATEGORIES = ["Promoções", "Petiscos", "Frutos do mar", "Peixes completos", "Porções", "Drinks", "Cervejas", "Refrigerantes e sucos", "Sobremesas"];
const IMAGE_OPTIONS = [
  "assets/images/menu-combo.svg", "assets/images/menu-peixe.svg", "assets/images/menu-camarao.svg", "assets/images/menu-lagosta.svg",
  "assets/images/menu-caldinho.svg", "assets/images/menu-agulhinha.svg", "assets/images/menu-isca.svg", "assets/images/menu-batata.svg",
  "assets/images/menu-caipirinha.svg", "assets/images/menu-drink.svg", "assets/images/menu-cerveja.svg", "assets/images/menu-coco.svg",
  "assets/images/menu-refri.svg", "assets/images/menu-sobremesa.svg"
];

const DEFAULT_PRODUCTS = [
  { id: "combo-praia", name: "Combo Praia", category: "Promoções", description: "Petisco da casa com dois drinks tropicais.", price: 8990, image: "assets/images/menu-combo.svg" },
  { id: "peixe-completo", name: "Peixe completo", category: "Peixes completos", description: "Peixe frito com arroz, feijão, farofa e macaxeira.", price: 12990, image: "assets/images/menu-peixe.svg" },
  { id: "camarao-alho-oleo", name: "Camarão alho e óleo", category: "Frutos do mar", description: "Camarões salteados com alho e limão.", price: 8490, image: "assets/images/menu-camarao.svg" },
  { id: "lagosta-temporada", name: "Lagosta da temporada", category: "Frutos do mar", description: "Especial sujeito à disponibilidade do dia.", price: 15990, image: "assets/images/menu-lagosta.svg" },
  { id: "caldinho", name: "Caldinho", category: "Petiscos", description: "Caldinho cremoso servido quente.", price: 1390, image: "assets/images/menu-caldinho.svg" },
  { id: "agulhinha-frita", name: "Agulhinha frita", category: "Petiscos", description: "Porção crocante com limão.", price: 4490, image: "assets/images/menu-agulhinha.svg" },
  { id: "isca-peixe", name: "Isca de peixe", category: "Porções", description: "Tirinhas empanadas com molho da casa.", price: 5790, image: "assets/images/menu-isca.svg" },
  { id: "batata-frita", name: "Batata frita", category: "Porções", description: "Batata sequinha e crocante.", price: 3290, image: "assets/images/menu-batata.svg" },
  { id: "caipirinha", name: "Caipirinha", category: "Drinks", description: "Clássica de limão com gelo.", price: 1890, image: "assets/images/menu-caipirinha.svg" },
  { id: "drink-tropical", name: "Drink tropical", category: "Drinks", description: "Frutas, gelo e clima de verão.", price: 2490, image: "assets/images/menu-drink.svg" },
  { id: "cerveja-long-neck", name: "Cerveja long neck", category: "Cervejas", description: "Cerveja bem gelada.", price: 1290, image: "assets/images/menu-cerveja.svg" },
  { id: "agua-coco", name: "Água de coco", category: "Refrigerantes e sucos", description: "Natural e refrescante.", price: 990, image: "assets/images/menu-coco.svg" },
  { id: "refrigerante", name: "Refrigerante lata", category: "Refrigerantes e sucos", description: "Opções variadas.", price: 790, image: "assets/images/menu-refri.svg" },
  { id: "sobremesa-coco", name: "Cocada cremosa", category: "Sobremesas", description: "Sobremesa regional com coco.", price: 1590, image: "assets/images/menu-sobremesa.svg" }
];

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

// Data boundary: replace these localStorage calls with Firebase, Supabase, auth and realtime listeners in production.
const DataService = {
  getProducts() {
    const stored = safeJsonParse(localStorage.getItem(STORAGE_KEYS.products), null);
    return Array.isArray(stored) && stored.length ? stored : DEFAULT_PRODUCTS;
  },
  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  },
  getSettings() {
    return { ...DEFAULT_SETTINGS, ...safeJsonParse(localStorage.getItem(STORAGE_KEYS.settings), {}) };
  },
  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  },
  getRequests() {
    const stored = safeJsonParse(localStorage.getItem(STORAGE_KEYS.serviceRequests), []);
    return Array.isArray(stored) ? stored : [];
  },
  saveRequests(requests) {
    localStorage.setItem(STORAGE_KEYS.serviceRequests, JSON.stringify(requests));
  },
  updateRequestStatus(id, status) {
    const now = new Date().toISOString();
    let updatedRequest = null;
    const requests = this.getRequests().map(request => {
      if (request.id !== id) return request;
      updatedRequest = {
        ...request,
        status,
        updatedAt: now,
        history: [...(request.history || []), { status, at: now }]
      };
      return updatedRequest;
    });
    this.saveRequests(requests);
    return updatedRequest;
  },
  getCustomerSessions() {
    const stored = safeJsonParse(localStorage.getItem(STORAGE_KEYS.tableSessions), []);
    return Array.isArray(stored) ? stored : [];
  },
  saveCustomerSessions(sessions) {
    localStorage.setItem(STORAGE_KEYS.tableSessions, JSON.stringify(sessions));
  },
  updateCustomerSession(sessionId, data) {
    const sessions = this.getCustomerSessions();
    const index = sessions.findIndex(session => session.id === sessionId);
    if (index < 0) return null;
    sessions[index] = { ...sessions[index], ...data, updatedAt: new Date().toISOString() };
    this.saveCustomerSessions(sessions);
    return sessions[index];
  },
  getClosedTables() {
    const stored = safeJsonParse(localStorage.getItem(STORAGE_KEYS.closedTables), []);
    return Array.isArray(stored) ? stored : [];
  },
  saveClosedTables(tables) {
    localStorage.setItem(STORAGE_KEYS.closedTables, JSON.stringify(tables));
  },
  finishTable(sessionId, summary) {
    const sessions = this.getCustomerSessions();
    const index = sessions.findIndex(session => session.id === sessionId);
    if (index >= 0) sessions[index] = { ...sessions[index], ...summary, status: "finalizada" };
    else sessions.unshift({ ...summary, id: sessionId, status: "finalizada" });
    this.saveCustomerSessions(sessions);
    const closed = this.getClosedTables().filter(table => table.id !== sessionId);
    closed.unshift({ ...summary, id: sessionId, status: "finalizada" });
    this.saveClosedTables(closed.slice(0, 300));
  }
};

let products = loadProducts();
let settings = loadSettings();
let activeFilter = "todos";
let lastRenderedSignature = "";
let soundEnabled = false;
let knownRequestIds = new Set();
let audioContext = null;

function safeJsonParse(value, fallback) {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function loadProducts() {
  return DataService.getProducts();
}

function loadSettings() {
  return DataService.getSettings();
}

function saveProductsToStorage() {
  DataService.saveProducts(products);
}

function saveSettingsToStorage() {
  DataService.saveSettings(settings);
}

function getServiceRequests() {
  return DataService.getRequests();
}

function saveServiceRequests(requests) {
  DataService.saveRequests(requests);
}

function formatRequestType(type) {
  const labels = { pedido: "Pedido", garcom: "Garçom", conta: "Conta", gelo: "Gelo", limpeza: "Limpeza", atendimento: "Atendimento" };
  return labels[type] || "Solicitação";
}

function formatStatus(status) {
  const labels = { novo: "Novo", em_atendimento: "Em atendimento", preparando: "Preparando", concluido: "ConcluÃ­do", cancelado: "Cancelado" };
  return labels[status] || status;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((Number(value) || 0) / 100);
}

function formatDate(value) {
  if (!value) return "Agora";
  return new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function getWaitMinutes(value) {
  if (!value) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
}

function formatWaitTime(value) {
  const minutes = getWaitMinutes(value);
  if (minutes < 1) return "agora";
  if (minutes === 1) return "1 min";
  return minutes + " min";
}

function formatBraceletStatus(value) {
  return value ? "Sim" : "Não";
}

function renderMinorInfo(minors = []) {
  if (!Array.isArray(minors) || minors.length === 0) return "";
  const braceletNeeded = minors.some(minor => minor.needsBracelet);
  const list = minors.map(minor =>
    '<li><strong>' + escapeHtml(minor.firstName) + ' ' + escapeHtml(minor.lastName) + '</strong>' +
    '<span>' + escapeHtml(minor.age) + ' anos • Fitinha: ' + formatBraceletStatus(minor.needsBracelet) + '</span></li>'
  ).join("");
  return '<div class="minor-info"><strong>Dados dos menores</strong>' +
    '<span class="minor-alert">Mesa com menor de idade</span>' +
    '<span>Fitinha necessária: ' + formatBraceletStatus(braceletNeeded) + '</span>' +
    '<ul>' + list + '</ul></div>';
}

function renderCustomerInfo(request) {
  const hasMinors = Boolean(request.hasMinors);
  return '<div class="customer-info ' + (hasMinors ? 'has-minors' : '') + '">' +
    '<span><strong>Mesa/guarda-sol:</strong> ' + escapeHtml(request.table || 'Não informada') + '</span>' +
    '<span><strong>Responsável:</strong> ' + escapeHtml(request.customerName || 'Não informado') + '</span>' +
    '<span><strong>WhatsApp:</strong> ' + escapeHtml(request.customerPhone || 'Não informado') + '</span>' +
    '<span><strong>Pessoas:</strong> ' + escapeHtml(request.peopleCount || 'Não informado') + '</span>' +
    '<span><strong>Tem menor:</strong> ' + formatBraceletStatus(hasMinors) + '</span>' +
    '</div>' + renderMinorInfo(request.minors || []);
}

function buildWhatsAppUrl(phone, message) {
  const target = String(phone || settings.whatsapp || DEFAULT_SETTINGS.whatsapp).replace(/\D/g, "");
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

function buildRequestMessage(request) {
  const itemLines = (request.items || []).map(item => `${item.quantity}x ${item.name} - ${formatCurrency(item.total || item.price * item.quantity)}`);
  return [
    `Olá, sobre a solicitação ${request.id} do Maré Pina.`,
    `Tipo: ${formatRequestType(request.type)}`,
    `Mesa/guarda-sol: ${request.table || "não informado"}`,
    request.customerName ? `Responsável: ${request.customerName}` : "",
    request.customerPhone ? `WhatsApp: ${request.customerPhone}` : "",
    request.peopleCount ? `Pessoas: ${request.peopleCount}` : "",
    request.hasMinors ? "Mesa com menor de idade" : "",
    itemLines.length ? "Itens:" : "",
    ...itemLines,
    request.total ? `Total: ${formatCurrency(request.total)}` : "",
    request.note ? `Observação: ${request.note}` : ""
  ].filter(Boolean).join("\n");
}

function showAdminToast(message) {
  const toast = $("#adminToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showAdminToast.timer);
  showAdminToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function filterRequests(type = activeFilter, source = getServiceRequests()) {
  const requests = Array.isArray(source) ? source : [];
  const visible = requests.filter(request => request.tableSessionStatus !== "finalizada");
  if (type === "todos") return visible;
  if (["novo", "em_atendimento", "preparando", "concluido", "cancelado"].includes(type)) return visible.filter(request => request.status === type);
  return visible.filter(request => request.type === type && !["concluido", "cancelado"].includes(request.status));
}

function renderDashboardStats() {
  renderAdminOperationalStats();
}

function primeKnownRequests() {
  knownRequestIds = new Set(getServiceRequests().map(request => request.id));
}

function playNotificationSound() {
  if (!soundEnabled) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext = audioContext || new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(740, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(980, audioContext.currentTime + 0.08);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.22, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.24);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.25);
}

function syncNewRequestAudio(requests) {
  const currentIds = new Set(requests.map(request => request.id));
  const hasNewRequest = requests.some(request => !knownRequestIds.has(request.id) && request.status === "novo");
  if (hasNewRequest && soundEnabled) playNotificationSound();
  knownRequestIds = currentIds;
}

function updateSoundButton() {
  const button = $("#toggleSound");
  if (!button) return;
  button.textContent = soundEnabled ? "Som ativo" : "Ativar som";
  button.setAttribute("aria-pressed", String(soundEnabled));
  button.classList.toggle("is-active", soundEnabled);
}

function toggleSound(event) {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass && (!event || event.isTrusted)) {
      audioContext = audioContext || new AudioContextClass();
      if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    }
    primeKnownRequests();
    showAdminToast("Som ativado para novas solicitaÃ§Ãµes.");
  } else {
    showAdminToast("Som desativado.");
  }
  updateSoundButton();
}

function printRequest(id) {
  const request = getServiceRequests().find(item => item.id === id);
  if (!request) return;
  const items = (request.items || []).map(item => '<li>' + escapeHtml(item.quantity) + 'x ' + escapeHtml(item.name) + ' - ' + formatCurrency(item.total || item.price * item.quantity) + '</li>').join('');
  const printWindow = window.open('', '_blank', 'width=720,height=820');
  const html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>' + escapeHtml(request.id) + '</title><style>body{font-family:Arial,sans-serif;margin:28px;color:#17333b}h1{margin:0 0 8px}section{margin:16px 0;padding-top:12px;border-top:1px solid #ddd}li{margin:6px 0}.total{font-size:20px;font-weight:700}</style></head><body><h1>' + escapeHtml(formatRequestType(request.type)) + ' ' + escapeHtml(request.id) + '</h1><p>Mesa: ' + escapeHtml(request.table || 'Nao informada') + '<br>Responsavel: ' + escapeHtml(request.customerName || 'Nao informado') + '<br>Status: ' + escapeHtml(formatStatus(request.status)) + '<br>Espera: ' + escapeHtml(formatWaitTime(request.createdAt)) + '</p><section><h2>Itens</h2><ul>' + (items || '<li>Sem itens</li>') + '</ul></section>' + (request.note ? '<section><h2>Observacao</h2><p>' + escapeHtml(request.note) + '</p></section>' : '') + '<p class="total">Total: ' + formatCurrency(request.total || 0) + '</p></body></html>';
  if (!printWindow) {
    window.print();
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function renderAdminRequests(force = false) {
  const wrapper = $("#adminRequests");
  if (!wrapper) return;
  const allRequests = getServiceRequests();
  syncNewRequestAudio(allRequests);
  const requests = filterRequests(activeFilter, allRequests);
  const signature = JSON.stringify({ activeFilter, requests });
  if (!force && signature === lastRenderedSignature) return;
  lastRenderedSignature = signature;

  renderDashboardStats();
  const lastUpdate = $("#lastUpdateText");
  if (lastUpdate) lastUpdate.textContent = `Atualizado Ã s ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;

  if (!requests.length) {
    wrapper.innerHTML = `<div class="empty-state"><strong>Nenhuma solicitaÃ§Ã£o aqui.</strong><span>Abra o site com ?mesa=08 e envie um pedido ou chamado.</span></div>`;
    return;
  }

  wrapper.innerHTML = requests.map(request => {
    const items = (request.items || []).map(item => `<li>${escapeHtml(item.quantity)}x ${escapeHtml(item.name)} <span>${formatCurrency(item.total || item.price * item.quantity)}</span></li>`).join("");
    const canStart = request.status === "novo";
    const canPrepare = request.type === "pedido" && ["novo", "em_atendimento"].includes(request.status);
    const canFinish = request.status !== "concluido" && request.status !== "cancelado";
    const waitMinutes = getWaitMinutes(request.createdAt);
    const classes = [
      "request-card",
      "request-card--" + request.type,
      "status-" + request.status,
      waitMinutes >= 15 && canFinish ? "is-waiting-long" : "",
      request.type === "conta" && canFinish ? "is-account-alert" : "",
      request.hasMinors ? "has-minor-alert" : ""
    ].filter(Boolean).join(" ");
    return `
      <article class="${escapeHtml(classes)}" data-request-id="${escapeHtml(request.id)}">
        <div class="request-card__top">
          <div>
            <strong>${escapeHtml(request.id)}</strong>
            <span>${formatRequestType(request.type)} â€¢ ${formatDate(request.createdAt)} â€¢ espera ${formatWaitTime(request.createdAt)}</span>
          </div>
          <mark>${formatStatus(request.status)}</mark>
        </div>
        ${renderCustomerInfo(request)}
        ${items ? `<ul class="request-items">${items}</ul>` : ""}
        ${request.note ? `<p class="request-note">${escapeHtml(request.note)}</p>` : ""}
        ${request.total ? `<div class="request-total"><span>Total</span><strong>${formatCurrency(request.total)}</strong></div>` : ""}
        <div class="request-history">${(request.history || []).slice(-4).map(item => `<span>${formatStatus(item.status)} Ã s ${formatDate(item.at)}</span>`).join("")}</div>
        <div class="request-actions">
          <button class="btn btn--light btn--small" type="button" data-status="em_atendimento" ${canStart ? "" : "disabled"}>Iniciar atendimento</button>
          ${request.type === "pedido" ? `<button class="btn btn--light btn--small" type="button" data-status="preparando" ${canPrepare ? "" : "disabled"}>Marcar preparando</button>` : ""}
          <button class="btn btn--primary btn--small" type="button" data-status="concluido" ${canFinish ? "" : "disabled"}>Concluir</button>
          <button class="btn btn--danger btn--small" type="button" data-status="cancelado" ${canFinish ? "" : "disabled"}>Cancelar</button>
          ${request.type === "pedido" ? `<button class="btn btn--light btn--small" type="button" data-print-request="${escapeHtml(request.id)}">Imprimir pedido</button>` : ""}
          ${request.customerPhone ? `<a class="btn btn--dark btn--small" href="${buildWhatsAppUrl(request.customerPhone, buildRequestMessage(request))}" target="_blank" rel="noopener">Enviar WhatsApp</a>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function updateRequestStatus(id, status) {
  const updatedRequest = DataService.updateRequestStatus(id, status);
  if (!updatedRequest) return;
  lastRenderedSignature = "";
  renderAdminRequests(true);
  renderAllAdminViews(true);
  showAdminToast("Solicitacao " + id + " atualizada para " + formatStatus(status) + ".");
}

function getRequestSessionKey(request) {
  return request.sessionId || [request.table || "sem-mesa", request.customerPhone || "sem-fone"].join("::");
}

function getRequestsByTable(sessionId) {
  const session = getAllTableSessions().find(item => item.id === sessionId);
  if (!session) return [];
  return getServiceRequests().filter(request => {
    if (request.sessionId && request.sessionId === session.id) return true;
    return !request.sessionId && request.table === session.table && request.customerPhone === session.customerPhone;
  });
}

function getAllTableSessions() {
  const stored = DataService.getCustomerSessions();
  const map = new Map(stored.map(session => [session.id, { ...session }]));
  getServiceRequests().forEach(request => {
    const key = getRequestSessionKey(request);
    const current = map.get(key) || {
      id: key,
      table: request.table || "Nao informada",
      customerName: request.customerName || "Nao informado",
      customerPhone: request.customerPhone || "",
      peopleCount: Number(request.peopleCount || 0),
      hasMinors: Boolean(request.hasMinors),
      minors: request.minors || [],
      status: request.tableSessionStatus === "finalizada" ? "finalizada" : "ativa",
      openedAt: request.createdAt,
      createdAt: request.createdAt
    };
    current.openedAt = current.openedAt && request.createdAt ? (new Date(current.openedAt) < new Date(request.createdAt) ? current.openedAt : request.createdAt) : (current.openedAt || request.createdAt);
    current.hasMinors = current.hasMinors || Boolean(request.hasMinors);
    current.minors = current.minors && current.minors.length ? current.minors : (request.minors || []);
    if (request.tableSessionStatus === "finalizada") current.status = "finalizada";
    map.set(key, current);
  });
  return Array.from(map.values());
}

function calculateTableTotal(sessionId) {
  return getRequestsByTable(sessionId).filter(request => request.type === "pedido").reduce((total, request) => total + Number(request.total || 0), 0);
}

function calculateTableDuration(openedAt, closedAt = new Date().toISOString()) {
  if (!openedAt) return "agora";
  const totalMinutes = Math.max(0, Math.floor((new Date(closedAt).getTime() - new Date(openedAt).getTime()) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return minutes < 1 ? "agora" : minutes + "min";
  return hours + "h " + String(minutes).padStart(2, "0") + "min";
}

function buildTableSummary(session) {
  const requests = getRequestsByTable(session.id);
  const openRequests = requests.filter(request => !["concluido", "cancelado"].includes(request.status));
  const pedidos = requests.filter(request => request.type === "pedido");
  const openPedidos = pedidos.filter(request => !["concluido", "cancelado"].includes(request.status));
  const chamados = requests.filter(request => request.type !== "pedido");
  const openChamados = chamados.filter(request => !["concluido", "cancelado"].includes(request.status));
  return {
    ...session,
    requests,
    openRequests,
    pedidos,
    chamados,
    openPedidosCount: openPedidos.length,
    openChamadosCount: openChamados.length,
    totalConsumed: calculateTableTotal(session.id),
    totalRequests: requests.length,
    totalOrders: pedidos.length,
    totalCalls: chamados.length,
    needsBracelet: (session.minors || []).some(minor => minor.needsBracelet)
  };
}

function getActiveTables() {
  return getAllTableSessions()
    .filter(session => session.status !== "finalizada")
    .map(buildTableSummary)
    .sort((a, b) => new Date(a.openedAt || 0) - new Date(b.openedAt || 0));
}

function getClosedTables() {
  const closedMap = new Map(DataService.getClosedTables().map(table => [table.id, table]));
  getAllTableSessions().filter(session => session.status === "finalizada").forEach(session => {
    closedMap.set(session.id, { ...closedMap.get(session.id), ...buildTableSummary(session) });
  });
  return Array.from(closedMap.values()).sort((a, b) => new Date(b.closedAt || 0) - new Date(a.closedAt || 0));
}

function closeOpenRequestsByTable(sessionId, closedAt) {
  const session = getAllTableSessions().find(item => item.id === sessionId);
  if (!session) return [];
  const updated = getServiceRequests().map(request => {
    const belongs = request.sessionId === session.id || (!request.sessionId && request.table === session.table && request.customerPhone === session.customerPhone);
    if (!belongs) return request;
    const nextStatus = ["cancelado", "concluido"].includes(request.status) ? request.status : "concluido";
    return {
      ...request,
      status: nextStatus,
      tableSessionStatus: "finalizada",
      tableClosedAt: closedAt,
      updatedAt: closedAt,
      history: request.status === nextStatus ? (request.history || []) : [...(request.history || []), { status: nextStatus, at: closedAt }]
    };
  });
  DataService.saveRequests(updated);
  return updated;
}

function finishTable(sessionId) {
  const session = getActiveTables().find(table => table.id === sessionId);
  if (!session) return;
  const closedAt = new Date().toISOString();
  closeOpenRequestsByTable(sessionId, closedAt);
  const closedSummary = {
    ...session,
    status: "finalizada",
    closedAt,
    openedAt: session.openedAt || session.createdAt || closedAt,
    totalConsumed: session.totalConsumed,
    totalRequests: session.totalRequests,
    durationText: calculateTableDuration(session.openedAt || session.createdAt, closedAt)
  };
  DataService.finishTable(sessionId, closedSummary);
  lastRenderedSignature = "";
  renderAdminRequests(true);
  renderAllAdminViews(true);
  showAdminToast("Mesa " + (session.table || "") + " finalizada com sucesso.");
}

let pendingFinishTableId = "";
let activeAdminTab = "dashboard";
let activeHistoryFilter = "hoje";
let tableOpsBound = false;

function openFinishTableModal(sessionId) {
  const table = getActiveTables().find(item => item.id === sessionId);
  if (!table) return;
  pendingFinishTableId = sessionId;
  const modal = $("#finishTableModal");
  const title = $("#finishTableTitle");
  const text = $("#finishTableText");
  const warning = $("#finishTableWarning");
  if (title) title.textContent = "Finalizar mesa " + (table.table || "") + "?";
  if (text) text.textContent = "Essa acao indica que o cliente foi embora. Os pedidos e chamados em aberto dessa mesa serao encerrados e enviados para o historico.";
  const hasOpenOrders = table.requests.some(request => request.type === "pedido" && ["novo", "preparando", "em_atendimento"].includes(request.status));
  if (warning) {
    warning.hidden = !hasOpenOrders;
    warning.textContent = hasOpenOrders ? "Essa mesa ainda possui pedidos em aberto. Deseja finalizar mesmo assim?" : "";
  }
  if (modal) modal.hidden = false;
  document.body.classList.add("no-scroll");
}

function closeFinishTableModal() {
  pendingFinishTableId = "";
  const modal = $("#finishTableModal");
  if (modal) modal.hidden = true;
  document.body.classList.remove("no-scroll");
}

function confirmFinishTable() {
  if (!pendingFinishTableId) return;
  const target = pendingFinishTableId;
  closeFinishTableModal();
  finishTable(target);
}

function tableMetric(label, value) {
  return '<div class="table-metric"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>';
}

function renderRequestMiniList(requests) {
  if (!requests.length) return '<div class="empty-state"><strong>Nenhuma solicitacao.</strong><span>Sem pedidos ou chamados para esta mesa.</span></div>';
  return '<ul class="request-items">' + requests.map(request => '<li>' + escapeHtml(formatRequestType(request.type)) + ' ' + escapeHtml(request.id || '') + ' <span>' + escapeHtml(formatStatus(request.status)) + '</span></li>').join('') + '</ul>';
}

function renderTableCard(table, closed = false) {
  const minors = table.hasMinors ? 'Sim' : 'Nao';
  const bracelet = table.needsBracelet ? 'Sim' : 'Nao';
  const topText = closed ? ('Fechada em ' + formatDate(table.closedAt)) : ('Aberta ha ' + calculateTableDuration(table.openedAt || table.createdAt));
  return '<article class="table-card ' + (closed ? 'is-closed ' : '') + (table.hasMinors ? 'has-minors' : '') + '" data-table-session-id="' + escapeHtml(table.id) + '">' +
    '<div class="table-card__top"><div><h3>Mesa ' + escapeHtml(table.table || 'Nao informada') + '</h3><span>' + escapeHtml(topText) + '</span></div><mark>' + escapeHtml(closed ? 'Finalizada' : 'Ativa') + '</mark></div>' +
    '<div class="table-metrics">' +
      tableMetric('Responsavel', table.customerName || 'Nao informado') +
      tableMetric('Pessoas', String(table.peopleCount || 'Nao informado')) +
      tableMetric('Menor de idade', minors) +
      tableMetric('Fitinha', bracelet) +
      tableMetric('Pedidos abertos', String(table.openPedidosCount || 0)) +
      tableMetric('Chamados abertos', String(table.openChamadosCount || 0)) +
      tableMetric('Total', formatCurrency(table.totalConsumed || 0)) +
      tableMetric(closed ? 'Tempo total' : 'Tempo', closed ? (table.durationText || calculateTableDuration(table.openedAt, table.closedAt)) : calculateTableDuration(table.openedAt || table.createdAt)) +
    '</div>' +
    (table.hasMinors ? renderMinorInfo(table.minors || []) : '') +
    '<div class="table-details">' + renderRequestMiniList(table.requests || []) + '</div>' +
    '<div class="request-actions">' +
      '<button class="btn btn--light btn--small" type="button" data-table-details="' + escapeHtml(table.id) + '">Ver detalhes</button>' +
      (table.customerPhone ? '<a class="btn btn--dark btn--small" href="' + buildWhatsAppUrl(table.customerPhone, 'Ola, aqui e o atendimento da mesa ' + (table.table || '')) + '" target="_blank" rel="noopener">WhatsApp</a>' : '') +
      (closed ? '' : '<button class="btn btn--danger btn--small" type="button" data-finish-table="' + escapeHtml(table.id) + '">Finalizar mesa</button>') +
    '</div>' +
  '</article>';
}

function renderActiveTables() {
  const wrapper = $("#activeTables");
  const count = $("#activeTablesCount");
  if (!wrapper) return;
  const tables = getActiveTables();
  if (count) count.textContent = tables.length + (tables.length === 1 ? " mesa" : " mesas");
  wrapper.innerHTML = tables.length ? tables.map(table => renderTableCard(table)).join("") : '<div class="empty-state"><strong>Nenhuma mesa ativa.</strong><span>As mesas aparecem aqui apos check-in ou pedido.</span></div>';
}

function filterClosedTables(tables) {
  const tableSearch = ($("#historyTableSearch")?.value || "").trim().toLowerCase();
  const customerSearch = ($("#historyCustomerSearch")?.value || "").trim().toLowerCase();
  const today = new Date().toISOString().slice(0, 10);
  return tables.filter(table => {
    const matchesDate = activeHistoryFilter === "todas" || String(table.closedAt || "").slice(0, 10) === today;
    const matchesTable = !tableSearch || String(table.table || "").toLowerCase().includes(tableSearch);
    const matchesCustomer = !customerSearch || String(table.customerName || "").toLowerCase().includes(customerSearch);
    return matchesDate && matchesTable && matchesCustomer;
  });
}

function renderClosedTables() {
  const wrapper = $("#closedTables");
  const count = $("#closedTablesCount");
  if (!wrapper) return;
  const tables = filterClosedTables(getClosedTables());
  if (count) count.textContent = tables.length + (tables.length === 1 ? " mesa" : " mesas");
  wrapper.innerHTML = tables.length ? tables.map(table => renderTableCard(table, true)).join("") : '<div class="empty-state"><strong>Nenhuma mesa finalizada.</strong><span>Finalize uma mesa para alimentar o historico.</span></div>';
}

function renderOrders() {
  const wrapper = $("#adminOrders");
  if (!wrapper) return;
  const orders = filterRequests("pedido", getServiceRequests());
  wrapper.innerHTML = orders.length ? orders.map(request => {
    const items = (request.items || []).map(item => '<li>' + escapeHtml(item.quantity) + 'x ' + escapeHtml(item.name) + ' <span>' + formatCurrency(item.total || item.price * item.quantity) + '</span></li>').join('');
    return '<article class="request-card request-card--pedido status-' + escapeHtml(request.status) + '"><div class="request-card__top"><div><strong>' + escapeHtml(request.id) + '</strong><span>Mesa ' + escapeHtml(request.table || 'Nao informada') + ' - ' + formatDate(request.createdAt) + '</span></div><mark>' + formatStatus(request.status) + '</mark></div>' + (items ? '<ul class="request-items">' + items + '</ul>' : '') + '<div class="request-total"><span>Total</span><strong>' + formatCurrency(request.total || 0) + '</strong></div></article>';
  }).join('') : '<div class="empty-state"><strong>Nenhum pedido ativo.</strong><span>Pedidos finalizados com a mesa saem desta fila.</span></div>';
}

function renderAdminOperationalStats() {
  const stats = $("#adminStats");
  const report = $("#dailyReport");
  const requests = getServiceRequests();
  const activeTables = getActiveTables();
  const closedToday = getClosedTables().filter(table => String(table.closedAt || "").slice(0, 10) === new Date().toISOString().slice(0, 10));
  const totalSold = closedToday.reduce((total, table) => total + Number(table.totalConsumed || 0), 0);
  const avgTicket = closedToday.length ? Math.round(totalSold / closedToday.length) : 0;
  const count = predicate => requests.filter(predicate).length;
  const data = [
    { label: "Mesas ativas", value: activeTables.length },
    { label: "Finalizadas hoje", value: closedToday.length },
    { label: "Total vendido hoje", value: formatCurrency(totalSold) },
    { label: "Pedidos concluidos", value: count(req => req.type === "pedido" && req.status === "concluido") },
    { label: "Chamados concluidos", value: count(req => req.type !== "pedido" && req.status === "concluido") },
    { label: "Contas solicitadas", value: count(req => req.type === "conta" && req.tableSessionStatus !== "finalizada") },
    { label: "Ticket medio", value: formatCurrency(avgTicket) }
  ];
  const markup = data.map(item => '<article class="stat-card"><span>' + escapeHtml(item.label) + '</span><strong>' + escapeHtml(item.value) + '</strong></article>').join('');
  if (stats) stats.innerHTML = markup;
  if (report) report.innerHTML = markup;
}

function renderAllAdminViews() {
  renderAdminOperationalStats();
  renderActiveTables();
  renderClosedTables();
  renderOrders();
}

function setAdminTab(tab) {
  activeAdminTab = tab;
  $$(".admin-tab").forEach(button => button.classList.toggle("is-active", button.dataset.adminTab === tab));
  $$("[data-admin-panel]").forEach(panel => panel.classList.toggle("is-active", panel.dataset.adminPanel === tab));
  renderAllAdminViews(true);
}

function setupTableOperations() {
  if (tableOpsBound) return;
  tableOpsBound = true;
  $("#adminTabs")?.addEventListener("click", event => {
    const button = event.target.closest("[data-admin-tab]");
    if (button) setAdminTab(button.dataset.adminTab);
  });
  document.addEventListener("click", event => {
    const detailButton = event.target.closest("[data-table-details]");
    if (detailButton) {
      detailButton.closest(".table-card")?.classList.toggle("is-expanded");
      return;
    }
    const finishButton = event.target.closest("[data-finish-table]");
    if (finishButton) openFinishTableModal(finishButton.dataset.finishTable);
  });
  $("#cancelFinishTable")?.addEventListener("click", closeFinishTableModal);
  $("#confirmFinishTable")?.addEventListener("click", confirmFinishTable);
  $("#finishTableModal")?.addEventListener("click", event => { if (event.target.id === "finishTableModal") closeFinishTableModal(); });
  $("#historyTableSearch")?.addEventListener("input", renderClosedTables);
  $("#historyCustomerSearch")?.addEventListener("input", renderClosedTables);
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-history-filter]");
    if (!button) return;
    activeHistoryFilter = button.dataset.historyFilter;
    $$('[data-history-filter]').forEach(item => item.classList.toggle('is-active', item === button));
    renderClosedTables();
  });
}

function moneyFromCents(cents) {
  return (Number(cents || 0) / 100).toFixed(2);
}

function centsFromReais(value) {
  return Math.round(Number(value || 0) * 100);
}

function generateId(name) {
  const base = String(name || "produto").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${base}-${Date.now().toString().slice(-5)}`;
}

function buildOptions(options, selected) {
  return options.map(option => `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("");
}

function populateSelects() {
  const categorySelect = $("#productCategory");
  const imageSelect = $("#productImage");
  if (categorySelect) categorySelect.innerHTML = buildOptions(CATEGORIES, CATEGORIES[0]);
  if (imageSelect) imageSelect.innerHTML = buildOptions(IMAGE_OPTIONS, IMAGE_OPTIONS[0]);
}

function renderSettings() {
  if ($("#settingsWhatsapp")) $("#settingsWhatsapp").value = settings.whatsapp || DEFAULT_SETTINGS.whatsapp;
  if ($("#settingsHours")) $("#settingsHours").value = settings.hours || DEFAULT_SETTINGS.hours;
  if ($("#settingsMaps")) $("#settingsMaps").value = settings.mapsUrl || DEFAULT_SETTINGS.mapsUrl;
}

function renderProducts() {
  const wrapper = $("#adminProducts");
  if (!wrapper) return;
  wrapper.innerHTML = products.map(product => `
    <article class="admin-product" data-product-id="${escapeHtml(product.id)}">
      <div class="admin-product__row"><strong>${escapeHtml(product.name)}</strong><button class="cart-remove" type="button" data-delete-product="${escapeHtml(product.id)}">Remover</button></div>
      <label>Nome<input data-field="name" value="${escapeHtml(product.name)}" /></label>
      <label>Categoria<select data-field="category">${buildOptions(CATEGORIES, product.category)}</select></label>
      <label>Preço em reais<input type="number" min="0" step="0.01" data-field="price" value="${moneyFromCents(product.price)}" /></label>
      <label>Descrição<textarea rows="2" data-field="description">${escapeHtml(product.description)}</textarea></label>
      <label>Imagem<select data-field="image">${buildOptions(IMAGE_OPTIONS, product.image)}</select></label>
    </article>
  `).join("");
}

function collectProductsFromDOM() {
  products = $$(".admin-product").map(card => {
    const read = field => card.querySelector(`[data-field="${field}"]`)?.value || "";
    return { id: card.dataset.productId, name: read("name").trim(), category: read("category"), price: centsFromReais(read("price")), description: read("description").trim(), image: read("image") };
  }).filter(product => product.name && product.category);
}

function showDashboard() {
  $("#loginPanel")?.classList.add("admin-hidden");
  $("#dashboardPanel")?.classList.remove("admin-hidden");
  renderSettings();
  renderProducts();
  primeKnownRequests();
  updateSoundButton();
  renderAdminRequests(true);
  renderAllAdminViews(true);
}

function bindEvents() {
  $("#loginForm")?.addEventListener("submit", event => {
    event.preventDefault();
    if ($("#adminPassword")?.value !== "praia123") {
      showAdminToast("Senha incorreta. Use praia123 para acessar.");
      return;
    }
    sessionStorage.setItem("marePinaAdmin", "true");
    showDashboard();
  });

  $("#requestFilters")?.addEventListener("click", event => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    activeFilter = button.dataset.filter;
    $$(".filter-btn").forEach(item => item.classList.toggle("is-active", item === button));
    lastRenderedSignature = "";
    renderAdminRequests(true);
  });

  $("#adminRequests")?.addEventListener("click", event => {
    const printButton = event.target.closest("[data-print-request]");
    if (printButton) {
      printRequest(printButton.dataset.printRequest);
      return;
    }
    const button = event.target.closest("[data-status]");
    if (!button) return;
    const card = button.closest("[data-request-id]");
    if (card) updateRequestStatus(card.dataset.requestId, button.dataset.status);
  });

  $("#refreshRequests")?.addEventListener("click", () => { lastRenderedSignature = ""; renderAdminRequests(true); renderAllAdminViews(true); showAdminToast("Painel atualizado."); });
  $("#toggleSound")?.addEventListener("click", toggleSound);

  $("#clearCompleted")?.addEventListener("click", () => {
    const remaining = getServiceRequests().filter(request => request.status !== "concluido" && request.status !== "cancelado");
    saveServiceRequests(remaining);
    lastRenderedSignature = "";
    renderAdminRequests(true);
    showAdminToast("Concluídos e cancelados foram limpos.");
  });

  $("#settingsForm")?.addEventListener("submit", event => {
    event.preventDefault();
    settings = { whatsapp: $("#settingsWhatsapp").value.replace(/\D/g, ""), hours: $("#settingsHours").value.trim(), mapsUrl: $("#settingsMaps").value.trim() };
    saveSettingsToStorage();
    showAdminToast("Configurações salvas.");
  });

  $("#productForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const name = $("#productName").value.trim();
    products.unshift({ id: generateId(name), name, category: $("#productCategory").value, price: centsFromReais($("#productPrice").value), description: $("#productDescription").value.trim(), image: $("#productImage").value });
    saveProductsToStorage();
    event.currentTarget.reset();
    renderProducts();
    showAdminToast("Produto adicionado.");
  });

  $("#saveProducts")?.addEventListener("click", () => {
    collectProductsFromDOM();
    saveProductsToStorage();
    renderProducts();
    showAdminToast("Cardápio salvo.");
  });

  $("#resetProducts")?.addEventListener("click", () => {
    products = DEFAULT_PRODUCTS;
    saveProductsToStorage();
    renderProducts();
    showAdminToast("Cardápio padrão restaurado.");
  });

  document.addEventListener("click", event => {
    const deleteButton = event.target.closest("[data-delete-product]");
    if (!deleteButton) return;
    products = products.filter(product => product.id !== deleteButton.dataset.deleteProduct);
    saveProductsToStorage();
    renderProducts();
  });

  window.addEventListener("storage", event => {
    if (!event.key || event.key === STORAGE_KEYS.serviceRequests) {
      lastRenderedSignature = "";
      renderAdminRequests(true);
      renderAllAdminViews(true);
    }
    if (event.key === STORAGE_KEYS.tableSessions || event.key === STORAGE_KEYS.closedTables) renderAllAdminViews(true);
  });
}

function init() {
  populateSelects();
  bindEvents();
  setupTableOperations();
  if (sessionStorage.getItem("marePinaAdmin") === "true") showDashboard();
  setAdminTab(activeAdminTab);
  setInterval(renderAdminRequests, 1000);
  setInterval(renderAllAdminViews, 1000);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();