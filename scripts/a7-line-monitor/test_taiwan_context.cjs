const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const site=path.join(__dirname,'site');
const read=name=>JSON.parse(fs.readFileSync(path.join(site,name),'utf8'));
const index=read('taiwan-context/index.json');
assert.equal(index.version,1);assert.equal(index.grid,4);
assert.ok(index.tiles.length>=50&&index.tiles.every(k=>/^\d{3}-\d{2,3}$/.test(k)));
assert.ok(read('taiwan-context/main.json').every(r=>r[0]===0||r[0]===1));
assert.ok(read('taiwan-context/primary.json').every(r=>r[0]===2));
for(const name of ['體育大學','林口長庚紀念醫院','郵政物流園區','林口三井 OUTLET 一館','林口三井 OUTLET 二館']){
  assert.ok(index.places.some(p=>p[3]===name||p[3]===name+'站'),`Missing ${name}`);
}
assert.ok(index.places.some(p=>p[4]<23),'Southern landmarks');
assert.ok(index.places.some(p=>p[5]>=121.5&&p[4]<24),'Eastern landmarks');
assert.ok(index.places.some(p=>p[5]<119.7&&p[4]>23.4),'Outlying-island landmarks');
assert.ok(!index.places.some(p=>p[1]==='retail'&&/小北百貨|寶雅|文具/.test(p[3])));

class Node{
  constructor(){this.checked=true;this.children=[];this.events={};this.textContent='';}
  append(...items){this.children.push(...items);} replaceChildren(...items){this.children=items;}
  setAttribute(k,v){this[k]=v;} addEventListener(k,fn){this.events[k]=fn;} removeEventListener(k){delete this.events[k];}
}
const elements={},requests=[],panes={},layers=[],events={};let zoom=6;
const get=id=>elements[id]??=(new Node());
const bounds={pad(){return this;},getWest:()=>121.35,getEast:()=>121.41,getSouth:()=>25.02,getNorth:()=>25.07};
const map={createPane:n=>panes[n]={style:{}},getZoom:()=>zoom,getBounds:()=>bounds,getSize:()=>({x:950,y:620}),
  latLngToContainerPoint:([lat,lng])=>({x:(lng-121.35)*14000+25,y:(25.07-lat)*10000+25}),on:(n,f)=>events[n]=f,
  attributionControl:{addAttribution(){}}};
const feature=(point,opts)=>({point,opts,addTo(group){group.items.push(this);return this;}});
const L={canvas:o=>o,polyline:feature,marker:feature,divIcon:o=>o,
  layerGroup:()=>({items:[],addTo(){layers.push(this);return this;},clearLayers(){this.items=[];}})};
const ctx=vm.createContext({L,AbortSignal,map,console,document:{getElementById:get,createElement:()=>new Node()},
  fetch:async url=>{assert.match(url,/^taiwan-context\//);requests.push(url);return {ok:true,json:async()=>read(url)};}});
const run=s=>vm.runInContext(s,ctx);
const settled=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
  run(fs.readFileSync(path.join(site,'taiwan-context.js'),'utf8'));
  ctx.places=index.places;
  const close=run('TaiwanContext.nearby(places,[25.04133,121.38541])');
  assert.equal(close[0].place[1],'transport');assert.ok(close[0].km<.02);
  assert.equal(new Set(close.map(r=>r.place[1])).size,close.length);
  assert.ok(close.every(r=>r.km<=3));
  run('TaiwanContext.init(map)');await settled();
  assert.deepEqual(requests,['taiwan-context/index.json','taiwan-context/main.json']);
  assert.equal(panes.contextRoads.style.pointerEvents,'none');assert.ok(Number(panes.contextPlaces.style.zIndex)<680);
  assert.equal(layers[2].items.length,0,'No landmark clutter at national zoom');
  assert.ok(layers[0].items.length>0,'National arterial roads are visible');
  zoom=15.25;events.moveend();await settled();
  assert.ok(requests.includes('taiwan-context/primary.json'));
  assert.ok(requests.some(r=>r.includes('roads-485-100')));
  assert.ok(layers[1].items.some(n=>n.opts.icon.html.textContent.includes('路')));
  assert.ok(layers[2].items.some(n=>n.opts.icon.html['aria-label']?.includes('體育大學站')));
  get('show-landmarks').checked=false;get('show-landmarks').events.change();await settled();
  assert.equal(layers[2].items.length,0);
  get('show-context-roads').checked=false;get('show-context-roads').events.change();
  assert.equal(layers[0].items.length,0);assert.equal(layers[1].items.length,0);
  const panel=run('TaiwanContext.projectContext([25.04133,121.38541])');panel.open=true;panel.events.toggle();await settled();
  assert.ok(panel.children[1].children[1].textContent.includes('直線距離'));
  console.log('PASS: bundled roads, zoom-based local detail, filtered landmarks, and measured project context.');
})().catch(e=>{console.error(e);process.exitCode=1;});
