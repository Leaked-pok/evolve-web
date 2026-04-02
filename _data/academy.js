const fs   = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const result = [];
  let inQuote = false;
  let current = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && !inQuote) {
      inQuote = true;
    } else if (ch === '"' && inQuote) {
      if (line[i + 1] === '"') { current += '"'; i++; }
      else { inQuote = false; }
    } else if (ch === ',' && !inQuote) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(filePath) {
  const raw     = fs.readFileSync(filePath, 'utf8').replace(/\r/g, '');
  const lines   = raw.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj  = {};
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || '').trim(); });
    return obj;
  });
}

module.exports = function () {
  const modules = parseCSV(path.join(__dirname, 'modules.csv'));
  const lessons = parseCSV(path.join(__dirname, 'lessons.csv'));

  // Index lessons by module_id
  const byModule = {};
  lessons.forEach(l => {
    const mid = l.module_id;
    if (!byModule[mid]) byModule[mid] = [];
    byModule[mid].push({
      num:      parseInt(l.num),
      title:    l.title,
      subtitle: l.subtitle,
      image:    l.image
    });
  });

  // Group modules by category (preserve CSV order)
  const catMap   = {};
  const catOrder = [];
  modules.forEach(m => {
    const cat = m.category.trim();
    if (!catMap[cat]) {
      const id = cat
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      catMap[cat] = { name: cat, id, modules: [] };
      catOrder.push(cat);
    }
    catMap[cat].modules.push({
      module_id:     parseInt(m.module_id),
      title:         m.title,
      level:         m.level,
      description:   m.description,
      image:         m.image,
      lessons_count: parseInt(m.lessons_count),
      lessons:       byModule[m.module_id] || []
    });
  });

  return catOrder.map(cat => catMap[cat]);
};
