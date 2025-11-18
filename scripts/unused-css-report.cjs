const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cssPath = path.join(root, 'app', 'globals.css');

function readFile(p){
  try { return fs.readFileSync(p,'utf8'); } catch(e){ return null; }
}

const css = readFile(cssPath);
if(!css){
  console.error('Could not read', cssPath);
  process.exit(2);
}

// Extract class and id selectors
const classRegex = /\.[A-Za-z0-9_-]+/g;
const idRegex = /#[A-Za-z0-9_-]+/g;
const classes = new Set();
const ids = new Set();
let m;
while((m = classRegex.exec(css))){ classes.add(m[0].slice(1)); }
while((m = idRegex.exec(css))){ ids.add(m[0].slice(1)); }

const selectors = Array.from(classes).map(c=>({type:'class', name:c})).concat(
  Array.from(ids).map(i=>({type:'id', name:i}))
);

// Walk files
const exts = ['.js','.jsx','.ts','.tsx','.html','.md','.json','.py'];
function walk(dir){
  const res = [];
  const entries = fs.readdirSync(dir,{withFileTypes:true});
  for(const e of entries){
    const p = path.join(dir,e.name);
    if(e.isDirectory()){
      if(['node_modules','.git','build','dist','out','.next','public','coverage'].includes(e.name)) continue;
      res.push(...walk(p));
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if(exts.includes(ext)) res.push(p);
    }
  }
  return res;
}

const files = walk(root).filter(f=> path.resolve(f) !== path.resolve(cssPath));
console.error('Scanning', files.length, 'files');

function matchInFile(filePath, selector){
  const content = readFile(filePath);
  if(content === null) return false;
  // create safe regex for word-boundary-ish matches
  const name = selector.name.replace(/[-\\^$*+?.()|[\]{}]/g,'\\$&');
  // match in strings or className/class attributes or plain word
  const re = new RegExp('(^|[^A-Za-z0-9_-])' + name + '($|[^A-Za-z0-9_-])','g');
  return re.test(content);
}

const report = [];
for(const s of selectors){
  const foundIn = [];
  for(const f of files){
    if(matchInFile(f,s)) foundIn.push(path.relative(root,f));
  }
  report.push({selector: (s.type==='class'?'.':'#')+s.name, type:s.type, count: foundIn.length, files: foundIn});
}

// Write report
const outJson = path.join(root,'scripts','unused-css-report.json');
fs.writeFileSync(outJson, JSON.stringify(report,null,2));
// Also write a CSV for quick scan
const csv = ['selector,type,count,files'];
for(const r of report){ csv.push([r.selector,r.type,r.count, '"'+r.files.join(';')+'"'].join(',')); }
fs.writeFileSync(path.join(root,'scripts','unused-css-report.csv'), csv.join('\n'));
console.log('Wrote', outJson, 'and CSV');
