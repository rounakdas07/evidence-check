import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizePaper,analyse,parseNBIB,parseCSV,parseIds,parsePasted,csvExport,mergePapers,safeUrl,mentions} from '../core.mjs';

test('negative results remain exact, with no invented positive conclusion',()=>{
 const p=normalizePaper({title:'Testing TrkB ligands',abstract:'BDNF is a candidate. We were unable to detect TrkB activation in cultured cells. The compounds may warrant further research.'});
 const a=analyse(p);assert.equal(a.selectedSentence,'We were unable to detect TrkB activation in cultured cells.');assert.equal(a.compounds,'Not identified');assert.deepEqual(a.clues.map(c=>c.label),['Cells / assays']);
});
test('mixed human and animal wording is flagged, not silently treated as clinical evidence',()=>{
 const a=analyse(normalizePaper({title:'TrkB research',abstract:'Patients need new treatments. We found increased BDNF in mice.'}));
 assert.ok(a.flags.some(f=>f.includes('Human and animal')));assert.equal(a.sourceType,'Research / unspecified');
});
test('review articles do not inherit experimental labels from background wording',()=>{
 const a=analyse(normalizePaper({title:'BDNF review',abstract:'Mice and patients have been studied.',types:['Review']}));
 assert.equal(a.sourceType,'Review');assert.deepEqual(a.clues,[]);assert.ok(a.flags.some(f=>f.startsWith('Review article')));
});
test('manual sentence selections stay exact and absent abstracts stay missing',()=>{
 const p=normalizePaper({title:'A paper',abstract:'First sentence. Second sentence.',sentenceOverride:1});assert.equal(analyse(p).selectedSentence,'Second sentence.');
 assert.equal(analyse(normalizePaper({title:'TrkB in mice'})).selectedSentence,'');
 assert.ok(analyse(normalizePaper({title:'TrkB'})).flags.some(f=>f.startsWith('No abstract')));
});
test('NBIB restores wrapped abstracts, PubMed IDs, authors and publication type',()=>{
 const records=parseNBIB('PMID- 34451801\nTI  - TrkB\n      activation\nAB  - We tested a compound.\n      We found no effect.\nFAU - Smith, Alice\nDP  - 2021 Aug\nPT  - Review\nAID - 10.1000/test [doi]\n\nPMID- 24802307\nTI  - Second paper\nAB  - A second abstract.');
 assert.equal(records.length,2);assert.equal(records[0].title,'TrkB activation');assert.equal(records[0].abstract,'We tested a compound. We found no effect.');assert.equal(records[0].year,'2021');assert.equal(records[0].doi,'10.1000/test');assert.equal(records[0].authors,'Smith, Alice');assert.equal(analyse(records[0]).review,true);
});
test('CSV import handles multiline quoted text and rejects malformed input',()=>{
 const rows=parseCSV('\uFEFFtitle,abstract,pmid\r\n"Study, one","We found \"\"a\"\" result.\nAnother line.",34451801');assert.equal(rows.length,1);assert.equal(rows[0].title,'Study, one');assert.equal(rows[0].abstract,'We found "a" result. Another line.');
 assert.throws(()=>parseCSV('title,abstract\n"unfinished'),/unclosed quote/);assert.throws(()=>parseCSV('name,text\none,two'),/title column/);
});
test('deduplication preserves existing notes and decisions',()=>{
 const kept=normalizePaper({pmid:'34451801',title:'Original',notes:'Important',status:'keep'});const merged=mergePapers([kept],[{pmid:'34451801',title:'Duplicate'}]);assert.equal(merged.duplicates,1);assert.equal(merged.papers[0].notes,'Important');assert.equal(merged.papers[0].status,'keep');
});
test('CSV exports source links, separate corrections and safe spreadsheet cells',()=>{
 const p=normalizePaper({title:'=HYPERLINK("bad")',abstract:'We found that ketamine binds TrkB.',pmid:'33606976',compoundOverride:'Reviewer correction',notes:'  @SUM(1,2)',status:'keep'});const csv=csvExport([p]);
 assert.ok(csv.includes('https://pubmed.ncbi.nlm.nih.gov/33606976/'));assert.ok(csv.includes('"ketamine","Reviewer correction"'));assert.ok(csv.includes("'  @SUM"));assert.ok(csv.includes("'=HYPERLINK"));assert.ok(csv.includes('We found that ketamine binds TrkB.'));
});
test('topic matching is literal and source URLs cannot execute scripts',()=>{
 assert.equal(mentions('An NTRK2 result','TrkB'),false);assert.equal(mentions('A (test) result','(test)'),true);assert.equal(mentions('BDNF in cells','BDNF'),true);assert.equal(safeUrl('javascript:alert(1)'),'');assert.equal(safeUrl('https://pubmed.ncbi.nlm.nih.gov/12345/'),'https://pubmed.ncbi.nlm.nih.gov/12345/');
});
test('pasted papers and IDs accept real workflow inputs',()=>{
 const papers=parsePasted('Title one\nAbstract one.\nPMID: 34451801\n\n---\n\nTitle two\nAbstract two.');assert.equal(papers.length,2);assert.equal(papers[0].pmid,'34451801');assert.deepEqual(parseIds('34451801 https://pubmed.ncbi.nlm.nih.gov/24802307/ 34451801'),['34451801','24802307']);
});
test('all eight example abstracts have attributable sources and verbatim selected text',async()=>{
 const data=JSON.parse(await readFile(new URL('../data/example.json',import.meta.url)));assert.equal(data.length,8);for(const raw of data){const p=normalizePaper(raw),a=analyse(p);assert.ok(p.pmid&&p.authors&&p.abstract);assert.match(p.license,/cc by/i);assert.equal(p.status,'new');assert.ok(!a.selectedSentence||p.abstract.includes(a.selectedSentence));}
});
