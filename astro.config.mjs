// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	// TODO: remplacer par ton vrai nom de domaine avant la mise en ligne.
	// Astro s'en sert pour générer les URLs absolues (sitemap, canonical, OG tags).
	site: 'https://vincentpinto.pro',

	i18n: {
		defaultLocale: 'fr',
		locales: ['fr', 'en'],
		routing: {
			// Le français reste à la racine ("/"), pas de "/fr/".
			// L'anglais sera servi sous "/en/" une fois qu'il y aura du contenu.
			prefixDefaultLocale: false,
		},
	},

	integrations: [sitemap()],
});
