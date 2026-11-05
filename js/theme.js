(function () {
  const racine = document.documentElement;
  let choix = null;
  try {
    choix = localStorage.getItem("theme");
  } catch (e) {}
  const systemeSombre =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  racine.setAttribute(
    "data-theme",
    choix || (systemeSombre ? "dark" : "light"),
  );

  document.addEventListener("DOMContentLoaded", () => {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "theme-toggle";
    const maj = () => {
      const sombre = racine.getAttribute("data-theme") === "dark";
      bouton.textContent = sombre ? "☀ Clair" : "☾ Sombre";
      bouton.setAttribute(
        "aria-label",
        sombre ? "Passer au thème clair" : "Passer au thème sombre",
      );
    };
    bouton.addEventListener("click", () => {
      const suivant =
        racine.getAttribute("data-theme") === "dark" ? "light" : "dark";
      racine.setAttribute("data-theme", suivant);
      try {
        localStorage.setItem("theme", suivant);
      } catch (e) {}
      maj();
    });
    maj();
    document.body.appendChild(bouton);
  });
})();
