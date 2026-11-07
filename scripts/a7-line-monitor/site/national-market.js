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
        if(typeof LiveProjects!=="undefined")await LiveProjects.load();
      }catch{failed=true;}
    })();
    return pending;
  }
  function note(){
    const a=text("a","資料來源與均價算法");
    a.href="NATIONAL-SOURCES.md";a.target="_blank";a.rel="noopener noreferrer";
    return a;
  }
  function status(){
    const p=text("p",failed?"全台資料讀取失敗，請重新整理。不顯示成 0 案。":"正在讀取全台官方資料…");
    p.setAttribute("role","status");return p;
  }
  function priceCard(price, scope){
    const box=text("section","");box.className="national-price";
    box.append(text("h3",scope+"｜新成屋均價"));
    if(Number.isFinite(price?.mean)&&price.count>=5){
      box.append(text("strong",price.mean.toFixed(2)+" 萬元／坪"),
        text("p",price.count+" 筆 · 交易日 "+price.first+" 至 "+price.last));
    }else{
      box.append(text("p",price?.count?("僅 "+price.count+" 筆合格樣本，不顯示均價。"):"無足夠合格或可定位樣本，不顯示均價。"));
    }
    box.append(text("small","成交時屋齡 5 年內 · 扣車位 · 按面積加權"),
      text("small","登記批次 "+data.sale_period.registration_from+" 至 "+data.sale_period.registration_to),note());
    return box;
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
  function districtPanel({city="",district="",place="",title="",geometry},open){
    const box=text("div","");if(!data){box.append(status());return box;}
    if(place){
      const area=data.areas["official:"+place];
      if(area){
        box.append(priceCard(area.price,"圖框內已定位成交"));
        if(area.filings.length)box.append(listing(area.filings,"圖框內對應建案"));
        else box.append(text("p","本次沒有能定位到圖框內的備查建案；不等於沒有建案。"));
      }else box.append(text("p","此生活圈尚無已核對的範圍或成交定位，不能用行政區平均代替。"));
      box.append(button("改看 "+district+" 的建案與均價",()=>open({city,district})),note());
      if(typeof LiveProjects!=="undefined")box.append(LiveProjects.panel({city,district,geometry}));
      return box;
    }
    const districts=Object.entries(data.districts).filter(([key])=>!city||(district?key===city+"/"+district:key.startsWith(city+"/")));
    if(district)box.append(priceCard(districts[0]?.[1].price,"行政區"));
    if(typeof LiveProjects!=="undefined")box.append(LiveProjects.panel({city,district}));
    const byId=new Map(districts.flatMap(([key,d])=>d.filings.map(id=>[id,key.replace("/"," ")])));
    const registry=text("details","");registry.append(text("summary","官方備查／首次登記（不是銷售清單）"),headerNote());box.append(registry);
    if(byId.size)registry.append(listing(ordered(byId.keys()),title||"近一年備查與首次登記紀錄",byId));
    else box.append(text("p",districts.some(([,d])=>d.registry)?"此區在本次官方檔案沒有符合期間的建案。":"本次官方備查檔未提供此區資料。"));
    box.append(note());return box;
  }
  function areaPanel(id, district, open, geometry){
    const box=text("div","");
    if(!data){box.append(status());return box;}
    const area=data.areas[id];
    box.append(priceCard(area?.price,"圖框內已定位成交"));
    if(area?.nearby_price?.count>0&&(!area.price?.count||area.nearby_price.count!==area.price.count)){
      const nearby=text("details","");nearby.className="atlas-source-notes";
      const price=area.nearby_price;
      nearby.append(text("summary",`含外擴 500 公尺：${price.mean===null?"樣本不足":price.mean.toFixed(2)+" 萬元／坪"} · ${price.count} 筆`),priceCard(price,"含圖框及外擴 500 公尺"));
      box.append(nearby);
    }
    box.append(button("看 "+district.district+" 全部新建案",()=>open(district)));
    if(typeof LiveProjects!=="undefined")box.append(LiveProjects.panel({...district,geometry}));
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
