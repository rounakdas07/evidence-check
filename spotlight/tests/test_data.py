"""Source integrity and row-selection checks; no network required."""
import csv,hashlib,io,json,pathlib,sys,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from prepare_data import metric,FDS,LYMPHOMA
DATA=json.loads((ROOT/'data/accounts.json').read_text())

class DataTests(unittest.TestCase):
 def test_only_exact_provider_routes_and_first_treatments(self):
  f={'Basis':'Provider','Standard_or_Item':'FDS','Cancer_Type':FDS,'Referral_Route_or_Stage':'ALL ROUTES','Treatment_Modality':'N/A'}
  self.assertEqual(metric(f),'fds')
  for field,value in [('Basis','Commissioner'),('Referral_Route_or_Stage','URGENT SUSPECTED CANCER'),('Cancer_Type','Suspected breast cancer')]:
   self.assertIsNone(metric({**f,field:value}))
  l={**f,'Standard_or_Item':'31D','Cancer_Type':LYMPHOMA,'Referral_Route_or_Stage':'First Treatment','Treatment_Modality':'ALL MODALITIES'}
  self.assertEqual(metric(l),'lymphoma')
  for field,value in [('Referral_Route_or_Stage','Subsequent Treatment'),('Referral_Route_or_Stage','ALL STAGES'),('Treatment_Modality','SURGERY')]:self.assertIsNone(metric({**l,field:value}))
  self.assertEqual(metric({**l,'Standard_or_Item':'62D','Referral_Route_or_Stage':'ALL ROUTES'}),'treatment62')
 def test_unique_source_identity_and_balanced_counts(self):
  records=list(csv.DictReader(io.StringIO((ROOT/'data/selected-records.csv').read_text())))
  self.assertEqual(len(records),DATA['meta']['selectedRowCount'])
  seen=set()
  for r in records:
   key=(r['code'],r['month'],r['metric']);self.assertNotIn(key,seen);seen.add(key)
   self.assertAlmostEqual(float(r['total']),float(r['within'])+float(r['after']))
   self.assertTrue(r['sourceUrl'].startswith('https://www.england.nhs.uk/'))
  self.assertEqual(sum(r['code']=='Total' for r in records),18)
 def test_raw_hashes_and_exact_record_pointers_when_downloaded(self):
  available=all((ROOT/'data/raw'/s['file']).exists() for s in DATA['meta']['sources'])
  if not available:self.skipTest('Run python scripts/fetch_data.py to verify original releases')
  sources={}
  for s in DATA['meta']['sources']:
   raw=(ROOT/'data/raw'/s['file']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),s['sha256'])
   rows=list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))));self.assertEqual(len(rows),s['rows']);sources[s['id']]=rows
  for t in [*DATA['trusts'],{'months':DATA['national']}]:
   for month,metrics in t['months'].items():
    for kind,r in metrics.items():
     original=sources[r['sourceId']][r['recordNumber']-2]
     self.assertEqual(original['Org_Code'],r['code']);self.assertEqual(metric(original),kind)
     for key in ['total','within','after']:self.assertAlmostEqual(float(original[key.title()]),r[key])
     if kind=='fds':self.assertAlmostEqual(sum(r['bins']),r['total'])
if __name__=='__main__':unittest.main()
