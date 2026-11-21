import {rm,mkdir,copyFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist/data',{recursive:true});
for(const f of ['index.html','styles.css','app.mjs','core.mjs','data/accounts.json','data/manifest.json','data/selected-records.csv'])await copyFile(f,'dist/'+f);
console.log('Built NHS rollout tool.');
