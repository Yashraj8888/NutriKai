/* ==========================================================
   Nutri Kai — main.js
   ========================================================== */

const WHATSAPP_NUMBER = "919344949954";
const BUSINESS_NAME = "Nutri Kai";

const PRODUCTS = [
  {
    slug: "energy-trails", name: "Energy Trails", pack: "100g", price: 199,
    description: "A robust adventure blend featuring 33% of broken almonds and 27% of cashew pieces for slow-release carbs and iron, backed by 23% of chia and 17% of pumpkin seeds to deliver endurance, healthy fats, and plant protein on the move.",
    image: "assets/Energy Trails.png"
  },
  {
    slug: "keto-boost", name: "Keto Boost", pack: "100g", price: 199,
    description: "Powered by 40% of low-carb chia seeds and 40% of nutrient-dense pumpkin seeds for healthy fats and zero-sugar satiety, supercharged with 20% of C8/C10 MCT powder that converts naturally into ketones for instant mental clarity.",
    image: "assets/Keto Boost.png"
  },
  {
    slug: "morning-fuel", name: "Morning Fuel", pack: "100g", price: 149,
    description: "Crafted with 60% of chia seeds to deliver sustainable omega-3s and fiber that keep morning hunger at bay, paired with 40% of pumpkin seeds providing zinc, magnesium, and plant protein for steady, crash-free energy all morning long.",
    image: "assets/Morning Fuel.png"
  },
  {
    slug: "skin-glow", name: "Skin Glow", pack: "100g", price: 149,
    description: "Built on a foundation of 50% of ground flaxseeds loaded with ALA omega-3s to balance hormones and reduce inflammation, combined with 50% of sunflower seeds rich in vitamin E and selenium to shield skin cells from oxidative damage.",
    image: "assets/Skin Glow.png"
  },
  {
    slug: "night-recovery", name: "Night Recovery", pack: "100g", price: 149,
    description: "Formulated with 60% of tryptophan-rich pumpkin seeds to naturally trigger melatonin production, 30% of anti-inflammatory chia seeds, and 10% of high-absorption magnesium glycinate to deeply relax your muscles and promote restorative sleep.",
    image: "assets/Night Recovery.png"
  },
  {
    slug: "gut-health", name: "Gut Health", pack: "100g", price: 149,
    description: "Combines 50% of hydrating sabja seeds that form a soothing, gut-coating mucilage gel, 35% of prebiotic flaxseed to feed healthy gut bacteria, and 15% of fennel powder clinically proven to relieve bloating and gas.",
    image: "assets/Gut Health.png"
  }
];

/* ---------------------------------------------------------
   STATE + HELPERS
   --------------------------------------------------------- */

const CART_KEY = "beeja_cart_v1";
const $ = id => document.getElementById(id);

let cart = loadCart();
let cardQty = {}; // per-card quantity before "Add to Cart" — starts at 0

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  catch (e) { /* storage unavailable */ }
}
const formatRupees = n => "₹" + n.toLocaleString("en-IN");
const findProduct = slug => PRODUCTS.find(p => p.slug === slug);

/* Image fallback (global: used by inline onerror) */
function handleImageError(img, slug) {
  const p = findProduct(slug);
  if (!p) return;
  img.parentElement.innerHTML = `
    <div class="product-placeholder">
      <svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="36" r="34" fill="none" stroke="#33402A" stroke-width="1.4" opacity="0.55"/>
        <text x="36" y="45" text-anchor="middle" font-family="Lora, serif" font-size="26" fill="#33402A">${p.name.charAt(0)}</text>
      </svg>
    </div>`;
}

/* ---------------------------------------------------------
   PRODUCT GRID
   --------------------------------------------------------- */

function renderProducts() {
  $("product-grid").innerHTML = PRODUCTS.map(p => `
    <article class="product-card" data-slug="${p.slug}">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="handleImageError(this, '${p.slug}')">
      </div>
      <div class="product-body">
        <div class="product-heading">
          <h3>${p.name}</h3>
          <span class="product-pack">${p.pack}</span>
        </div>
        <p class="product-desc">${p.description}</p>
        <button class="product-more" type="button" data-action="more">Read more</button>
        <div class="product-footer">
          <span class="product-price">${formatRupees(p.price)}</span>
          <div class="qty-stepper">
            <button class="qty-btn" type="button" data-action="dec" aria-label="Decrease quantity">&minus;</button>
            <span class="qty-value">0</span>
            <button class="qty-btn" type="button" data-action="inc" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="btn-add" type="button" data-action="add" disabled>Add to Cart</button>
      </div>
    </article>`).join("");
}

