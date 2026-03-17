import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import swup from "@swup/astro";
import mdx from "@astrojs/mdx";
import {
  transformerNotationHighlight,
  transformerNotationDiff,
} from "@shikijs/transformers";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://chaelsoo.me",
  base: "/",
  integrations: [
    swup({
      theme: ["overlay", { direction: "to-top" }],
      cache: true,
      progress: true,
    }),
    preact(),
    sitemap(),
    mdx(),
  ],

  markdown: {
    shikiConfig: {
      theme: "github-dark",
      transformers: [
        transformerNotationHighlight(),
        transformerNotationDiff(),
        {
          name: "inject-language-data",
          pre(node) {
            node.properties["data-language"] = this.options?.lang ?? "text";
          },
        },
      ],
    },
  },

  image: {
    responsiveStyles: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  experimental: {
    svgo: true,
  },
});

//swup theme variations:
// theme: "fade"
// theme: ["overlay", { direction: "to-top"}]
//
// for overlay and fade, further customization can be done in animate.css file
// To know about swup, visit https://swup.js.org/
