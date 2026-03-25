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
    } else if(file.endsWith('.tsx') && !file.includes('ui')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/app');
let count = 0;
files.forEach(f => {
  // skip already processed or specific files where it breaks behavior
  if (f.includes('layout.tsx') || f.includes('page.tsx') && path.dirname(f) === 'src\\app') return;
  if (f.includes('interview\\page.tsx')) return;
  if (f.includes('analysis\\page.tsx')) return;

  let text = fs.readFileSync(f, 'utf8');
  let newText = text;
  
  // replace className="anything"
  newText = newText.replace(/className="[^"]*"/g, '');
  newText = newText.replace(/className=`[^`]*`/g, '');
  
  // We won't strip className={...} blindly because it breaks cn() expressions with parens if done poorly

  if(text !== newText) {
    fs.writeFileSync(f, newText);
    count++;
  }
});

files.forEach(f => {
  if (f.includes('layout.tsx') || f.includes('page.tsx') && path.dirname(f) === 'src\\app') return;
  if (f.includes('interview\\page.tsx')) return;
  if (f.includes('analysis\\page.tsx')) return;

  let text = fs.readFileSync(f, 'utf8');
  if (text.includes('className=')) {
     console.log('Still has className:', f);
  }
});

console.log('App Files Cleaned:', count);