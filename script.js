/* Maré Pina Beach Bar - cliente */

const STORAGE_KEYS = {
  products: "marePinaProducts",
  settings: "marePinaSettings",
  orders: "marePinaOrders",
  serviceRequests: "marePinaServiceRequests",
  requestCounter: "marePinaRequestCounter",
  customerSession: "marePinaCustomerSession",
  tableSessions: "marePinaTableSessions",
  sessionCounter: "marePinaSessionCounter"
};

const DEFAULT_SETTINGS = {
  whatsapp: "5581999999999",
  hours: "Sáb a Qua • 7h às 17h30",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Praia%20do%20Pina%20Recife%20PE",
  instagramUrl: "https://www.instagram.com/"
};

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

const DEFAULT_CATEGORIES = ["Todos", "Promoções", "Petiscos", "Frutos do mar", "Peixes completos", "Porções", "Drinks", "Cervejas", "Refrigerantes e sucos", "Sobremesas"];
const QUICK_ACTIONS = [
  { type: "garcom", title: "Chamar garçom", text: "Solicitar atendimento na mesa" },
  { type: "conta", title: "Pedir a conta", text: "Avisar que deseja fechar" },
  { type: "gelo", title: "Pedir mais gelo", text: "Enviar pedido de gelo" },
  { type: "limpeza", title: "Solicitar limpeza", text: "Mesa ou guarda-sol" },
  { type: "atendimento", title: "Falar com atendimento", text: "Enviar uma mensagem rápida" }
];

let settings = loadSettings();
let products = loadProducts();
let activeCategory = "Todos";
let menuSearchTerm = "";
let detectedTable = "";
let customerSession = null;
let lastCreatedOrder = null;
let loaderHidden = false;
let loaderFallbackTimer;
const cart = new Map();

const moneyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

// Data boundary: replace these localStorage calls with Firebase, Supabase or an API client in production.
const DataService = {
  getProducts() {
    const stored = safeJsonParse(localStorage.getItem(STORAGE_KEYS.products), null);
    return Array.isArray(stored) && stored.length ? stored : DEFAULT_PRODUCTS;
  },
  getSettings() {
    return { ...DEFAULT_SETTINGS, ...safeJsonParse(localStorage.getItem(STORAGE_KEYS.settings), {}) };
  },
  getRequests() {
    const stored = safeJsonParse(localStorage.getItem(STORAGE_KEYS.serviceRequests), []);
    return Array.isArray(stored) ? stored : [];
  },
  saveRequests(requests) {
    localStorage.setItem(STORAGE_KEYS.serviceRequests, JSON.stringify(requests.slice(0, 200)));
  },
  saveRequest(request) {
    const requests = this.getRequests();
    requests.unshift(request);
    this.saveRequests(requests);
    window.dispatchEvent(new CustomEvent("service-request-created", { detail: request }));
  },
  getCustomerSessions() {
    const stored = safeJsonParse(localStorage.getItem(STORAGE_KEYS.tableSessions), []);
    return Array.isArray(stored) ? stored : [];
  },
  saveCustomerSessions(sessions) {
    localStorage.setItem(STORAGE_KEYS.tableSessions, JSON.stringify(sessions));
  },
  getCustomerSession() {
    const stored = safeJsonParse(localStorage.getItem(STORAGE_KEYS.customerSession), null);
    if (!stored || !stored.id) return null;
    const tableSession = this.getCustomerSessions().find(session => session.id === stored.id);
    return tableSession ? { ...stored, ...tableSession } : stored;
  },
  saveCustomerSession(session) {
    localStorage.setItem(STORAGE_KEYS.customerSession, JSON.stringify(session));
    const sessions = this.getCustomerSessions();
    const index = sessions.findIndex(item => item.id === session.id);
    const normalized = { ...session, status: session.status || "ativa", openedAt: session.openedAt || session.createdAt || new Date().toISOString() };
    if (index >= 0) sessions[index] = { ...sessions[index], ...normalized };
    else sessions.unshift(normalized);
    this.saveCustomerSessions(sessions.slice(0, 200));
  },
  clearCustomerSession() {
    localStorage.removeItem(STORAGE_KEYS.customerSession);
  }
};

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