$("product-grid").addEventListener("click", e => {
  const btn = e.target.closest("[data-action]");
  const card = e.target.closest(".product-card");
  if (!btn || !card) return;

  const slug = card.dataset.slug;
  const action = btn.dataset.action;
  const addBtn = card.querySelector(".btn-add");
  const valueEl = card.querySelector(".qty-value");

  if (action === "more") {
    const open = card.classList.toggle("is-expanded");
    btn.textContent = open ? "Show less" : "Read more";
  }

  if (action === "inc" || action === "dec") {
    const next = Math.max(0, (cardQty[slug] || 0) + (action === "inc" ? 1 : -1));
    cardQty[slug] = next;
    valueEl.textContent = next;
    addBtn.disabled = next === 0;
  }

  if (action === "add") {
    const qty = cardQty[slug] || 0;
    if (qty < 1) return;
    cart[slug] = (cart[slug] || 0) + qty;
    saveCart();
    renderCart();

    cardQty[slug] = 0;
    valueEl.textContent = 0;
    addBtn.disabled = true;
    addBtn.textContent = "Added ✓";
    addBtn.classList.add("is-added");
    setTimeout(() => {
      addBtn.textContent = "Add to Cart";
      addBtn.classList.remove("is-added");
    }, 900);
  }
});

/* ---------------------------------------------------------
   CART
   --------------------------------------------------------- */

const cartEntries = () =>
  Object.entries(cart)
    .map(([slug, qty]) => ({ product: findProduct(slug), qty }))
    .filter(e => e.product && e.qty > 0);

const cartTotal = entries => entries.reduce((s, { product, qty }) => s + product.price * qty, 0);

function renderCart() {
  const entries = cartEntries();
  const count = entries.reduce((s, e) => s + e.qty, 0);
  const total = formatRupees(cartTotal(entries));

  $("cart-count").textContent = count;
  $("cart-count").dataset.empty = String(count === 0);
  $("cart-total").textContent = total;
  $("details-total").textContent = total;
  $("to-details").disabled = count === 0;
  $("cart-bar-text").textContent = `${count} item${count === 1 ? "" : "s"} · ${total}`;
  $("cart-bar").hidden = count === 0;

  $("cart-items").innerHTML = entries.length
    ? entries.map(({ product, qty }) => `
        <div class="cart-line" data-slug="${product.slug}">
          <div class="cart-line-thumb">
            <img src="${product.image}" alt="" onerror="handleImageError(this, '${product.slug}')">
          </div>
          <div class="cart-line-body">
            <div class="cart-line-top">
              <div>
                <div class="cart-line-name">${product.name}</div>
                <div class="cart-line-pack">${product.pack}</div>
              </div>
              <button class="cart-line-remove" type="button" data-action="remove">Remove</button>
            </div>
            <div class="cart-line-bottom">
              <div class="qty-stepper">
                <button class="qty-btn" type="button" data-action="dec" aria-label="Decrease quantity">&minus;</button>
                <span class="qty-value">${qty}</span>
                <button class="qty-btn" type="button" data-action="inc" aria-label="Increase quantity">+</button>
              </div>
              <span class="cart-line-price">${formatRupees(product.price * qty)}</span>
            </div>
          </div>
        </div>`).join("")
    : `<div class="cart-empty">
         <p>Your cart is empty.</p>
         <a href="#shop" data-close-cart="true">Browse the range</a>
       </div>`;

  $("order-recap").innerHTML = entries.map(({ product, qty }) =>
    `<li><span>${product.name} × ${qty}</span><span>${formatRupees(product.price * qty)}</span></li>`).join("");

  validateDetails();
}

$("cart-items").addEventListener("click", e => {
  if (e.target.closest("[data-close-cart]")) { closeCart(); return; }

  const btn = e.target.closest("[data-action]");
  const line = e.target.closest(".cart-line");
  if (!btn || !line) return;

  const slug = line.dataset.slug;
  const action = btn.dataset.action;

  if (action === "inc") cart[slug] = (cart[slug] || 0) + 1;
  if (action === "dec") cart[slug] = Math.max(0, (cart[slug] || 0) - 1);
  if (action === "remove") delete cart[slug];
  if (cart[slug] === 0) delete cart[slug];

  saveCart();
  renderCart();
});

/* ---------------------------------------------------------
   CART DRAWER + 2 STEPS
   --------------------------------------------------------- */

function setStep(n) {
  $("step-cart").hidden = n !== 1;
  $("step-details").hidden = n !== 2;
  $("cart-back").hidden = n !== 2;
  $("cart-title").textContent = n === 1 ? "Your Cart" : "Your Details";
  $("cart-step-label").textContent = `Step ${n} of 2`;
}

