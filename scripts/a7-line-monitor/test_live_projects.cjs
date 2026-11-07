const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
class Element{
  constructor(tag){this.tag=tag;this.children=[];this.events={};this.value="";}
  append(...n){this.children.push(...n);}
  replaceChildren(...n){this.children=n;}
  setAttribute(k,v){this[k]=v;}
  addEventListener(k,f){this.events[k]=f;}
}
const text=n=>(n.textContent||"")+n.children.map(text).join(" ");
const base={name:"測試案",city:"桃園市",district:"龜山區",circle:"長庚生活圈",source:"591新建案",source_updated:new Date().toISOString().slice(0,10),verified_on:new Date().toISOString().slice(0,10),url:"https://newhouse.591.com.tw/123",category:"active",coordinates:[121.5,25.1]};
const data={schema_version:1,observed_at:new Date().toISOString(),regions:{6:{city:"桃園市",status:"indexed"}},projects:[base,{...base,name:"預推案",category:"listed_pending",url:"https://newhouse.591.com.tw/124"},{...base,category:"completed"},{...base,url:"https://evil.com/123"}]};
const context=vm.createContext({document:{createElement:t=>new Element(t)},URL,Date,AbortSignal,
  fetch:async url=>{assert.equal(url,"national-listings.json");return {ok:true,json:async()=>data};}});
vm.runInContext(fs.readFileSync(path.join(__dirname,"site/live-projects.js"),"utf8"),context);
const live=vm.runInContext("LiveProjects",context);
(async()=>{
  await live.load();assert.equal(live.count(),2);assert.equal(live.count({district:"林口區"}),0);
  assert.equal(live.url("https://secret@newhouse.591.com.tw/123"),"");assert.equal(live.url("https://newhouse.591.com.tw/123?key=secret"),"");
  const polygon={type:"Polygon",coordinates:[[[121,25],[122,25],[122,26],[121,26],[121,25]]]};
  assert.ok(live.inside([121.5,25.1],polygon));assert.ok(!live.inside([120.5,25.1],polygon));
  assert.equal(live.count({geometry:polygon}),2);
  const panel=live.panel({district:"龜山區"});assert.match(text(panel),/開啟建案頁/);assert.match(text(panel),/2 案/);
  const controls=panel.children.find(e=>e.className==="live-filters");
  controls.children[0].value="pending";controls.children[0].events.change();assert.match(text(panel),/符合 1 案/);
  controls.children[1].value="長庚生活圈";controls.children[1].events.change();assert.match(text(panel),/不以行政區均價代替/);
  controls.children[2].value="找不到";controls.children[2].events.input();assert.match(text(panel),/符合 0 案/);
  data.observed_at="2020-01-01";assert.equal(live.count(),0);assert.match(text(live.panel()),/超過 8 天/);
  console.log("PASS: live links, explicit source stages, geo containment, circle and search filters, no stale fallback.");
})().catch(e=>{console.error(e);process.exitCode=1;});
