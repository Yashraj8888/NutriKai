/* ==========================================================
   Nutri Kai — main.js
   ========================================================== */

const WHATSAPP_NUMBER = "919344949954";
const BUSINESS_NAME = "Nutri Kai";

/* ---------------------------------------------------------
   PRODUCTS
   --------------------------------------------------------- */

const PRODUCTS = [
  {
    slug: "energy-trails",
    category: "Energy Trails",
    name: "Energy Trails",
    description: "A robust adventure blend featuring 33% of broken almonds and 27% of cashew pieces for slow-release carbs and iron, backed by 23% of chia and 17% of pumpkin seeds to deliver endurance, healthy fats, and plant protein on the move.",
    pack: "100g",
    price: 199,
    image: "assets/Energy Trails.png"
  },
  {
    slug: "keto-boost",
    category: "Keto Boost",
    name: "Keto Boost",
    description: "Powered by 40% of low-carb chia seeds and 40% of nutrient-dense pumpkin seeds for healthy fats and zero-sugar satiety, supercharged with 20% of C8/C10 MCT powder that converts naturally into ketones for instant mental clarity.",
    pack: "100g",
    price: 199,
    image: "assets/Keto Boost.png"
  },
  {
    slug: "morning-fuel",
    category: "Morning Fuel",
    name: "Morning Fuel",
    description: "Crafted with 60% of chia seeds to deliver sustainable omega-3s and fiber that keep morning hunger at bay, paired with 40% of pumpkin seeds providing zinc, magnesium, and plant protein for steady, crash-free energy all morning long.",
    pack: "100g",
    price: 149,
    image: "assets/Morning Fuel.png"
  },
  {
    slug: "skin-glow",
    category: "Skin Glow",
    name: "Skin Glow",
    description: "Built on a foundation of 50% of ground flaxseeds loaded with ALA omega-3s to balance hormones and reduce inflammation, combined with 50% of sunflower seeds rich in vitamin E and selenium to shield skin cells from oxidative damage.",
    pack: "100g",
    price: 149,
    image: "assets/Skin Glow.png"
  },
  {
    slug: "night-recovery",
    category: "Night Recovery",
    name: "Night Recovery",
    description: "Formulated with 60% of tryptophan-rich pumpkin seeds to naturally trigger melatonin production, 30% of anti-inflammatory chia seeds, and 10% of high-absorption magnesium glycinate to deeply relax your muscles and promote restorative sleep.",
    pack: "100g",
    price: 149,
    image: "assets/Night Recovery.png"
  },
  {
    slug: "gut-health",
    category: "Gut Health",
    name: "Gut Health",
    description: "Combines 50% of hydrating sabja seeds that form a soothing, gut-coating mucilage gel, 35% of prebiotic flaxseed to feed healthy gut bacteria, and 15% of fennel powder clinically proven to relieve bloating and gas.",
    pack: "100g",
    price: 149,
    image: "assets/Gut Health.png"
  },
];

/* ---------------------------------------------------------
   STATE
   --------------------------------------------------------- */

const CART_KEY = "beeja_cart_v1";

let cart = loadCart();
let cardQty = {};

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    // Storage unavailable
  }
}

