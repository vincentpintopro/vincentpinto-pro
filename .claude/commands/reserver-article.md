Nouvel article à mettre EN RÉSERVE (draft) : $ARGUMENTS

Le fichier à créer est src/content/blog/$ARGUMENTS.md

Le contenu markdown complet de l'article (frontmatter inclus) va être collé juste après cette commande, à la suite de $ARGUMENTS.

1. Crée le fichier avec le contenu fourni, en t'assurant que `draft: true` dans le frontmatter.
2. Ne touche PAS à `pubDate` : laisse la valeur telle que fournie (ou une date par défaut si aucune n'est donnée), elle sera mise à jour au moment de la publication, pas maintenant.
3. Vérifie rapidement le contenu : apostrophes typographiques (') partout, aucun tiret long.
4. Lance le build et vérifie que :
   - le build passe sans erreur,
   - l'article n'apparaît PAS sur l'accueil (parce qu'il est en draft),
   - l'article n'apparaît PAS sur /blog (parce qu'il est en draft).
5. Si tout est bon, commit et push sur main avec un message clair (ex: "Draft: <titre de l'article>").
6. Donne-moi un résumé court : nom du fichier créé, statut des vérifications, hash du commit, et le nombre total d'articles actuellement en réserve.

Ne touche à aucun autre fichier que celui-ci. Si un point échoue (build cassé, article visible alors qu'il devrait être en draft, apostrophe droite trouvée, tiret long trouvé), arrête-toi et préviens-moi avant de committer.
