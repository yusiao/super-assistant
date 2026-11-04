const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'site/station-atlas.geojson'),'utf8'));
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.attributes={};this.style={};this.classList={add(){},remove(){}};}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(k,fn){this.events[k]=fn;}
 click(){this.events.click?.({preventDefault(){},stopPropagation(){}});}
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
const L={geoJSON,layerGroup:()=>({addTo(){return this;},clearLayers(){markers.length=0;}}),
 divIcon:o=>o,marker:(position,o)=>({addTo(){markers.push({...o,position});return this;}}),
 imageOverlay:(url,bounds,o)=>{overlays.push({url,bounds,...o});return {addTo(){}};}};
const context=vm.createContext({document:{getElementById:get,createElement:tag=>new Element(tag)},fetch:async url=>{
 assert.equal(url,'station-atlas.geojson');return {ok:true,json:async()=>data};
},URL,AbortSignal,L});
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
 assert.equal(shapes.opts.bubblingMouseEvents,false);
 shapes.paths[0].events.click();
 assert.equal(calls.at(-1)[0],'a7','A geographic polygon click opens its extent, not a point buffer');
 assert.equal(markers.length,3);
 const a7ids=shapes.features.map(f=>f.properties.id);assert.ok(a7ids.includes('a7-post')&&a7ids.includes('a7-school'));
 atlas.show('a9');assert.ok(markers.some(m=>m.icon.html.textContent==='三井周邊商業街廓 ›'));
 markers[0].icon.html.click();assert.equal(calls.at(-1)[0],'a9-mitsui');assert.equal(markers.length,2);
 markers.find(m=>m.icon.html.textContent==='三井 OUTLET 二館').icon.html.click();
 assert.equal(calls.at(-1)[0],'a9-mall2');
 const panel=get('atlas-detail');assert.ok(panel.children.some(n=>n.textContent==='三井 OUTLET 二館'));
 panel.children[0].children[1].click();assert.equal(calls.at(-1)[0],'a9');
 get('atlas-corridor').click();assert.equal(markers.length,3);
 zoom=16;events.zoomend();assert.ok(markers.length>3,'Zooming into an overview exposes neighborhood polygons');
 atlas.leave();assert.equal(atlas.isActive(),false);assert.equal(get('atlas-detail').hidden,true);
 zoom=8;events.zoomend();assert.equal(markers.length,0,'Station labels do not clutter nationwide overview');
 for(const f of data.features){
  assert.notEqual(f.geometry.type,'Point');
  assert.ok(f.properties.note&&f.properties.checked_at&&f.properties.kind);
 }
 assert.equal(data.features.length,11);
 console.log('PASS: polygon clicks, nested shop areas, breadcrumbs, zoom, validation, privacy and layer hit testing.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