function formatRupees(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function findProduct(slug) {
  return PRODUCTS.find(product => product.slug === slug);
}

/* ---------------------------------------------------------
   IMAGE FALLBACK
   --------------------------------------------------------- */

const CATEGORY_TONE = {
  "Seed Sachets": "#33402A",
  "Dry Fruit Mixes": "#B98B2E",
  "Trail Mixes": "#7A5230"
};

function placeholderMarkup(product) {
  const tone = CATEGORY_TONE[product.category] || "#33402A";
  const initial = product.name.trim().charAt(0).toUpperCase();

  return `
    <div class="product-placeholder" style="background:${tone}0D">
      <svg width="72" height="72" viewBox="0 0 72 72"
           xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="36" r="34"
                fill="none"
                stroke="${tone}"
                stroke-width="1.4"
                opacity="0.55"/>
        <text x="36"
              y="45"
              text-anchor="middle"
              font-family="Lora, serif"
              font-size="26"
              fill="${tone}">
          ${initial}
        </text>
      </svg>
    </div>
  `;
}

function handleImageError(imgEl, slug) {
  const product = findProduct(slug);

  if (!product) return;

  const wrapper = imgEl.parentElement;
  wrapper.innerHTML = placeholderMarkup(product);
}

/* ---------------------------------------------------------
   PRODUCT GRID
   --------------------------------------------------------- */

const productGrid = document.getElementById("product-grid");

function renderProducts() {
  productGrid.innerHTML = PRODUCTS.map(product => {
    const qty = cardQty[product.slug] || 1;

    return `
      <article class="product-card" data-slug="${product.slug}">

        <div class="product-image">
          <img
            src="${product.image}"
            alt="${product.name}"
            loading="lazy"
            onerror="handleImageError(this, '${product.slug}')"
          >
        </div>

        <div class="product-body">

          <div class="product-heading">
            <h3>${product.name}</h3>
            <span class="product-pack">${product.pack}</span>
          </div>

          <p class="product-desc">
            ${product.description}
          </p>

          <div class="product-footer">

            <span class="product-price">
              ${formatRupees(product.price)}
            </span>

            <div class="qty-stepper" data-role="card-stepper">

              <button
                class="qty-btn"
                data-action="dec"
                aria-label="Decrease quantity"
              >
                &minus;
              </button>

              <span class="qty-value">${qty}</span>

              <button
                class="qty-btn"
                data-action="inc"
                aria-label="Increase quantity"
              >
                +
              </button>

            </div>

          </div>

          <button
            class="btn btn-add"
            data-action="add"
          >
            Add to Cart
          </button>

        </div>

      </article>
    `;
  }).join("");
}

productGrid.addEventListener("click", e => {
  const card = e.target.closest(".product-card");

  if (!card) return;

  const slug = card.dataset.slug;
  const action = e.target.dataset.action;

  if (action === "inc" || action === "dec") {
    const current = cardQty[slug] || 1;

    const next =
      action === "inc"
        ? current + 1
        : Math.max(1, current - 1);

    cardQty[slug] = next;

    card.querySelector(".qty-value").textContent = next;
  }

  if (action === "add") {
    const qty = cardQty[slug] || 1;

    cart[slug] = (cart[slug] || 0) + qty;

    saveCart();
    renderCart();

    cardQty[slug] = 1;
    card.querySelector(".qty-value").textContent = 1;

    const btn = e.target;
    const original = btn.textContent;

    btn.textContent = "Added ✓";
    btn.classList.add("is-added");

    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("is-added");
    }, 900);
  }
});

/* ---------------------------------------------------------
   CART
   --------------------------------------------------------- */

const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const cartCountEl = document.getElementById("cart-count");

const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");

const cartToggle = document.getElementById("cart-toggle");
const cartClose = document.getElementById("cart-close");

const checkoutBtn = document.getElementById("checkout-btn");

const customerNameEl =
  document.getElementById("customer-name");

const customerAddressEl =
  document.getElementById("customer-address");

const checkoutErrorEl =
  document.getElementById("checkout-error");

function cartEntries() {
  return Object.entries(cart)
    .map(([slug, qty]) => ({
      product: findProduct(slug),
      qty
    }))
    .filter(entry =>
      entry.product &&
      entry.qty > 0
    );
}

function cartTotal(entries) {
  return entries.reduce(
    (sum, { product, qty }) =>
      sum + product.price * qty,
    0
  );
}

