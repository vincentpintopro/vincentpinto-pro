import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // Fichiers plats (pas de dossier par article), pour garder les slugs
  // et donc les URL /blog/slug/ strictement identiques.
  loader: glob({ pattern: '**/*.md', base: "./src/content/blog" }),
  schema: z.object({
    // Champs tels qu'ils existent déjà dans mes fichiers .md, inchangés.
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }).transform((data) => ({
    ...data,
    // Le thème lit partout `post.data.date` (tri, affichage, RSS...).
    // On dérive `date` de `pubDate` ici, une seule fois, plutôt que de
    // renommer `pubDate` dans mes fichiers ou de modifier tous les
    // composants du thème un par un.
    date: data.pubDate,
  })),
});

export const collections = { blog };
