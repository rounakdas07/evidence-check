import {CASES, SOURCE_MAP, VERSION, LABELS} from './data.mjs';

export function modelInputs() {
  return CASES.map(c=>({id:c.id, suite_version:VERSION, evidence_summary:SOURCE_MAP[c.source_id].evidence, claim:c.claim}));
}
export function answerKey() {
  return CASES.map(c=>({...c,suite_version:VERSION, source_url:SOURCE_MAP[c.source_id].url, annotation_status:'draft_not_expert_adjudicated'}));
}
export function parsePredictions(text) {
  const clean=String(text).trim();
  if (!clean) throw new Error('Paste predictions or choose a JSON / JSONL file first.');
  if (clean.length>1000000) throw new Error('Use a file smaller than 1 MB.');
  let rows;
  try { rows=JSON.parse(clean); if (!Array.isArray(rows)) rows=[rows]; }
  catch { try { rows=clean.split(/\r?\n/).filter(x=>x.trim()).map(x=>JSON.parse(x)); } catch { throw new Error('Could not read the JSON. Use an array or one JSON object per line, without Markdown fences.'); } }
  if (!rows.length) throw new Error('The prediction list is empty.');
  const ids=new Set(CASES.map(x=>x.id)); const seen=new Set();
  return rows.map((r,i)=>{
    if (!r || typeof r!=='object' || Array.isArray(r)) throw new Error(`Row ${i+1} must be an object with id and prediction.`);
    if (!ids.has(r.id)) throw new Error(`Row ${i+1}: unknown case ID. Use EC01–EC18 from this suite.`);
    if (seen.has(r.id)) throw new Error(`Duplicate case ${r.id}. Keep one prediction per case.`);
    if (!LABELS.includes(r.prediction)) throw new Error(`${r.id}: prediction must be supported, contradicted or not_established.`);
    if (r.suite_version!==undefined && r.suite_version!==VERSION) throw new Error(`${r.id}: suite version does not match ${VERSION}.`);
    seen.add(r.id); return {id:r.id,prediction:r.prediction};
  });
}
export function scorePredictions(predictions) {
  // Validate through the same path for the browser and CLI.
  const valid=parsePredictions(JSON.stringify(predictions));
  const map=new Map(valid.map(p=>[p.id,p.prediction]));
  const rows=CASES.map(c=>({...c,prediction:map.get(c.id)??null,correct:map.has(c.id)?map.get(c.id)===c.expected:null}));
  const matrix=LABELS.map(()=>LABELS.map(()=>0));
  for (const r of rows) if(r.prediction) matrix[LABELS.indexOf(r.expected)][LABELS.indexOf(r.prediction)]++;
  const correct=rows.filter(r=>r.correct===true).length;
  const falseSupported=rows.filter(r=>r.prediction==='supported'&&r.expected!=='supported').length;
  const riskySubmitted=rows.filter(r=>r.prediction&&r.expected!=='supported').length;
  const perLabel=LABELS.map((label,i)=>{const tp=matrix[i][i],fp=matrix.reduce((a,r)=>a+r[i],0)-tp,fn=matrix[i].reduce((a,b)=>a+b,0)-tp; return {label,tp,fp,fn,f1:2*tp+fp+fn?2*tp/(2*tp+fp+fn):0};});
  return {suite_version:VERSION,total:CASES.length,submitted:valid.length,correct,accuracy:correct/valid.length,coverage:valid.length/CASES.length,falseSupported,riskySubmitted,macroF1:valid.length===CASES.length?perLabel.reduce((a,b)=>a+b.f1,0)/LABELS.length:null,matrix,perLabel,rows};
}
export function toCSV(rows) {
  const cols=['suite_version','run_kind','annotation_status','id','source_id','source_url','check','claim','expected','prediction','correct','reason'];
  const safe=v=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  return [cols.join(','),...rows.map(r=>{
    const record={suite_version:VERSION,run_kind:'user_supplied',annotation_status:'draft_not_expert_adjudicated',source_url:SOURCE_MAP[r.source_id]?.url,...r};
    return cols.map(k=>safe(record[k])).join(',');
  })].join('\r\n');
}
// Deliberately scripted for interface demonstration. Not a model evaluation.
export function demoPredictions() {
  const errors={EC01:'supported',EC04:'supported',EC07:'supported',EC10:'not_established',EC13:'supported',EC18:'not_established'};
  return CASES.map(c=>({id:c.id,prediction:errors[c.id]??c.expected}));
}
