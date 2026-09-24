import { GROUPES_SYNONYMES } from "@data/synonymes";

const ATTRS = `(?:"[^"]*"|'[^']*'|[^'">])*`;

function normaliser(s: string): string {
  const mots = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return ` ${mots} `;
}

// Retire les éléments marqués data-pagefind-ignore : on ne cherche des
// synonymes que dans ce que Pagefind indexe réellement.
function retirerBlocsIgnores(html: string): string {
  let out = html;
  for (;;) {
    const i = out.indexOf("data-pagefind-ignore");
    if (i === -1) return out;
    const debut = out.lastIndexOf("<", i);
    const ouvrante = new RegExp(`<([a-zA-Z][\\w-]*)${ATTRS}>`, "y");
    ouvrante.lastIndex = debut;
    const m = ouvrante.exec(out);
    if (!m) return out.replace("data-pagefind-ignore", "");
    const nom = m[1];
    const balise = new RegExp(`<(/?)${nom}\\b${ATTRS}>`, "gi");
    balise.lastIndex = ouvrante.lastIndex;
    let profondeur = m[0].endsWith("/>") ? 0 : 1;
    let fin = ouvrante.lastIndex;
    while (profondeur > 0) {
      const t = balise.exec(out);
      if (!t) {
        fin = out.length;
        break;
      }
      if (t[1] === "/") profondeur--;
      else if (!t[0].endsWith("/>")) profondeur++;
      fin = balise.lastIndex;
    }
    out = out.slice(0, debut) + " " + out.slice(fin);
  }
}

const ENTITES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&nbsp;": " ",
};

export function texteIndexable(html: string): string {
  return retirerBlocsIgnores(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " "))
    .replace(new RegExp(`</?[a-zA-Z][^\\s>/]*${ATTRS}>`, "g"), " ")
    .replace(/&(?:amp|lt|gt|quot|nbsp|#39|#x27);/g, (e) => ENTITES[e]);
}

// Pour chaque groupe dont au moins un terme figure dans le texte, renvoie
// les autres termes du groupe (ceux qui n'y figurent pas déjà).
export function synonymesPour(texte: string): string[] {
  const t = normaliser(texte);
  const present = (terme: string) => {
    const n = normaliser(terme).trim();
    const variante = n.endsWith("s") ? n.slice(0, -1) : `${n}s`;
    return t.includes(` ${n} `) || t.includes(` ${variante} `);
  };
  const ajouts = new Set<string>();
  for (const groupe of GROUPES_SYNONYMES) {
    if (!groupe.some(present)) continue;
    for (const terme of groupe) if (!present(terme)) ajouts.add(terme);
  }
  return [...ajouts];
}
