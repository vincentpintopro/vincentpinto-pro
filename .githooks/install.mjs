// Active le garde-fou pre-commit à l'installation (script "prepare" de package.json).
// Ne doit JAMAIS faire échouer `npm install` : git absent, pas un dépôt git
// (build de l'hébergeur), etc. Toute erreur est ignorée en silence.

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

try {
  const racine = fileURLToPath(new URL("..", import.meta.url));
  const options = { cwd: racine, stdio: "ignore" };
  // --show-cdup est vide seulement si `racine` est la racine d'un dépôt git :
  // on ne touche pas à la config d'un dépôt parent qui n'est pas ce projet.
  const versLaRacine = execFileSync("git", ["rev-parse", "--show-cdup"], {
    cwd: racine,
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
  if (versLaRacine === "") {
    execFileSync("git", ["config", "--local", "core.hooksPath", ".githooks"], options);
  }
} catch {
  // Volontairement ignoré.
}
