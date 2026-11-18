import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SOURCES,SOURCE_MAP,PROMPT,VERSION,REVIEW_DATE} from '../data.mjs';
import {modelInputs,answerKey,demoPredictions} from '../core.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..','pack');
await mkdir(root,{recursive:true});
const jsonl=rows=>rows.map(r=>JSON.stringify(r)).join('\n')+'\n';
const files={
  'inputs.jsonl':jsonl(modelInputs()),
  'answer-key.json':JSON.stringify(answerKey(),null,2)+'\n',
  'sources.json':JSON.stringify(SOURCES.map(s=>({...SOURCE_MAP[s.id],review_date:REVIEW_DATE})),null,2)+'\n',
  'prompt.txt':PROMPT+'\n',
  'SCRIPTED-DEMO-predictions.jsonl':jsonl(demoPredictions()),
  'manifest.json':JSON.stringify({suite:'Evidence Check',version:VERSION,review_date:REVIEW_DATE,cases:18,sources:6,labels:'Draft, AI-assisted; not independently expert-adjudicated',demonstration:'Scripted predictions are not results from any model',task:'Classify constructed claims against curated evidence paraphrases'},null,2)+'\n'
};
for(const [name,content] of Object.entries(files))await writeFile(resolve(root,name),content);
console.log(`Exported ${Object.keys(files).length} files to pack/ (v${VERSION}).`);
