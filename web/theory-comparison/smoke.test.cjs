#!/usr/bin/env node
// Static contract smoke checks for the theory comparison page.
// Run: node web/theory-comparison/smoke.test.cjs
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname;
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
const timeline=fs.readFileSync(path.join(root,'../cosmology-simulations/index.html'),'utf8');
const registry=fs.readFileSync(path.join(root,'README.md'),'utf8');
const cases=[
 ['eight frameworks',()=>assert.equal((page.match(/<article class="card"/g)||[]).length,8)],
 ['five filters',()=>assert.equal((page.match(/data-filter="/g)||[]).length,5)],
 ['accessible filter state',()=>assert.match(page,/aria-pressed="true"/)],
 ['chain source files',()=>['ChainTheoryCompendium.pdf','ChainAlpha.lean','ChainTheoryTalk.pdf'].forEach(s=>assert.ok(page.includes(s)))],
 ['no physical proof overclaim',()=>assert.match(page,/Lean theorem alone does not establish empirical physics/)],
 ['simulation timeline linked',()=>assert.match(timeline,/href="\.\.\/theory-comparison\/"/)],
 ['simulation genealogy preserved',()=>['HACC','Aurora','MEGATRON'].forEach(s=>assert.ok(timeline.includes(s)))],
 ['provenance policy present',()=>assert.match(registry,/claim-level records/)],
 ['relative destinations exist',()=>{assert.ok(fs.existsSync(path.join(root,'README.md')));assert.ok(fs.existsSync(path.join(root,'../cosmology-simulations/index.html')))}]
];
let failed=0;for(const [name,fn] of cases){try{fn();console.log('PASS',name)}catch(e){failed++;console.error('FAIL',name,e.message)}}if(failed)process.exitCode=1;
