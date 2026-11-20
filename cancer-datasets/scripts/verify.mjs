import fs from 'node:fs';
import assert from 'node:assert/strict';
import {safeURL,filterRecords} from '../core.js';
const root = new URL('../', import.meta.url);
const data = JSON.parse(fs.readFileSync(new URL('data.json',root),'utf8'));
assert.equal(data.version,1);assert.match(data.checked,/^\d{4}-\d{2}-\d{2}$/);
const ids=new Set(), sourceLog=fs.readFileSync(new URL('SOURCES.md',root),'utf8');
for(const r of data.records){
 assert.match(r.id,/^[a-z0-9-]+$/);assert.ok(!ids.has(r.id));ids.add(r.id);
 for(const field of ['name','subtitle','summary','usefulFor','caveat','accessDetail','sourceNote'])assert.ok(typeof r[field]==='string'&&r[field].trim(),`${r.id}: ${field}`);
 for(const field of ['cancers','modalities','therapies','outcomes','tags'])assert.ok(Array.isArray(r[field])&&r[field].every(x=>typeof x==='string'),`${r.id}: ${field}`);
 assert.ok(['Patients','Cell lines','Mixed'].includes(r.model));assert.ok(['Open','Mixed','Controlled'].includes(r.access));assert.ok(['cohort','collection','screen'].includes(r.kind));
 assert.ok(r.sources.length);assert.ok(r.sources.every(s=>safeURL(s.url)&&s.label&&sourceLog.includes(s.url)));
 assert.ok(sourceLog.includes('`'+r.id+'`'));
 if(r.model==='Cell lines')assert.ok(!r.outcomes.some(x=>['Treatment response','Survival'].includes(x)));
 if(r.tags.includes('combination-screen'))assert.equal(r.model,'Cell lines');
 if(r.year!==null)assert.ok(Number.isInteger(r.year)&&r.year>=2000&&r.year<=2026);
}
for(const file of ['index.html','style.css','app.js','core.js','icon.svg','README.md','LICENSE'])assert.ok(fs.existsSync(new URL(file,root)),file);
console.log(JSON.stringify({resources:ids.size,clinicalPreset:filterRecords(data.records,{preset:'clinical'}).length,combinationPreset:filterRecords(data.records,{preset:'combinations'}).length,sourceLinks:data.records.reduce((sum,r)=>sum+r.sources.length,0),status:'passed'}));
