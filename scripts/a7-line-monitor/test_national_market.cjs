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
  assert.match(text(district),/左營區｜成交均價/);
  assert.match(text(district),/新成屋成交均價/);
  assert.match(text(district),/預售屋成交均價/);
  assert.match(text(district),/各建案預售成交/);
  assert.ok(data.districts["高雄市/左營區"].filings.length);
  const all=national.districtPanel({},()=>{});
  assert.match(text(all),/近一年備查與首次登記紀錄/);
  assert.match(text(all),/查看備查詳情/);
  const linked=new Set([...data.areas.a8.filings,...data.areas.a8.nearby]);
  assert.ok(linked.size);
  const a8=text(national.areaPanel("a8",{city:"桃園市",district:"龜山區"},()=>{}));
  assert.match(a8,/不顯示均價/);assert.match(a8,/龜山區行政區參考（非本圖框均價）/);
  if(data.areas.a8.presale_price.mean!==null){
    assert.ok(a8.includes(data.areas.a8.presale_price.mean.toFixed(2)+" 萬元／坪"));
  }
  const a9=text(national.areaPanel("a9",{city:"新北市",district:"林口區"},()=>{}));
  assert.match(a9,/萬元／坪/);assert.match(a9,/500 公尺/);
  const board=national.areaPanel("a9",{city:"新北市",district:"林口區"},()=>{}).children[0];
  const hasLink=e=>e.tag==="a"||e.children.some(hasLink);
  assert.equal(hasLink(board),false,"Prices are visible without navigating away");
  const unknown=text(national.districtPanel({place:"unverified",city:"高雄市",district:"左營區"},()=>{}));
  assert.match(unknown,/不能用行政區平均代替/);
  vm.runInContext(fs.readFileSync(path.join(__dirname,"site/live-projects.js"),"utf8"),context);
  const boundary=(id,name,x)=>({id,name,geometry:{type:"Polygon",coordinates:[[[x,25],[x+.01,25],[x+.01,25.1],[x,25.1],[x,25]]]}});
  const scopes=[boundary("a8","A8 長庚生活圈",121.36),boundary("a9","A9 林口站生活圈",121.38)];
  const pinA9={city:"新北市",district:"林口區",coordinates:[121.385,25.05],verified_on:"2026-11-07"};
  const exact=text(national.projectBenchmark(pinA9,scopes));
  assert.match(exact,/A9 林口站生活圈 · 圖框內/);
  assert.doesNotMatch(exact,/A8 長庚|行政區參考/);
  assert.ok(exact.includes(data.areas.a9.price.mean.toFixed(2)));
  const pinA8={city:"桃園市",district:"龜山區",coordinates:[121.365,25.05],verified_on:"2026-11-07"};
  const fallback=text(national.projectBenchmark(pinA8,scopes));
  assert.match(fallback,/A8 長庚生活圈：圖框內樣本不足/);assert.match(fallback,/龜山區 · 行政區參考/);
  assert.ok(fallback.includes(data.districts["桃園市/龜山區"].price.mean.toFixed(2)));
  assert.doesNotMatch(text(national.projectBenchmark({...pinA9,coordinates:null},scopes)),/圖框內/);
  const today=new Date().toISOString().slice(0,10),sample={mean:50,count:10,first:today,last:today};
  data.districts["新北市/林口區"].presale_price=sample;
  data.districts["新北市/林口區"].presale_projects=[{name:"甲案",count:3,last:today},{name:"甲 案",count:4,last:today},
    {name:"測試案",count:30,last:today},{name:"乙案",count:2,last:today},{name:"丙案",count:5,last:"2020-01-01"}];
  data.districts["新北市/林口區"].price={...sample,mean:60};
  const offer={...pinA9,verified_on:today,source_updated:today,name:"測試案",property_style:"住宅大樓",price_unit:"萬/坪",price:"36~40",category:"active"};
  assert.equal(national.priceComparison(offer).discount.toFixed(1),"20.0");
  assert.equal(national.priceComparison(offer).kind,"presale");
  assert.equal(national.comparableOffer(offer).peers,1);
  assert.equal(national.comparableOffer({...offer,price:"48~49"}).high,49,"Offers above the red/blue cutoff can still be compared");
  assert.match(national.priceComparison(offer).scope,/行政區/);
  assert.equal(national.priceComparison({...offer,price:"36~41"}),null,"Do not mark the low end alone");
  assert.equal(national.priceComparison({...offer,price:"36~41",category:"new_home"}).mean,60);
  assert.equal(national.priceComparison({...offer,category:"new_home"}).kind,"completed");
  for(const change of [{category:"sold_out"},{category:"listed_presale"},{category:"pending"},{category:"listed_pending"},{price:"39起"},{price:"待定"},
    {price_unit:"萬/戶"},{verified_on:"2020-01-01"},{source_updated:"2020-01-01"},{name:"透天測試"},{property_style:""}])assert.equal(national.priceComparison({...offer,...change}),null);
  national.setComparisonScopes(scopes);
  data.areas.a9.presale_price={...sample,mean:55,count:9};
  assert.match(national.priceComparison(offer).scope,/行政區/);
  data.areas.a9.presale_price={...sample,mean:55};
  assert.match(national.priceComparison(offer).scope,/A9 林口站生活圈圖框內/);
  data.areas.a9.presale_price={...sample,mean:45};
  assert.equal(national.priceComparison(offer),null,"Do not shop for a higher benchmark after choosing a supported local scope");
  console.log("PASS: nationwide picker, district data, filing details, scope prices and no misleading fallback.");
})().catch(e=>{console.error(e);process.exitCode=1;});
