document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initGallery();
  initPurchaseOptions();
  initAccordion();
  initStatsAnimation();
});

// Mobile Menu
function initMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links a");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const isActive = navLinks.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", isActive);
      document.body.classList.toggle("no-scroll", isActive);
    });

    // Close menu when a link is clicked
    links.forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
      });
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !hamburger.contains(e.target) &&
        !navLinks.contains(e.target) &&
        navLinks.classList.contains("active")
      ) {
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
      }
    });
  }
}

// Product Gallery
function initGallery() {
  const mainImages = document.querySelectorAll(".main-image img");
  const thumbnails = document.querySelectorAll(".thumbnails-grid img");
  const dots = document.querySelectorAll(".gallery-dots .dot");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  let currentIndex = 0;

  function updateGallery() {
    mainImages.forEach((img, idx) => {
      img.classList.toggle("active", idx === currentIndex);
    });
    thumbnails.forEach((thumb, idx) => {
      thumb.classList.toggle("active", idx === currentIndex);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === currentIndex);
    });
  }

  function goToSlide(index) {
    if (index < 0) index = mainImages.length - 1;
    if (index >= mainImages.length) index = 0;
    currentIndex = index;
    updateGallery();
  }

  if (prevBtn)
    prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
  if (nextBtn)
    nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));

  thumbnails.forEach((thumb, idx) => {
    thumb.addEventListener("click", () => goToSlide(idx));
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => goToSlide(idx));
  });
}

// Purchase Options (Subscription Toggles + Fragrance Selection)
function initPurchaseOptions() {
  const subCards = document.querySelectorAll(".sub-option-card");
  const fragranceCards = document.querySelectorAll(".fragrance-card");
  const addToCartBtn = document.getElementById("add-to-cart");

  if (!addToCartBtn) {
    console.error("Add to cart button not found");
    return;
  }

  // State
  let state = {
    type: "single", // single, double
    fragrances: {
      single: "original",
      double_1: "original",
      double_2: "original",
    },
    price: 99.99,
  };

  const prices = {
    single: 99.99,
    double: 169.99,
  };

  // Fragrance Selection Logic
  fragranceCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      e.stopPropagation(); // Avoid triggering sub-card click

      const fragranceValue = card.getAttribute("data-fragrance");
      const grid = card.closest(".fragrance-grid");
      const group = grid ? grid.getAttribute("data-group") : null;
      const container = card.closest(".sub-option-card");

      if (!container) return;

      const cardType = container.getAttribute("data-type");

      // Find all cards in this SPECIFIC grid and update UI
      if (grid) {
        const siblings = grid.querySelectorAll(".fragrance-card");
        siblings.forEach((s) => s.classList.remove("selected"));
      }
      card.classList.add("selected");

      // Update radio button
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
      }

      // Update State
      if (cardType === "double") {
        if (group === "1") state.fragrances.double_1 = fragranceValue;
        if (group === "2") state.fragrances.double_2 = fragranceValue;
      } else if (cardType === "single") {
        state.fragrances.single = fragranceValue;
      }

      updateCart();
    });
  });

  // Purchase Type Selection Logic
  subCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Prevent propagation to allow inner elements to work
      const target = e.target;

      // If clicking a radio or fragrance card, let those handlers deal with it
      if (
        target.matches('input[type="radio"]') ||
        target.closest(".fragrance-card")
      ) {
        return;
      }

      // UI Update
      subCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");

      // Radio Update
      const radio = card.querySelector('input[name="subscription_type"]');
      if (radio) {
        radio.checked = true;
        state.type = radio.value;
        state.price = prices[state.type] || 99.99;
      }

      updateCart();
    });
  });

  // Also handle radio button changes directly
  const typeRadios = document.querySelectorAll(
    'input[name="subscription_type"]'
  );
  typeRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const card = e.target.closest(".sub-option-card");
      if (card) {
        subCards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        state.type = e.target.value;
        state.price = prices[state.type] || 99.99;
        updateCart();
      }
    });
  });

  function updateCart() {
    let fragranceInfo = "";

    if (state.type === "double") {
      fragranceInfo = `${state.fragrances.double_1}+${state.fragrances.double_2}`;
    } else if (state.type === "single") {
      fragranceInfo = state.fragrances.single;
    }

    // Build cart URL with all parameters
    const params = new URLSearchParams({
      product: state.type,
      fragrances: fragranceInfo,
      price: state.price,
    });

    const url = `https://example.com/cart?${params.toString()}`;

    if (addToCartBtn) {
      addToCartBtn.href = url;
      addToCartBtn.setAttribute("data-type", state.type);
      addToCartBtn.setAttribute("data-fragrances", fragranceInfo);
      addToCartBtn.setAttribute("data-price", state.price);
      addToCartBtn.textContent = `Add to Cart - $${state.price.toFixed(2)}`;
    }
  }

  // Initialize
  updateCart();
}

// Accordion
function initAccordion() {
  const items = document.querySelectorAll(".accordion-item");

  items.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    header.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all others
      items.forEach((i) => {
        i.classList.remove("active");
        i.querySelector(".accordion-content").style.maxHeight = null;
        i.querySelector(".icon").textContent = "+";
        const h = i.querySelector(".accordion-header");
        if (h) h.setAttribute("aria-expanded", "false");
      });

      // Toggle current
      if (!isActive) {
        item.classList.add("active");
        const content = item.querySelector(".accordion-content");
        content.style.maxHeight = content.scrollHeight + "px";
        item.querySelector(".icon").textContent = "−"; // Minus sign
        header.setAttribute("aria-expanded", "true");
      }
    });
  });
}

// Stats Animation
function initStatsAnimation() {
  const section = document.querySelector(".stats-bar");
  const counters = document.querySelectorAll(".percentage");
  let started = false;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        counters.forEach((counter) => {
          const target = +counter.getAttribute("data-target");
          animateCounter(counter, target);
        });
      }
    },
    { threshold: 0.5 }
  );

  if (section) {
    observer.observe(section);
  }
}

function animateCounter(element, target) {
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.round(current) + "%";
  }, 20);
}
