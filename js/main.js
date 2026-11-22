/* =========================================================
   Petit Laura – Landing page
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURAÇÃO – é só preencher aqui, o resto é automático.
   --------------------------------------------------------- */
const CONFIG = {
  // WhatsApp: código do país + DDD + número, só dígitos. Ex.: "5511999999999"
  whatsappNumber: "",

  // Mensagem inicial que aparece pronta no WhatsApp
  whatsappMessage: "Oi! Vim pelo site da Petit Laura 💕 Quero saber mais sobre os produtos personalizados.",

  links: {
    instagram: "", // ex.: "https://www.instagram.com/petitlaura"
    shopee: "",    // ex.: "https://shopee.com.br/petitlaura"
    loja: "",      // quando a loja estiver no ar: "https://petitlaura.com.br"
  },

  // Parâmetros de origem, para saber no Shopee/loja quem veio da landing
  utm: { source: "landing", medium: "link_na_bio" },
};

(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const toastEl = document.getElementById("toast");
  let toastTimer;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
  };

  /* ---------- Monta URLs ---------- */
  const withUtm = (url, campaign) => {
    try {
      const u = new URL(url);
      u.searchParams.set("utm_source", CONFIG.utm.source);
      u.searchParams.set("utm_medium", CONFIG.utm.medium);
      u.searchParams.set("utm_campaign", campaign);
      return u.toString();
    } catch {
      return url;
    }
  };

  const waUrl = (text) => {
    const digits = (CONFIG.whatsappNumber || "").replace(/\D/g, "");
    if (!digits) return "";
    return `https://wa.me/${digits}?text=${encodeURIComponent(text || CONFIG.whatsappMessage)}`;
  };

  const resolve = (key, productText) => {
    if (key === "whatsapp") return waUrl(productText);
    const url = CONFIG.links[key];
    if (!url) return "";
    return key === "instagram" ? url : withUtm(url, key);
  };

  /* ---------- Liga os links ---------- */
  document.querySelectorAll("[data-link]").forEach((el) => {
    const key = el.dataset.link;
    const url = resolve(key);
    if (url) {
      el.href = url;
      if (key === "loja") {
        el.classList.remove("btn--soon");
        el.removeAttribute("aria-disabled");
        el.removeAttribute("tabindex");
        el.removeAttribute("target");
        el.querySelector(".badge")?.remove();
      }
    } else {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        toast(key === "loja" ? "Nossa loja chega em breve 💕" : "Link em breve 💕");
      });
    }
  });

  // Produtos: abrem o WhatsApp já falando do produto escolhido
  document.querySelectorAll("[data-product]").forEach((el) => {
    const url = waUrl(`Oi! Vim pelo site da Petit Laura 💕 Quero saber mais sobre: ${el.dataset.product}.`);
    if (url) {
      el.href = url;
    } else {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        toast("WhatsApp em breve 💕");
      });
    }
  });

  /* ---------- Ano no rodapé ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Revelar ao rolar ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Botão flutuante: aparece depois do hero ---------- */
  const fab = document.getElementById("fab");
  const hero = document.getElementById("topo");
  if (fab && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => fab.classList.toggle("is-visible", !en.isIntersecting), { threshold: 0, rootMargin: "-40% 0px 0px 0px" }).observe(hero);
  } else if (fab) {
    fab.classList.add("is-visible");
  }

  /* ---------- Carrossel ---------- */
  const car = document.getElementById("carousel");
  if (car) {
    const track = car.querySelector(".carousel__track");
    const slides = [...track.children];
    const dotsBox = car.querySelector(".carousel__dots");
    const dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "carousel__dot";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", `Slide ${i + 1}`);
      b.addEventListener("click", () => goTo(i));
      dotsBox.appendChild(b);
      return b;
    });

    let index = 0;
    const slideStep = () => slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : slides[0].offsetWidth;
    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      const s = slides[index];
      track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2, behavior: "smooth" });
    };

    const update = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestDist = Infinity;
      slides.forEach((s, i) => {
        const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - center);
        if (d < bestDist) { best = i; bestDist = d; }
      });
      index = best;
      dots.forEach((d, i) => d.setAttribute("aria-selected", String(i === best)));
    };
    track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    update();

    car.querySelectorAll("[data-dir]").forEach((b) => b.addEventListener("click", () => goTo(index + Number(b.dataset.dir))));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
    });

    // Avanço automático suave, pausa ao tocar/passar o mouse e respeita "menos movimento"
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      let timer, visible = false, paused = false;
      const stop = () => clearInterval(timer);
      const start = () => { stop(); if (visible && !paused) timer = setInterval(() => goTo(index + 1), 4500); };
      new IntersectionObserver(([en]) => { visible = en.isIntersecting; start(); }, { threshold: 0.5 }).observe(car);
      ["pointerdown", "mouseenter", "focusin"].forEach((ev) => car.addEventListener(ev, () => { paused = true; stop(); }));
      ["mouseleave", "focusout"].forEach((ev) => car.addEventListener(ev, () => { paused = false; start(); }));
    }
  }
})();