function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...safeJsonParse(localStorage.getItem(STORAGE_KEYS.settings), {}) };
}

function loadProducts() {
  const stored = safeJsonParse(localStorage.getItem(STORAGE_KEYS.products), null);
  return Array.isArray(stored) && stored.length ? stored : DEFAULT_PRODUCTS;
}

function formatCurrency(value) {
  return moneyFormatter.format((Number(value) || 0) / 100);
}

function sanitizeTable(value) {
  return String(value || "").trim().replace(/[<>]/g, "").slice(0, 40);
}

function getTableFromURL() {
  const params = new URLSearchParams(window.location.search);
  return sanitizeTable(params.get("mesa") || params.get("guarda-sol") || params.get("table"));
}

function formatTableLabel(value) {
  const cleaned = sanitizeTable(value).replace(/-/g, " ");
  if (!cleaned) return "Mesa/guarda-sol não informado";
  if (/^\d+$/.test(cleaned)) return `Mesa/guarda-sol ${cleaned.padStart(2, "0")}`;
  return cleaned.split(" ").filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function getCurrentTable() {
  return sanitizeTable(customerSession?.table || $("#tableNumber")?.value || detectedTable);
}

function buildWhatsAppUrl(message) {
  const phone = String(settings.whatsapp || DEFAULT_SETTINGS.whatsapp).replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function getCustomerSession() {
  return DataService.getCustomerSession();
}

function isCurrentSessionClosed(session = customerSession || getCustomerSession()) {
  return Boolean(session && session.status === "finalizada");
}

function clearCustomerSession() {
  DataService.clearCustomerSession();
  customerSession = null;
  lastCreatedOrder = null;
  const whatsappButton = $("#sendWhatsAppSecondary");
  if (whatsappButton) whatsappButton.disabled = true;
  syncTableInputs(getTableFromURL());
}

function startNewCustomerSession() {
  clearCustomerSession();
  renderCustomerStatus();
  openCustomerStartModal();
  showToast("Inicie um novo atendimento para esta mesa.");
}

function handleClosedTableState(session = customerSession || getCustomerSession()) {
  if (!isCurrentSessionClosed(session)) return false;
  customerSession = session;
  closeCart();
  const wrapper = $("#customerStatusList");
  if (wrapper) {
    wrapper.innerHTML = '<div class="closed-session"><strong>Atendimento finalizado. Obrigado pela visita!</strong><span>Para fazer novos pedidos, inicie um novo atendimento.</span><button class="btn btn--primary" type="button" id="startNewCustomerSession">Iniciar novo atendimento</button></div>';
  }
  return true;
}

function checkIfTableIsClosed() {
  const session = getCustomerSession();
  if (!session) return false;
  return handleClosedTableState(session);
}

function nextCustomerSessionId() {
  const next = Number(localStorage.getItem(STORAGE_KEYS.sessionCounter) || 0) + 1;
  localStorage.setItem(STORAGE_KEYS.sessionCounter, String(next));
  return `SESSION-${String(next).padStart(4, "0")}`;
}

function saveCustomerSession(data) {
  const now = new Date().toISOString();
  const session = {
    id: data.id || nextCustomerSessionId(),
    customerName: String(data.customerName || "").trim(),
    customerPhone: String(data.customerPhone || "").replace(/D/g, ""),
    table: sanitizeTable(data.table),
    peopleCount: Number(data.peopleCount || 0),
    hasMinors: Boolean(data.hasMinors),
    minors: Array.isArray(data.minors) ? data.minors : [],
    status: data.status || "ativa",
    openedAt: data.openedAt || data.createdAt || now,
    createdAt: data.createdAt || now,
    updatedAt: now
  };
  DataService.saveCustomerSession(session);
  customerSession = session;
  applyCustomerSession(session);
  return session;
}

function updateCustomerSummary(session = customerSession) {
  const status = $("#tableStatusText");
  if (!status) return;
  if (!session) {
    status.textContent = detectedTable ? `Mesa sugerida pelo QR Code: ${detectedTable}` : "Mesa/guarda-sol não informado";
    return;
  }
  const minorsText = session.hasMinors ? " • com menor de idade" : "";
  status.textContent = `${formatTableLabel(session.table)} • ${session.customerName} • ${session.peopleCount} pessoa(s)${minorsText}`;
}

function applyCustomerSession(session) {
  if (!session) return;
  detectedTable = session.table || detectedTable;
  syncTableInputs(session.table);
  const nameInput = $("#clientName");
  const phoneInput = $("#clientWhatsapp");
  const tableInput = $("#tableNumber");
  if (nameInput) nameInput.value = session.customerName || "";
  if (phoneInput) phoneInput.value = session.customerPhone || "";
  if (tableInput) tableInput.value = session.table || "";
  updateCustomerSummary(session);
}

function setCustomerStartMessage(message) {
  const box = $("#customerStartMessage");
  if (!box) return;
  box.textContent = message;
  box.hidden = !message;
}

function getMinorFormData() {
  return $$(".minor-card").map(card => ({
    firstName: card.querySelector('[data-minor-field="firstName"]')?.value.trim() || "",
    lastName: card.querySelector('[data-minor-field="lastName"]')?.value.trim() || "",
    age: Number(card.querySelector('[data-minor-field="age"]')?.value || 0),
    needsBracelet: card.querySelector('[data-minor-field="needsBracelet"]:checked')?.value === "true"
  }));
}

function validateCustomerStartForm() {
  const hasMinors = $("input[name='sessionHasMinors']:checked")?.value === "true";
  const data = {
    customerName: $("#sessionCustomerName")?.value.trim() || "",
    customerPhone: $("#sessionCustomerPhone")?.value.trim() || "",
    table: sanitizeTable($("#sessionTable")?.value || ""),
    peopleCount: Number($("#sessionPeopleCount")?.value || 0),
    hasMinors,
    minors: hasMinors ? getMinorFormData() : []
  };

  if (!data.customerName) return { valid: false, message: "Informe o nome do responsável pela mesa." };
  if (!data.customerPhone.replace(/\D/g, "")) return { valid: false, message: "Informe o WhatsApp do responsável." };
  if (!data.table) return { valid: false, message: "Informe a mesa ou guarda-sol." };
  if (!data.peopleCount || data.peopleCount < 1) return { valid: false, message: "Informe uma quantidade de pessoas maior que zero." };
  if (data.hasMinors && data.minors.length < 1) return { valid: false, message: "Cadastre pelo menos um menor de idade." };

  for (const minor of data.minors) {
    if (!minor.firstName || !minor.lastName) return { valid: false, message: "Informe nome e sobrenome de todos os menores." };
    if (!minor.age || minor.age < 1 || minor.age >= 18) return { valid: false, message: "A idade de cada menor deve ser menor que 18 anos." };
  }
  return { valid: true, data };
}

function minorFieldTemplate(index, minor = {}) {
  const yesChecked = minor.needsBracelet === true ? "checked" : "";
  const noChecked = minor.needsBracelet === false ? "checked" : "";
  return `
    <article class="minor-card" data-minor-index="${index}">
      <div class="minor-card__top"><strong>Menor ${index + 1}</strong><button class="cart-remove" type="button" data-remove-minor="${index}">Remover</button></div>
      <div class="form-grid">
        <label>Nome<input type="text" data-minor-field="firstName" value="${escapeHtml(minor.firstName || "")}" required /></label>
        <label>Sobrenome<input type="text" data-minor-field="lastName" value="${escapeHtml(minor.lastName || "")}" required /></label>
        <label>Idade<input type="number" min="1" max="17" data-minor-field="age" value="${minor.age || ""}" required /></label>
      </div>
      <fieldset class="radio-card radio-card--compact">
        <legend>Precisa de fitinha?</legend>
        <label><input type="radio" name="minorBracelet${index}" data-minor-field="needsBracelet" value="true" ${yesChecked} required /> Sim</label>
        <label><input type="radio" name="minorBracelet${index}" data-minor-field="needsBracelet" value="false" ${noChecked} required /> Não</label>
      </fieldset>
    </article>
  `;
}

function renderMinorFields(minors = []) {
  const wrapper = $("#minorFields");
  if (!wrapper) return;
  wrapper.innerHTML = minors.map((minor, index) => minorFieldTemplate(index, minor)).join("");
}

function addMinorField(minor = {}) {
  const minors = getMinorFormData();
  minors.push(minor);
  renderMinorFields(minors);
}

function removeMinorField(index) {
  const minors = getMinorFormData().filter((_, itemIndex) => itemIndex !== Number(index));
  renderMinorFields(minors);
}

function fillCustomerStartForm(session = customerSession) {
  const tableFromUrl = getTableFromURL();
  const data = session || { table: tableFromUrl, peopleCount: 1, hasMinors: false, minors: [] };
  if ($("#sessionCustomerName")) $("#sessionCustomerName").value = data.customerName || "";
  if ($("#sessionCustomerPhone")) $("#sessionCustomerPhone").value = data.customerPhone || "";
  if ($("#sessionTable")) $("#sessionTable").value = data.table || tableFromUrl || "";
  if ($("#sessionPeopleCount")) $("#sessionPeopleCount").value = data.peopleCount || "";
  const hasMinors = Boolean(data.hasMinors);
  const radio = $(`input[name='sessionHasMinors'][value='${hasMinors}']`);
  if (radio) radio.checked = true;
  const minorSection = $("#minorSection");
  if (minorSection) minorSection.hidden = !hasMinors;
  renderMinorFields(hasMinors ? data.minors || [] : []);
  setCustomerStartMessage("");
}

function openCustomerStartModal() {
  fillCustomerStartForm(customerSession || getCustomerSession());
  const modal = $("#customerStartModal");
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("no-scroll");
  setTimeout(() => $("#sessionCustomerName")?.focus(), 50);
}

function closeCustomerStartModal() {
  const modal = $("#customerStartModal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("no-scroll");
}

function attachCustomerDataToRequest(request) {
  const session = customerSession || getCustomerSession();
  if (!session) return request;
  return {
    ...request,
    sessionId: session.id,
    table: session.table || request.table,
    customerName: session.customerName || request.customerName || "",
    customerPhone: session.customerPhone || request.customerPhone || "",
    peopleCount: session.peopleCount,
    hasMinors: session.hasMinors,
    minors: session.minors || []
  };
}

function getServiceRequests() {
  return DataService.getRequests();
}

function nextServiceRequestId() {
  const next = Number(localStorage.getItem(STORAGE_KEYS.requestCounter) || 0) + 1;
  localStorage.setItem(STORAGE_KEYS.requestCounter, String(next));
  return `REQ-${String(next).padStart(4, "0")}`;
}

function saveServiceRequest(request) {
  const now = new Date().toISOString();
  const requests = getServiceRequests();
  const enrichedRequest = attachCustomerDataToRequest(request);
  const record = {
    id: enrichedRequest.id || nextServiceRequestId(),
    type: enrichedRequest.type,
    status: enrichedRequest.status || "novo",
    sessionId: enrichedRequest.sessionId || "",
    table: sanitizeTable(enrichedRequest.table),
    customerName: enrichedRequest.customerName || "",
    customerPhone: String(enrichedRequest.customerPhone || "").replace(/\D/g, ""),
    peopleCount: Number(enrichedRequest.peopleCount || 0),
    hasMinors: Boolean(enrichedRequest.hasMinors),
    minors: Array.isArray(enrichedRequest.minors) ? enrichedRequest.minors : [],
    items: Array.isArray(enrichedRequest.items) ? enrichedRequest.items : [],
    note: enrichedRequest.note || "",
    total: Number(enrichedRequest.total || 0),
    history: enrichedRequest.history || [{ status: enrichedRequest.status || "novo", at: now }],
    createdAt: enrichedRequest.createdAt || now,
    updatedAt: now
  };

  DataService.saveRequest(record);
  return record;
}

function getCartItems() {
  return Array.from(cart.values());
}

function getSubtotal() {
  return getCartItems().reduce((total, item) => total + item.price * item.quantity, 0);
}

function clearCart() {
  cart.clear();
  renderCart();
}

function createOrderRequest() {
  const items = getCartItems();
  if (!items.length) {
    showToast("Adicione pelo menos um item antes de enviar.");
    return null;
  }

  const session = customerSession || getCustomerSession();
  if (!session) {
    showToast("Preencha os dados da mesa antes de enviar o pedido.");
    openCustomerStartModal();
    return null;
  }
  if (handleClosedTableState(session)) {
    showToast("Atendimento finalizado. Inicie um novo atendimento para pedir novamente.");
    return null;
  }

  const request = saveServiceRequest({
    type: "pedido",
    status: "novo",
    table: session.table,
    customerName: session.customerName,
    customerPhone: session.customerPhone,
    items: items.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price, total: item.price * item.quantity })),
    note: $("#orderNote")?.value.trim() || "",
    total: getSubtotal()
  });

  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify([request, ...safeJsonParse(localStorage.getItem(STORAGE_KEYS.orders), [])].slice(0, 60)));
  lastCreatedOrder = request;
  const whatsappButton = $("#sendWhatsAppSecondary");
  if (whatsappButton) whatsappButton.disabled = false;
  clearCart();
  closeCart();
  renderCustomerStatus();
  showToast("Pedido " + request.id + " enviado para o painel.");
  return request;
}

