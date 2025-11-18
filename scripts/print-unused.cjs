const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname,'..');
const reportPath = path.join(root,'scripts','unused-css-report.json');
const r = JSON.parse(fs.readFileSync(reportPath,'utf8'));
const unused = r.filter(x=>x.count===0).map(x=>x.selector);
console.log('Unused selectors (count='+unused.length+')');
for(const u of unused) console.log(u);
