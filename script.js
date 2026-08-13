/* =====================================================================
   Gáldar FS Store — lógica de tienda (carrito + checkout + PayPal)
   ---------------------------------------------------------------------
   CONFIGURACIÓN: los datos del pedido se envían por email a FORM_EMAIL
   y el pago se realiza con PayPal a la cuenta PAYPAL_EMAIL.
   ===================================================================== */
const CONFIG = {
  PAYPAL_EMAIL: "xsonicx2010@gmail.com",   // cuenta PayPal que recibe el pago
  FORM_EMAIL:   "xsonicx2010@gmail.com",   // email que recibe los datos del pedido
  CURRENCY:     "EUR",
  STORE_NAME:   "Gáldar FS Store"
};

/* ---------- Catálogo de camisetas ---------- */
const PRODUCTS = [
  { id: "home",   name: "Camiseta 1ª Equipación", desc: "Diseño oficial local", price: 29.95, color: "#c62828", num: "10" },
  { id: "away",   name: "Camiseta 2ª Equipación", desc: "Diseño oficial visitante", price: 29.95, color: "#1565c0", num: "7"  },
  { id: "third",  name: "Camiseta 3ª Equipación", desc: "Edición especial", price: 32.95, color: "#2e7d32", num: "9"  },
  { id: "gk",     name: "Camiseta Portero", desc: "Modelo portero temporada", price: 27.95, color: "#f9a825", num: "1"  },
  { id: "train",  name: "Camiseta Entrenamiento", desc: "Tejido transpirable", price: 22.50, color: "#37474f", num: "23" },
  { id: "fan",    name: "Camiseta Afición", desc: "Con los colores del club", price: 19.95, color: "#6a1b9a", num: "12" }
];

const SIZES = ["S", "M", "L", "XL", "XXL"];

/* ---------- Utilidades ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const eur = n => n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

function shirtSVG(color, num, size = 150) {
  return `<svg viewBox="0 0 200 210" width="${size}" height="${size}" role="img" aria-label="Camiseta">
    <path d="M40 42 L74 26 Q100 50 126 26 L160 42 L142 80 L124 72 L124 186 L76 186 L76 72 L58 80 Z"
      fill="${color}" stroke="rgba(0,0,0,.12)" stroke-width="2"/>
    <path d="M74 26 Q100 50 126 26" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="3"/>
    <text x="100" y="140" text-anchor="middle" font-size="46" font-weight="800"
      fill="rgba(255,255,255,.92)" font-family="system-ui">${num}</text>
  </svg>`;
}

/* ---------- Estado del carrito ---------- */
let cart = []; // { key, id, name, price, size, qty, color, num }

function cartKey(id, size) { return id + "::" + size; }

function addToCart(id, size, qty) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p || !size || qty < 1) return;
  const key = cartKey(id, size);
  const existing = cart.find(l => l.key === key);
  if (existing) existing.qty += qty;
  else cart.push({ key, id, name: p.name, price: p.price, size, qty, color: p.color, num: p.num });
  renderCart();
  showToast(`Añadido: ${p.name} (${size})`, true);
}

function removeFromCart(key) {
  cart = cart.filter(l => l.key !== key);
  renderCart();
}

function cartTotal() { return cart.reduce((s, l) => s + l.price * l.qty, 0); }
function cartCount() { return cart.reduce((s, l) => s + l.qty, 0); }

