const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
class Element{
  constructor(tag){this.tag=tag;this.children=[];this.events={};this.value="";}
  append(...n){this.children.push(...n);}
  replaceChildren(...n){this.children=n;}
  setAttribute(k,v){this[k]=v;}
  addEventListener(k,f){this.events[k]=f;}
}
const text=n=>(n.textContent||"")+n.children.map(text).join(" ");
const descendants=n=>[n,...n.children.flatMap(descendants)];
const base={id:"a",name:"測試案",city:"桃園市",district:"龜山區",circle:"長庚生活圈",source:"591新建案",source_updated:new Date().toISOString().slice(0,10),verified_on:new Date().toISOString().slice(0,10),url:"https://newhouse.591.com.tw/123",category:"active",coordinates:[121.5,25.1]};
const data={schema_version:1,observed_at:new Date().toISOString(),regions:{6:{city:"桃園市",status:"indexed"}},projects:[base,{...base,id:"b",name:"預推案",category:"listed_pending",url:"https://newhouse.591.com.tw/124"},{...base,category:"completed"},{...base,url:"https://evil.com/123"}]};
const homes={schema_version:1,observed_at:data.observed_at,regions:{},projects:[]};
const price={discount:24,scope:"龜山區行政區",high:38,mean:50,count:20,first:"2026-01-01",last:"2026-08-01"};
const markers=[],status=new Element("p"),events={},opened=[];
const L={layerGroup:()=>({addTo(){return this;},clearLayers(){markers.length=0;}}),divIcon:o=>o,
  marker:(position,options)=>({addTo(){markers.push({position,...options});}})};
const map={createPane:()=>({style:{}}),getBounds:()=>({pad(){return this;},contains:()=>true}),
  project:([lat,lng])=>({x:lng*10000,y:lat*10000}),on:(name,run)=>events[name]=run,getZoom:()=>14,
  fitBounds(){throw Error("Single or coincident projects must not recenter the map");}};
const context=vm.createContext({document:{createElement:t=>new Element(t),getElementById:()=>status},URL,Date,AbortSignal,L,
  NationalMarket:{priceComparison:p=>p.id==="a"?{...price,kind:"presale",label:"預售屋"}:
    p.id==="home"?{...price,kind:"completed",label:"新成屋"}:null},
  fetch:async url=>{assert.ok(["national-listings.json","national-new-homes.json"].includes(url));return {ok:true,json:async()=>url.includes("new-homes")?homes:data};}});
vm.runInContext(fs.readFileSync(path.join(__dirname,"site/live-projects.js"),"utf8"),context);
const live=vm.runInContext("LiveProjects",context);
(async()=>{
  await live.load();assert.equal(live.count(),2);assert.equal(live.count({district:"林口區"}),0);
  assert.equal(live.url("https://secret@newhouse.591.com.tw/123"),"");assert.equal(live.url("https://newhouse.591.com.tw/123?key=secret"),"");
  const polygon={type:"Polygon",coordinates:[[[121,25],[122,25],[122,26],[121,26],[121,25]]]};
  assert.ok(live.inside([121.5,25.1],polygon));assert.ok(!live.inside([120.5,25.1],polygon));
  assert.equal(live.count({geometry:polygon}),2);
  let selected;
  const panel=live.panel({district:"龜山區",onProject:p=>selected=p});assert.match(text(panel),/查看建案資料/);assert.match(text(panel),/2 案/);
  const action=descendants(panel).find(e=>e["aria-label"]==="查看建案資料：測試案");action.events.click();assert.equal(selected.id,"a");
  assert.ok(!descendants(panel).some(e=>e.tag==="a"),"Listings do not send users to external project pages");
  const benchmark=new Element("section");benchmark.textContent="區域新成屋均價 45.27";
  const inspection=live.selectionPanel([{...base,layout:"二房",area:"25坪",opening:"2026年07月",completion:"預計2029年第三季度"}],{benchmark});
  assert.match(text(inspection),/區域新成屋均價 45.27/);assert.match(text(inspection),/二房.*25坪.*2026年07月.*預計2029年第三季度/);
  assert.match(text(inspection),/預售↓ 24.0%.*公開開價上緣 38.*成交均價 50.00/);
  assert.ok(descendants(inspection).some(e=>e.className==="price-watch price-watch-presale"));
  assert.ok(!descendants(inspection).some(e=>e.tag==="a"),"Project details and benchmark render without external links");
  const controls=panel.children.find(e=>e.className==="live-filters");
  controls.children[0].value="pending";controls.children[0].events.change();assert.match(text(panel),/符合 1 案/);
  controls.children[1].value="長庚生活圈";controls.children[1].events.change();assert.match(text(panel),/不以行政區均價代替/);
  controls.children[2].value="找不到";controls.children[2].events.input();assert.match(text(panel),/符合 0 案/);
  data.projects.push({...base,id:"c",name:"第二個標記",url:"https://newhouse.591.com.tw/125",coordinates:[121.51,25.1]},
    {...base,id:"unknown",name:"無座標的案",url:"https://newhouse.591.com.tw/126",coordinates:null});
  const pins=live.mountMap(map,rows=>{opened.push(rows.map(p=>p.id).join(","));pins.select(rows);});
  await live.load();
  assert.equal(markers.length,2,"Two coincident projects share a marker; missing coordinates never produce a pin");
  assert.match(status.textContent,/3 案有定位/);
  assert.match(markers[0].icon.html["aria-label"],/其中 預售價差 1 案/);
  assert.equal(markers[0].icon.html.children[0].textContent,"預售↓");
  assert.equal(markers[1].icon.html.children.length,0);
  let stopped=0;
  for(const {icon} of markers)icon.html.events.click({stopPropagation(){stopped++;}});
  assert.deepEqual(opened,["a,b","c"],"Second marker opens directly, without closing the first");
  assert.equal(stopped,2,"Project clicks do not bubble to district selection");
  assert.equal(markers[1].icon.html["aria-pressed"],"true");
  events.moveend();assert.equal(markers[1].icon.html["aria-pressed"],"true");
  homes.projects.push({...base,id:"home",category:"new_home",url:"https://newhouse.591.com.tw/127"},
    {...base,id:"unverified-home",category:"listed_new_home",url:"https://newhouse.591.com.tw/128"});
  assert.equal(live.count(),5);assert.match(text(live.panel()),/在售新成屋/);
  assert.ok(descendants(live.selectionPanel([homes.projects[0]])).some(e=>e.className==="price-watch price-watch-completed"));
  pins.refresh();
  assert.deepEqual(markers[0].icon.html.children.map(e=>e.textContent),["低","預售↓"]);
  assert.match(markers[0].icon.html["aria-label"],/成屋價差 1 案、預售價差 1 案/);
  data.observed_at=homes.observed_at="2020-01-01";assert.equal(live.count(),0);assert.match(text(live.panel()),/超過 8 天/);
  events.moveend();assert.equal(markers.length,0);
  console.log("PASS: map pins, clustering, direct selection, no fake coordinates, live links, filters and no stale fallback.");
})().catch(e=>{console.error(e);process.exitCode=1;});
