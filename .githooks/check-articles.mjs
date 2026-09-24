// Garde-fou pre-commit pour les articles du blog.
//
// Activation, une fois par machine (le réglage n'est pas versionné) :
//   git config core.hooksPath .githooks
//
// Usage manuel sur des fichiers du disque (au lieu du staging) :
//   node .githooks/check-articles.mjs src/content/blog/mon-article.md
//
// Sans dépendance : Node seulement.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// =====================================================================
// CONFIGURATION : tout ce qui suit est fait pour être édité.
// Les mots et phrases sont insensibles à la casse et cherchés en mot
// entier, sauf ceux de "termesCasse" (alertes) qui sont sensibles à la casse.
// Dans une phrase, l'apostrophe droite ' et l'apostrophe typographique ’
// sont équivalentes, et les espaces multiples aussi.
// Les blocs de code et les adresses des liens markdown [texte](adresse)
// ne sont jamais analysés.
// =====================================================================

// Seuls les fichiers de ce dossier, avec ces extensions, sont contrôlés.
const DOSSIER_ARTICLES = "src/content/blog/";
const EXTENSIONS = [".md", ".mdx"];

// ---------------------------------------------------------------------
// NIVEAU 1 : BLOQUE le commit
// ---------------------------------------------------------------------

// Caractères interdits (les blocs de code sont ignorés).
const BLOQUANT_CARACTERES = [
  { nom: "tiret long (—)", caractere: "—" }, // U+2014
  { nom: "apostrophe droite (')", caractere: "'" }, // ASCII, pas ’
];

// Mots interdits.
const BLOQUANT_MOTS = ["CheckYeti"];

// Un nombre collé à l'un de ces mots, dans les deux ordres :
// « 3 600 partenaires », « 1 000 signés », « partenaires : 3600 ».
// Ce sont des expressions régulières (sans les ^ $), accents inclus.
const BLOQUANT_MOTS_CHIFFRES = ["partenaires?", "prestataires?", "sign[ée]e?s?"];

// ---------------------------------------------------------------------
// NIVEAU 2 : ALERTE, le commit passe
// ---------------------------------------------------------------------

const ALERTE_CARACTERES = [
  { nom: "tiret demi-cadratin (–)", caractere: "–" }, // U+2013
];

const ALERTE_MOTS = [
  { categorie: "nom de marque", termes: ["Manawa"] },
  {
    categorie: "OTA / marketplace",
    // Sensible à la casse : « Booking » (la marque) mais pas « booking » (le mot courant).
    termesCasse: ["Booking"],
    termes: [
      "GetYourGuide",
      "Viator",
      "Expedia",
      "Airbnb",
      "Civitatis",
      "Tripadvisor",
      "Klook",
      "Musement",
      "Tiqets",
    ],
  },
  {
    // Liste de départ, à élaguer avec le temps.
    categorie: "tournure qui sent l'IA",
    termes: [
      "il ne s'agit pas seulement",
      "ce n'est pas seulement",
      "plongez",
      "plongez-vous",
      "embarquez",
      "découvrez",
      "libérez",
      "exploitez tout le potentiel",
      "dans un monde où",
      "à l'ère de",
      "à l'ère du numérique",
      "véritable",
      "incontournable",
      "atout majeur",
      "n'hésitez pas à",
      "que vous soyez",
      "en conclusion",
      "en somme",
      "pour conclure",
      "en résumé",
      "de nos jours",
      "force est de constater",
      "il convient de",
      "il est important de noter",
      "il est essentiel de",
      "un large éventail",
      "révolutionner",
      "révolutionnaire",
      "sans plus attendre",
    ],
  },
];

// Alerte sur tout emoji (les symboles © ® ™ sont tolérés).
const ALERTE_EMOJI = true;

// =====================================================================
// FIN DE LA CONFIGURATION : le code ci-dessous n'a pas besoin d'être édité.
// =====================================================================

const LETTRES = "\\p{L}\\p{N}";
const NOMBRE = "\\d+(?:[ \\u00a0\\u202f.,]\\d+)*";

