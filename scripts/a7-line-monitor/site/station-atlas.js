"use strict";
const StationAtlas = (() => {
  const $ = id => document.getElementById(id);
  let map, data, shapes, labels, focus = "", active = false, onNavigate=()=>{};
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
      b.title=p.kind+"；點選查看範圍與來源";
      L.marker(p.label,{pane:"atlasLabels",keyboard:false,bubblingMouseEvents:false,
        icon:L.divIcon({html:b,className:"atlas-label-anchor",iconSize:[0,0],iconAnchor:[0,0]})}).addTo(labels);
    }
  }
  function info(){
    const panel=$("atlas-detail");panel.replaceChildren();panel.hidden=!active;
    if(!active)return;
    const selected=focus?find(focus):null,p=selected?.properties;
    const crumb=node("nav","");crumb.setAttribute("aria-label","區域地圖層級");
    crumb.append(button("A7–A9 總覽",()=>show("")));
    if(selected){
      const ancestors=[];let f=selected;
      while(f.properties.parent){f=find(f.properties.parent);ancestors.unshift(f);}
      for(const f of ancestors)crumb.append(button(f.properties.name,()=>show(f.properties.id)));
    }
    panel.append(crumb,node("p",p?p.kind:"REGION → NEIGHBORHOOD"),node("h3",p?p.name:"看範圍，再看街廓。"));
    panel.append(node("p",p?p.note:"直接點地圖上的彩色範圍，展開區內商圈、街廓與地標。這是區域觀察圖，不是法定重劃區界址。"));
    const items=selected?children(focus):roots();
    for(const f of items){const b=button(f.properties.name+" →",()=>show(f.properties.id),"atlas-area-choice");panel.append(b);}
    if(selected){
      if(!items.length)panel.append(node("p","已到此範圍最細層級；仍可用＋／−或滾輪查看道路。"));
      if(p.roads.length)panel.append(node("p","沿線道路："+p.roads.join("、")));
      const a=node("a","查看範圍依據");a.href=p.source_url;a.target="_blank";a.rel="noopener noreferrer";panel.append(a,node("small","查核："+p.checked_at+"。名稱與範圍不表示有新推建案。"));
    }
    panel.append(node("small","地圖導覽不會替換下方的報告篩選條件；建案位置未核實時，不會放置推測標記。"));
  }
  function show(id){
    if(!data||id&&!find(id))return;
    focus=id;active=true;onNavigate();
    $("map-drill")?.setAttribute("hidden","");
    $("road-map").classList.add("atlas-active");
    draw();info();
    const features=id?[find(id)]:roots();
    map.fitBounds(L.geoJSON(features).getBounds(),{padding:[45,45],maxZoom:17,animate:false});
    $("atlas-corridor").setAttribute("aria-pressed","true");
  }
  function leave(){
    active=false;focus="";$("atlas-detail").hidden=true;$("road-map").classList.remove("atlas-active");
    $("atlas-corridor").setAttribute("aria-pressed","false");draw();
  }
  async function init(instance,onFocus=()=>{}){
    map=instance;onNavigate=onFocus;
    $("atlas-corridor").addEventListener("click",()=>show(""));
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
  return {init,show,leave,isActive:()=>active,valid};
})();
