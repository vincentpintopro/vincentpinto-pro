Publication d'un article en réserve : $ARGUMENTS

Le fichier concerné est src/content/blog/$ARGUMENTS.md

1. Récupère la date du jour et confirme que tu es sur la branche main, à jour.
2. Dans le frontmatter du fichier, passe `draft` de `true` à `false` et mets `pubDate` à la date du jour au format YYYY-MM-DD.
3. Vérifie rapidement le contenu : apostrophes typographiques (') partout, aucun tiret long.
4. Lance le build et vérifie que :
   - le build passe sans erreur,
   - l'article apparaît en tête de l'accueil,
   - l'article apparaît en tête de /blog,
   - sa page individuelle s'affiche correctement.
5. Si tout est bon, commit et push sur main avec un message clair (ex: "Publish: <titre de l'article>").
6. Donne-moi un résumé court : date de pubDate utilisée, statut des vérifications, hash du commit.

Ne touche à aucun autre fichier que celui-ci. Si un point échoue (build cassé, apostrophe droite trouvée, tiret long trouvé), arrête-toi et préviens-moi avant de committer, ne corrige pas tout seul sans me le dire.
