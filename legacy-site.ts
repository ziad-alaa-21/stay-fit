const header = document.querySelector("[data-header]");
const loader = document.querySelector(".loader");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const backTop = document.querySelector("[data-back-top]");
const slides = [...document.querySelectorAll(".hero-slide")];
const dotsWrap = document.querySelector("[data-slide-dots]");
const prevSlideButton = document.querySelector("[data-slide-prev]");
const nextSlideButton = document.querySelector("[data-slide-next]");
const carousel = document.querySelector("[data-product-carousel]");
const productPrev = document.querySelector("[data-product-prev]");
const productNext = document.querySelector("[data-product-next]");
let activeSlide = 0;
let slideTimer;
const mobileMenuQuery = window.matchMedia("(max-width: 1023px)");

document.body.classList.add("is-loading");

window.addEventListener("load", () => {
  loader?.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
});

const syncHeader = () => {
  const scrolled = window.scrollY > 30;
  header?.classList.toggle("is-scrolled", scrolled);
  backTop?.classList.toggle("is-visible", window.scrollY > 520);
};

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

const updateMenuA11y = () => {
  if (!navMenu) return;
  const isOpen = navMenu.classList.contains("is-open");
  const shouldHide = mobileMenuQuery.matches && !isOpen;
  navMenu.toggleAttribute("inert", shouldHide);
  navMenu.setAttribute("aria-hidden", String(shouldHide));
};

menuToggle?.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  header.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  updateMenuA11y();
});

navMenu?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    navMenu.classList.remove("is-open");
    header.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    updateMenuA11y();
  }
});

mobileMenuQuery.addEventListener("change", updateMenuA11y);
updateMenuA11y();

const renderDots = () => {
  dotsWrap.innerHTML = "";
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.textContent = `${index + 1}/${slides.length}`;
    dot.setAttribute("aria-label", `Show slide ${index + 1}`);
    dot.addEventListener("click", () => {
      setSlide(index);
      restartSlider();
    });
    dotsWrap.append(dot);
  });
};

const setSlide = (index) => {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlide);
  });
  [...dotsWrap.children].forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeSlide);
    dot.setAttribute("aria-selected", String(dotIndex === activeSlide));
  });
};

const restartSlider = () => {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => setSlide(activeSlide + 1), 5000);
};

if (slides.length && dotsWrap) {
  renderDots();
  setSlide(0);
  restartSlider();
}

prevSlideButton?.addEventListener("click", () => {
  setSlide(activeSlide - 1);
  restartSlider();
});

nextSlideButton?.addEventListener("click", () => {
  setSlide(activeSlide + 1);
  restartSlider();
});

document.querySelector(".hero-slider")?.addEventListener("mousemove", (event) => {
  const active = slides[activeSlide];
  const rect = active.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
  active.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 35, 280)}ms`;
  revealObserver.observe(element);
});

const scrollCarousel = (direction) => {
  if (!carousel) return;
  const amount = Math.max(carousel.clientWidth * 0.84, 260);
  carousel.scrollBy({ left: amount * direction, behavior: "smooth" });
};

productPrev?.addEventListener("click", () => scrollCarousel(-1));
productNext?.addEventListener("click", () => scrollCarousel(1));

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 6}deg) translateY(-8px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

document.querySelector(".newsletter")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  const originalText = button.textContent;
  button.textContent = "Joined";
  setTimeout(() => {
    button.textContent = originalText;
    event.currentTarget.reset();
  }, 1600);
});

backTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
