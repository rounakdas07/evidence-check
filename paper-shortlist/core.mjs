export const VERSION='1.0.0';
export const DEFAULT_TERMS=['TrkB','NTRK2','BDNF'];
export const STATUSES=['new','keep','maybe','skip'];
export const MAX_RECORDS=250;
export function plain(value=''){
 return String(value).replace(/<\/(?:p|h[1-6]|div)>/gi,' ').replace(/<[^>]*>/g,'').replace(/&nbsp;/gi,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>{const c=+n;return c<=1114111?String.fromCodePoint(c):'';}).replace(/\s+/g,' ').trim();
}
export function safeUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(36);}
export function normalizePaper(p){
 const title=plain(p.title||'Untitled paper'),abstract=plain(p.abstract??p.abstractText??'');
 const pmid=/^\d+$/.test(String(p.pmid||''))?String(p.pmid):'';
 const doi=plain(p.doi||'').replace(/^https?:\/\/(?:dx\.)?doi\.org\//i,'');
 const types=Array.isArray(p.types)?p.types.map(plain):plain(p.types||'').split(';').filter(Boolean);
 return {id:pmid?'pmid-'+pmid:doi?'doi-'+doi.toLowerCase():'text-'+hash(title.toLowerCase()+abstract),title,abstract,pmid,doi,year:String(p.year||'').match(/(?:19|20)\d{2}/)?.[0]||'',authors:plain(p.authors||''),journal:plain(p.journal||''),types,license:plain(p.license||''),url:pmid?'https://pubmed.ncbi.nlm.nih.gov/'+pmid+'/':safeUrl(p.url)||(doi?'https://doi.org/'+encodeURI(doi):''),origin:plain(p.origin||'Imported text'),status:STATUSES.includes(p.status)?p.status:'new',notes:typeof p.notes==='string'?p.notes.slice(0,6000):'',settingOverride:typeof p.settingOverride==='string'?p.settingOverride.slice(0,200):'',compoundOverride:typeof p.compoundOverride==='string'?p.compoundOverride.slice(0,200):'',sentenceOverride:Number.isInteger(p.sentenceOverride)?p.sentenceOverride:-1};
}
export function fromEuropePMC(r){return normalizePaper({pmid:r.source==='MED'?r.id:'',title:r.title,abstract:r.abstractText,doi:r.doi,year:r.pubYear,authors:r.authorString,journal:r.journalInfo?.journal?.title||r.journalTitle,types:r.pubTypeList?.pubType||[],license:r.license,url:r.source&&r.id?'https://europepmc.org/article/'+r.source+'/'+r.id:'',origin:'Europe PMC / '+new Date().toISOString().slice(0,10)});}
export function sentences(text){return plain(text).match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)?.map(x=>x.trim()).filter(Boolean)||[];}
export function termsFrom(value){return [...new Set(String(value).split(/[,;\n]/).map(t=>t.trim()).filter(Boolean))].slice(0,12);}
const escapeRE=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function mentions(text,term){return new RegExp('(?:^|[^a-z0-9])'+escapeRE(term)+'(?=$|[^a-z0-9])','i').test(text);}
const compounds=[['OT-003',/\bOT[\s-]?003\b/i],['7,8-DHF',/7,8[\s-]*(?:dihydroxyflavone|DHF)/i],['LM22A-4',/\bLM22A[\s-]?4\b/i],['ketamine',/\b(?:[rs]-)?ketamine\b/i],['psilocin',/\bpsilocin\b/i],['psilocybin',/\bpsilocybin\b/i],['LSD',/\bLSD\b|lysergic acid diethylamide/i],['fluoxetine',/\bfluoxetine\b/i],['imipramine',/\bimipramine\b/i],['amitriptyline',/\bamitriptyline\b/i],['deoxygedunin',/\bdeoxygedunin\b/i],['β-hydroxybutyrate',/hydroxybutyrate/i]];
export function analyse(p,terms=DEFAULT_TERMS){
 const text=p.title+' '+p.abstract,parts=sentences(p.abstract),found=terms.filter(t=>mentions(text,t));
 const review=p.types.some(t=>/\breview\b/i.test(t))||/\b(?:in this review|this review (?:discusses|summarizes|summarises|describes))\b/i.test(text);
 const flags=[];
 const defs=[['Human tissue',/post[\s-]?mortem|postmortem|human brain tissue|brains? of (?:patients|individuals|subjects)/i],['Human terms',/\bpatients?\b|healthy volunteers|participants|human subjects/i],['Animals',/\bmice\b|\bmouse\b|\brats?\b|\brodents?\b|\bzebrafish\b|in vivo/i],['Cells / assays',/\bcell(?:s|ular| line)?\b|in vitro|cultured|binding assay|phosphorylation|biochemical|neuronal culture/i]];
 const clues=review?[]:defs.flatMap(([label,re])=>{const idx=parts.findIndex(s=>re.test(s));return idx>=0?[{label,sentence:parts[idx],index:idx}]:[];});
 const human=clues.some(c=>c.label.startsWith('Human')),animal=clues.some(c=>c.label==='Animals');
 if(human&&animal)flags.push('Human and animal terms both appear. Check which results belong to which experiment.');
 if(!p.abstract)flags.push('No abstract available. Labels based on the title alone are incomplete.');
 if(review)flags.push('Review article: background reading, not a new experiment.');
 if(/\bOT[\s-]?003\b/i.test(text))flags.push('OT-003 is mentioned. Confirm whether it was tested or only discussed.');
 if(!found.length)flags.push('None of your topic terms were found in the supplied title or abstract.');
 const names=compounds.filter(([,re])=>re.test(text)).map(([n])=>n);
 const scored=parts.map((sentence,index)=>({sentence,index,score:(/we (?:found|show|demonstrat|observ)|our (?:findings|results)|results (?:show|indicat|suggest)|we were unable|we did not|we detected/i.test(sentence)?6:0)+(/\b(results|found|observed|showed|demonstrated|reduced|increased|failed|unable|decreased|lack)\b/i.test(sentence)?2:0)+(found.some(t=>mentions(sentence,t))?1:0)-(/\b(?:may|could|hypothes|suggest|future|potential)\b/i.test(sentence)?1:0)})).sort((a,b)=>b.score-a.score||a.index-b.index);
 const candidate=scored[0]?.score>1?scored[0]:null;
 const override=p.sentenceOverride>=0&&p.sentenceOverride<parts.length?{sentence:parts[p.sentenceOverride],index:p.sentenceOverride}:null;
 const selected=override||candidate;
 const sourceType=review?'Review':p.types.some(t=>/randomized controlled trial|clinical trial/i.test(t))?'Clinical trial (indexed)':'Research / unspecified';
 return {found,scope:/\bOT[\s-]?003\b/i.test(text)?'OT-003 mentioned':found.some(t=>/^(trkb|ntrk2)$/i.test(t))?'TrkB mentioned':found.length?'Topic match':'No topic match',review,sourceType,clues,setting:p.settingOverride||(review?'Review':clues.map(c=>c.label).join(' · ')||'Not identified'),compounds:p.compoundOverride||names.join(', ')||'Not identified',selectedSentence:selected?.sentence||'',selectedIndex:selected?.index??-1,parts,flags,rank:(/\bOT[\s-]?003\b/i.test(text)?100:0)+(found.some(t=>/^(trkb|ntrk2)$/i.test(t))?10:0)+found.length};
}
export function mergePapers(old,incoming){const seen=new Set(),out=[],duplicateIds=[];for(const raw of [...old,...incoming]){const p=normalizePaper(raw);if(seen.has(p.id)){duplicateIds.push(p.id);continue;}seen.add(p.id);out.push(p);}return {papers:out.slice(0,MAX_RECORDS),duplicates:duplicateIds.length,overflow:Math.max(0,out.length-MAX_RECORDS)};}
export function parseNBIB(text){
 const chunks=String(text).replace(/\r/g,'').split(/\n(?=PMID\s*-)/).filter(x=>x.trim());const result=[];
 for(const chunk of chunks){const fields={};let key='';for(const line of chunk.split('\n')){const m=line.match(/^([A-Z0-9]{2,4})\s*-\s?(.*)$/);if(m){key=m[1];(fields[key]??=[]).push(m[2]);}else if(key&&/^\s+/.test(line))fields[key][fields[key].length-1]+=' '+line.trim();}
  if(!fields.TI)continue;result.push(normalizePaper({pmid:fields.PMID?.[0],title:fields.TI.join(' '),abstract:fields.AB?.join(' ')||'',year:fields.DP?.[0],authors:(fields.FAU||fields.AU||[]).join(', '),journal:fields.JT?.[0]||fields.TA?.[0],types:fields.PT||[],doi:fields.AID?.find(x=>x.includes('[doi]'))?.replace(/\s*\[doi\]/,'')||'',origin:'PubMed export (.nbib)'}));}
 return result;
}
export function parseCSV(text){const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw new Error('The CSV contains an unclosed quote. Check the file and try again.');if(cell||row.length){row.push(cell);rows.push(row);}if(!rows.length)return [];
 const header=rows.shift().map(h=>h.replace(/^\uFEFF/,'').trim().toLowerCase());if(!header.includes('title'))throw new Error('CSV needs a title column. Add abstract, pmid, year and url where available.');
 return rows.filter(r=>r[header.indexOf('title')]?.trim()).map(r=>normalizePaper({...Object.fromEntries(header.map((h,i)=>[h,r[i]||''])),origin:'CSV import'}));
}
export function parsePasted(text){
 if(/^\s*PMID\s*-/m.test(text))return parseNBIB(text);
 return text.split(/\n\s*---+\s*\n/).filter(b=>b.trim()).map(block=>{const lines=block.trim().split('\n');const title=lines.shift().replace(/^title:\s*/i,'').trim();let pmid='',url='';const abstract=[];for(const line of lines){const m=line.match(/^PMID:\s*(\d+)/i),u=line.match(/^URL:\s*(https?:\/\/\S+)/i);if(m)pmid=m[1];else if(u)url=u[1];else abstract.push(line.replace(/^abstract:\s*/i,''));}return normalizePaper({title,abstract:abstract.join(' '),pmid,url,origin:'Pasted text'});});
}
export function parseIds(text){const matches=[...text.matchAll(/\b\d{4,10}\b/g)].map(m=>m[0]);return [...new Set(matches)];}
export function csvExport(papers,terms){
 const cols=['title','year','pmid','doi','url','decision','source_type_suggested','topic_terms_found','study_clues_suggested','study_label_reviewed','compound_mentions_suggested','compound_label_reviewed','selected_abstract_sentence','sentence_selection','notes','origin','license'];
 const rows=papers.map(p=>{const a=analyse(p,terms);return [p.title,p.year,p.pmid,p.doi,p.url,p.status,a.sourceType,a.found.join('; '),a.clues.map(c=>c.label).join('; '),p.settingOverride,analyse({...p,compoundOverride:''},terms).compounds,p.compoundOverride,a.selectedSentence,p.sentenceOverride>=0?'Reviewer selected':'Rule selected',p.notes,p.origin,p.license];});
 const quote=v=>{let s=String(v??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};return '\uFEFF'+[cols,...rows].map(row=>row.map(quote).join(',')).join('\r\n');
}
export function briefExport(papers,terms){return ['# Paper shortlist',`Topic terms: ${terms.join(', ')}`,`Exported ${new Date().toISOString().slice(0,10)} · Paper Shortlist ${VERSION}`,'','Labels are screening suggestions from abstracts, not a study-quality assessment. Sentences are copied from the supplied abstract; they may omit context. Decisions and notes are the reviewer’s.','',...papers.flatMap(p=>{const a=analyse(p,terms);return [`## ${p.title}`,`${p.authors} (${p.year||'year not supplied'})`,`${p.url||'No source link supplied'}`,'',`Decision: ${p.status}`,`Study clues: ${a.setting}`,`Compound mentions: ${a.compounds}`,`Source type: ${a.sourceType}`,'',a.selectedSentence?'> '+a.selectedSentence:'No result-like sentence identified. Read the abstract.',a.flags.length?'Checks: '+a.flags.join(' '):'',p.notes?'Reviewer note: '+p.notes:'',`Input: ${p.origin}`,''];})].join('\n');}
