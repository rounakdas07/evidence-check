import test from 'node:test';
import assert from 'node:assert/strict';
import {CASES,SOURCES,SOURCE_MAP,LABELS,VERSION} from '../data.mjs';
import {modelInputs,answerKey,parsePredictions,scorePredictions,toCSV,demoPredictions} from '../core.mjs';

test('every case has a unique ID and a traceable primary source',()=>{
  assert.equal(new Set(CASES.map(c=>c.id)).size,18);
  assert.equal(SOURCES.length,6);
  for(const c of CASES){assert.ok(SOURCE_MAP[c.source_id]);assert.ok(LABELS.includes(c.expected));assert.ok(c.reason);}
  for(const s of SOURCES){assert.match(s.pmid,/^\d+$/);assert.match(s.doi,/^10\./);assert.ok(s.locator);}
});
test('each source has a supported observation, contradiction and overreach',()=>{
  for(const s of SOURCES)assert.deepEqual(CASES.filter(c=>c.source_id===s.id).map(c=>c.expected).sort(),[...LABELS].sort());
});
test('model input export excludes answer labels and rationales',()=>{
  const inputs=modelInputs();assert.equal(inputs.length,18);
  for(const r of inputs){assert.deepEqual(Object.keys(r).sort(),['claim','evidence_summary','id','suite_version']);assert.equal(r.suite_version,VERSION);}
  assert.equal(answerKey().every(c=>c.annotation_status==='draft_not_expert_adjudicated'),true);
});
test('JSON array and JSONL inputs give identical parsed rows',()=>{
  const p=demoPredictions();assert.deepEqual(parsePredictions(JSON.stringify(p)),parsePredictions(p.map(r=>JSON.stringify(r)).join('\r\n')));
});
test('all correct predictions have full agreement, coverage and F1',()=>{
  const r=scorePredictions(CASES.map(c=>({id:c.id,prediction:c.expected})));
  assert.equal(r.accuracy,1);assert.equal(r.coverage,1);assert.equal(r.macroF1,1);assert.equal(r.falseSupported,0);
  assert.deepEqual(r.matrix,[[6,0,0],[0,6,0],[0,0,6]]);
});
test('always-supported baseline cannot look like strong performance',()=>{
  const r=scorePredictions(CASES.map(c=>({id:c.id,prediction:'supported'})));
  assert.equal(r.correct,6);assert.equal(r.falseSupported,12);assert.equal(r.accuracy,1/3);assert.equal(r.macroF1,1/6);
});
test('scripted demonstration matches independently calculated totals',()=>{
  const r=scorePredictions(demoPredictions());assert.equal(r.correct,12);assert.equal(r.falseSupported,4);
  assert.deepEqual(r.matrix,[[6,0,0],[1,3,2],[3,0,3]]);
  assert.ok(Math.abs(r.macroF1-(.75+2/3+6/11)/3)<1e-12);
});
test('missing predictions are reported as missing and macro-F1 is withheld',()=>{
  const r=scorePredictions([{id:'EC02',prediction:'supported'}]);
  assert.equal(r.accuracy,1);assert.equal(r.coverage,1/18);assert.equal(r.macroF1,null);assert.equal(r.riskySubmitted,0);
  assert.equal(r.rows.filter(x=>x.correct===null).length,17);
});
test('prediction order cannot change the score',()=>assert.deepEqual(scorePredictions(demoPredictions()),scorePredictions(demoPredictions().reverse())));
test('duplicate IDs are rejected',()=>assert.throws(()=>parsePredictions('[{"id":"EC01","prediction":"supported"},{"id":"EC01","prediction":"contradicted"}]'),/Duplicate/));
test('unknown IDs are rejected',()=>assert.throws(()=>parsePredictions('{"id":"EC99","prediction":"supported"}'),/unknown case/));
test('unknown labels are rejected',()=>assert.throws(()=>parsePredictions('{"id":"EC01","prediction":"true"}'),/prediction must/));
test('wrong suite versions are rejected',()=>assert.throws(()=>parsePredictions('{"id":"EC01","prediction":"supported","suite_version":"old"}'),/version/));
test('empty and malformed inputs return usable errors',()=>{
  for(const value of ['', '[]','null','"text"','[null]','```json\n{}\n```','not JSON'])assert.throws(()=>parsePredictions(value));
  assert.throws(()=>parsePredictions(' '.repeat(2)+'x'.repeat(1000001)),/1 MB/);
});
test('CSV keeps source links, provisional-label status and demo provenance',()=>{
  const csv=toCSV(scorePredictions(demoPredictions()).rows.map(r=>({...r,run_kind:'scripted_demo'})));
  assert.match(csv,/source_url/);assert.match(csv,/https:\/\/pubmed/);assert.match(csv,/draft_not_expert_adjudicated/);
  assert.equal((csv.match(/"scripted_demo"/g)||[]).length,18);
});
test('CSV escapes quotes and prevents formula execution',()=>{
  const csv=toCSV([{id:'EC01',claim:'=1+1',reason:'A "quote", with comma'}]);
  assert.match(csv,/"'=1\+1"/);assert.match(csv,/"A ""quote"", with comma"/);
});
