/* =====================================================================
   AIMX Esports — lógica de tienda (carrito + checkout + PayPal + email)
   ---------------------------------------------------------------------
   Los datos del pedido / recruitment se envían por email a FORM_EMAIL
   y el pago del pedido se realiza con PayPal a PAYPAL_EMAIL.
   ===================================================================== */
const CONFIG = {
  PAYPAL_EMAIL: "xsonicx2010@gmail.com",   // cuenta PayPal que recibe el pago
  FORM_EMAIL:   "xsonicx2010@gmail.com",   // email que recibe los datos
  CURRENCY:     "EUR",
  STORE_NAME:   "AIMX Esports"
};

/* Producto principal de la tienda */
const PRODUCT = { id: "red-jersey", name: "AIMX Red Jersey", price: 29.99 };

/* Roster (Academy) y Staff — placeholders editables */
const ROSTER = [
  { name: "AIMX RAYZE",  role: "PLAYER · FORTNITE COMPETITIVE" },
  { name: "AIMX NERVYX", role: "PLAYER · FORTNITE COMPETITIVE" },
  { name: "AIMX ZMANUE", role: "PLAYER · FORTNITE COMPETITIVE" },
  { name: "AIMX NAPOO",  role: "PLAYER · FORTNITE COMPETITIVE" }
];
const STAFF = [
  { name: "AIMX CEO",   role: "FOUNDER · CEO" },
  { name: "AIMX COACH", role: "HEAD COACH" }
];

/* ---------- Utilidades ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const eur = n => "€" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function avatarSVG(seed) {
  // Silueta genérica con anillo rojo (placeholder de jugador)
  const hue = (seed * 47) % 360;
  return `<svg viewBox="0 0 130 130" width="130" height="130" aria-hidden="true">
    <defs><radialGradient id="g${seed}" cx="50%" cy="35%"><stop offset="0" stop-color="hsl(${hue},20%,22%)"/><stop offset="1" stop-color="#0d0d0f"/></radialGradient></defs>
    <rect width="130" height="130" fill="url(#g${seed})"/>
    <circle cx="65" cy="52" r="22" fill="#2a2a30"/>
    <path d="M25 120 Q65 78 105 120 Z" fill="#2a2a30"/>
    <text x="65" y="72" text-anchor="middle" font-size="9" font-weight="800" fill="rgba(229,9,20,.55)" font-family="Arial,sans-serif" letter-spacing="1">AIMX</text>
  </svg>`;
}

/* ---------- Estado ---------- */
let selectedSize = "M";
let cart = []; // { key, name, price, size, qty }

function cartTotal() { return cart.reduce((s, l) => s + l.price * l.qty, 0); }
function cartCount() { return cart.reduce((s, l) => s + l.qty, 0); }

function addToCart(size, qty) {
  const key = PRODUCT.id + "::" + size;
  const existing = cart.find(l => l.key === key);
  if (existing) existing.qty += qty;
  else cart.push({ key, name: PRODUCT.name, price: PRODUCT.price, size, qty });
  renderCart();
  showToast(`Añadido: ${PRODUCT.name} (Talla ${size})`);
}
function removeFromCart(key) { cart = cart.filter(l => l.key !== key); renderCart(); }

/* ---------- Render roster / staff ---------- */
function renderRoster() {
  const html = (list, offset = 0) => list.map((p, i) => `
    <article class="roster-card">
      <div class="avatar">${avatarSVG(i + offset + 1)}</div>
      <h4>${p.name}</h4>
      <small>${p.role}</small>
    </article>`).join("");
  $("#roster-grid").innerHTML = html(ROSTER);
  $("#staff-grid").innerHTML = html(STAFF, 10);
}

/* ---------- Render carrito ---------- */
function jerseyThumb() {
  return `<svg viewBox="0 0 40 42" width="30" height="30"><path d="M8 8 L15 5 Q20 10 25 5 L32 8 L28 16 L25 15 L25 38 L15 38 L15 15 L12 16 Z" fill="#141416" stroke="#e50914" stroke-width="1.5"/></svg>`;
}
function renderCart() {
  const box = $("#cart-items");
  if (cart.length === 0) {
    box.innerHTML = `<p class="cart-empty">Tu carrito está vacío.<br>Añade la camiseta para empezar.</p>`;
  } else {
    box.innerHTML = cart.map(l => `
      <div class="cart-line">
        <div class="thumb">${jerseyThumb()}</div>
        <div class="info"><b>${l.name}</b><small>Talla ${l.size} · x${l.qty}</small></div>
        <span class="price">${eur(l.price * l.qty)}</span>
        <button class="rm" data-rm="${l.key}" aria-label="Quitar">✕</button>
      </div>`).join("");
    $$("[data-rm]").forEach(b => b.addEventListener("click", () => removeFromCart(b.dataset.rm)));
  }
  $("#cart-total").textContent = eur(cartTotal());
  $("#cart-count").textContent = cartCount();
  $("#go-checkout").disabled = cart.length === 0;
}

/* ---------- Drawer ---------- */
function openCart()  { $("#cart-drawer").hidden = false; $("#cart-overlay").hidden = false; }
function closeCart() { $("#cart-drawer").hidden = true;  $("#cart-overlay").hidden = true; }

/* ---------- Checkout ---------- */
function openCheckout() {
  if (cart.length === 0) return;
  closeCart();
  $("#summary-items").innerHTML = cart.map(l =>
    `<div class="s-line"><span>${l.name} · Talla ${l.size} · x${l.qty}</span><span>${eur(l.price * l.qty)}</span></div>`
  ).join("");
  $("#summary-total").textContent = eur(cartTotal());
  $("#pay-amount").textContent = eur(cartTotal());
  $("#checkout-modal").hidden = false;
  $("#checkout-overlay").hidden = false;
}
function closeCheckout() { $("#checkout-modal").hidden = true; $("#checkout-overlay").hidden = true; }

