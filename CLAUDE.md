## Style

Pas de tirets longs (—) dans les textes affichés sur le site : c'est perçu comme un marqueur d'IA en français. Utiliser un point, une virgule, ou un « | » entouré d'espaces selon le contexte.

Quand un lien `<a>` est précédé d'une espace dans une phrase, ne jamais laisser cette espace dépendre d'un retour à la ligne dans le code (Astro la rogne à la compilation). Utiliser `{' '}` explicite avant le `<a>`, ou garder le lien sur la même ligne que le mot qui précède.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
