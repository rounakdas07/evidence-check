"""Build the public directory from the CQC CSV and optional ODS enrichment.
Usage: python scripts/build_data.py /path/to/cqc-directory.csv /path/to/cqc-filters.ods
Inputs are linked in data/manifest.json; no CQC API credentials are required.
"""
import csv, json, gzip, hashlib, sys, collections, zipfile, xml.etree.ElementTree as ET
from pathlib import Path
OUT=Path(__file__).resolve().parents[1]/'data'
SERVICES=['Nursing homes','Residential homes','Homecare agencies','Supported living','Supported housing','Shared lives']
CSV_URL='https://www.cqc.org.uk/system/files/2026-11/19_November_2026_CQC_directory.csv'
ODS_URL='https://www.cqc.org.uk/system/files/2026-11/2_November_2026_HSCA_Active_Locations.ods'
def clean(s):return ' '.join(s.split())
def website(s):
 s=clean(s)
 if not s or s in ('-','*') or ' ' in s:return ''
 if not s.startswith(('https://','http://')):s='https://'+s
 return s if '.' in s else ''
with open(sys.argv[1],encoding='utf-8-sig',newline='') as f:
 rows=list(csv.reader(f))
header=next(i for i,row in enumerate(rows) if row[0]=='Name' and 'Service types' in row)
assert any('19 November 2026' in c for row in rows[:header] for c in row),'Unexpected source date: update build metadata'
raw=[dict(zip(rows[header],r)) for r in rows[header+1:] if any(r)]
selected=[r for r in raw if set(r['Service types'].split('|')) & set(SERVICES)]
assert len(selected)>20000
ids={r['CQC Location ID (for office use only)'] for r in selected}
assert len(ids)==len(selected),'Duplicate location ID'
enrich={}; providers_extra={}
T='{urn:oasis:names:tc:opendocument:xmlns:table:1.0}';X='{urn:oasis:names:tc:opendocument:xmlns:text:1.0}'
name='';headers=None
with zipfile.ZipFile(sys.argv[2]) as z:
 for ev,e in ET.iterparse(z.open('content.xml'),events=['start','end']):
  if ev=='start' and e.tag==T+'table':name=e.get(T+'name')
  if ev=='end' and e.tag==T+'table-row':
   if name=='HSCA_Active_Locations':
    vals=[]
    for c in e:
     v=' '.join(''.join(p.itertext()) for p in c.findall(X+'p'))
     vals.extend([v]*min(int(c.get(T+'number-columns-repeated','1')),150))
    if headers is None:headers=vals
    elif vals and vals[0] in ids:
     d=dict(zip(headers,vals));bed=d.get('Care homes beds','')
     enrich[vals[0]]={'beds':int(float(bed)) if d.get('Care home?')=='Y' and bed.replace('.','',1).isdigit() and float(bed)>0 else None,'dual':d.get('Location Dual Registered',''),'primary':d.get('Primary ID (Dual registration locations)',''),'provider':d.get('Provider ID','')}
     pid=d['Provider ID'];ex=providers_extra.setdefault(pid,{'websites':set(),'companies':set(),'brands':set()})
     w=website(d.get('Provider Web Address',''))
     if w:ex['websites'].add(w)
     for field,key in [('Provider Companies House Number','companies'),('Brand Name','brands')]:
      v=clean(d.get(field,''))
      if v and v not in ('-','*'):ex[key].add(v.removeprefix('BRAND '))
   e.clear()
regions=sorted(set(r['Region'] or 'Not recorded' for r in selected));areas=sorted(set(r['Local authority'] or 'Not recorded' for r in selected));grouped=collections.defaultdict(list)
for r in selected:grouped[r['CQC Provider ID (for office use only)']].append(r)
providers=[]
for pid,rs in grouped.items():
 names=collections.Counter(clean(r['Provider name']) for r in rs);pname=names.most_common(1)[0][0];ex=providers_extra.get(pid,{})
 locs=[]
 for r in sorted(rs,key=lambda r:r['Name'].casefold()):
  lid=r['CQC Location ID (for office use only)'];extra=enrich.get(lid,{})
  if extra.get('provider')!=pid:extra={}
  mask=sum(1<<i for i,s in enumerate(SERVICES) if s in r['Service types'].split('|'))
  locs.append([lid,clean(r['Name']),r['Postcode'],areas.index(r['Local authority'] or 'Not recorded'),regions.index(r['Region'] or 'Not recorded'),mask,clean(r['Address']),website(r["Service's website (if available)"]),r['Phone number'],clean(r['Also known as']),extra.get('beds'),extra.get('dual',''),extra.get('primary','')])
 providers.append([pid,pname,sorted(ex.get('websites',[])),sorted(ex.get('companies',[])),sorted(ex.get('brands',[])),locs])
providers.sort(key=lambda p:p[1].casefold());files=[];OUT.mkdir(exist_ok=True)
for i in range(12):
 part=providers[i::12];name=f'part-{i:02}.json.gz';payload=json.dumps(part,ensure_ascii=False,separators=(',',':')).encode()
 (OUT/name).write_bytes(gzip.compress(payload,compresslevel=9,mtime=0));files.append(name)
manifest={'version':1,'directoryDate':'2026-11-19','enrichmentDate':'2026-11-02','builtDate':'2026-11-20','sources':{'directory':CSV_URL,'enrichment':ODS_URL,'information':'https://www.cqc.org.uk/about-us/transparency/using-cqc-data','licence':'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'},'sha256':{Path(p).name:hashlib.sha256(Path(p).read_bytes()).hexdigest() for p in sys.argv[1:3]},'services':SERVICES,'regions':regions,'areas':areas,'providers':len(providers),'locations':len(selected),'enrichedLocations':len(enrich),'files':files,'schema':{'provider':['id','name','websites','companyNumbers','brands','locations'],'location':['id','name','postcode','areaIndex','regionIndex','serviceMask','address','website','phone','alsoKnownAs','careHomeBeds','dualRegistered','primaryId']}}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({'providers':len(providers),'locations':len(selected),'enriched':len(enrich),'compressedBytes':sum((OUT/f).stat().st_size for f in files),'5to50':sum(5<=len(p[5])<=50 for p in providers),'top':[(p[1],len(p[5])) for p in sorted(providers,key=lambda p:-len(p[5]))[:8]],'tailHeaders':headers[-8:]},indent=2))
