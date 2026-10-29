const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
class Element{constructor(){this.children=[];this.events={};this.attributes={};this.checked=true;this.textContent='';}append(...n){this.children.push(...n);}replaceChildren(...n){this.children=n;}setAttribute(k,v){this.attributes[k]=v;}addEventListener(k,fn){this.events[k]=fn;}click(){this.events.click?.({});}}
const ids=new Map(),get=id=>{if(!ids.has(id))ids.set(id,new Element());return ids.get(id);},fits=[],tiles=[];
function layer(features=[]){return {features,on(){return this;},addTo(){return this;},setStyle(){},clearLayers(){this.features=[];},addData(f){this.features.push(...f);},getBounds(){return {isValid:()=>true,features:this.features};}};}
const mapEvents={},markers=[];
const L={DomEvent:{disableClickPropagation(){},disableScrollPropagation(){}},map:()=>({on:(k,fn)=>{mapEvents[k]=fn;},zoomControl:{setPosition(){}},fitBounds:b=>fits.push(b),removeLayer(){}}),geoJSON:layer,tileLayer:(url,options)=>{tiles.push({url,options});return layer();}};
const geo=JSON.parse(fs.readFileSync(path.join(__dirname,'site/districts.geojson'),'utf8'));
L.layerGroup=()=>({...layer(),clearLayers(){markers.length=0;}});
L.divIcon=options=>options;
L.marker=(position,options)=>({addTo(){markers.push({position,...options});return this;}});
const context=vm.createContext({document:{getElementById:get,createElement:()=>new Element()},L,fetch:async url=>({ok:true,json:async()=>url==='districts.geojson'?geo:{type:'FeatureCollection',features:[]}}),AbortSignal,URL,console});
const run=s=>vm.runInContext(s,context);
async function main(){
 run(fs.readFileSync(path.join(__dirname,'site/redevelopment-areas.js'),'utf8'));
 run(fs.readFileSync(path.join(__dirname,'site/road-map.js'),'utf8').replace('return {init,render,cities,districts}','return {init,render,cities,districts,validLife}'));
 context.scopes=['郵政物流','樂善國小','文青國小','中心商業區','體育大學'].map((name,id)=>({id:String(id),name:`A7站重劃區-${name}`,city:'桃園市',district:'龜山區'}));
 await run("RegionMap.init((c,d,a)=>RegionMap.render(c,d,scopes,a))");run("RegionMap.render('桃園市','',scopes)");
 assert.equal(run('RegionMap.cities().length'),22);assert.equal(geo.features.length,368);assert.equal(tiles.length,0);
 get('enable-roads').click();get('enable-roads').click();assert.equal(tiles.length,1);assert.equal(tiles[0].options.referrerPolicy,'origin');
 assert.ok(get('life-toggle').disabled);assert.match(get('boundary-status').textContent,/待核對/);
 run("RegionMap.render('新北市','汐止區',[])");assert.equal(fits.at(-1).features[0].properties.district,'汐止區');
 run("RegionMap.render('高雄市','鼓山區',[])");assert.equal(fits.at(-1).features[0].properties.district,'鼓山區');
 get('map-overview').click();assert.ok(Array.isArray(fits.at(-1)));
 get('district-toggle').checked=false;get('district-toggle').events.change();
 mapEvents.click({latlng:{lng:121.3852781,lat:25.0411111}});
 assert.equal(get('map-selection').textContent,'桃園市 · 龜山區','Hidden borders still allow geographic selection');
 assert.equal(markers[0].icon.html.textContent,'A7 重劃區｜點開');
 let stopped=false;const event={preventDefault(){},stopPropagation(){stopped=true;}};
 markers[0].icon.html.events.click(event);assert.equal(stopped,true);
 assert.equal(markers.length,5,'Opening the map marker reveals five geographic labels');
 markers.find(m=>m.icon.html.textContent==='郵政物流').icon.html.events.click(event);
 assert.ok(get('map-drill').children.some(n=>n.textContent==='目前查看：A7站重劃區-郵政物流'));
 get('map-drill').children.find(n=>n.textContent==='返回行政區地圖').events.click(event);
 assert.equal(markers.length,1);assert.equal(markers[0].icon.html.textContent,'A7 重劃區｜點開');
 const selection=get('map-selection').textContent;mapEvents.click({latlng:{lng:119,lat:24}});assert.equal(get('map-selection').textContent,selection,'Sea clicks do not select arbitrary district');
 const catalog=run('RedevelopmentAreas');assert.equal(new Set(catalog.map(p=>p.id)).size,catalog.length);
 const districtCounts=new Map();for(const p of catalog){assert.equal(new URL(p.source).protocol,'https:');assert.ok(['development','established','planned'].includes(p.type));for(const d of [...p.districts,...p.relatedDistricts||[]]){assert.ok(geo.features.some(f=>f.properties.city===p.city&&f.properties.district===d));const k=`${p.city}/${d}`;districtCounts.set(k,(districtCounts.get(k)||0)+1);}}
 for(const [key,count] of districtCounts){const [c,d]=key.split('/');
   context.testCity=c;context.testDistrict=d;run('RegionMap.render(testCity,testDistrict,scopes)');
   assert.equal(markers.length,count,`${c}${d} has clickable redevelopment entries`);
   markers[0].icon.html.events.click(event);
   assert.ok(get('map-drill').children.some(n=>n.textContent==='查看區域分類來源'));
   assert.ok(get('map-drill').children.some(n=>n.textContent.includes('建案資料尚未接入')));
   get('map-drill').children.find(n=>n.textContent==='返回行政區地圖').events.click(event);
   assert.ok(get('map-drill').hidden,'Back closes place details without leaving stale selection');
 }
 assert.equal(get('catalog-audit').children.filter(n=>n.textContent.includes('：')).length,61,'Every northern district appears in coverage audit');
 run("RegionMap.render('臺北市','士林區',scopes)");get('place-type').value='established';get('place-type').events.change();assert.equal(markers.length,7,'Seven official Shilin subdistricts, not seven redevelopment zones');
 get('place-type').value='planned';get('place-type').events.change();assert.equal(markers.length,1);assert.match(markers[0].icon.html.textContent,/社子島/);
 get('place-type').value='development';get('place-type').events.change();assert.ok(markers.some(m=>m.icon.html.textContent.includes('北士科')&&m.icon.html.textContent.includes('鄰近關聯')));
 assert.equal(catalog.filter(p=>p.id==='beitou-shilin').length,1,'Related district entry must not duplicate the underlying area');
 get('place-type').value='all';get('place-type').events.change();run("RegionMap.render('新北市','新店區',scopes)");
 assert.equal(markers.filter(m=>m.icon.html.textContent.includes('大坪林')).length,2,'Station life area and historical legal redevelopment area stay distinct');
 run("RegionMap.render('新北市','烏來區',scopes)");assert.match(get('catalog-coverage').textContent,/未收錄不代表不存在/);
 get('place-type').value='established';get('place-type').events.change();run("RegionMap.render('新北市','泰山區',scopes)");
 assert.equal(get('place-type').value,'all','Changing districts resets hidden category filters');
 assert.ok(markers.some(m=>m.icon.html.textContent==='塭仔圳（新莊／泰山）｜點開'));
 context.feature={type:'Feature',properties:{verification:'verified',city:'新北市',district:'汐止區',name:'Test',source_url:'https://example.org/boundary',checked_at:'2026-10-25'},geometry:{type:'Polygon',coordinates:[[[121,25],[121.01,25],[121.01,25.01],[121,25]]]}};
 assert.equal(run('RegionMap.validLife(feature)'),true);context.feature.properties.verification='estimated';assert.equal(run('RegionMap.validLife(feature)'),false);context.feature.properties.verification='verified';context.feature.geometry.coordinates[0].pop();assert.equal(run('RegionMap.validLife(feature)'),false);
 const html=fs.readFileSync(path.join(__dirname,'site/index.html'),'utf8');assert.ok(!html.includes('unsafe-inline'));assert.ok(html.includes('content="no-referrer"'));assert.ok(!html.includes('src="map.js'));
 console.log('PASS: nationwide road map selection, opt-in only, verified-boundary validation, unchanged strict CSP.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