function createQuickRequest(type) {
  const action = QUICK_ACTIONS.find(item => item.type === type);
  const session = customerSession || getCustomerSession();
  if (!session) {
    showToast("Preencha os dados da mesa antes de solicitar atendimento.");
    openCustomerStartModal();
    return null;
  }
  if (handleClosedTableState(session)) {
    showToast("Atendimento finalizado. Inicie um novo atendimento para solicitar novamente.");
    return null;
  }

  const request = saveServiceRequest({
    type,
    status: "novo",
    table: session.table,
    customerName: session.customerName,
    customerPhone: session.customerPhone,
    note: action ? action.title : "Solicitacao de atendimento"
  });

  const messages = {
    garcom: "Garcom chamado com sucesso.",
    conta: "Pedido de conta enviado para atendimento.",
    gelo: "Pedido de gelo enviado para atendimento.",
    limpeza: "Solicitacao de limpeza enviada.",
    atendimento: "Mensagem enviada para atendimento."
  };
  showToast(messages[type] || "Solicitacao enviada para atendimento.");
  renderCustomerStatus();
  return request;
}

function formatRequestType(type) {
  const labels = { pedido: "Pedido", garcom: "GarÃ§om", conta: "Conta", gelo: "Gelo", limpeza: "Limpeza", atendimento: "Atendimento" };
  return labels[type] || "SolicitaÃ§Ã£o";
}

