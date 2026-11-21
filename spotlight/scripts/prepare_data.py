"""Join published NHS provider metrics without mixing routes or treatment stages."""
import csv,datetime,hashlib,io,json,pathlib,collections
ROOT=pathlib.Path(__file__).resolve().parents[1];DATA=ROOT/'data'
SOURCES=[
 {'id':'apr-jul','file':'2026-04-to-07.csv','url':'https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2026/09/2026-27-Apr-Jul-Monthly-Combined-CSV-Provisional.csv','label':'April–July 2026 combined CSV (provisional)','period':None},
 {'id':'aug','file':'2026-08.csv','url':'https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2026/10/August-2026-Monthly-Combined-CSV-Provisional.csv','label':'August 2026 combined CSV (provisional)','period':'2026-08'},
 {'id':'sep','file':'2026-09.csv','url':'https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2026/11/September-2026-Monthly-Combined-CSV-Provisional.csv','label':'September 2026 combined CSV (provisional)','period':'2026-09'}]
FDS='Suspected haematological malignancies (excluding acute leukaemia)';LYMPHOMA='Haematological - Lymphoma'
MONTHS=['2026-04','2026-05','2026-06','2026-07','2026-08','2026-09']
def metric(r):
 if r['Basis']!='Provider':return None
 if r['Standard_or_Item']=='FDS' and r['Cancer_Type']==FDS and r['Referral_Route_or_Stage']=='ALL ROUTES':return 'fds'
 if r['Cancer_Type']==LYMPHOMA and r['Treatment_Modality']=='ALL MODALITIES':
  if r['Standard_or_Item']=='31D' and r['Referral_Route_or_Stage']=='First Treatment':return 'lymphoma'
  if r['Standard_or_Item']=='62D' and r['Referral_Route_or_Stage']=='ALL ROUTES':return 'treatment62'
 return None
def numeric(value):
 if value is None or value.strip()=='':return None
 n=float(value)
 if n<0:raise ValueError('Negative count')
 return int(n) if n.is_integer() else n

def main():
 trusts={};national={};records=[];raw_count=0;provider_count=0;all_provider_codes=set();seen=set()
 for src in SOURCES:
  raw_path=DATA/'raw'/src['file'];raw=raw_path.read_bytes();src['retrievedAt']=datetime.datetime.fromtimestamp(raw_path.stat().st_mtime,datetime.timezone.utc).isoformat();rows=list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))));raw_count+=len(rows)
  src.update({'rows':len(rows),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
  for record_number,r in enumerate(rows,start=2):
   if r['Basis']=='Provider':provider_count+=1;all_provider_codes.add(r['Org_Code'])
   kind=metric(r)
   if not kind:continue
   month=src['period'] or datetime.datetime.strptime(r['Period'],'%d/%m/%Y').strftime('%Y-%m')
   assert month in MONTHS
   code=r['Org_Code'];unique=(code,month,kind);assert unique not in seen,unique;seen.add(unique)
   rec={'sourceId':src['id'],'recordNumber':record_number,'month':month,'code':code,'name':r['Org_Name'],'region':r['Parent_Org'],'metric':kind,'total':numeric(r['Total']),'within':numeric(r['Within']),'after':numeric(r['After'])}
   if kind=='fds':rec['bins']=[numeric(r[k]) for k in ['Within_14_days','In_15_to_28_days','In_29_to_42_days','In_43_to_62_days','After_62_days']]
   if all(rec[k] is not None for k in ['total','within','after']):assert abs(rec['total']-rec['within']-rec['after'])<1e-7
   records.append(rec)
   if code=='Total':national.setdefault(month,{})[kind]=rec;continue
   t=trusts.setdefault(code,{'code':code,'name':r['Org_Name'].title().replace('Nhs','NHS').replace("'S","'s").replace(' And ',' and ').replace(' Of ',' of '),'rawName':r['Org_Name'],'region':r['Parent_Org'].replace('And','and').replace('Of','of'),'months':{},'isNHS':'NHS' in r['Org_Name'].upper()})
   t['months'].setdefault(month,{})[kind]=rec
 note_file=DATA/'research-notes.json'
 if note_file.exists():
  research=json.loads(note_file.read_text());research=research.get('trusts',research)
  for code,info in research.items():
   if code in trusts:trusts[code].update(info)
 additions=json.loads((DATA/'additional-research.json').read_text()) if (DATA/'additional-research.json').exists() else {}
 for code,info in additions.items():
  if code in trusts:trusts[code].update(info)
 for t in trusts.values():
  for month in MONTHS:t['months'].setdefault(month,{})
  t.setdefault('readiness',{'status':'unknown','text':'Digital pathology deployment has not been checked for this trust.','platform':'Not verified'})
  t.setdefault('relationship',{'kind':'unverified','text':'Relationship with Spotlight not verified.'})
  t.setdefault('nextQuestion','Confirm the laboratory that reports lymphoma biopsies, its digital-slide coverage and the source of the diagnostic delays before discussing a deployment.')
 manifest={'retrievedAt':max(s['retrievedAt'] for s in SOURCES),'builtAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'periods':MONTHS,'rawRowCount':raw_count,'providerRowCount':provider_count,'sourceProviderCount':len(all_provider_codes-{'Total'}),'selectedRowCount':len(records),'nhsTrustCount':sum(t['isNHS'] for t in trusts.values()),'trustCount':len(trusts),'sources':SOURCES,'publicationIndex':'https://www.england.nhs.uk/statistics/statistical-work-areas/cancer-waiting-times/','definitions':{'fds':FDS+' / FDS / ALL ROUTES','lymphoma':LYMPHOMA+' / 31D / First Treatment / ALL MODALITIES','treatment62':LYMPHOMA+' / 62D / ALL ROUTES / ALL MODALITIES'}}
 (DATA/'manifest.json').write_text(json.dumps(manifest,indent=2))
 (DATA/'accounts.json').write_text(json.dumps({'meta':manifest,'national':national,'trusts':sorted(trusts.values(),key=lambda t:t['name'])},ensure_ascii=False,separators=(',',':')))
 fields=['sourceId','recordNumber','month','code','name','region','metric','total','within','after','sourceUrl']
 with (DATA/'selected-records.csv').open('w',newline='') as f:
  writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader()
  for rec in records:writer.writerow({**{k:rec.get(k,'') for k in fields},'sourceUrl':next(x['url'] for x in SOURCES if x['id']==rec['sourceId'])})
 print({k:manifest[k] for k in ['rawRowCount','providerRowCount','sourceProviderCount','selectedRowCount','nhsTrustCount','trustCount']})
if __name__=='__main__':main()
