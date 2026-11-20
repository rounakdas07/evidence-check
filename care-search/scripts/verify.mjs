import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import zlib from 'node:zlib';import assert from 'node:assert/strict';
import {prepareProviders,queryProviders} from '../core.js';import {workbook} from '../xlsx.js';
const root=new URL('../',import.meta.url),meta=JSON.parse(fs.readFileSync(new URL('data/manifest.json',root)));const raw=meta.files.flatMap(f=>JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('data/'+f,root)))));const providers=prepareProviders(raw,meta);
assert.equal(providers.length,18145);assert.equal(providers.reduce((n,p)=>n+p.locs.length,0),30628);assert.equal(new Set(providers.map(p=>p.id)).size,meta.providers);assert.equal(new Set(providers.flatMap(p=>p.locs.map(l=>l.id))).size,meta.locations);
assert.equal(queryProviders(providers,{min:5,max:50}).length,672);
const source=providers.find(p=>p.name==='Midshires Care Limited');assert(source);const mansfield=source.locs.find(l=>l.name==='Helping Hands Mansfield');assert.equal(mansfield.postcode,'NG18 2AE');
for(const q of ['NG18 2AE','ng182ae','Helping Hands Mansfield'])assert(queryProviders(providers,{q}).some(r=>r.provider.id===source.id&&r.locations.some(l=>l.id===mansfield.id)));
const east=String(meta.regions.indexOf('East Midlands')),nursing=1;const filtered=queryProviders(providers,{region:east,services:nursing,min:5,max:50});assert(filtered.length>0);for(const r of filtered){assert(r.provider.locs.length>=5&&r.provider.locs.length<=50);assert(r.locations.every(l=>String(l.region)===east&&(l.services&nursing)));}
assert.equal(queryProviders(providers,{q:'zzzxqnoactualprovider'}).length,0);assert.equal(queryProviders(providers,{min:99,max:2}).length,0);
assert.equal(queryProviders(providers,{min:9000,region:'999'},new Set([source.id])).length,1,'Saved view ignores directory filters');
const byName=queryProviders(providers,{q:'Midshires Care Limited'});assert.equal(byName.find(r=>r.provider.id===source.id).locations.length,151);
for(const p of providers)for(const w of p.websites){assert.doesNotThrow(()=>new URL(w));assert(['https:','http:'].includes(new URL(w).protocol));}
const fixture=workbook([{name:'Safety checks',headers:['Text','Number','Postcode'],rows:[['=HYPERLINK("https://example.com")',42,'NG18 2AE'],['<script> & "quote"',0,'01234567'],['+123',3.25,'@test']],widths:[40,20,25]}]);fs.writeFileSync(path.join(os.tmpdir(),'care-search-export-test.xlsx'),Buffer.from(await fixture.arrayBuffer()));
console.log(JSON.stringify({providers:meta.providers,locations:meta.locations,defaultResults:672,eastMidlandsNursingProviders:filtered.length,allChecks:'passed',exportFixture:path.join(os.tmpdir(),'care-search-export-test.xlsx')}));
