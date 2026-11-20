export const normalise = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export const serviceNames = (mask, meta) => meta.services.filter((_, i) => mask & (1 << i));
export const regionName = value => value === 'East' ? 'East of England' : value;
export function prepareProviders(raw,meta){
 return raw.map(([id,name,websites,companies,brands,locations])=>{
  const locs=locations.map(([id,name,postcode,area,region,services,address,website,phone,alias,beds,dual,primary])=>{
   const search=normalise([name,postcode,meta.areas[area],regionName(meta.regions[region]),address,alias,...serviceNames(services,meta)].join(' '));
   return {id,name,postcode,area,region,services,address,website,phone,alias,beds,dual,primary,search,compactPostcode:normalise(postcode).replaceAll(' ','')};
  });
  return {id,name,websites,companies,brands,locs,search:normalise([id,name,...brands,...websites,...companies].join(' ')),services:locs.reduce((mask,l)=>mask|l.services,0)};
 });
}
export function queryProviders(providers,filters,savedIds=null){
 const {q='',region='',area='',services=0,min=1,max=Infinity,sort='size'}=filters;
 const norm=normalise(q),tokens=norm.split(' ').filter(Boolean),compact=norm.replaceAll(' ','');
 const results=[];
 for(const p of providers){
  if(savedIds && !savedIds.has(p.id))continue;
  if(!savedIds && (p.locs.length<min || p.locs.length>max))continue;
  const providerMatches=tokens.every(t=>p.search.includes(t));
  const matched=p.locs.filter(l=>{
   if(!savedIds && ((region!==''&&String(l.region)!==String(region))||(area!==''&&String(l.area)!==String(area))||(services && !(l.services&services))))return false;
   return !tokens.length||providerMatches||tokens.every(t=>(p.search+' '+l.search).includes(t))||(compact.length>1 && l.compactPostcode.includes(compact));
  });
  if(matched.length)results.push({provider:p,locations:matched});
 }
 results.sort(sort==='name'?(a,b)=>a.provider.name.localeCompare(b.provider.name,'en'):(a,b)=>b.provider.locs.length-a.provider.locs.length||a.provider.name.localeCompare(b.provider.name,'en'));
 return results;
}