function formatStatus(status) {
  const labels = { novo: "Novo", em_atendimento: "Em atendimento", preparando: "Preparando", concluido: "ConcluÃ­do", cancelado: "Cancelado" };
  return labels[status] || status || "Novo";
}

function formatShortDate(value) {
  if (!value) return "Agora";
  return new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function getSessionRequests() {
  const session = customerSession || getCustomerSession();
  if (!session) return [];
  return getServiceRequests()
    .filter(request => request.sessionId === session.id || (request.table === session.table && request.customerPhone === session.customerPhone))
    .slice(0, 12);
}

function renderCustomerStatus() {
  const wrapper = $("#customerStatusList");
  if (!wrapper) return;
  if (handleClosedTableState()) return;
  const requests = getSessionRequests();
  if (!requests.length) {
    wrapper.innerHTML = '<div class="empty-state"><strong>Nenhuma solicitacao enviada ainda.</strong><span>Seus pedidos e chamados aparecerao aqui.</span></div>';
    return;
  }
  wrapper.innerHTML = requests.map(request => {
    const totalItems = (request.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0);
    const detail = request.type === "pedido" ? (totalItems ? totalItems + " item(ns)" : "Pedido") : (request.note || formatRequestType(request.type));
    return [
      '<article class="status-card status-' + escapeHtml(request.status) + '">',
      '<div>',
      '<strong>' + formatRequestType(request.type) + '</strong>',
      '<span>' + escapeHtml(detail) + ' - ' + formatShortDate(request.createdAt) + '</span>',
      '</div>',
      '<mark>' + formatStatus(request.status) + '</mark>',
      '</article>'
    ].join("");
  }).join("");
}

function buildOrderMessage(request) {
  const target = request || lastCreatedOrder;
  if (!target) return "Olá, quero atendimento pelo site do Maré Pina Beach Bar.";
  const itemLines = (target.items || []).map(item => `${item.quantity}x ${item.name} - ${formatCurrency(item.total || item.price * item.quantity)}`);
  return [
    `Olá, enviei o pedido ${target.id} pelo painel do Maré Pina.`,
    `Mesa/guarda-sol: ${target.table || "não informado"}`,
    target.customerName ? `Responsável: ${target.customerName}` : "",
    target.peopleCount ? `Pessoas na mesa: ${target.peopleCount}` : "",
    target.hasMinors ? "Mesa com menor de idade" : "",
    itemLines.length ? "Itens:" : "",
    ...itemLines,
    target.note ? `Observação: ${target.note}` : "",
    `Total: ${formatCurrency(target.total)}`
  ].filter(Boolean).join("\n");
}

function renderCategories() {
  const wrapper = $("#categoryScroller");
  if (!wrapper) return;
  const productCategories = new Set(products.map(product => product.category));
  wrapper.innerHTML = DEFAULT_CATEGORIES.filter(category => category === "Todos" || productCategories.has(category)).map(category => `
    <button class="category-btn ${category === activeCategory ? "is-active" : ""}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
  `).join("");
}

function renderMenu() {
  const grid = $("#menuGrid");
  if (!grid) return;
  const search = menuSearchTerm.trim().toLowerCase();
  const filtered = products.filter(product => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const searchable = [product.name, product.category, product.description].join(" ").toLowerCase();
    return matchesCategory && (!search || searchable.includes(search));
  });

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state menu-empty"><strong>Nenhum item encontrado.</strong><span>Tente buscar por outro prato, bebida ou categoria.</span></div>';
    return;
  }

  grid.innerHTML = filtered.map(product => `
    <article class="menu-card" data-product-card="${escapeHtml(product.id)}">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
      <div class="menu-card__body">
        <span>${escapeHtml(product.category)}</span>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description || "")}</p>
        <div class="menu-card__footer">
          <strong>${formatCurrency(product.price)}</strong>
          <button class="add-btn" type="button" data-add-product="${escapeHtml(product.id)}">Adicionar</button>
        </div>
      </div>
    </article>
  `).join("");
}
function setCategory(category) {
  activeCategory = category;
  renderCategories();
  renderMenu();
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  const current = cart.get(productId);
  cart.set(productId, current ? { ...current, quantity: current.quantity + 1 } : { ...product, quantity: 1 });
  renderCart();
  showToast(`${product.name} adicionado ao pedido.`);
}

