const links = [...document.querySelectorAll(".toc__link")];

if (links.length) {
  const sections = links.map((link) => document.querySelector(link.getAttribute("href")));

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-20% 0px -70% 0px" });

  sections.forEach((section) => spy.observe(section));
}