/* ---------- PayPal ---------- */
function buildPayPalUrl(order) {
  const p = new URLSearchParams();
  p.set("cmd", "_cart"); p.set("upload", "1");
  p.set("business", CONFIG.PAYPAL_EMAIL);
  p.set("currency_code", CONFIG.CURRENCY);
  p.set("lc", "ES"); p.set("charset", "utf-8"); p.set("no_note", "1");
  cart.forEach((l, i) => {
    const n = i + 1;
    p.set("item_name_" + n, `${l.name} (Talla ${l.size})`);
    p.set("amount_" + n, l.price.toFixed(2));
    p.set("quantity_" + n, String(l.qty));
  });
  const [first, ...rest] = order.nombre.trim().split(" ");
  p.set("first_name", first || order.nombre);
  p.set("last_name", rest.join(" "));
  p.set("email", order.email);
  p.set("address1", order.direccion);
  p.set("city", order.ciudad);
  p.set("state", order.provincia);
  p.set("zip", order.cp);
  p.set("country", "ES");
  p.set("return", location.origin + "/gracias.html");
  p.set("cancel_return", location.origin + "/");
  return "https://www.paypal.com/cgi-bin/webscr?" + p.toString();
}

/* ---------- Envío por email (FormSubmit) ---------- */
async function sendEmail(payload) {
  const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(CONFIG.FORM_EMAIL), {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("email_failed");
  return res.json();
}

async function handleCheckout(e) {
  e.preventDefault();
  const form = e.target;
  const err = $("#form-error");
  err.hidden = true;
  if (!form.checkValidity()) {
    err.textContent = "Por favor, rellena todos los campos obligatorios (*).";
    err.hidden = false; form.reportValidity(); return;
  }
  const order = Object.fromEntries(new FormData(form).entries());
  const btn = $("#pay-btn");
  btn.disabled = true;
  const original = btn.innerHTML;
  btn.textContent = "Enviando pedido…";
  try {
    await sendEmail({
      _subject: `🛒 Nuevo pedido — ${CONFIG.STORE_NAME}`,
      _template: "table",
      Nombre: order.nombre, Email: order.email, Telefono: order.telefono,
      DNI_NIF: order.dni || "-", Direccion: order.direccion, Codigo_Postal: order.cp,
      Ciudad: order.ciudad, Provincia: order.provincia, Pais: order.pais,
      Notas: order.notas || "-",
      Pedido: cart.map(l => `${l.qty}x ${l.name} (Talla ${l.size}) = ${eur(l.price * l.qty)}`).join(" | "),
      Total: eur(cartTotal()), Pago: `PayPal a ${CONFIG.PAYPAL_EMAIL}`
    });
  } catch (_) { console.warn("No se pudo enviar el email del pedido; se continúa al pago."); }
  btn.textContent = "Redirigiendo a PayPal…";
  window.location.href = buildPayPalUrl(order);
  setTimeout(() => { btn.disabled = false; btn.innerHTML = original; }, 6000);
}

/* ---------- Formulario JOIN (recruitment) ---------- */
async function handleJoin(e) {
  e.preventDefault();
  const form = e.target;
  const msg = $("#join-msg");
  const btn = $("#apply-btn");
  msg.hidden = true; msg.className = "form-note";
  if (!form.nombre.value.trim()) {
    msg.textContent = "Introduce al menos tu nombre."; msg.hidden = false; return;
  }
  const data = Object.fromEntries(new FormData(form).entries());
  btn.disabled = true; const original = btn.textContent; btn.textContent = "ENVIANDO…";
  try {
    await sendEmail({ _subject: `🎮 Nueva solicitud JOIN — ${CONFIG.STORE_NAME}`, _template: "table", ...data });
    msg.textContent = "¡Solicitud enviada! Te contactaremos pronto.";
    msg.className = "form-note ok"; msg.hidden = false; form.reset();
  } catch (_) {
    msg.textContent = "No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.";
    msg.hidden = false;
  }
  btn.disabled = false; btn.textContent = original;
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(text) {
  const t = $("#toast");
  t.textContent = text; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2200);
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  renderRoster();
  renderCart();

  // Selector de talla
  $$(".size-pill").forEach(pill => pill.addEventListener("click", () => {
    $$(".size-pill").forEach(p => p.classList.remove("is-active"));
    pill.classList.add("is-active");
    selectedSize = pill.dataset.size;
  }));

  // Cantidad
  const qtyInput = $("#qty-input");
  $("#qty-minus").addEventListener("click", () => { qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1); });
  $("#qty-plus").addEventListener("click",  () => { qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + 1; });

  const getQty = () => Math.max(1, parseInt(qtyInput.value, 10) || 1);

  $("#add-cart").addEventListener("click", () => { addToCart(selectedSize, getQty()); openCart(); });
  $("#buy-now").addEventListener("click", () => { addToCart(selectedSize, getQty()); openCheckout(); });

  $("#open-cart").addEventListener("click", openCart);
  $("#close-cart").addEventListener("click", closeCart);
  $("#cart-overlay").addEventListener("click", closeCart);
  $("#go-checkout").addEventListener("click", openCheckout);
  $("#close-checkout").addEventListener("click", closeCheckout);
  $("#checkout-overlay").addEventListener("click", closeCheckout);
  $("#checkout-form").addEventListener("submit", handleCheckout);
  $("#join-form").addEventListener("submit", handleJoin);

  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCheckout(); closeCart(); } });
});