function changeQuantity(productId, delta) {
  const item = cart.get(productId);
  if (!item) return;
  const quantity = item.quantity + delta;
  if (quantity <= 0) cart.delete(productId);
  else cart.set(productId, { ...item, quantity });
  renderCart();
}

function renderCart() {
  const items = getCartItems();
  const count = items.reduce((total, item) => total + item.quantity, 0);
  ["#cartCountBadge", "#floatingCartCount", "#floatingCartCountInline", "#bottomCartCount"].forEach(selector => {
    const element = $(selector);
    if (element) element.textContent = String(count);
  });

  const empty = $("#cartEmpty");
  const subtotal = $("#cartSubtotal");
  const wrapper = $("#cartItems");
  if (empty) empty.hidden = items.length > 0;
  if (subtotal) subtotal.textContent = formatCurrency(getSubtotal());
  if (!wrapper) return;

  wrapper.innerHTML = items.map(item => `
    <article class="cart-item">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
      <div>
        <h3>${escapeHtml(item.name)}</h3>
        <div class="cart-item__meta">
          <span>${formatCurrency(item.price)}</span>
          <div class="qty-control" aria-label="Quantidade de ${escapeHtml(item.name)}">
            <button type="button" data-cart-action="decrease" data-product-id="${escapeHtml(item.id)}">−</button>
            <strong>${item.quantity}</strong>
            <button type="button" data-cart-action="increase" data-product-id="${escapeHtml(item.id)}">+</button>
          </div>
        </div>
        <button class="cart-remove" type="button" data-cart-action="remove" data-product-id="${escapeHtml(item.id)}">Remover</button>
      </div>
    </article>
  `).join("");
}

