// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	// TODO: remplacer par ton vrai nom de domaine avant la mise en ligne.
	// Astro s'en sert pour générer les URLs absolues (sitemap, canonical, OG tags).
	site: 'https://vincentpinto.pro',

	// Convention canonique du site : toujours un slash final (ex: /blog/).
	// Cloudflare Pages sert les pages en dossier + index.html (page/index.html),
	// et redirige nativement en 308 de /page vers /page/ pour ce format : cette
	// convention s'aligne dessus au lieu de la combattre, sans code additionnel.
	trailingSlash: 'always',

	i18n: {
		defaultLocale: 'fr',
		locales: ['fr', 'en'],
		routing: {
			// Le français reste à la racine ("/"), pas de "/fr/".
			// L'anglais sera servi sous "/en/" une fois qu'il y aura du contenu.
			prefixDefaultLocale: false,
		},
	},

	integrations: [sitemap(), mdx(), pagefind()],

	vite: {
		plugins: [tailwindcss()],
	},

	markdown: {
		shikiConfig: {
			theme: 'css-variables',
		},
	},
});
