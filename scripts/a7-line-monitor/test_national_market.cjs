const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
class Element{
  constructor(tag){this.tag=tag;this.children=[];this.events={};this.value="";}
  append(...n){this.children.push(...n);}
  replaceChildren(...n){this.children=n;}
  setAttribute(k,v){this[k]=v;}
  addEventListener(k,f){this.events[k]=f;}
  click(){this.events.click?.();}
}
const ids=new Map(),get=id=>{if(!ids.has(id))ids.set(id,new Element("div"));return ids.get(id);};
const text=n=>(n.textContent||"")+n.children.map(text).join(" ");
const data=JSON.parse(fs.readFileSync(path.join(__dirname,"site/national-market.json"),"utf8"));
const features=JSON.parse(fs.readFileSync(path.join(__dirname,"site/districts.geojson"),"utf8")).features;
const context=vm.createContext({document:{getElementById:get,createElement:t=>new Element(t)},
  fetch:async url=>{assert.equal(url,"national-market.json");return {ok:true,json:async()=>data};},AbortSignal});
vm.runInContext(fs.readFileSync(path.join(__dirname,"site/national-market.js"),"utf8"),context);
const national=vm.runInContext("NationalMarket",context);
(async()=>{
  let request;
  await national.configure(features,q=>request=q);
  assert.equal(get("national-city").children.length,22);
  get("national-city").value="高雄市";get("national-city").events.change();
  assert.equal(get("national-district").children.length,39);
  get("national-district").value="左營區";get("national-view").click();
  assert.equal(request.city,"高雄市");assert.equal(request.district,"左營區");
  const district=national.districtPanel(request,()=>{});
  assert.match(text(district),/行政區｜新成屋均價/);
  assert.ok(data.districts["高雄市/左營區"].filings.length);
  const all=national.districtPanel({},()=>{});
  assert.match(text(all),/近一年新建案/);
  assert.match(text(all),/查看備查詳情/);
  const linked=new Set([...data.areas.a8.filings,...data.areas.a8.nearby]);
  assert.ok(linked.size);
  const a8=text(national.areaPanel("a8",{city:"桃園市",district:"龜山區"},()=>{}));
  assert.match(a8,/不顯示均價/);assert.doesNotMatch(a8,/行政區｜新成屋均價/);
  const a9=text(national.areaPanel("a9",{city:"新北市",district:"林口區"},()=>{}));
  assert.match(a9,/萬元／坪/);assert.match(a9,/500 公尺/);
  const unknown=text(national.districtPanel({place:"unverified",city:"高雄市",district:"左營區"},()=>{}));
  assert.match(unknown,/不能用行政區平均代替/);
  console.log("PASS: nationwide picker, district data, filing details, scope prices and no misleading fallback.");
})().catch(e=>{console.error(e);process.exitCode=1;});