function openCart() {
  const drawer = $("#cartDrawer");
  const backdrop = $("#cartBackdrop");
  if (!drawer || !backdrop) return;
  const session = customerSession || getCustomerSession();
  if (session) applyCustomerSession(session);
  backdrop.hidden = false;
  requestAnimationFrame(() => drawer.classList.add("is-open"));
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  const drawer = $("#cartDrawer");
  const backdrop = $("#cartBackdrop");
  if (!drawer || !backdrop) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  setTimeout(() => { if (!drawer.classList.contains("is-open")) backdrop.hidden = true; }, 220);
}

function syncTableInputs(value) {
  const cleaned = sanitizeTable(value);
  detectedTable = cleaned || detectedTable;
  const input = $("#tableNumber");
  if (input && input.value !== cleaned) input.value = cleaned;
  if (customerSession) updateCustomerSummary(customerSession);
  else updateCustomerSummary(null);
}

function initTableParam() {
  detectedTable = getTableFromURL();
  customerSession = getCustomerSession();
  if (customerSession) applyCustomerSession(customerSession);
  else syncTableInputs(detectedTable);
}

function initCustomerSessionGate() {
  customerSession = getCustomerSession();
  if (customerSession) {
    applyCustomerSession(customerSession);
    return;
  }
  openCustomerStartModal();
}

