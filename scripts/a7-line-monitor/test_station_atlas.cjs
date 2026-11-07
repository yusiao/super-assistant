const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'site/station-atlas.geojson'),'utf8'));
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.attributes={};this.style={};this.classList={add(){},remove(){}};}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(k,fn){this.events[k]=fn;}
 click(){this.events.click?.({preventDefault(){},stopPropagation(){}});}
 focus(){this.focused=true;}
}
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
const calls=[],overlays=[],panes={},events={},layers=[];
let zoom=13;
const map={createPane:n=>(panes[n]=new Element()),getPane:n=>panes[n],getZoom:()=>zoom,
 on:(name,fn)=>events[name]=fn,fitBounds:b=>calls.push(b)};
function geoJSON(features=[],opts={}){
 const layer={features:[],opts,paths:[],addTo(){return this;},clearLayers(){this.features=[];this.paths=[];},
  addData(f){
   const all=Array.isArray(f)?f:f.type==='FeatureCollection'?f.features:[f];
   for(const feature of all){
    this.features.push(feature);
    const p={events:{},bindTooltip(){},on(name,fn){this.events[name]=fn;}};
    opts.style?.(feature);opts.onEachFeature?.(feature,p);this.paths.push(p);
   }
  },getBounds(){return this.features.map(f=>f.properties.id);}};
 layer.addData(features);layers.push(layer);return layer;
}
const markers=[];
const market={generated_at:'2026-11-01T20:25:22+08:00',areas:[
 {name:'A7站重劃區-郵政物流',city:'桃園市',district:'龜山區',availability:'partial',projects:[
  {id:'one',name:'測試預售甲',category:'active',url:'https://nbm.jsl.com.tw/',address:'測試基地',status:'預計完工 2028'},
  {id:'done',name:'不可顯示的成屋',category:'completed',url:'https://nbm.jsl.com.tw/'}]},
 {name:'A7站重劃區-樂善國小',city:'桃園市',district:'龜山區',availability:'unavailable',projects:[
  {id:'old',name:'不可補數的舊資料',category:'active',url:'https://nbm.jsl.com.tw/'}],transactions:[
  {project_name:'僅有成交的建案',unit:'A08-8F',total_price:'1200萬',url:'https://nbm.jsl.com.tw/'}]},
 {name:'A7周邊-子區待核對',city:'桃園市',district:'龜山區',availability:'partial',projects:[
  {id:'two',name:'測試周邊乙',category:'pending',url:'https://ttt.jsl.com.tw/'}]}
]};
const text=n=>(n.textContent||'')+n.children.map(text).join(' ');
const descendants=n=>[n,...n.children.flatMap(descendants)];
const L={geoJSON,layerGroup:()=>({addTo(){return this;},clearLayers(){markers.length=0;}}),
 divIcon:o=>o,marker:(position,o)=>({addTo(){markers.push({...o,position});return this;}}),
 imageOverlay:(url,bounds,o)=>{overlays.push({url,bounds,...o});return {addTo(){}};}};