function openCart() {
  setStep(1);
  $("cart-drawer").classList.add("is-open");
  $("cart-overlay").classList.add("is-open");
  $("cart-drawer").setAttribute("aria-hidden", "false");
  $("cart-toggle").setAttribute("aria-expanded", "true");
  $("cart-close").focus();
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("cart-drawer").classList.remove("is-open");
  $("cart-overlay").classList.remove("is-open");
  $("cart-drawer").setAttribute("aria-hidden", "true");
  $("cart-toggle").setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

$("cart-toggle").addEventListener("click", openCart);
$("cart-bar").addEventListener("click", openCart);
$("cart-close").addEventListener("click", closeCart);
$("cart-overlay").addEventListener("click", closeCart);
$("to-details").addEventListener("click", () => { if (cartEntries().length) setStep(2); });
$("cart-back").addEventListener("click", () => setStep(1));

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && $("cart-drawer").classList.contains("is-open")) closeCart();
});

/* ---------------------------------------------------------
   WHATSAPP ORDERING
   --------------------------------------------------------- */

function buildOrderMessage(name, address) {
  const entries = cartEntries();
  const lines = entries.map(({ product, qty }, i) =>
    `${i + 1}. ${product.name} (${product.pack}) x${qty} — ${formatRupees(product.price * qty)}`);

  return [
    `Hi ${BUSINESS_NAME}! I'd like to place an order:`,
    "",
    ...lines,
    "",
    `Total: ${formatRupees(cartTotal(entries))}`,
    "",
    `Name: ${name}`,
    `Delivery Address: ${address}`,
    "",
    "Thank you!"
  ].join("\n");
}

const whatsappLink = msg => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

function validateDetails() {
  const name = $("customer-name").value.trim();
  const address = $("customer-address").value.trim();
  $("checkout-btn").disabled = cartEntries().length === 0 || !name || !address;
  $("checkout-error").textContent = "";
  return { name, address };
}

$("customer-name").addEventListener("input", validateDetails);
$("customer-address").addEventListener("input", validateDetails);

$("checkout-btn").addEventListener("click", () => {
  if (cartEntries().length === 0) return;
  const { name, address } = validateDetails();
  if (!name || !address) {
    $("checkout-error").textContent = "Please enter your name and delivery address.";
    return;
  }
  window.open(whatsappLink(buildOrderMessage(name, address)), "_blank", "noopener");
});

/* General WhatsApp links (contact + footer) */
(function wireGeneralWhatsAppLinks() {
  const link = whatsappLink(`Hi ${BUSINESS_NAME}! I have a question about your products.`);
  ["contact-whatsapp", "footer-whatsapp"].forEach(id => {
    const el = $(id);
    if (el) { el.href = link; el.target = "_blank"; el.rel = "noopener"; }
  });
})();

/* ---------------------------------------------------------
   HERO CAROUSEL (auto-advance + swipe)
   --------------------------------------------------------- */

function initProductCarousel() {
  const track = $("hero-carousel-track");
  const dots = $("carousel-dots");
  if (!track || !dots) return;

  const slides = Array.from(track.querySelectorAll(".carousel-slide"));
  if (!slides.length) return;

  let current = 0;
  let timer;

  dots.innerHTML = slides.map((_, i) =>
    `<button class="carousel-dot${i === 0 ? " is-active" : ""}" type="button" aria-label="Show product ${i + 1}" data-slide="${i}"></button>`).join("");
  const dotButtons = Array.from(dots.querySelectorAll(".carousel-dot"));

  function showSlide(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("is-active", idx === current));
    dotButtons.forEach((d, idx) => d.classList.toggle("is-active", idx === current));
  }
  function restart() {
    clearInterval(timer);
    if (slides.length > 1) timer = setInterval(() => showSlide(current + 1), 2800);
  }

  dotButtons.forEach(d => d.addEventListener("click", () => { showSlide(Number(d.dataset.slide)); restart(); }));

  let startX = null;
  const box = $("product-carousel");
  box.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { showSlide(current + (dx < 0 ? 1 : -1)); restart(); }
    startX = null;
  }, { passive: true });

  restart();
}

/* ---------------------------------------------------------
   MOBILE NAV
   --------------------------------------------------------- */

const navToggle = $("nav-toggle");
const mainNav = $("main-nav");

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});
mainNav.querySelectorAll("a").forEach(link =>
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }));

/* ---------------------------------------------------------
   INIT
   --------------------------------------------------------- */

$("footer-year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
initProductCarousel();