function renderCart() {
  const entries = cartEntries();

  const totalItems = entries.reduce(
    (sum, entry) => sum + entry.qty,
    0
  );

  cartCountEl.textContent = totalItems;

  cartCountEl.dataset.empty =
    totalItems === 0
      ? "true"
      : "false";

  if (entries.length === 0) {

    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <p>Your cart is empty.</p>

        <a
          href="#shop"
          data-close-cart="true"
        >
          Browse the range
        </a>
      </div>
    `;

    checkoutBtn.disabled = true;

  } else {

    cartItemsEl.innerHTML = entries.map(
      ({ product, qty }) => `
        <div
          class="cart-line"
          data-slug="${product.slug}"
        >

          <div class="cart-line-thumb">
            <img
              src="${product.image}"
              alt=""
              onerror="handleImageError(this, '${product.slug}')"
            >
          </div>

          <div class="cart-line-body">

            <div class="cart-line-top">

              <div>

                <div class="cart-line-name">
                  ${product.name}
                </div>

                <div class="cart-line-pack">
                  ${product.pack}
                </div>

              </div>

              <button
                class="cart-line-remove"
                data-action="remove"
              >
                Remove
              </button>

            </div>

            <div class="cart-line-bottom">

              <div class="qty-stepper">

                <button
                  class="qty-btn"
                  data-action="dec"
                  aria-label="Decrease quantity"
                >
                  &minus;
                </button>

                <span class="qty-value">
                  ${qty}
                </span>

                <button
                  class="qty-btn"
                  data-action="inc"
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

              <span class="cart-line-price">
                ${formatRupees(product.price * qty)}
              </span>

            </div>

          </div>

        </div>
      `
    ).join("");

    checkoutBtn.disabled = false;
  }

  cartTotalEl.textContent =
    formatRupees(cartTotal(entries));
}

cartItemsEl.addEventListener("click", e => {

  const closeLink =
    e.target.closest("[data-close-cart]");

  if (closeLink) {
    closeCart();
    return;
  }

  const line =
    e.target.closest(".cart-line");

  if (!line) return;

  const slug = line.dataset.slug;
  const action = e.target.dataset.action;

  if (action === "inc") {
    cart[slug] =
      (cart[slug] || 0) + 1;
  }

  if (action === "dec") {
    cart[slug] =
      Math.max(
        0,
        (cart[slug] || 0) - 1
      );
  }

  if (action === "remove") {
    delete cart[slug];
  }

  if (cart[slug] === 0) {
    delete cart[slug];
  }

  saveCart();
  renderCart();
});

/* ---------------------------------------------------------
   CART DRAWER
   --------------------------------------------------------- */

function openCart() {
  cartDrawer.classList.add("is-open");
  cartOverlay.classList.add("is-open");

  cartDrawer.setAttribute(
    "aria-hidden",
    "false"
  );

  cartToggle.setAttribute(
    "aria-expanded",
    "true"
  );

  cartClose.focus();

  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartOverlay.classList.remove("is-open");

  cartDrawer.setAttribute(
    "aria-hidden",
    "true"
  );

  cartToggle.setAttribute(
    "aria-expanded",
    "false"
  );

  document.body.style.overflow = "";
}

cartToggle.addEventListener(
  "click",
  openCart
);

cartClose.addEventListener(
  "click",
  closeCart
);

cartOverlay.addEventListener(
  "click",
  closeCart
);

document.addEventListener(
  "keydown",
  e => {
    if (
      e.key === "Escape" &&
      cartDrawer.classList.contains("is-open")
    ) {
      closeCart();
    }
  }
);

/* ---------------------------------------------------------
   WHATSAPP ORDERING
   --------------------------------------------------------- */

function buildOrderMessage(name, address) {

  const entries = cartEntries();

  const lines = entries.map(
    ({ product, qty }, i) =>
      `${i + 1}. ${product.name} (${product.pack}) x${qty} — ${formatRupees(product.price * qty)}`
  );

  const total = cartTotal(entries);

  return [
    `Hi ${BUSINESS_NAME}! I'd like to place an order:`,
    "",
    ...lines,
    "",
    `Total: ${formatRupees(total)}`,
    "",
    `Name: ${name}`,
    `Delivery Address: ${address}`,
    "",
    "Thank you!"
  ].join("\n");
}

function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ---------------------------------------------------------
   CHECKOUT VALIDATION
   --------------------------------------------------------- */