const context=vm.createContext({document:{getElementById:get,createElement:tag=>new Element(tag)},fetch:async url=>{
 assert.equal(url,'station-atlas.geojson');return {ok:true,json:async()=>data};
},URL,AbortSignal,L,Date,projectLinkUrl:url=>/^https:\/\/(nbm|ttt)\.jsl\.com\.tw\/$/.test(url)?url:''});
vm.runInContext(fs.readFileSync(path.join(__dirname,'site/station-atlas.js'),'utf8'),context);
const atlas=vm.runInContext('StationAtlas',context);
async function main(){
 assert.equal(atlas.valid(data),true);
 const duplicate=structuredClone(data);duplicate.features.push(duplicate.features[0]);assert.equal(atlas.valid(duplicate),false);
 const cycle=structuredClone(data);cycle.features[0].properties.parent='a7-post';assert.equal(atlas.valid(cycle),false);
 const invalid=structuredClone(data);invalid.features[0].geometry.coordinates[0].pop();assert.equal(atlas.valid(invalid),false);
 const unsafe=structuredClone(data);unsafe.features[0].properties.source_url='javascript:alert(1)';assert.equal(atlas.valid(unsafe),false);
 assert.equal(await atlas.init(map),true);assert.equal(atlas.isActive(),true);
 assert.deepEqual(Array.from(calls.at(-1)),['a7','a8','a9']);
 assert.equal(markers.length,3);assert.equal(overlays[0].url,'station-terrain.webp');
 assert.ok(+panes.atlasAreas.style.zIndex>400,'Polygon pane must intercept clicks ahead of districts');
 assert.ok(+panes.atlasTerrain.style.zIndex<200,'Opt-in external roads must not be covered by the terrain image');
 const shapes=layers.find(l=>l.opts.pane==='atlasAreas');
 const panel=get('atlas-results-body'),quick=get('atlas-detail');
 atlas.setMarketData(market);
 assert.match(text(quick.children[0]),/已核對 2 案/);
 assert.match(text(quick.children[1]),/尚未接入/);
 assert.equal(get('atlas-result-title').textContent,'A7–A9 地圖建案');
 assert.equal(shapes.opts.bubblingMouseEvents,false);
 shapes.paths[0].events.click();
 assert.equal(calls.at(-1)[0],'a7','A geographic polygon click opens its extent, not a point buffer');
 assert.equal(markers.length,5);
 assert.equal(get('atlas-result-title').textContent,'A7 開發區');
 assert.match(text(panel),/測試預售甲/);assert.match(text(panel),/測試周邊乙/);
 assert.match(text(panel),/子區待核對/);assert.match(text(panel),/僅有成交的建案/);
 assert.doesNotMatch(text(panel),/不可顯示的成屋|不可補數的舊資料/);
 assert.ok(descendants(panel).some(n=>n.tag==='summary'&&n.textContent==='建案詳情'));
 assert.ok(descendants(panel).some(n=>n.tag==='a'&&n.href==='https://nbm.jsl.com.tw/'&&n.className==='atlas-primary'));
 const select=panel.children[0].children[1];
 select.value='a7-post';select.events.change();
 assert.equal(get('atlas-result-title').textContent,'郵政物流園區');
 assert.match(text(panel),/測試預售甲/);assert.doesNotMatch(text(panel),/測試周邊乙/);
 assert.match(text(panel),/不代表基地位在此園區範圍內/);
 atlas.show('a7-school');assert.doesNotMatch(text(panel),/測試預售甲/);
 assert.match(text(panel),/尚未接入/);
 atlas.show('a7');
 const updated=structuredClone(market);updated.areas[0].projects[0].name='更新後建案';
 atlas.setMarketData(updated);assert.match(text(panel),/更新後建案/);assert.doesNotMatch(text(panel),/測試預售甲/);
 atlas.setMarketData(null,'network');assert.match(text(panel),/讀取失敗/);assert.doesNotMatch(text(panel),/更新後建案/);
 let retries=0;get('refresh').addEventListener('click',()=>retries++);
 descendants(panel).find(n=>n.textContent==='重新讀取').click();assert.equal(retries,1);
 atlas.setMarketData(market);
 const a7ids=shapes.features.map(f=>f.properties.id);assert.ok(a7ids.includes('a7-post')&&a7ids.includes('a7-school'));
 quick.children[2].click();assert.equal(get('atlas-result-title').textContent,'A9 林口站生活圈');
 assert.ok(markers.some(m=>m.icon.html.textContent.startsWith('A8 長庚生活圈')),'Other regions remain accessible while the panel is open');
 markers.find(m=>m.icon.html.textContent==='三井周邊商業街廓 ›').icon.html.click();assert.equal(calls.at(-1)[0],'a9-mitsui');
 markers.find(m=>m.icon.html.textContent==='三井 OUTLET 二館').icon.html.click();
 assert.equal(calls.at(-1)[0],'a9-mall2');
 assert.equal(get('atlas-result-title').textContent,'三井 OUTLET 二館');
 assert.match(text(panel),/尚未接入/);assert.doesNotMatch(text(panel),/測試預售甲|測試周邊乙/);
 const back=panel.children[0].children[1];back.value='a9';back.events.change();assert.equal(calls.at(-1)[0],'a9');
 get('atlas-corridor').click();assert.equal(markers.length,3);assert.equal(get('atlas-result-title').textContent,'A7–A9 地圖建案');
 zoom=16;events.zoomend();assert.ok(markers.length>3,'Zooming into an overview exposes neighborhood polygons');
 atlas.leave();assert.equal(atlas.isActive(),false);assert.equal(get('atlas-detail').hidden,false);
 zoom=8;events.zoomend();assert.equal(markers.length,0,'Station labels do not clutter nationwide overview');
 for(const f of data.features){
  assert.notEqual(f.geometry.type,'Point');
  assert.ok(f.properties.note&&f.properties.checked_at&&f.properties.kind);
 }
 assert.equal(data.features.length,11);
 assert.doesNotMatch(fs.readFileSync(path.join(__dirname,'site/index.html'),'utf8'),/<dialog\b|返回地圖/);
 console.log('PASS: continuous map drilldown and region switches, non-modal panel, source links, refresh and privacy.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