function renderAssistActions() {
  const wrapper = $("#assistActions");
  if (!wrapper) return;
  wrapper.innerHTML = QUICK_ACTIONS.map(action => `
    <button class="quick-action quick-action--${escapeHtml(action.type)}" type="button" data-quick-request="${escapeHtml(action.type)}">
      <strong>${escapeHtml(action.title)}</strong>
      <span>${escapeHtml(action.text)}</span>
    </button>
  `).join("");
}

function initSettingsUI() {
  const defaultMessage = "Olá, quero atendimento pelo site do Maré Pina Beach Bar.";
  ["#floatingWhatsapp", "#footerWhatsapp"].forEach(selector => {
    const element = $(selector);
    if (element) element.href = buildWhatsAppUrl(defaultMessage);
  });
  ["#mapsButton", "#mapsButtonFooter"].forEach(selector => {
    const element = $(selector);
    if (element && settings.mapsUrl) element.href = settings.mapsUrl;
  });
  const footerHours = $("#footerHours");
  if (footerHours) footerHours.textContent = settings.hours || DEFAULT_SETTINGS.hours;
}

function initHeader() {
  const header = $("#siteHeader");
  const toggle = $("#menuToggle");
  const links = $("#navLinks");
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 10);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  toggle?.addEventListener("click", () => {
    const isOpen = links?.classList.toggle("is-open");
    toggle.classList.toggle("is-active", Boolean(isOpen));
    toggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });
  $$("#navLinks a").forEach(link => link.addEventListener("click", () => {
    links?.classList.remove("is-open");
    toggle?.classList.remove("is-active");
    toggle?.setAttribute("aria-expanded", "false");
  }));
}

function initGalleryModal() {
  const modal = $("#galleryModal");
  const image = $("#galleryModalImage");
  const closeButton = $("#closeGalleryModal");
  $$(".gallery-item").forEach(button => button.addEventListener("click", () => {
    if (!modal || !image || !button.dataset.full) return;
    image.src = button.dataset.full;
    modal.hidden = false;
    document.body.classList.add("no-scroll");
  }));
  const close = () => {
    if (!modal || !image) return;
    modal.hidden = true;
    image.src = "";
    document.body.classList.remove("no-scroll");
  };
  closeButton?.addEventListener("click", close);
  modal?.addEventListener("click", event => { if (event.target === modal) close(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && modal && !modal.hidden) close(); });
}

function hideLoader() {
  if (loaderHidden) return;
  loaderHidden = true;
  clearTimeout(loaderFallbackTimer);
  const loader = $("#pageLoader");
  document.body.classList.remove("is-loading");
  if (!loader) return;
  const finish = () => {
    loader.hidden = true;
    loader.setAttribute("aria-hidden", "true");
  };
  loader.classList.add("is-hidden");
  loader.addEventListener("transitionend", finish, { once: true });
  setTimeout(finish, 700);
}

