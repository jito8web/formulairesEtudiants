const form = document.getElementById("form");
const erreur = document.getElementById("erreur");
const bouton = document.getElementById("envoyer");
const confirmation = document.getElementById("confirmation");

async function enregistrer(donnees) {
  donnees.email = donnees.email.trim().toLowerCase();
  if (!donnees.projet.trim()) donnees.projet = null;

  const reponse = await fetch(`${SUPABASE_URL}/rest/v1/etudiants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=minimal", // indispensable : les visiteurs n'ont pas le droit de lire
    },
    body: JSON.stringify(donnees),
  });

  if (reponse.status === 409) {
    throw new Error("DOUBLON");
  }
  if (!reponse.ok) {
    throw new Error("ERREUR_" + reponse.status);
  }
}

function valider() {
  let premier = null;
  form.querySelectorAll("[required]").forEach((champ) => {
    const vide = !champ.value.trim();
    let invalide = vide || (champ.type === "email" && !champ.checkValidity());
    if (
      champ.type === "tel" &&
      !vide &&
      !/^[+\d][\d\s.-]{6,}$/.test(champ.value.trim())
    )
      invalide = true;
    champ.classList.toggle("invalide", invalide);
    if (invalide && !premier) premier = champ;
  });
  return premier;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const premier = valider();
  if (premier) {
    erreur.textContent = "Corrigez les champs en rouge avant d’envoyer.";
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
