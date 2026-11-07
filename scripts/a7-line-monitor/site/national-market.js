"use strict";
const NationalMarket = (() => {
  const $ = id => document.getElementById(id);
  const text = (tag, value) => { const n=document.createElement(tag); n.textContent=value; return n; };
  const button = (label, run) => {
    const b=text("button",label); b.type="button"; b.className="atlas-secondary";
    b.addEventListener("click",run); return b;
  };
  let data, pending, failed=false;

  function load(){
    if(!pending)pending=(async()=>{
      try{
        const r=await fetch("national-market.json",{signal:AbortSignal.timeout(12000)});
        if(!r.ok)throw Error("national");
        const body=await r.json();
        if(body.schema_version!==1||!body.districts||!body.areas||!body.filings||!body.sale_period)throw Error("schema");
        data=body;
      }catch{failed=true;}
      if(typeof LiveProjects!=="undefined")await LiveProjects.load();
    })();
    return pending;
  }
  function note(){
    const a=text("a","資料來源與均價算法");
    a.href="NATIONAL-SOURCES.md";a.target="_blank";a.rel="noopener noreferrer";
    return a;
  }
  function status(){
    const p=text("p",failed?"成交與備查資料讀取失敗，不影響建案標記。":"正在讀取官方成交與備查資料…");
    p.setAttribute("role","status");return p;
  }
  const enough=price=>Number.isFinite(price?.mean)&&price.count>=5;
  const unitPrice=price=>price.mean.toFixed(2)+" 萬元／坪";
  const priceTypes=[["price","新成屋","成交時屋齡 5 年內"],["presale_price","預售屋","依預售契約成交登錄"]];
  function priceBoard(scope={},title,reference=false){
    const box=text("section","");box.className="national-price"+(reference?" national-price-reference":"");
    box.append(text("h3",title));
    const grid=text("div","");grid.className="national-price-grid";
    for(const [key,label,description] of priceTypes){
      const metric=text("div","");metric.className="national-price-metric";
      const price=scope[key];
      metric.append(text("h4",label+"成交均價"));
      if(enough(price)){
        metric.append(text("strong",unitPrice(price)),text("p",`${price.count.toLocaleString("zh-TW")} 筆 · ${price.first} 至 ${price.last}`));
      }else{
        metric.append(text("p",price?.count?`樣本不足（${price.count} 筆），不顯示均價。`:"無足夠合格或可定位樣本，不顯示均價。"));
      }
      if(!reference)metric.append(text("small",description+(key==="presale_price"&&scope.presale_projects?.length?` · ${scope.presale_projects.length} 案`:"")));
      grid.append(metric);
    }
    box.append(grid);
    if(!reference){
      const method=text("details","");method.className="national-price-method";
      method.append(text("summary","樣本期間與統計口徑"),
        text("p","來源：內政部實價登錄。成交價扣除車位，按面積加權，至少 5 筆才計均價；不是待售開價。"),
        text("p",`新成屋登記批次：${data.sale_period.registration_from} 至 ${data.sale_period.registration_to}。`));
      if(data.presale_period)method.append(text("p",`預售屋契約批次：${data.presale_period.from} 至 ${data.presale_period.to}，排除解約。`));
      box.append(method);
    }
    return box;
  }
  function benchmark(box,scope,{city,district}){
    const reference=data.districts[`${city}/${district}`];
    if(reference&&(!enough(scope?.price)||!enough(scope?.presale_price))&&(enough(reference.price)||enough(reference.presale_price))){
      box.append(priceBoard(reference,`${district}行政區參考（非本圖框均價）`,true));
    }
  }
  function projectPrices(scope){
    if(!scope?.presale_projects?.length)return null;
    const details=text("details","");details.className="national-project-prices";
    details.append(text("summary",`各建案預售成交 · ${scope.presale_projects.length} 案`));
    const list=text("dl","");
    for(const project of scope.presale_projects){
      list.append(text("dt",project.name),text("dd",enough(project)?`${unitPrice(project)} · ${project.count} 筆`:`樣本不足 · ${project.count} 筆`));
    }
    details.append(list);return details;
  }
  function marketDetails(){
    const box=text("details","");box.className="atlas-source-notes";
    box.append(text("summary","成交均價與各案實登"));return box;
  }
  function listing(ids, title, districtById=new Map()){
    const section=text("section","");section.className="national-list";
    section.append(text("h3",title+" · "+ids.length+" 筆"));
    const list=text("div","");section.append(list);
    let shown=0;
    const more=button("顯示更多建案",()=>add());
    function add(){
      for(const id of ids.slice(shown,shown+12)){
        const p=data.filings[id];if(!p)continue;
        const card=text("article","");card.className="atlas-project-card national-filing";
        const badge=text("span",p.registered?"已首次登記":"已備查 · 銷售狀態待核對");
        badge.className="badge";card.append(badge,text("h4",p.name));
        if(districtById.has(id))card.append(text("p",districtById.get(id)));
        card.append(text("p",p.address||p.land||"基地位置未提供"));
        card.append(text("small",p.registered?"首次登記 "+p.registered:"備查 "+(p.filed||"日期未提供")));
        const detail=text("details","");
        detail.append(text("summary","查看備查詳情"),
          text("p","起造人："+(p.builder||"未提供")),
          text("p","建照："+(p.permit||"未提供")),
          text("p","基地："+(p.land||"未提供")),
          text("p","申報銷售期間："+(p.selling_period||"未提供")),
          text("small","備查申報期間不是即時銷售狀態；此紀錄未提供已核實的建案官網連結。"));
        card.append(detail);
        list.append(card);
      }
      shown+=12;more.hidden=shown>=ids.length;
    }
    section.append(more);add();return section;
  }
  const newest = id => data.filings[id].registered || data.filings[id].filed || "";
  const ordered = ids => [...ids].sort((a,b)=>newest(b).localeCompare(newest(a)));
  function headerNote(){
    return text("p","內政部公開備查／首次登記 "+data.filing_since+" 起；資料查核 "+data.checked_on+"。備查不等於已開賣，未列入不代表沒有新案。");
  }
  function districtPanel({city="",district="",place="",title="",geometry,onLocate},open){
    const box=text("div","");
    if(typeof LiveProjects!=="undefined")box.append(LiveProjects.panel({city,district,geometry,onLocate}));
    if(!data){box.append(status());return box;}
    if(place){
      const area=data.areas["official:"+place];
      const prices=marketDetails();
      if(area){
        prices.append(priceBoard(area,"圖框內｜已定位成交"));
        benchmark(prices,area,{city,district});
        const projects=projectPrices(area);if(projects)prices.append(projects);
      }else{
        prices.append(text("p","此生活圈尚無已核對的範圍或成交定位，不能用行政區平均代替。"));
        benchmark(prices,null,{city,district});
      }
      box.append(prices);
      if(area?.filings.length){
        const registry=text("details","");registry.append(text("summary","官方備查紀錄"),listing(area.filings,"圖框內對應建案"));box.append(registry);
      }
      box.append(button("改看 "+district+" 的建案與均價",()=>open({city,district})),note());
      return box;
    }
    const districts=Object.entries(data.districts).filter(([key])=>!city||(district?key===city+"/"+district:key.startsWith(city+"/")));
    const scope=district?districts[0]?.[1]:city?data.cities?.[city]:data.national;
    if(scope){
      const prices=marketDetails();prices.append(priceBoard(scope,`${district||city||"全台"}｜成交均價`));
      const projects=projectPrices(scope);if(projects)prices.append(projects);box.append(prices);
    }
    const byId=new Map(districts.flatMap(([key,d])=>d.filings.map(id=>[id,key.replace("/"," ")])));
    const registry=text("details","");registry.append(text("summary","官方備查／首次登記（不是銷售清單）"),headerNote());box.append(registry);
    if(byId.size)registry.append(listing(ordered(byId.keys()),title||"近一年備查與首次登記紀錄",byId));
    else box.append(text("p",districts.some(([,d])=>d.registry)?"此區在本次官方檔案沒有符合期間的建案。":"本次官方備查檔未提供此區資料。"));
    box.append(note());return box;
  }
  function areaPanel(id, district, open, geometry,onLocate){
    const box=text("div","");
    if(typeof LiveProjects!=="undefined")box.append(LiveProjects.panel({...district,geometry,onLocate}));
    if(!data){box.append(status());return box;}
    const area=data.areas[id];
    const prices=marketDetails();prices.append(priceBoard(area,"圖框內｜已定位成交"));
    benchmark(prices,area,district);
    const projects=projectPrices(area);if(projects)prices.append(projects);
    const expanded={price:area?.nearby_price,presale_price:area?.nearby_presale_price};
    if(priceTypes.some(([key])=>expanded[key]?.count>0&&expanded[key].count!==area[key]?.count)){
      const nearby=text("details","");nearby.className="atlas-source-notes";
      nearby.append(text("summary","查看含外擴 500 公尺的成交參考"),priceBoard(expanded,"含圖框及外擴 500 公尺"));
      prices.append(nearby);
    }
    box.append(button("看 "+district.district+" 全部新建案",()=>open(district)),prices);
    const registry=text("details","");registry.append(text("summary","官方備查／首次登記（不是銷售清單）"),headerNote());
    if(area?.filings.length)registry.append(listing(ordered(area.filings),"圖框內對應建案"));
    if(area?.nearby?.length)registry.append(listing(ordered(area.nearby),"圖框外 500 公尺內的周邊建案"));
    if(area?.filings.length||area?.nearby?.length)registry.append(text("small","按備查門牌或附近門牌比對，不是基地界址。"));
    if(!area?.filings.length&&!area?.nearby?.length)registry.append(text("p","本次沒有能對到此範圍的備查位置，仍可查整個行政區。"));
    box.append(registry,note());
    return box;
  }
  function count(id){const a=data?.areas[id];return (a?.filings?.length||0)+(a?.nearby?.length||0);}
  function configure(features, open){
    const city=$("national-city"),district=$("national-district");
    const groups=new Map();
    for(const {properties:p} of features){
      if(!groups.has(p.city))groups.set(p.city,[]);
      groups.get(p.city).push(p.district);
    }
    const option=(label,value)=>{const o=text("option",label);o.value=value;return o;};
    for(const c of [...groups.keys()].sort((a,b)=>a.localeCompare(b,"zh-Hant")))city.append(option(c,c));
    city.addEventListener("change",()=>{
      district.replaceChildren(option("全縣市",""));
      for(const d of groups.get(city.value)||[])district.append(option(d,d));
      district.disabled=!city.value;
    });
    $("national-view").addEventListener("click",()=>open({city:city.value,district:city.value?district.value:""}));
    $("national-view").disabled=false;
    return load();
  }
  return {configure,load,areaPanel,districtPanel,count};
})();
