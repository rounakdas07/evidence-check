import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sumMetric,aggregate,priority,selectTrusts,csvCell,csvExport,accountBrief} from '../core.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/accounts.json',import.meta.url)));
const months=data.meta.periods;
const original=data.trusts.find(t=>t.code==='RJE');

test('rates use weighted activity, not the mean monthly percentage',()=>{
 const t={months:{a:{fds:{total:10,within:2,after:8}},b:{fds:{total:90,within:81,after:9}}}};
 const r=sumMetric(t,['a','b'],'fds');assert.equal(r.performance,.83);assert.equal(r.after,17);
});
test('missing rows remain missing and disqualify an otherwise eligible account',()=>{
 const t=structuredClone(original);delete t.months[months[0]].fds;
 const a=aggregate(t,months);assert.equal(a.fds.observed,5);assert.equal(a.fds.complete,false);assert.equal(priority(a),false);
 const missing={...t,months:{}};const b=aggregate(missing,months);
 assert.equal(b.fds.performance,null);assert.match(accountBrief(data,b,months),/No FDS rows reported/);assert.match(accountBrief(data,b,months),/No lymphoma first-treatment rows reported/);
 assert.doesNotMatch(accountBrief(data,b,months),/0 of 0 completed/);
 const csv=csvExport(data,[b],months);assert.match(csv,/"RJE"/);assert.match(csv,/"","","","0","0","","0"/);
});
test('known Spotlight relationships never enter priority but can be viewed in all trusts',()=>{
 const known=new Set(['RHM','R0A','RTD','RR8']);
 assert.ok(selectTrusts(data,{hideKnown:false}).every(t=>!known.has(t.code)));
 const all=selectTrusts(data,{mode:'all',hideKnown:false});for(const code of known)assert.ok(all.some(t=>t.code===code),code);
 assert.ok(selectTrusts(data,{mode:'all'}).every(t=>!known.has(t.code)));
});
test('default shortlist and featured account reconcile with source rows',()=>{
 const rows=selectTrusts(data);assert.equal(rows.length,34);assert.equal(rows[0].code,'RJE');
 const t=rows[0];assert.equal(t.fds.total,202);assert.equal(t.fds.after,83);assert.equal(t.lymphoma.total,89);assert.equal(t.below,6);
 assert.ok(Math.abs(t.fds.performance-119/202)<1e-12);
});
test('period, region, search and digital-evidence filters remain distinct',()=>{
 const short=selectTrusts(data,{period:'three'});assert.ok(short.length>0);assert.ok(short.every(t=>t.fds.expected===3&&t.lymphoma.total>=25&&t.below>=2));
 const west=selectTrusts(data,{region:original.region});assert.ok(west.length>0);assert.ok(west.every(t=>t.region===original.region));
 assert.deepEqual(selectTrusts(data,{query:'RJE'}).map(t=>t.code),['RJE']);
 assert.ok(selectTrusts(data,{digital:true}).every(t=>['operational','network'].includes(t.readiness.status)));
 const delayed=selectTrusts(data,{sort:'delay'});assert.ok(delayed.every((t,i)=>!i||delayed[i-1].fds.after>=t.fds.after));
});
test('all selected metric rows reconcile to published national totals',()=>{
 for(const month of months)for(const kind of ['fds','lymphoma','treatment62'])for(const key of ['total','within','after']){
  const providerTotal=data.trusts.reduce((s,t)=>s+(t.months[month]?.[kind]?.[key]||0),0);
  assert.ok(Math.abs(providerTotal-data.national[month][kind][key])<1e-7,`${month} ${kind} ${key}: ${providerTotal} versus ${data.national[month][kind][key]}`);
 }
});
test('exports include original source releases, period and qualification notes',()=>{
 const t=aggregate(original,months),csv=csvExport(data,[t],months),brief=accountBrief(data,t,months);
 for(const source of data.meta.sources){assert.ok(csv.includes(source.url));assert.ok(brief.includes(source.url));}
 assert.ok(csv.includes('2026-04'));assert.ok(csv.includes('2026-09'));assert.ok(csv.includes(t.nextQuestion));assert.ok(brief.includes('separate 31-day treatment dataset'));
 assert.equal(csvCell('=HYPERLINK("bad")'),'"\'=HYPERLINK(""bad"")"');
 assert.equal(csvCell('  +SUM(A1)'),'"\'  +SUM(A1)"');
 assert.equal(csvCell('comma,quote"'),'"comma,quote"""');
});
