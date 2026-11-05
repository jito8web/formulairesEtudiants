const CHAMPS = [
  ["nom", "Nom"],
  ["prenom", "Prénom"],
  ["naissance", "Date de naissance"],
  ["sexe", "Sexe"],
  ["telephone", "Téléphone"],
  ["email", "E-mail"],
  ["ville", "Ville"],
  ["filiere", "Filière"],
  ["niveau", "Niveau"],
  ["motivation", "Motivation"],
  ["projet", "Projet après les études"],
  ["created_at", "Envoyée le"],
];
const ATTENDUES = 50;
const $ = (id) => document.getElementById(id);
let etudiants = [];
let affiches = []; // liste actuellement affichée (résultat de la recherche)

/* ---------- Connexion ---------- */
async function connexion(email, mdp) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password: mdp }),
  });
  if (!r.ok) throw new Error("IDENTIFIANTS");
  return (await r.json()).access_token;
}

function deconnecter() {
  sessionStorage.removeItem("jeton");
  etudiants = [];
  $("tableau").hidden = true;
  $("connexion").hidden = false;
}

$("form-connexion").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("a-erreur");
  err.hidden = true;
  try {
    const jeton = await connexion($("a-email").value.trim(), $("a-mdp").value);
    sessionStorage.setItem("jeton", jeton);
    $("a-mdp").value = "";
    await afficher();
  } catch (x) {
    err.textContent =
      x.message === "IDENTIFIANTS"
        ? "E-mail ou mot de passe incorrect."
        : "Impossible de charger les fiches. Réessayez.";
    err.hidden = false;
  }
});
$("deconnexion").addEventListener("click", deconnecter);

/* ---------- Chargement ---------- */
async function charger() {
  const jeton = sessionStorage.getItem("jeton");
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/etudiants?select=*&order=created_at.desc`,
    {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${jeton}` },
    },
  );
  if (r.status === 401) {
    deconnecter();
    throw new Error("SESSION");
  }
  if (!r.ok) throw new Error("CHARGEMENT");
  return r.json();
}

async function afficher() {
  etudiants = await charger();
  $("connexion").hidden = true;
  $("tableau").hidden = false;
  const n = etudiants.length;
  $("nb-recues").textContent = n;
  $("nb-attendues").textContent = ATTENDUES;
  $("nb-manquantes").textContent = Math.max(ATTENDUES - n, 0);
  $("barre-prog").style.width = Math.min((n / ATTENDUES) * 100, 100) + "%";
  filtrer();
}

/* ---------- Liste et recherche (textContent : aucune injection HTML) ---------- */
const dateFr = (iso) =>
  new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });

function filtrer() {
  const q = $("recherche").value.trim().toLowerCase();
  const liste = $("liste");
  liste.replaceChildren();
  const trouves = etudiants.filter(
    (e) =>
      !q ||
      Object.values(e).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
  );
  affiches = trouves;
  trouves.forEach((e) => {
    const tr = document.createElement("tr");
    tr.tabIndex = 0;
    [e.nom, e.prenom, e.filiere, e.niveau, dateFr(e.created_at)].forEach(
      (v) => {
        const td = document.createElement("td");
        td.textContent = v;
        tr.appendChild(td);
      },
    );
    tr.addEventListener("click", () => detail(e));
    tr.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") detail(e);
    });
    liste.appendChild(tr);
  });
  $("vide").hidden = trouves.length > 0;
}
$("recherche").addEventListener("input", filtrer);

/* ---------- Détail d'une fiche ---------- */
let ficheOuverte = null;
function detail(e) {
  ficheOuverte = e;
  $("d-erreur").hidden = true;
  $("d-titre").textContent = `${e.prenom} ${e.nom}`;
  const dl = $("d-contenu");
  dl.replaceChildren();
  CHAMPS.slice(2).forEach(([cle, titre]) => {
    const dt = document.createElement("dt");
    dt.textContent = titre;
    const dd = document.createElement("dd");
    dd.textContent = cle === "created_at" ? dateFr(e[cle]) : e[cle] || "—";
    dl.append(dt, dd);
  });
  $("detail").showModal();
}
$("d-fermer").addEventListener("click", () => $("detail").close());

