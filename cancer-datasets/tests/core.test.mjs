import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {filterRecords,sortRecords,stateFromURL,searchURL,parseSaved,makeCSV,csvCell,safeURL,escapeHTML} from '../core.js';
const {records} = JSON.parse(fs.readFileSync(new URL('../data.json',import.meta.url),'utf8'));
const ids = list => list.map(r=>r.id).sort();

test('combination preset includes aggregated DrugComb but excludes single-agent screens and patient cohorts',()=>{
  assert.deepEqual(ids(filterRecords(records,{preset:'combinations'})),['drugcomb','nci-almanac']);
  assert.equal(filterRecords(records,{preset:'combinations',model:'Patients'}).length,0);
});
test('patient outcome preset includes the combination cohort and excludes laboratory viability',()=>{
  const result=filterRecords(records,{preset:'clinical'});
  assert.ok(result.some(r=>r.id==='gide-melanoma'));
  assert.ok(result.every(r=>r.model==='Patients'&&!r.outcomes.includes('Cell viability')));
  assert.ok(!result.some(r=>r.id==='tcga'));
});
test('combined filters respect cancer, modality, outcome and access simultaneously',()=>{
  assert.deepEqual(ids(filterRecords(records,{cancer:'Melanoma',modality:'Single-cell',outcome:'Treatment response',access:'Mixed'})),['sade-feldman']);
  assert.deepEqual(ids(filterRecords(records,{q:'nivolumab',cancer:'Melanoma',model:'Patients',access:'Open'})),['riaz-nivolumab']);
});
test('cancer filter retains broad collections and excludes unrelated single-cancer cohorts',()=>{
  const result=filterRecords(records,{cancer:'Colorectal'});
  assert.ok(result.some(r=>r.id==='tcga'));
  assert.ok(result.some(r=>r.id==='lee-colorectal'));
  assert.ok(!result.some(r=>r.id==='gide-melanoma'));
});
test('search handles accessions, punctuation and multiple required words',()=>{
  assert.deepEqual(ids(filterRecords(records,{q:'GSE91061'})),['riaz-nivolumab']);
  assert.ok(filterRecords(records,{q:'anti-PD-1 melanoma'}).some(r=>r.id==='gide-melanoma'));
  assert.ok(filterRecords(records,{q:'single cell'}).some(r=>r.id==='tisch2'));
  assert.equal(filterRecords(records,{q:'nivolumab definitelymissing'}).length,0);
});
test('shared URLs round-trip search state and never include private notes',()=>{
  const state={q:'anti-PD-1 melanoma',cancer:'Melanoma',preset:'clinical',sort:'year',notes:'private'};
  const url=searchURL('https://example.org/cancer-datasets/?old=1#anything',state);
  const restored=stateFromURL(url,records);
  assert.equal(restored.q,state.q);assert.equal(restored.cancer,state.cancer);assert.equal(restored.preset,state.preset);
  assert.ok(!url.includes('private'));assert.ok(!url.includes('old='));
  assert.equal(stateFromURL('https://example.org/?cancer=made-up&preset=bogus',records).cancer,'');
});
test('saved data tolerates corruption and ignores stale IDs',()=>{
  assert.equal(parseSaved('{broken',records).saved.size,0);
  const parsed=parseSaved(JSON.stringify({saved:['tcga','tcga','unknown'],notes:{tcga:'Check terms',unknown:'gone'}}),records);
  assert.deepEqual([...parsed.saved],['tcga']);assert.equal(parsed.notes.tcga,'Check terms');assert.equal(parsed.notes.unknown,undefined);
});
test('CSV escapes quotes, preserves multiline notes and prevents spreadsheet formula interpretation',()=>{
  const csv=makeCSV(records.slice(0,1),{[records[0].id]:'=HYPERLINK("evil")\nline two'},'2026-11-20');
  assert.ok(csv.startsWith('\uFEFF"Resource"'));
  assert.ok(csv.includes('"\'=HYPERLINK(""evil"")\nline two"'));
  assert.equal(csvCell(' +1+1'),'"\' +1+1"');
  assert.ok(csv.includes(records[0].sources[0].url));
});
test('source URLs and displayed strings cannot inject executable HTML',()=>{
  assert.equal(safeURL('javascript:alert(1)'),'');assert.equal(safeURL('http://example.org'),'');
  assert.equal(escapeHTML('<img src=x onerror="x">'),'&lt;img src=x onerror=&quot;x&quot;&gt;');
});
test('publication sort puts undated collections after dated records without mutating source order',()=>{
  const first=records[0].id;
  const result=sortRecords(records,'year');
  assert.equal(result[0].year,Math.max(...records.map(r=>r.year||0)));
  assert.equal(result.at(-1).year,null);assert.equal(records[0].id,first);
});
