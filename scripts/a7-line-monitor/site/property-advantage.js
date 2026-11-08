"use strict";
const PropertyAdvantage=(()=>{
  const day=86400000;
  const eligibleRoom=/(?:^|[,，、/／\s])(?:[23二三](?:\s*[~～-]\s*[23二三])?)\s*房/;
  const meter=km=>km<.01?"不到 10 公尺":`約 ${Math.round(km*100)*10} 公尺`;
  const locationCache=new WeakMap();
  let pending,context,stations=[];
  function load(){
    return pending??=Promise.all([
      TaiwanContext.load().catch(()=>null),
      fetch("advantage-rail.json",{signal:AbortSignal.timeout(8000)}).then(r=>{
        if(!r.ok)throw Error("station source");return r.json();
      }).catch(()=>null)
    ]).then(([poi,rail])=>{
      context=poi;
      if(rail?.schema_version===1&&Array.isArray(rail.stations))stations=rail.stations.filter(s=>
        typeof s.name==="string"&&s.name&&Number.isFinite(s.lat)&&Number.isFinite(s.lon)&&s.lat>=21&&s.lat<=27&&s.lon>=118&&s.lon<=124);
    });
  }
  function locationEvidence(project,point){
    if(locationCache.has(project))return locationCache.get(project);
    const nearby=TaiwanContext.nearby(context.places,point);
    const service=nearby.find(({place,km})=>["retail","medical"].includes(place[1])&&km<=1.2);
    const jobs=nearby.find(({place,km})=>place[1]==="jobs"&&km<=2);
    let rail=null;
    for(const s of stations){
      if(Math.abs(s.lat-point[0])>.008||Math.abs(s.lon-point[1])>.009)continue;
      const km=TaiwanContext.distance(point,[s.lat,s.lon]);
      if(km<=.8&&(!rail||km<rail.km))rail={name:s.name,km};
    }
    const evidence=service&&(rail||jobs)?{rail,jobs,service}:null;
    locationCache.set(project,evidence);return evidence;
  }
  function evaluate(project){
    if(!context||!eligibleRoom.test(String(project.layout||"").normalize("NFKC")))return null;
    const point=LiveProjects.location(project),price=NationalMarket.comparableOffer(project);
    if(!point||!price||price.high>price.mean||price.count<20||
      !(Date.parse(price.last)-Date.parse(price.first)>=45*day)||(price.kind==="presale"&&!(price.peers>=3)))return null;
    const evidence=locationEvidence(project,point);
    if(!evidence)return null;
    const {rail,jobs,service}=evidence,anchor=rail||{name:jobs.place[3],km:jobs.km};
    return {price,anchor:anchor.name,reasons:[
      `價格｜開價上緣 ${price.high} 萬元／坪，不高於${price.scope}同類成交均價 ${price.mean.toFixed(2)} 萬元／坪。`,
      `成交｜${price.count} 筆${price.label}實登，${price.first} 至 ${price.last}${price.peers===null?"":`；另有 ${price.peers} 個建案各至少 3 筆`}。`,
      "產品｜來源列有兩房或三房規劃，實際在售戶別與總價待核對。",
      `區位｜距${rail?"軌道站":"產業園區"} ${anchor.name} ${meter(anchor.km)}，距 ${service.place[3]} ${meter(service.km)}（均為直線距離）。`
    ]};
  }
  return {load,evaluate};
})();
