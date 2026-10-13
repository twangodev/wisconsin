/** Build a private, offline review interface from the JSON audit. */
import fs from 'node:fs';
import path from 'node:path';

export function writeReport(audit, output) {
  const directory = path.dirname(output);
  const triageFile = path.join(directory, 'triage.json');
  const triage = fs.existsSync(triageFile) ? JSON.parse(fs.readFileSync(triageFile, 'utf8')) : {};
  const data = JSON.stringify({ summary: audit.summary, generatedAt: audit.generatedAt,
    limitations: audit.limitations, courses: audit.courses, triage,
    documents: audit.documents.map(({file,course,category,semanticReview,sourceReview,findings}) =>
      ({file,course,category,semanticReview,sourceReview,findings})) }).replace(/</g, '\\u003c');
  const contentPrefix = path.relative(directory, path.resolve(import.meta.dir, '../content'))
    .split(path.sep).map(encodeURIComponent).join('/') + '/';
  const html = `<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wisconsin content review</title>
<style>
body{font:16px/1.5 system-ui,sans-serif;max-width:1100px;margin:32px auto;padding:0 20px;background:#f8fafc;color:#17212e}
h1{font-size:28px}a{color:#1554a1}button,select,input{font:inherit;padding:7px;margin:4px;border:1px solid #cbd5e1;border-radius:5px}
article,aside{background:white;border:1px solid #d6dee8;padding:16px;margin:12px 0;border-radius:8px}
article h3{margin:0;font-size:17px;overflow-wrap:anywhere}.meta{color:#526072;font-size:14px}
pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;background:#f1f5f9;padding:8px}
li{margin:6px 0}.toolbar{position:sticky;top:0;background:#f8fafc;padding:8px 0;border-bottom:1px solid #cbd5e1}summary{cursor:pointer}
</style>
<h1>Wisconsin content review</h1><p id="scope"></p>
<p>These are structural checks and review candidates. Source accuracy, completeness, grades, and diagram meaning require separate review. Private report; no network requests.</p>
<aside><h2>Findings and next work</h2><div id="triage"></div></aside>
<details><summary>Audit limits</summary><ul id="limits"></ul></details>
<div class="toolbar"><label>Course <select id="course"><option value="">All</option></select></label>
<label>Rule <select id="rule"><option value="">All</option></select></label>
<label>Review <select id="review"><option value="">All</option><option value="pending">Pending source review</option><option value="completed">Pilot reviewed</option><option value="partially-reviewed">Partial</option></select></label>
<input id="search" type="search" placeholder="Find a document" aria-label="Find a document">
<label><input id="only" type="checkbox" checked>With findings</label><p id="count"></p></div>
<div id="documents"></div><button id="more">Show another 100 documents</button>
<script>
const data=${data};
const contentPrefix=${JSON.stringify(contentPrefix)};
const byId=id=>document.getElementById(id);
const element=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
byId('scope').textContent=data.summary.documents+' Markdown/R Markdown documents across '+data.summary.courses+' courses; generated '+data.generatedAt;
for(const l of data.limitations)byId('limits').append(element('li',l));
for(const item of data.triage.findings??[]){const p=element('p');p.append(element('strong',item.priority+' — '+item.title+': '),document.createTextNode(item.evidence+' '+item.action));byId('triage').append(p);}
if(data.triage.validation)byId('triage').append(element('p',data.triage.validation.summary));
for(const c of Object.keys(data.courses).sort()){const o=element('option',c);o.value=c;byId('course').append(o);}
for(const r of Object.keys(data.summary.rules).sort()){const o=element('option',r);o.value=r;byId('rule').append(o);}
const urgent=new Set(['renderer-implicit-cross-course-target','renderer-unexpected-vault-root','renderer-missing-local-target','replacement-or-private-glyph','ocr-watermark']);
const score=d=>d.findings.reduce((n,f)=>n+(urgent.has(f.rule)?20:f.status==='confirmed'?5:1),0);
const documents=[...data.documents].sort((a,b)=>score(b)-score(a)||a.file.localeCompare(b.file));
let limit=100;
function render(){
 const course=byId('course').value,rule=byId('rule').value,review=byId('review').value,query=byId('search').value.toLowerCase();
 const shown=documents.filter(d=>(!course||d.course===course)&&(!rule||d.findings.some(f=>f.rule===rule))&&(!byId('only').checked||d.findings.length)&&(!query||d.file.toLowerCase().includes(query))&&(!review||(review==='completed'?d.semanticReview.startsWith('reviewed-'):d.semanticReview===review)));
 byId('count').textContent=shown.length+' matching documents; showing '+Math.min(limit,shown.length);
 byId('documents').replaceChildren();
 for(const d of shown.slice(0,limit)){
  const card=element('article'),heading=element('h3'),link=element('a',d.file);
  link.href=contentPrefix+d.file.split('/').map(encodeURIComponent).join('/');heading.append(link);card.append(heading);
  const meta=element('p',d.category+' · source review: '+d.semanticReview+' · '+d.findings.length+' findings');meta.className='meta';card.append(meta);
  if(d.sourceReview)card.append(element('p',d.sourceReview.coverage));
  const details=element('details'),summary=element('summary','Show findings and line references');details.append(summary);
  for(const f of d.findings.filter(f=>!rule||f.rule===rule)){
   const item=element('div');item.append(element('p',f.status+' · '+f.rule+' · line '+f.line));
   item.append(element('pre',typeof f.detail==='string'?f.detail:JSON.stringify(f.detail,null,2)));details.append(item);
  }
  card.append(details);byId('documents').append(card);
 }
 byId('more').hidden=limit>=shown.length;
}
for(const id of ['course','rule','review','search','only'])byId(id).addEventListener('input',()=>{limit=100;render();});
byId('more').addEventListener('click',()=>{limit+=100;render();});render();
</script></html>`;
  const destination = output.replace(/\.json$/i, '') + '.html';
  fs.writeFileSync(destination, html);
  return destination;
}
