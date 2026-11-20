(function () {
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const glow = document.getElementById("cursor-glow");
  const SPOT = ".card, .stat, .server";

  document.addEventListener("pointerdown", (event) => {
    const button = event.target.closest(".btn");
    if (!button || reduce) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const dot = document.createElement("span");

    dot.className = "ripple";
    dot.style.width = dot.style.height = `${size}px`;
    dot.style.left = `${event.clientX - rect.left - size / 2}px`;
    dot.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.append(dot);
    dot.addEventListener("animationend", () => dot.remove());
  });

  if (!fine || reduce) return;

  let x = 0;
  let y = 0;
  let cx = 0;
  let cy = 0;

  window.addEventListener("pointermove", (event) => {
    x = event.clientX;
    y = event.clientY;
    glow.classList.add("on");

    const target = event.target.closest && event.target.closest(SPOT);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    target.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    target.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });

  document.addEventListener("pointerleave", () => glow.classList.remove("on"));

  (function frame() {
    cx += (x - cx) * 0.14;
    cy += (y - cy) * 0.14;
    glow.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    requestAnimationFrame(frame);
  })();
})();
