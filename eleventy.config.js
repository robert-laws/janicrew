import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // Rewrites root-relative href/src/srcset/action in HTML output to include pathPrefix.
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/images": "images", "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "logo/*.{jpg,png}": "logo/files" });
  eleventyConfig.addWatchTarget("src/assets/");

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  // Draft-only marker for facts the owner still has to confirm.
  eleventyConfig.addShortcode(
    "placeholder",
    (label) => `<mark class="placeholder">[PLACEHOLDER: ${label}]</mark>`
  );

  // "Trash - Dust - Polish desk" style joins for task lists.
  eleventyConfig.addFilter("joinTasks", (arr, sep = " · ") =>
    Array.isArray(arr) ? arr.join(sep) : ""
  );

  // Look up a scope area object by its name.
  eleventyConfig.addFilter("areaByName", (coreScope, name) =>
    (coreScope || []).find((a) => a.area === name)
  );

  // Look up an image slot; returns null when unset so templates can show a placeholder.
  eleventyConfig.addFilter("slot", (images, key) => (images && images[key]) || null);

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: process.env.PATH_PREFIX ?? "/janicrew/",
  };
}
