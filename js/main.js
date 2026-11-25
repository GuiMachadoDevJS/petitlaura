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
    instagram: "https://www.instagram.com/petitlaura.oficial",
    shopee: "https://shopee.com.br/petitlaura",
    loja: "https://petitlaura.com.br", // loja oficial: personalizados sob medida
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
  const totop = document.getElementById("totop");
  const showFloating = (on) => {
    fab?.classList.toggle("is-visible", on);
    totop?.classList.toggle("is-visible", on);
  };
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => showFloating(!en.isIntersecting), { threshold: 0, rootMargin: "-40% 0px 0px 0px" }).observe(hero);
  } else {
    showFloating(true);
  }

  /* ---------- Seta "role para ver mais": some ao começar a rolar ---------- */
  const hint = document.getElementById("scrollhint");
  if (hint) {
    const onScroll = () => hint.classList.toggle("is-hidden", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Voltar ao topo ---------- */
  totop?.addEventListener("click", () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ---------- Fotos dos produtos: se a imagem ainda não existir, mantém o espaço rosa com coração ---------- */
  document.querySelectorAll(".card__photo img").forEach((img) => {
    const drop = () => img.remove();
    img.addEventListener("error", drop);
    if (img.complete && img.naturalWidth === 0) drop();
  });
})();
