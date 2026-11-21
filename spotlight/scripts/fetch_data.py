"""Download the dated official releases used by this snapshot."""
import urllib.request,pathlib
from prepare_data import SOURCES
root=pathlib.Path(__file__).resolve().parents[1]/'data'/'raw';root.mkdir(parents=True,exist_ok=True)
for src in SOURCES:
 with urllib.request.urlopen(src['url'],timeout=60) as response:data=response.read()
 if b'Org_Code' not in data[:2000]:raise RuntimeError('Response is not the expected NHS CSV')
 (root/src['file']).write_bytes(data);print(src['file'],len(data),'bytes',flush=True)