function echapper(texte) {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function motifMot(terme, sensibleCasse = false) {
  const corps = terme
    .trim()
    .split(/\s+/)
    .map((mot) => echapper(mot).replace(/['’]/g, "['’]"))
    .join("\\s+");
  return new RegExp(`(?<![${LETTRES}])${corps}(?![${LETTRES}])`, sensibleCasse ? "gu" : "giu");
}

function motifCaractere(caractere) {
  return new RegExp(echapper(caractere), "gu");
}

// Chaque règle : { niveau, nom, regex }.
function construireRegles() {
  const regles = [];
  for (const { nom, caractere } of BLOQUANT_CARACTERES) {
    regles.push({ niveau: "bloquant", nom, regex: motifCaractere(caractere) });
  }
  for (const mot of BLOQUANT_MOTS) {
    regles.push({ niveau: "bloquant", nom: `mot interdit « ${mot} »`, regex: motifMot(mot) });
  }
  const mots = BLOQUANT_MOTS_CHIFFRES.join("|");
  regles.push({
    niveau: "bloquant",
    nom: "nombre collé à partenaires/prestataires/signés",
    regex: new RegExp(`(?<![${LETTRES}])${NOMBRE}\\s*(?:${mots})(?![${LETTRES}])`, "giu"),
  });
  regles.push({
    niveau: "bloquant",
    nom: "nombre collé à partenaires/prestataires/signés",
    regex: new RegExp(`(?<![${LETTRES}])(?:${mots})\\s*[:=(]?\\s*${NOMBRE}(?![${LETTRES}])`, "giu"),
  });

  for (const { nom, caractere } of ALERTE_CARACTERES) {
    regles.push({ niveau: "alerte", nom, regex: motifCaractere(caractere) });
  }
  for (const { categorie, termes = [], termesCasse = [] } of ALERTE_MOTS) {
    for (const terme of termes) {
      regles.push({ niveau: "alerte", nom: categorie, regex: motifMot(terme) });
    }
    for (const terme of termesCasse) {
      regles.push({ niveau: "alerte", nom: categorie, regex: motifMot(terme, true) });
    }
  }
  if (ALERTE_EMOJI) {
    regles.push({
      niveau: "alerte",
      nom: "emoji",
      regex: /(?![©®™])(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*)/gu,
    });
  }
  return regles;
}

// Remplace par des espaces le code en ligne et l'adresse des liens markdown,
// pour garder les colonnes intactes.
function masquer(ligne) {
  return ligne
    .replace(/`[^`]*`/g, (code) => " ".repeat(code.length))
    .replace(/(\]\()([^)\s]*)/g, (_, debut, adresse) => debut + " ".repeat(adresse.length));
}

// Parcourt le texte en ignorant les blocs de code (clôturés et en ligne)
// et les adresses de liens.
function analyser(texte, regles) {
  const trouvailles = [];
  let cloture = null;

  texte.split(/\r?\n/).forEach((brut, index) => {
    const bordure = /^ {0,3}(`{3,}|~{3,})/.exec(brut);
    if (cloture) {
      if (bordure && bordure[1][0] === cloture.car && bordure[1].length >= cloture.long) cloture = null;
      return;
    }
    if (bordure) {
      cloture = { car: bordure[1][0], long: bordure[1].length };
      return;
    }

    const ligne = masquer(brut);
    const sur = [];
    for (const regle of regles) {
      for (const m of ligne.matchAll(regle.regex)) {
        sur.push({ regle, debut: m.index, fin: m.index + m[0].length, trouve: m[0] });
      }
    }

    // Deux règles sur le même passage (« plongez » et « plongez-vous ») :
    // on ne garde que la plus longue, par niveau.
    sur.sort((a, b) => a.debut - b.debut || b.fin - a.fin);
    const dernierFin = { bloquant: -1, alerte: -1 };
    for (const t of sur) {
      const niveau = t.regle.niveau;
      if (t.debut < dernierFin[niveau]) continue;
      dernierFin[niveau] = t.fin;
      trouvailles.push({
        niveau,
        nom: t.regle.nom,
        ligne: index + 1,
        trouve: t.trouve,
        contexte: extrait(ligne, t.debut, t.fin),
      });
    }
  });
  return trouvailles;
}

function extrait(ligne, debut, fin) {
  const avant = ligne.slice(Math.max(0, debut - 25), debut).replace(/\s+/g, " ");
  const apres = ligne.slice(fin, fin + 25).replace(/\s+/g, " ");
  const marge = (debut > 25 ? "…" : "");
  const suite = (fin + 25 < ligne.length ? "…" : "");
  return `${marge}${avant}«${ligne.slice(debut, fin)}»${apres}${suite}`;
}

function fichiersEnStaging() {
  const sortie = execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "-z", "--diff-filter=ACMR"],
    { encoding: "utf8" },
  );
  return sortie
    .split("\0")
    .filter((f) => f.startsWith(DOSSIER_ARTICLES) && EXTENSIONS.some((e) => f.endsWith(e)));
}

function lire(fichier, depuisDisque) {
  if (depuisDisque) return readFileSync(fichier, "utf8");
  return execFileSync("git", ["show", `:${fichier}`], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

const arguments_ = process.argv.slice(2);
const depuisDisque = arguments_.length > 0;
const fichiers = depuisDisque ? arguments_ : fichiersEnStaging();

if (fichiers.length === 0) process.exit(0);

const regles = construireRegles();
const parFichier = [];
for (const fichier of fichiers) {
  const trouvailles = analyser(lire(fichier, depuisDisque), regles);
  if (trouvailles.length > 0) parFichier.push({ fichier, trouvailles });
}

if (parFichier.length === 0) process.exit(0);

function afficher(niveau, titre) {
  const lignes = [];
  for (const { fichier, trouvailles } of parFichier) {
    for (const t of trouvailles.filter((x) => x.niveau === niveau)) {
      lignes.push(`  ${fichier}:${t.ligne}  ${t.nom}  ${t.contexte}`);
    }
  }
  if (lignes.length === 0) return 0;
  console.log(`\n${titre}`);
  console.log(lignes.join("\n"));
  return lignes.length;
}

const nbBloquants = afficher("bloquant", `BLOQUANT (${fichiers.length} article(s) vérifié(s))`);
const nbAlertes = afficher("alerte", "ALERTES (n'empêchent pas le commit)");

console.log("");
if (nbBloquants > 0) {
  console.log(`commit bloqué, corrige les points ci-dessus (${nbBloquants} bloquant(s), ${nbAlertes} alerte(s))`);
  process.exit(1);
}
console.log(`commit autorisé, ${nbAlertes} alerte(s) à relire ci-dessus`);
process.exit(0);
