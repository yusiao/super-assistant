"use strict";
const StationAtlas = (() => {
  const $ = id => document.getElementById(id);
  let map, data, shapes, labels, focus = "", active = false, onNavigate=()=>{};
  let market = null, marketError = "";
  const stationButtons = new Map();
  const stages = {active:"銷售中預售",pending:"未開賣預售",sold_out:"完銷預售"};
  const colors = {a7:"#ad5929",a8:"#276b66",a9:"#3b6592"};
  const node = (tag, value) => {const n=document.createElement(tag);n.textContent=value;return n;};
  const roots = () => data.features.filter(f=>!f.properties.parent);
  const find = id => data.features.find(f=>f.properties.id===id);
  const children = id => data.features.filter(f=>f.properties.parent===id);
  function root(f){while(f.properties.parent)f=find(f.properties.parent);return f.properties.id;}
  function valid(body){
    if(body?.type!=="FeatureCollection"||!Array.isArray(body.features)||!body.features.length)return false;
    const ids=new Set();
    for(const f of body.features){
      const p=f.properties,g=f.geometry;
      if(!p?.id||ids.has(p.id)||!p.name||p.verification!=="estimated")return false;
      ids.add(p.id);
      try{if(new URL(p.source_url).protocol!=="https:")return false;}catch{return false;}
      if(!["Polygon","MultiPolygon"].includes(g?.type))return false;
      const polys=g.type==="Polygon"?[g.coordinates]:g.coordinates;
      if(!polys.length||!polys.every(poly=>poly.length&&poly.every(r=>r.length>=4&&r.every(c=>Array.isArray(c)&&c.length===2&&Number.isFinite(c[0])&&Number.isFinite(c[1])&&c[0]>120&&c[0]<123&&c[1]>24&&c[1]<26)&&r[0][0]===r.at(-1)[0]&&r[0][1]===r.at(-1)[1])))return false;
    }
    for(const f of body.features){
      const chain=new Set([f.properties.id]);let parent=f.properties.parent;
      while(parent){if(!ids.has(parent)||chain.has(parent))return false;chain.add(parent);parent=body.features.find(v=>v.properties.id===parent).properties.parent;}
    }
    return true;
  }
  function button(label, fn, cls=""){
    const b=node("button",label);b.type="button";b.className=cls;
    b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();fn();});return b;
  }
  function sourceLink(url, title){
    const safe=typeof projectLinkUrl==="function"?projectLinkUrl(url):"";
    if(!safe)return node("span","建案連結未取得");
    const a=node("a",title);a.href=safe;a.target="_blank";a.rel="noopener noreferrer";return a;
  }
  function marketScope(feature){
    const station=root(feature),areas=market?.areas||[];
    const related={"a7-post":"郵政物流","a7-centre":"中心商業區","a7-school":"文青國小"}[feature.properties.id];
    const city=station==="a9"?"新北市":"桃園市",district=station==="a9"?"林口區":"龜山區";
    const inStation=a=>a.city===city&&a.district===district&&new RegExp("^"+station.toUpperCase()+"(?:站重劃區-|周邊-|[ ·-])").test(a.name);
    const all=areas.filter(inStation);
    // A source's neighborhood classification is not a geocoded point inside the drawn polygon.
    return {related,areas:related?all.filter(a=>a.name===`A7站重劃區-${related}`):all,
      note:related?`以下為「${related}」來源分類的周邊參考，不代表基地位在此${feature.properties.kind}內。`:feature.properties.parent?
        `以下為 ${station.toUpperCase()} 周邊參考，尚未核實位於此街廓內。`:
        "按來源的區域分類列出，尚未核實基地座標；不代表每案都位於彩色框內。"};
  }
  const usable = a => ["partial","observed"].includes(a.availability);
  function projects(areas){
    const seen=new Set(),rows=[];
    for(const area of areas){
      if(!usable(area))continue;
      for(const project of area.projects||[]){
        const id=project.id||project.url||project.name;
        if(!Object.hasOwn(stages,project.category)||seen.has(id))continue;
        seen.add(id);rows.push({project,area});
      }
    }
    return rows;
  }
  function projectPanel(feature){
    const box=node("section","");box.className="atlas-project-panel";box.setAttribute("aria-label","選取範圍的建案");
    if(marketError){box.append(node("p","建案資料讀取失敗。不以舊資料補數。"),button("重新讀取",()=>$("refresh").click(),"atlas-secondary"));return box;}
    if(!market){box.append(node("p","建案資料載入中…"));return box;}
    const stamp=new Date(market.generated_at);
    const scope=marketScope(feature);
    if(!scope.areas.length){box.append(node("p","此範圍尚未接入可核對的建案資料，不代表沒有預售屋。"));return box;}
    const groups=[scope.areas.filter(a=>!a.name.includes("子區待核對")),scope.areas.filter(a=>a.name.includes("子區待核對"))];
    const rows=projects(groups.flat()),count=rows.length;
    const meta=node("p",count?`可看 ${count} 案`:(scope.areas.some(usable)?"本次無可展示建案":"本次未取得建案資料"));meta.className="atlas-list-meta";
    if(Number.isFinite(stamp.getTime()))meta.append(node("span",`資料 ${stamp.toLocaleDateString("zh-TW",{timeZone:"Asia/Taipei"})}${Date.now()-stamp.getTime()>8*86400000?" · 超過 8 天未更新":""}`));
    box.append(meta);
    for(const [index,areas] of groups.entries()){
      const shown=rows.filter(row=>areas.includes(row.area));if(!shown.length)continue;
      const section=node("div","");
      if(index)section.append(node("h5",`${root(feature).toUpperCase()} 周邊參考 · 子區待核對`));
      for(const {project:p,area} of shown){
          const card=node("article","");card.className="atlas-project-card";
          const title=node("h4",p.name),stage=node("span",stages[p.category]);stage.className=`badge ${p.category}`;
          const details=node("details","");
          details.append(node("summary","建案詳情"),node("p",p.status||"價格與銷售狀態未取得"));
          for(const s of p.sources||[])if(s.url!==p.url)details.append(sourceLink(s.url,`交叉來源：${s.name} ↗`));
          if(p.observed_at)details.append(node("small",`本次讀取：${p.observed_at.slice(0,10)}；非來源更新日。`));
          const label=node("p",area.name.replace("A7站重劃區-",""));label.className="atlas-card-location";
          const actions=node("div","");actions.className="atlas-card-actions";
          const link=sourceLink(p.url,"開啟建案頁 ↗");link.className="atlas-primary";actions.append(link);
          card.append(stage,title,label);
          if(p.address)card.append(node("p",p.address));
          card.append(actions,details);section.append(card);
      }
      box.append(section);
    }
    if(!count)box.append(node("p","資料不足不代表零供給，不以舊建案補數。"));
    const trades=new Map();for(const a of scope.areas)for(const t of a.transactions||[])trades.set(JSON.stringify(t),t);
    if(trades.size){
      const details=node("details","");details.className="atlas-trades";
      details.append(node("summary",`本次取得成交紀錄 · ${trades.size} 筆`),node("p","成交紀錄不表示建商仍在銷售；交易日也不等於本次揭露日。"));
      for(const t of [...trades.values()].sort((a,b)=>(b.deal_date||"").localeCompare(a.deal_date||""))){
        const row=node("article","");row.append(node("strong",t.project_name),node("p",[t.unit||"戶別未取得",t.floor||"樓層未取得",t.layout||"格局未取得",t.area||"面積未取得",`總價 ${t.total_price||"未取得"}`,`單價 ${t.unit_price||"未取得"}`,t.parking||"車位未取得",`車位價 ${t.parking_price||"未取得"}`,`交易日（民國）${t.deal_date||"未取得"}`].join(" · ")),sourceLink(t.url,"成交建案網址 ↗"));details.append(row);
      }
      box.append(details);
    }
    box.append(node("small",`${scope.note} 不是即時銷售資訊或全區供給總量。`));
    return box;
  }
  function setMarketData(body,error=""){
    if(market===body&&marketError===error)return;
    market=body;marketError=error;
    if(active&&data){info();if($("atlas-results").open)renderResults(find(focus));}
  }
  function draw(){
    if(!data)return;
    shapes.clearLayers();labels.clearLayers();
    const selected=focus?find(focus):null;
    const visible=selected?[selected,...children(focus)]:[...roots(),...(map.getZoom()>=15?roots().flatMap(f=>children(f.properties.id)):[])];
    if(selected?.properties.parent){shapes.addData(find(selected.properties.parent));}
    shapes.addData(visible);
    if(map.getZoom()<12)return;
    const labelled=selected&&children(focus).length?children(focus):visible;
    for(const f of labelled){
      const p=f.properties,b=button(p.name+((children(p.id).length)?" ›":""),()=>show(p.id),"atlas-map-label");
      b.title=p.kind+"；點選查看建案與範圍";
      L.marker(p.label,{pane:"atlasLabels",keyboard:false,bubblingMouseEvents:false,
        icon:L.divIcon({html:b,className:"atlas-label-anchor",iconSize:[0,0],iconAnchor:[0,0]})}).addTo(labels);
    }
  }
  function info(){
    const panel=$("atlas-detail");panel.replaceChildren();panel.hidden=!active;
    if(!active)return;
    const selected=focus?root(find(focus)):"";
    stationButtons.clear();
    for(const f of roots()){
      const {id,name}=f.properties,areas=marketScope(f).areas,count=projects(areas).length;
      const status=marketError?"讀取失敗":!market?"讀取中":count?`看 ${count} 案`:!areas.length?"尚未接入":"本次未取得建案";
      const b=button("",()=>show(id),`atlas-station ${id}`);
      b.setAttribute("aria-pressed",String(selected===id));b.setAttribute("aria-haspopup","dialog");
      b.append(node("strong",name),node("span",status));panel.append(b);stationButtons.set(id,b);
    }
  }
  function renderResults(feature){
    const p=feature.properties,body=$("atlas-results-body"),station=find(root(feature));
    $("atlas-result-title").textContent=p.name;
    const select=node("select","");select.id="atlas-area-select";
    const label=node("label","切換生活圈");label.htmlFor=select.id;
    const addOptions=(f,depth=0)=>{
      const opt=node("option",(depth?"　".repeat(depth):"")+f.properties.name);
      opt.value=f.properties.id;select.append(opt);
      for(const child of children(f.properties.id))addOptions(child,depth+1);
    };
    addOptions(station);select.value=p.id;
    select.addEventListener("change",()=>{show(select.value);$("atlas-area-select").focus();});
    const control=node("div","");control.className="atlas-scope-control";control.append(label,select);
    const more=node("details","");more.className="atlas-source-notes";
    more.append(node("summary","地圖範圍與圖資來源"),node("p",p.note));
    if(p.roads.length)more.append(node("p","沿線道路："+p.roads.join("、")));
    const a=node("a","查看範圍依據");a.href=p.source_url;a.target="_blank";a.rel="noopener noreferrer";more.append(a);
    body.replaceChildren(control,projectPanel(feature),more);
    body.scrollTop=0;
  }
  function show(id){
    if(!data||id&&!find(id))return;
    focus=id;active=true;onNavigate();
    $("map-drill")?.setAttribute("hidden","");
    $("road-map").classList.add("atlas-active");
    map.invalidateSize?.({pan:false});draw();info();
    const features=id?[find(id)]:roots();
    map.fitBounds(L.geoJSON(features).getBounds(),{padding:[45,45],maxZoom:17,animate:false});
    $("atlas-corridor").setAttribute("aria-pressed","true");
    const dialog=$("atlas-results");
    if(id){renderResults(find(id));if(!dialog.open)dialog.showModal();}
    else if(dialog.open)dialog.close();
  }
  function leave(){
    active=false;focus="";$("atlas-detail").hidden=true;$("road-map").classList.remove("atlas-active");
    if($("atlas-results").open)$("atlas-results").close();
    $("atlas-corridor").setAttribute("aria-pressed","false");draw();
    map?.invalidateSize?.({pan:false});
  }
  async function init(instance,onFocus=()=>{}){
    map=instance;onNavigate=onFocus;
    $("atlas-corridor").addEventListener("click",()=>show(""));
    const dialog=$("atlas-results");
    $("atlas-close").addEventListener("click",()=>dialog.close());
    dialog.addEventListener("close",()=>{if(active&&focus&&!dialog.open)stationButtons.get(root(find(focus)))?.focus({preventScroll:true});});
    try{
      const r=await fetch("station-atlas.geojson",{signal:AbortSignal.timeout(10000)});
      if(!r.ok)throw Error("atlas");const body=await r.json();if(!valid(body))throw Error("schema");data=body;
      for(const [name,z] of [["atlasTerrain",190],["atlasRoads",360],["atlasAreas",450],["atlasLabels",650]]){
        map.createPane(name).style.zIndex=String(z);
      }
      map.getPane("atlasTerrain").style.pointerEvents="none";
      map.getPane("atlasRoads").style.pointerEvents="none";
      L.imageOverlay("station-terrain.webp",data.terrain_bounds,{pane:"atlasTerrain",interactive:false,
        attribution:'地形：<a href="https://registry.opendata.aws/terrain-tiles/">Mapzen / AWS Terrain Tiles</a>；道路與觀察圖形：<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors / ODbL</a>'}).addTo(map);
      L.geoJSON(data.roads,{pane:"atlasRoads",interactive:false,style:f=>({
        color:f.properties.class==="primary"?"#cfb477":"#fcfaf2",weight:f.properties.class==="primary"?3.5:2,opacity:.95
      })}).addTo(map);
      labels=L.layerGroup().addTo(map);
      shapes=L.geoJSON([],{pane:"atlasAreas",bubblingMouseEvents:false,
        style:f=>({color:colors[root(f)],weight:f.properties.id===focus?3:2,
          fillOpacity:(!focus||f.properties.parent===focus) ? .12 : .035,
          dashArray:f.properties.id==="a7"?"5 4":null}),
        onEachFeature:(f,layer)=>{
          layer.bindTooltip(node("span",f.properties.name+" · "+f.properties.kind),{sticky:true});
          layer.on("click",()=>show(f.properties.id));
        }
      }).addTo(map);
      map.on("zoomend",draw);
      $("atlas-corridor").disabled=false;
      show("");
      return true;
    }catch{
      $("atlas-detail").hidden=false;$("atlas-detail").replaceChildren(node("p","區域範圍圖未載入，請重新整理。行政區地圖仍可使用。"));
      $("atlas-corridor").disabled=true;return false;
    }
  }
  return {init,show,leave,isActive:()=>active,valid,setMarketData};
})();