function initLoader() {
  const loader = $("#pageLoader");
  if (!loader) {
    document.body.classList.remove("is-loading");
    return;
  }
  loaderFallbackTimer = setTimeout(hideLoader, 2500);
  if (document.readyState === "complete") hideLoader();
  else window.addEventListener("load", hideLoader, { once: true });
}

function bindGlobalEvents() {
  document.addEventListener("click", event => {
    const target = event.target.closest("button, a");
    if (!target) return;
    const category = target.dataset.category;
    const productId = target.dataset.addProduct;
    const cartAction = target.dataset.cartAction;
    const quickType = target.dataset.quickRequest;
    if (category) setCategory(category);
    if (productId) addToCart(productId);
    if (target.matches("[data-open-cart]")) openCart();
    if (quickType) createQuickRequest(quickType);
    if (cartAction) {
      const id = target.dataset.productId;
      if (cartAction === "increase") changeQuantity(id, 1);
      if (cartAction === "decrease") changeQuantity(id, -1);
      if (cartAction === "remove") changeQuantity(id, -999);
    }
  });

  $("#closeCart")?.addEventListener("click", closeCart);
  $("#cartBackdrop")?.addEventListener("click", closeCart);
  $("#floatingWaiter")?.addEventListener("click", () => createQuickRequest("garcom"));
  $("#orderForm")?.addEventListener("submit", event => {
    event.preventDefault();
    createOrderRequest();
  });
  $("#sendWhatsAppSecondary")?.addEventListener("click", () => {
    const request = lastCreatedOrder;
    if (!request) {
      showToast("Envie o pedido para atendimento antes de encaminhar no WhatsApp.");
      return;
    }
    openWhatsApp(buildOrderMessage(request));
  });
  $("#customerStartForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const result = validateCustomerStartForm();
    if (!result.valid) {
      setCustomerStartMessage(result.message);
      return;
    }
    saveCustomerSession(result.data);
    closeCustomerStartModal();
    showToast("Dados da mesa salvos. Você já pode acessar o cardápio.");
  });
  document.addEventListener("change", event => {
    if (!event.target.matches("input[name='sessionHasMinors']")) return;
    const hasMinors = event.target.value === "true";
    const minorSection = $("#minorSection");
    if (minorSection) minorSection.hidden = !hasMinors;
    if (hasMinors && $$(".minor-card").length === 0) addMinorField();
    if (!hasMinors) renderMinorFields([]);
  });
  $("#addMinorField")?.addEventListener("click", () => addMinorField());
  document.addEventListener("click", event => {
    const removeButton = event.target.closest("[data-remove-minor]");
    if (removeButton) removeMinorField(removeButton.dataset.removeMinor);
  });
  $("#editCustomerSession")?.addEventListener("click", openCustomerStartModal);
  $("#clearCustomerSession")?.addEventListener("click", () => {
    clearCustomerSession();
    renderCustomerStatus();
    openCustomerStartModal();
  });

  $("#menuSearch")?.addEventListener("input", event => {
    menuSearchTerm = event.target.value || "";
    renderMenu();
  });

  window.addEventListener("storage", event => {
    if (!event.key || event.key === STORAGE_KEYS.serviceRequests || event.key === STORAGE_KEYS.customerSession || event.key === STORAGE_KEYS.tableSessions) {
      checkIfTableIsClosed();
      renderCustomerStatus();
    }
  });

  document.addEventListener("click", event => {
    if (event.target.closest("#startNewCustomerSession")) startNewCustomerSession();
  });
}

function init() {
  initHeader();
  initSettingsUI();
  initTableParam();
  renderAssistActions();
  renderCategories();
  renderMenu();
  renderCart();
  renderCustomerStatus();
  initGalleryModal();
  bindGlobalEvents();
  initCustomerSessionGate();
  checkIfTableIsClosed();
  setInterval(() => { checkIfTableIsClosed(); renderCustomerStatus(); }, 1000);
}

initLoader();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();