function validateCheckoutDetails() {

  const name =
    customerNameEl.value.trim();

  const address =
    customerAddressEl.value.trim();

  checkoutBtn.disabled =
    cartEntries().length === 0 ||
    !name ||
    !address;

  if (checkoutErrorEl) {
    checkoutErrorEl.textContent = "";
  }

  return {
    name,
    address
  };
}

customerNameEl.addEventListener(
  "input",
  validateCheckoutDetails
);

customerAddressEl.addEventListener(
  "input",
  validateCheckoutDetails
);

checkoutBtn.addEventListener(
  "click",
  () => {

    if (cartEntries().length === 0) {
      return;
    }

    const {
      name,
      address
    } = validateCheckoutDetails();

    if (!name || !address) {

      checkoutErrorEl.textContent =
        "Please enter your name and delivery address.";

      return;
    }

    const message =
      buildOrderMessage(
        name,
        address
      );

    window.open(
      whatsappLink(message),
      "_blank",
      "noopener"
    );
  }
);

/* ---------------------------------------------------------
   GENERAL WHATSAPP LINKS
   --------------------------------------------------------- */

function wireGeneralWhatsAppLinks() {

  const greeting =
    `Hi ${BUSINESS_NAME}! I have a question about your products.`;

  const link =
    whatsappLink(greeting);

  [
    "contact-whatsapp",
    "footer-whatsapp"
  ].forEach(id => {

    const el =
      document.getElementById(id);

    if (el) {
      el.href = link;
      el.target = "_blank";
      el.rel = "noopener";
    }

  });
}

/* ---------------------------------------------------------
   PRODUCT HERO CAROUSEL
   --------------------------------------------------------- */

function initProductCarousel() {

  const track =
    document.getElementById(
      "hero-carousel-track"
    );

  const dots =
    document.getElementById(
      "carousel-dots"
    );

  if (!track || !dots) {
    return;
  }

  const slides =
    Array.from(
      track.querySelectorAll(
        ".carousel-slide"
      )
    );

  if (!slides.length) {
    return;
  }

  let current = 0;

  dots.innerHTML =
    slides.map(
      (_, index) => `
        <button
          class="carousel-dot${index === 0 ? " is-active" : ""}"
          type="button"
          aria-label="Show product ${index + 1}"
          data-slide="${index}"
        ></button>
      `
    ).join("");

  const dotButtons =
    Array.from(
      dots.querySelectorAll(
        ".carousel-dot"
      )
    );

  function showSlide(index) {

    current = index;

    slides.forEach(
      (slide, i) => {
        slide.classList.toggle(
          "is-active",
          i === current
        );
      }
    );

    dotButtons.forEach(
      (dot, i) => {
        dot.classList.toggle(
          "is-active",
          i === current
        );
      }
    );
  }

  dotButtons.forEach(dot => {

    dot.addEventListener(
      "click",
      () => {
        showSlide(
          Number(dot.dataset.slide)
        );
      }
    );

  });

  if (slides.length > 1) {

    setInterval(
      () => {
        showSlide(
          (current + 1) % slides.length
        );
      },
      2800
    );

  }
}

/* ---------------------------------------------------------
   MOBILE NAV
   --------------------------------------------------------- */

const navToggle =
  document.getElementById("nav-toggle");

const mainNav =
  document.getElementById("main-nav");

navToggle.addEventListener(
  "click",
  () => {

    const isOpen =
      mainNav.classList.toggle(
        "is-open"
      );

    navToggle.setAttribute(
      "aria-expanded",
      isOpen ? "true" : "false"
    );
  }
);

mainNav
  .querySelectorAll("a")
  .forEach(link => {

    link.addEventListener(
      "click",
      () => {

        mainNav.classList.remove(
          "is-open"
        );

        navToggle.setAttribute(
          "aria-expanded",
          "false"
        );

      }
    );

  });

/* ---------------------------------------------------------
   FOOTER YEAR
   --------------------------------------------------------- */

document.getElementById(
  "footer-year"
).textContent =
  new Date().getFullYear();

/* ---------------------------------------------------------
   INIT
   --------------------------------------------------------- */

renderProducts();
renderCart();
wireGeneralWhatsAppLinks();
initProductCarousel();