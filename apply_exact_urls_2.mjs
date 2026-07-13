import fs from 'fs';

const exactUrls = {
  'boosted-bowl.png': 'v1783746340/gearheadz/products/boosted-bowl.png',
  'boosted-bowl-text.png': 'v1783746339/gearheadz/products/boosted-bowl-text.png',
  'honda-civic.png': 'v1783491448/gearheadz/products/honda-civic.png',
  'jdm-legends.png': 'v1783746349/gearheadz/products/jdm-legends.png',
  'jdm-legends-text.png': 'v1783746348/gearheadz/products/jdm-legends-text.png',
  'Need-speed.png': 'v1783491447/gearheadz/products/Need-speed.png',
  'turbo-girl.png': 'v1783491446/gearheadz/products/turbo-girl.png',
  'turbi-hat-black.png': 'v1782448985/gearheadz/products/turbi-hat-black.jpg'
};

let content = fs.readFileSync('js/products.js', 'utf8');

for (const [filename, newPath] of Object.entries(exactUrls)) {
  const regex = new RegExp(`v[0-9]+/gearheadz/products/${filename.replace('.', '\\.')}`, 'g');
  content = content.replace(regex, newPath);
}

fs.writeFileSync('js/products.js', content);
console.log('products.js updated with exact correct image URLs.');
