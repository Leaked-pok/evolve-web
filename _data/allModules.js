// Flattened list of all modules with category name — used for Eleventy pagination
const academyData = require('./academy.js');

module.exports = function () {
  const categories = academyData();
  const modules = [];
  categories.forEach(cat => {
    cat.modules.forEach(mod => {
      modules.push({ ...mod, category: cat.name, categoryId: cat.id });
    });
  });
  return modules;
};
