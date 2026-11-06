const form = document.getElementById("form");
const erreur = document.getElementById("erreur");
const bouton = document.getElementById("envoyer");
const confirmation = document.getElementById("confirmation");

const LETTRES_SEULES = /^\p{L}[\p{L}\s'’-]*$/u;
const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL_VALIDE = /^(\+261|0)3\d{8}$/;
const nettoyerTel = (t) => t.replace(/[\s.-]/g, "");

const DATE_MIN = "1930-01-01";
const aujourdhui = (() => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
})();
const champNaissance = document.getElementById("naissance");
champNaissance.min = DATE_MIN;
champNaissance.max = aujourdhui;

const REGLES = {
  nom: (v) => LETTRES_SEULES.test(v.trim()),
  prenom: (v) => LETTRES_SEULES.test(v.trim()),
  ville: (v) => LETTRES_SEULES.test(v.trim()),
  filiere: (v) => LETTRES_SEULES.test(v.trim()),
  email: (v) => EMAIL_VALIDE.test(v.trim()),
  telephone: (v) => TEL_VALIDE.test(nettoyerTel(v)),
  naissance: (v) => v >= DATE_MIN && v <= aujourdhui,
};
const MESSAGES = {
  nom: "Le nom ne doit contenir que des lettres.",
  prenom: "Le prénom ne doit contenir que des lettres.",
  ville: "La ville ne doit contenir que des lettres.",
  filiere: "La filière ne doit contenir que des lettres.",
  email: "E-mail invalide : il doit contenir un @ (exemple : nom@gmail.com).",
  telephone: "Numéro invalide : 03X XX XXX XX ou +261 3X XX XXX XX.",
  naissance:
    "Date de naissance invalide : elle ne peut pas être dans le futur.",
};

["nom", "prenom", "ville", "filiere"].forEach((id) => {
  const champ = document.getElementById(id);
  champ.addEventListener("input", () => {
    champ.value = champ.value.replace(/[^\p{L}\s'’-]/gu, "");
  });
});

const champTel = document.getElementById("telephone");
champTel.addEventListener("input", () => {
  let v = champTel.value.replace(/[^\d+\s]/g, "");
  v = v.replace(/\+/g, (m, i) => (i === 0 ? "+" : ""));
  v = v.replace(/\s{2,}/g, " ");
  const max = v.startsWith("+") ? 12 : 10;
  let nb = 0,
    sortie = "";
  for (const c of v) {
    if (/\d/.test(c)) {
      if (nb >= max) continue;
      nb++;
    }
    sortie += c;
  }
  champTel.value = sortie;
});

async function enregistrer(donnees) {
  ["nom", "prenom", "ville", "filiere", "motivation"].forEach(
    (k) => (donnees[k] = donnees[k].trim()),
  );
  donnees.telephone = nettoyerTel(donnees.telephone);
  donnees.email = donnees.email.trim().toLowerCase();
  if (!donnees.projet.trim()) donnees.projet = null;

  const reponse = await fetch(`${SUPABASE_URL}/rest/v1/etudiants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=minimal", //
    },
    body: JSON.stringify(donnees),
  });

  if (reponse.status === 409) throw new Error("DOUBLON");
  if (!reponse.ok) throw new Error("ERREUR_" + reponse.status);
}

let messageErreur = "";
function valider() {
  let premier = null;
  messageErreur = "";
  form.querySelectorAll("[required]").forEach((champ) => {
    const vide = !champ.value.trim();
    const regle = REGLES[champ.id];
    const invalide = vide || (regle ? !regle(champ.value) : false);
    champ.classList.toggle("invalide", invalide);
    if (invalide && !premier) {
      premier = champ;
      messageErreur =
        vide || !MESSAGES[champ.id]
          ? "Corrigez les champs en rouge avant d’envoyer."
          : MESSAGES[champ.id];
    }
  });
  return premier;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const premier = valider();
  if (premier) {
    erreur.textContent = messageErreur;
    erreur.hidden = false;
    premier.focus();
    return;
  }
  erreur.hidden = true;
  bouton.disabled = true;
  bouton.textContent = "Envoi en cours…";
  try {
    const donnees = Object.fromEntries(new FormData(form).entries());
    await enregistrer(donnees);
    document.getElementById("nom-confirme").textContent = donnees.prenom;
    form.hidden = true;
    confirmation.hidden = false;
    confirmation.focus();
  } catch (err) {
    erreur.textContent =
      err.message === "DOUBLON"
        ? "Cet e-mail a déjà été utilisé : votre fiche est déjà enregistrée."
        : "L’envoi a échoué. Vérifiez votre connexion et réessayez.";
    erreur.hidden = false;
    bouton.disabled = false;
    bouton.textContent = "Envoyer ma fiche";
  }
});
