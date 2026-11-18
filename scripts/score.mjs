import {readFile,writeFile} from 'node:fs/promises';
import {parsePredictions,scorePredictions,toCSV} from '../core.mjs';
const args=process.argv.slice(2);
const demo=args.includes('--scripted-demo');
const paths=args.filter(x=>x!=='--scripted-demo');
if(!paths.length || paths.length>2){console.error('Usage: node scripts/score.mjs predictions.jsonl [report.csv] [--scripted-demo]');process.exit(1);}
try{
  const result=scorePredictions(parsePredictions(await readFile(paths[0],'utf8')));
  const run_kind=demo?'scripted_demo':'user_supplied';
  console.log(JSON.stringify({run_kind,annotation_status:'draft_not_expert_adjudicated',suite_version:result.suite_version,submitted:result.submitted,total:result.total,correct:result.correct,label_agreement:result.accuracy,coverage:result.coverage,unsupported_accepted:result.falseSupported,non_supported_submitted:result.riskySubmitted,macro_f1:result.macroF1,confusion_matrix:result.matrix},null,2));
  if(paths[1])await writeFile(paths[1],toCSV(result.rows.map(r=>({...r,run_kind}))));
}catch(e){console.error(e.message);process.exitCode=1;}
