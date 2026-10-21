// Junta las propiedades (una por archivo en data/propiedades/) en data/propiedades.json
// y genera sitemap.xml. Netlify lo ejecuta solo en cada cambio.
const fs = require('fs');
const dir = 'data/propiedades';
const props = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => {
  try { return JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')); }
  catch (e) { console.error('Archivo con error, se omite:', f); return null; }
}).filter(Boolean);
const vistos = {};
props.forEach(p => { if (vistos[p.codigo]) console.warn('Código repetido:', p.codigo); vistos[p.codigo] = 1; });
fs.writeFileSync('data/propiedades.json', JSON.stringify({ propiedades: props }, null, 2));
const hoy = new Date().toISOString().slice(0, 10);
fs.writeFileSync('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://propiedadesnava.cl/</loc><lastmod>' + hoy + '</lastmod></url>\n</urlset>\n');
console.log('Propiedades publicadas:', props.length);