/* ---------- Render catálogo ---------- */
function renderProducts() {
  const grid = $("#product-grid");
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="product-card">
      <div class="product-media">${shirtSVG(p.color, p.num, 170)}</div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-price">${eur(p.price)}</div>
        <div class="product-controls">
          <select aria-label="Talla" data-size="${p.id}">
            ${SIZES.map(s => `<option value="${s}">Talla ${s}</option>`).join("")}
          </select>
          <div class="qty"><input type="number" min="1" value="1" aria-label="Cantidad" data-qty="${p.id}"></div>
        </div>
        <button class="btn btn-primary add-btn" data-add="${p.id}">Añadir al carrito</button>
      </div>
    </article>`).join("");

  $$("[data-add]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.add;
    const size = $(`[data-size="${id}"]`).value;
    const qty = Math.max(1, parseInt($(`[data-qty="${id}"]`).value, 10) || 1);
    addToCart(id, size, qty);
  }));
}

/* ---------- Render carrito ---------- */
function renderCart() {
  const box = $("#cart-items");
  if (cart.length === 0) {
    box.innerHTML = `<p class="cart-empty">Tu carrito está vacío.<br>Añade una camiseta para empezar.</p>`;
  } else {
    box.innerHTML = cart.map(l => `
      <div class="cart-line">
        <div class="thumb">${shirtSVG(l.color, l.num, 44)}</div>
        <div class="info">
          <b>${l.name}</b>
          <small>Talla ${l.size} · x${l.qty}</small>
        </div>
        <span class="price">${eur(l.price * l.qty)}</span>
        <button class="rm" data-rm="${l.key}" aria-label="Quitar">🗑</button>
      </div>`).join("");
    $$("[data-rm]").forEach(b => b.addEventListener("click", () => removeFromCart(b.dataset.rm)));
  }
  $("#cart-total").textContent = eur(cartTotal());
  $("#cart-count").textContent = cartCount();
  $("#go-checkout").disabled = cart.length === 0;
}

/* ---------- Drawer carrito ---------- */
function openCart()  { $("#cart-drawer").hidden = false; $("#cart-overlay").hidden = false; }
function closeCart() { $("#cart-drawer").hidden = true;  $("#cart-overlay").hidden = true; }

/* ---------- Checkout ---------- */
function openCheckout() {
  if (cart.length === 0) return;
  closeCart();
  $("#summary-items").innerHTML = cart.map(l =>
    `<div class="s-line"><span>${l.name} · T-${l.size} · x${l.qty}</span><span>${eur(l.price * l.qty)}</span></div>`
  ).join("");
  $("#summary-total").textContent = eur(cartTotal());
  $("#pay-amount").textContent = eur(cartTotal());
  $("#checkout-modal").hidden = false;
  $("#checkout-overlay").hidden = false;
}
function closeCheckout() { $("#checkout-modal").hidden = true; $("#checkout-overlay").hidden = true; }

/* ---------- Construcción URL de pago PayPal ---------- */
function buildPayPalUrl(order) {
  const params = new URLSearchParams();
  params.set("cmd", "_cart");
  params.set("upload", "1");
  params.set("business", CONFIG.PAYPAL_EMAIL);
  params.set("currency_code", CONFIG.CURRENCY);
  params.set("lc", "ES");
  params.set("charset", "utf-8");
  params.set("no_note", "1");
  // Líneas del pedido
  cart.forEach((l, i) => {
    const n = i + 1;
    params.set("item_name_" + n, `${l.name} (Talla ${l.size})`);
    params.set("amount_" + n, l.price.toFixed(2));
    params.set("quantity_" + n, String(l.qty));
  });
  // Prefill de datos del comprador (redundancia si el email fallara)
  const [first, ...rest] = order.nombre.trim().split(" ");
  params.set("first_name", first || order.nombre);
  params.set("last_name", rest.join(" "));
  params.set("email", order.email);
  params.set("address1", order.direccion);
  params.set("city", order.ciudad);
  params.set("state", order.provincia);
  params.set("zip", order.cp);
  params.set("country", "ES");
  // Retorno tras el pago
  params.set("return", location.origin + "/gracias.html");
  params.set("cancel_return", location.origin + "/");
  return "https://www.paypal.com/cgi-bin/webscr?" + params.toString();
}

/* ---------- Envío del pedido por email (FormSubmit) ---------- */
async function sendOrderEmail(order) {
  const payload = {
    _subject: `🛒 Nuevo pedido — ${CONFIG.STORE_NAME}`,
    _template: "table",
    Nombre: order.nombre,
    Email: order.email,
    Telefono: order.telefono,
    DNI_NIF: order.dni || "-",
    Direccion: order.direccion,
    Codigo_Postal: order.cp,
    Ciudad: order.ciudad,
    Provincia: order.provincia,
    Pais: order.pais,
    Notas: order.notas || "-",
    Pedido: cart.map(l => `${l.qty}x ${l.name} (Talla ${l.size}) = ${eur(l.price * l.qty)}`).join(" | "),
    Total: eur(cartTotal()),
    Pago: `PayPal a ${CONFIG.PAYPAL_EMAIL}`
  };
  const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(CONFIG.FORM_EMAIL), {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("email_failed");
  return res.json();
}

/* ---------- Submit del formulario ---------- */
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const err = $("#form-error");
  err.hidden = true;

  if (!form.checkValidity()) {
    err.textContent = "Por favor, rellena todos los campos obligatorios (*).";
    err.hidden = false;
    form.reportValidity();
    return;
  }

  const order = Object.fromEntries(new FormData(form).entries());
  const btn = $("#pay-btn");
  btn.disabled = true;
  const original = btn.innerHTML;
  btn.textContent = "Enviando pedido…";

  try {
    // 1) Enviar los datos del pedido por email
    await sendOrderEmail(order);
  } catch (_) {
    // No bloqueamos el pago: los datos van también en PayPal como respaldo.
    console.warn("No se pudo enviar el email del pedido; se continúa al pago.");
  }

  // 2) Redirigir a PayPal para completar el pago
  btn.textContent = "Redirigiendo a PayPal…";
  try { localStorage.setItem("gfs_last_order", JSON.stringify({ order, total: cartTotal() })); } catch (_) {}
  window.location.href = buildPayPalUrl(order);

  // Restaurar por si el navegador cancela la navegación
  setTimeout(() => { btn.disabled = false; btn.innerHTML = original; }, 6000);
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg, ok = false) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast" + (ok ? " ok" : "");
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2200);
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  renderProducts();
  renderCart();

  $("#open-cart").addEventListener("click", openCart);
  $("#close-cart").addEventListener("click", closeCart);
  $("#cart-overlay").addEventListener("click", closeCart);
  $("#go-checkout").addEventListener("click", openCheckout);
  $("#close-checkout").addEventListener("click", closeCheckout);
  $("#checkout-overlay").addEventListener("click", closeCheckout);
  $("#checkout-form").addEventListener("submit", handleSubmit);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeCheckout(); closeCart(); }
  });
});
