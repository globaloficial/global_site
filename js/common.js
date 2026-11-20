const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const LINKS = {
  invite: "https://web.fluxer.app/oauth2/authorize?client_id=1562253521942745089&scope=bot&permissions=22527189434367169",
  support: "https://fluxer.gg/hDYAW1OU",
  github: "https://github.com/Global-APP/global",
  issues: "https://github.com/Global-APP/global/issues"
};

const BRAND_COLOR = "#0330ef";
const VIDEO_PATTERN = /\.(mp4|webm)$/i;

const escapeHtml = (text) =>
  text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

function animateNumber(element, target, duration, from = 0) {
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const value = from + (target - from) * (1 - (1 - progress) ** 3);

    element.textContent = Math.round(value).toLocaleString("pt-BR");
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function createMedia(source) {
  if (!VIDEO_PATTERN.test(source)) {
    const image = new Image();

    image.alt = "";
    image.src = source;
    return image;
  }

  const video = document.createElement("video");

  Object.assign(video, { src: source, autoplay: true, loop: true, muted: true, playsInline: true });
  return video;
}

function createAvatar({ name, source, letter = name[0].toUpperCase(), accent = BRAND_COLOR, className = "" }) {
  const placeholder = document.createElement("i");

  placeholder.className = `initial ${className}`.trim();
  placeholder.style.setProperty("--tint", accent);
  placeholder.textContent = letter;

  if (!source) return placeholder;

  const wrapper = document.createElement("span");
  const media = createMedia(source);

  wrapper.className = `avatar ${className}`.trim();
  media.addEventListener("error", () => wrapper.replaceWith(placeholder));
  wrapper.append(media);

  return wrapper;
}

function initLinks() {
  $$("[data-link]").forEach((anchor) => {
    anchor.href = LINKS[anchor.dataset.link];
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  });
}

function initSpotlight() {
  document.addEventListener("pointermove", (event) => {
    const target = event.target.closest && event.target.closest(".command");
    if (!target) return;

    const { left, top, width, height } = target.getBoundingClientRect();
    target.style.setProperty("--mx", `${((event.clientX - left) / width) * 100}%`);
    target.style.setProperty("--my", `${((event.clientY - top) / height) * 100}%`);
  });
}

initLinks();
initSpotlight();