/* ---------- Export CSV (ouvrable dans Excel) ---------- */
function celluleCsv(v) {
  let t = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; // neutralise les formules Excel
  return '"' + t.replace(/"/g, '""') + '"';
}
$("export").addEventListener("click", () => {
  const lignes = [CHAMPS.map((c) => celluleCsv(c[1])).join(";")];
  affiches.forEach((e) =>
    lignes.push(CHAMPS.map(([k]) => celluleCsv(e[k])).join(";")),
  );
  const blob = new Blob(["\ufeff" + lignes.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "etudiants.csv";
  a.click();
  URL.revokeObjectURL(a.href);
});

/* ---------- Reprise de session ---------- */
if (sessionStorage.getItem("jeton")) afficher().catch(() => {});

/* ---------- Export Excel (.xlsx) ---------- */
const naissanceFr = (d) => (d ? d.split("-").reverse().join("/") : "");
function valeurExport(e, k) {
  if (k === "created_at") return dateFr(e[k]);
  if (k === "naissance") return naissanceFr(e[k]);
  return e[k] ?? "";
}
function nomFichier(ext) {
  return `etudiants_${new Date().toISOString().slice(0, 10)}.${ext}`;
}

$("export-xlsx").addEventListener("click", () => {
  if (!affiches.length) return alert("Aucune fiche à exporter.");
  const lignes = affiches.map((e) =>
    Object.fromEntries(CHAMPS.map(([k, t]) => [t, valeurExport(e, k)])),
  );
  const feuille = XLSX.utils.json_to_sheet(lignes);
  feuille["!cols"] = CHAMPS.map(([k]) => ({
    wch: k === "motivation" || k === "projet" ? 50 : 18,
  }));
  const classeur = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(classeur, feuille, "Étudiants");
  XLSX.writeFile(classeur, nomFichier("xlsx"));
});

/* ---------- Export PDF (tableau récapitulatif) ---------- */
$("export-pdf").addEventListener("click", () => {
  if (!affiches.length) return alert("Aucune fiche à exporter.");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const colonnes = [
    "nom",
    "prenom",
    "naissance",
    "sexe",
    "telephone",
    "email",
    "ville",
    "filiere",
    "niveau",
  ];
  const titres = colonnes.map((k) => CHAMPS.find((c) => c[0] === k)[1]);
  doc.setFontSize(14);
  doc.text(`Fiches étudiants (${affiches.length})`, 14, 14);
  doc.setFontSize(9);
  doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")}`, 14, 19);
  doc.autoTable({
    startY: 23,
    head: [titres],
    body: affiches.map((e) => colonnes.map((k) => valeurExport(e, k))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [36, 71, 184] },
  });
  doc.save(nomFichier("pdf"));
});

/* ---------- Suppression d'une fiche ---------- */
$("d-supprimer").addEventListener("click", async () => {
  const e = ficheOuverte;
  if (!e) return;
  if (
    !confirm(
      `Supprimer définitivement la fiche de ${e.prenom} ${e.nom} ?\nCette action est irréversible.`,
    )
  )
    return;
  const bouton = $("d-supprimer");
  bouton.disabled = true;
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/etudiants?id=eq.${encodeURIComponent(e.id)}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${sessionStorage.getItem("jeton")}`,
          Prefer: "return=representation",
        },
      },
    );
    if (r.status === 401) {
      $("detail").close();
      deconnecter();
      return;
    }
    const supprimees = r.ok ? await r.json() : [];
    if (!supprimees.length) throw new Error("REFUSE");
    $("detail").close();
    await afficher();
  } catch (x) {
    $("d-erreur").textContent =
      "Suppression impossible. Vérifiez que supabase-delete.sql a bien été exécuté.";
    $("d-erreur").hidden = false;
  } finally {
    bouton.disabled = false;
  }
});
