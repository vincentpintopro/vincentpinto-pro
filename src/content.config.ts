import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// "glob" scanne un dossier et charge chaque fichier .md comme une entrée.
	loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		draft: z.boolean().default(false),
		// Pas encore utilisé : servira plus tard à mettre certains articles
		// en avant sur l'accueil une fois qu'il y aura assez de volume.
		featured: z.boolean().default(false),
	}),
});

export const collections = { blog };
