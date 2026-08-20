module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  // App Links Android (vérification "ce domaine appartient à l'app Evolve
  // Poker") — Eleventy ne copie pas les dossiers commençant par un point par
  // défaut, passthrough explicite requis pour que ce fichier atterrisse
  // bien dans _site/.well-known/ (donc en ligne, à la racine du domaine).
  eleventyConfig.addPassthroughCopy(".well-known");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
