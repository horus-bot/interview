const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if(file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let count = 0;
files.forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  // Simple sweeping regex for className
  let newText = text.replace(/className=(?:"[^"]*"|'[^']*'|`[^`]*`|\{.*?\})/gs, '');
  newText = newText.replace(/className=\{cn\([^)]*\)\}/gs, ''); 

  // remove some obvious nextjs/tailwind imports
  newText = newText.replace(/import \{ cn \} from .*;/g, '');

  if(text !== newText) {
    fs.writeFileSync(f, newText);
    count++;
  }
});
console.log('Cleaned:', count);