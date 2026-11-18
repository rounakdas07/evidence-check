export const VERSION = '1.0.0';
export const REVIEW_DATE = '2026-11-18';
export const LABELS = ['supported', 'contradicted', 'not_established'];
export const LABEL_NAMES = {supported:'Supported', contradicted:'Contradicted', not_established:'Not established'};

// Original, concise paraphrases of the linked primary-study abstracts.
// Draft reference annotations, AI-assisted; not independently expert-adjudicated.
export const SOURCES = [
  {id:'vegf', target:'VEGF', topic:'A case series is not an incidence rate', short:'Renal injury', kind:'Human cases + mouse experiment', citation:'Eremina et al. · NEJM · 2008', pmid:'18337603', doi:'10.1056/NEJMoa0707330', title:'VEGF inhibition and renal thrombotic microangiopathy', locator:'Abstract: six patient cases and conditional podocyte deletion',
    evidence:'The authors described six bevacizumab-treated patients with renal lesions characteristic of thrombotic microangiopathy (TMA). They also deleted VEGF in adult mouse podocytes, producing severe thrombotic glomerular injury. The abstract provides no denominator for all bevacizumab-treated patients.',
    context:'Keep the human case series separate from the causal mouse experiment.'},
  {id:'her2', target:'HER2 / ERBB2', topic:'Mouse findings stay in mice', short:'Cardiac function', kind:'Mouse genetic experiment', citation:'Ozcelik et al. · PNAS · 2002', pmid:'12072561', doi:'10.1073/pnas.122249299', title:'Conditional mutation of the ErbB2 (HER2) receptor in cardiomyocytes leads to dilated cardiomyopathy', locator:'Abstract: Cre-loxP experiment and conditional-mutant phenotype',
    evidence:'Researchers disrupted ErbB2 specifically in ventricular cardiomyocytes using Cre-loxP in mice. The mutants developed severe dilated cardiomyopathy, usually showing cardiac dysfunction by their second postnatal month. This experimental result concerns genetically altered mice, not a treated patient cohort.',
    context:'Genetic disruption is not identical to a drug exposure in humans.'},
  {id:'pd1', target:'PD-1', topic:'The genetic background changes the result', short:'Autoimmune cardiomyopathy', kind:'Mouse genetic experiment', citation:'Nishimura et al. · Science · 2001', pmid:'11209085', doi:'10.1126/science.291.5502.319', title:'Autoimmune dilated cardiomyopathy in PD-1 receptor-deficient mice', locator:'Abstract: BALB/c versus RAG-2-deficient background',
    evidence:'Disrupting PD-1 in BALB/c mice caused dilated cardiomyopathy, impaired contraction and fatal heart failure. The phenotype did not occur in BALB/c mice also lacking RAG-2. Affected PD-1-deficient mice had circulating autoantibodies against a cardiomyocyte protein.',
    context:'The RAG-2 qualification is essential; this is not a universal effect.'},
  {id:'ctla4', target:'CTLA-4', topic:'Loss of a brake is not less activation', short:'Immune regulation', kind:'Mouse genetic experiment', citation:'Tivol et al. · Immunity · 1995', pmid:'7584144', doi:'10.1016/1074-7613(95)90125-6', title:'Loss of CTLA-4 leads to massive lymphoproliferation and fatal multiorgan tissue destruction, revealing a critical negative regulatory role of CTLA-4', locator:'Abstract: knockout phenotype and peripheral T-cell activation',
    evidence:'CTLA-4-deficient mice developed extensive lymphocyte proliferation and tissue injury, including severe myocarditis and pancreatitis. They died at three to four weeks of age. Their peripheral T cells were activated and could proliferate spontaneously.',
    context:'Removing a negative regulator can increase the downstream response.'},
  {id:'pi3k', target:'PI3Kα / alpelisib', topic:'A pooled rate is not a subgroup rate', short:'Metabolic adverse events', kind:'Human randomised trial', citation:'André et al. · NEJM · 2019', pmid:'31091374', doi:'10.1056/NEJMoa1813904', title:'Alpelisib for PIK3CA-Mutated, Hormone Receptor-Positive Advanced Breast Cancer', locator:'Abstract, Results: overall-population safety and diarrhoea grade',
    evidence:'SOLAR-1 randomised 572 patients, including 341 with PIK3CA-mutated tumours. In the overall population, grade 3–4 hyperglycaemia occurred in 36.6% with alpelisib–fulvestrant versus 0.7% with placebo–fulvestrant. The abstract reported grade 3 diarrhoea, but no grade 4 diarrhoea.',
    context:'Preserve the population, combination regimen and adverse-event grade.'},
  {id:'checkpoint', target:'PD-1 + CTLA-4', topic:'A combination result is not a single-target mechanism', short:'Combination treatment', kind:'Human randomised trial', citation:'Larkin et al. · NEJM · 2015', pmid:'26027431', doi:'10.1056/NEJMoa1504030', title:'Combined Nivolumab and Ipilimumab or Monotherapy in Untreated Melanoma', locator:'Abstract, Results: treatment-related grade 3–4 adverse events',
    evidence:'In CheckMate 067, treatment-related grade 3–4 adverse events occurred in 55.0% with nivolumab–ipilimumab, 16.3% with nivolumab alone, and 27.3% with ipilimumab alone. These are treatment-group event rates; they do not assign each event to a single molecular mechanism.',
    context:'Clinical event attribution does not isolate target-level causality.'}
];
const row = (id, source_id, check, claim, expected, reason) => ({id, source_id, check, claim, expected, reason});
export const CASES = [
  row('EC01','vegf','Missing denominator','Renal TMA occurred in 100% of bevacizumab-treated patients.','not_established','Six selected cases provide no incidence denominator for everyone treated.'),
  row('EC02','vegf','Reported observation','Six bevacizumab-treated patients developed renal lesions consistent with TMA.','supported','This preserves the reported case count without inventing an incidence rate.'),
  row('EC03','vegf','Effect direction','Deleting VEGF in adult mouse podocytes prevented thrombotic glomerular injury.','contradicted','The deletion produced injury; it did not prevent it.'),
  row('EC04','her2','Species boundary','This mouse experiment establishes the cardiomyopathy rate in patients receiving trastuzumab.','not_established','An experimental mouse phenotype supplies no patient incidence estimate.'),
  row('EC05','her2','Reported observation','Disrupting ErbB2 in mouse ventricular cardiomyocytes led to dilated cardiomyopathy.','supported','The intervention, species and reported phenotype are retained.'),
  row('EC06','her2','Intervention direction','The experimental intervention increased ErbB2 activity in mouse ventricular cardiomyocytes.','contradicted','ErbB2 was disrupted, not activated.'),
  row('EC07','pd1','Genetic context','PD-1 disruption caused cardiomyopathy in BALB/c mice even when RAG-2 was also absent.','contradicted','The abstract explicitly excludes that RAG-2-deficient background.'),
  row('EC08','pd1','Reported observation','PD-1 disruption caused dilated cardiomyopathy in BALB/c mice.','supported','This reports the phenotype in the stated mouse background.'),
  row('EC09','pd1','Species boundary','PD-1-blocking drugs inevitably cause heart failure in humans.','not_established','Mouse gene-disruption findings cannot establish an inevitable human drug effect.'),
  row('EC10','ctla4','Effect direction','CTLA-4 loss reduced peripheral T-cell activation in the reported mice.','contradicted','The mice had activated peripheral T cells and spontaneous proliferation.'),
  row('EC11','ctla4','Reported observation','CTLA-4-deficient mice developed lymphoproliferative disease with multiorgan tissue injury.','supported','This preserves the model and observed tissue injury.'),
  row('EC12','ctla4','Species boundary','Patients receiving CTLA-4-blocking drugs die within four weeks.','not_established','Mouse knockout mortality does not establish mortality after human drug treatment.'),
  row('EC13','pi3k','Population scope','The reported 36.6% hyperglycaemia rate applies specifically to the PIK3CA-mutated subgroup.','not_established','The supplied safety rate is for the overall population, not that subgroup.'),
  row('EC14','pi3k','Reported observation','Grade 3–4 hyperglycaemia was more frequent with alpelisib–fulvestrant than placebo–fulvestrant.','supported','The reported comparison is 36.6% versus 0.7%.'),
  row('EC15','pi3k','Explicit negation','Grade 4 diarrhoea was observed in SOLAR-1.','contradicted','The abstract explicitly reports no grade 4 diarrhoea.'),
  row('EC16','checkpoint','Treatment attribution','Every severe event in the combination arm was caused exclusively by PD-1 inhibition.','not_established','Arm-level event rates cannot assign every event to one target.'),
  row('EC17','checkpoint','Reported observation','Treatment-related grade 3–4 events were more frequent with the combination than either monotherapy.','supported','The combination rate, 55.0%, exceeds both monotherapy rates.'),
  row('EC18','checkpoint','Arm mix-up','Treatment-related grade 3–4 events occurred in 55.0% of the nivolumab-only group.','contradicted','55.0% belongs to the combination arm; nivolumab alone was 16.3%.')
];
export const SOURCE_MAP = Object.fromEntries(SOURCES.map(s=>[s.id,{...s,url:`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`}]));
export const PROMPT = `Classify each candidate claim using ONLY its supplied evidence_summary. Do not use outside knowledge. The summaries are curated paraphrases, not full papers.
Return one JSON object per line with exactly these keys: id, prediction.
Allowed prediction values:
- supported: every material part of the claim follows from the supplied evidence.
- contradicted: the supplied evidence explicitly conflicts with a material part of the claim.
- not_established: the evidence is insufficient, including extrapolation across species, population, treatment or causality.
If evidence explicitly conflicts with a claim, prefer contradicted to not_established. Otherwise a stronger claim than the evidence warrants is not_established. Absence of evidence is not evidence of absence.
Preserve species, intervention direction, population, event grade, treatment arm and denominator. Judge claims, not overall target safety.
Output JSONL only. Example format: {"id":"EC01","prediction":"not_established"}
Do not consult the answer key.`;
