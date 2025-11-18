const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname,'..');
const reportPath = path.join(root,'scripts','unused-css-report.json');
const cssPath = path.join(root,'app','globals.css');
const outPath = path.join(root,'scripts','unused-css-blocks.txt');

const report = JSON.parse(fs.readFileSync(reportPath,'utf8'));
const unused = report.filter(r=>r.count===0).map(r=>r.selector);

// filter out hex color ids like #fff, #ffffff, #ff0000, with optional alpha
const hexId = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const filtered = unused.filter(s => !(s.startsWith('#') && hexId.test(s)));

const css = fs.readFileSync(cssPath,'utf8');
const lines = css.split(/\r?\n/);

const results = [];
for(const sel of filtered){
  // remove leading dot/# for search but match literal
  const raw = sel.replace(/([.*+?^${}()|[\]\\])/g,'\\$1');
  // find all occurrences
  for(let i=0;i<lines.length;i++){
    if(lines[i].includes(sel) || lines[i].match(new RegExp('(^|\\s|,)' + raw + '($|\\s|,|:|\\.|#)'))){
      // extract block: go up to include selector line and subsequent lines until balanced braces
      let start = i;
      // go back to include multi-line selectors that start earlier (search backwards until a blank line or previous selector end)
      while(start>0 && !lines[start-1].trim().endsWith('}') ) start--;
      let brace = 0;
      let j = start;
      let blockLines = [];
      // If the selector line contains '{', start counting
      for(; j<lines.length; j++){
        blockLines.push(lines[j]);
        for(const ch of lines[j]){ if(ch==='{') brace++; if(ch==='}') brace--; }
        if(brace<=0 && lines[j].includes('}')){ j++; break; }
        // If we hit a blank line and haven't started block, break to avoid huge capture
        if(blockLines.length>200) break;
      }
      results.push({selector: sel, file: cssPath, startLine: start+1, block: blockLines.join('\n')});
      break; // only first occurrence per selector
    }
  }
}

let out = [];
out.push('# Unused CSS blocks extracted from app/globals.css');
out.push('# Count: ' + results.length);
for(const r of results){
  out.push('\n/* Selector: ' + r.selector + '  (line ' + r.startLine + ') */');
  out.push(r.block);
}

fs.writeFileSync(outPath, out.join('\n'));
console.log('Wrote', outPath, 'with', results.length, 'blocks (hex-color IDs filtered out).');
