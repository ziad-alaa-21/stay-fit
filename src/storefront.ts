const header = document.querySelector<HTMLElement>("[data-header]");
const loader = document.querySelector<HTMLElement>(".loader");
const menuToggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const navMenu = document.querySelector<HTMLElement>("[data-nav-menu]");
const backTop = document.querySelector<HTMLButtonElement>("[data-back-top]");
const slides = [...document.querySelectorAll<HTMLElement>(".hero-slide")];
const dotsWrap = document.querySelector<HTMLElement>("[data-slide-dots]");
const prevSlideButton = document.querySelector<HTMLButtonElement>("[data-slide-prev]");
const nextSlideButton = document.querySelector<HTMLButtonElement>("[data-slide-next]");
const carousel = document.querySelector<HTMLElement>("[data-product-carousel]");
const productPrev = document.querySelector<HTMLButtonElement>("[data-product-prev]");
const productNext = document.querySelector<HTMLButtonElement>("[data-product-next]");
const mobileMenuQuery = window.matchMedia("(max-width: 1023px)");
let activeSlide = 0;
let slideTimer: number | undefined;

document.body.classList.add("is-loading");
window.addEventListener("load", () => {
  loader?.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
});

const syncHeader = (): void => {
  header?.classList.toggle("is-scrolled", window.scrollY > 30);
  backTop?.classList.toggle("is-visible", window.scrollY > 520);
};

const updateMenuA11y = (): void => {
  if (!navMenu) return;
  const isOpen = navMenu.classList.contains("is-open");
  const shouldHide = mobileMenuQuery.matches && !isOpen;
  navMenu.toggleAttribute("inert", shouldHide);
  navMenu.setAttribute("aria-hidden", String(shouldHide));
};

const setSlide = (index: number): void => {
  if (!slides.length || !dotsWrap) return;
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === activeSlide));
  [...dotsWrap.children].forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeSlide);
    dot.setAttribute("aria-selected", String(dotIndex === activeSlide));
  });
};

const restartSlider = (): void => {
  if (slideTimer) window.clearInterval(slideTimer);
  slideTimer = window.setInterval(() => setSlide(activeSlide + 1), 5000);
};

const renderDots = (): void => {
  if (!dotsWrap) return;
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

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();
updateMenuA11y();
mobileMenuQuery.addEventListener("change", updateMenuA11y);

menuToggle?.addEventListener("click", () => {
  if (!navMenu || !header) return;
  const isOpen = navMenu.classList.toggle("is-open");
  header.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  updateMenuA11y();
});

navMenu?.addEventListener("click", (event: MouseEvent) => {
  if (event.target instanceof HTMLAnchorElement) {
    navMenu.classList.remove("is-open");
    header?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    updateMenuA11y();
  }
});

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

document.querySelector<HTMLElement>(".hero-slider")?.addEventListener("mousemove", (event: MouseEvent) => {
  const active = slides[activeSlide];
  if (!active) return;
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
  { threshold: 0.16 },
);

document.querySelectorAll<HTMLElement>(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 35, 280)}ms`;
  revealObserver.observe(element);
});

const scrollCarousel = (direction: number): void => {
  if (!carousel) return;
  const amount = Math.max(carousel.clientWidth * 0.84, 260);
  carousel.scrollBy({ left: amount * direction, behavior: "smooth" });
};

productPrev?.addEventListener("click", () => scrollCarousel(-1));
productNext?.addEventListener("click", () => scrollCarousel(1));

document.querySelectorAll<HTMLElement>(".tilt-card").forEach((card) => {
  card.addEventListener("mousemove", (event: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 6}deg) translateY(-8px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

document.querySelector<HTMLFormElement>(".newsletter")?.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement | null;
  if (!form) return;
  const button = form.querySelector<HTMLButtonElement>("button");
  if (!button) return;
  const originalText = button.textContent ?? "Submit";
  button.textContent = "Joined";
  window.setTimeout(() => {
    button.textContent = originalText;
    form.reset();
  }, 1600);
});

backTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
