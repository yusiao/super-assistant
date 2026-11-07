"use strict";
const TaiwanContext=(()=>{
  const root="taiwan-context/",$=id=>document.getElementById(id);
  const kinds={transport:["交通","站"],medical:["醫療","醫"],education:["校園","學"],retail:["大型商場","商"],jobs:["產業園區","產"],leisure:["公園／公共地標","景"]};
  const priority={transport:0,medical:1,jobs:2,retail:3,education:4,leisure:5};
  const styles=[
    ["#ec9959","#fff8e4",3.6],["#e8b34e","#fff9df",3.0],["#f4d480","#fdf9df",2.4],
    ["#f9e9b5","#c8ad77",2.2],["#fff9ea","#b6b4a0",1.5],["#fffdf5","#c9c7ba",1.1],["#83bcd3",null,1.5]
  ];
  const el=(tag,text="",cls="")=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
  const get=async file=>{const r=await fetch(root+file,{signal:AbortSignal.timeout(9000)});if(!r.ok)throw Error(file);return r.json();};
  let indexPromise;
  function load(){return indexPromise??=get("index.json").then(data=>{
    if(data.version!==1||data.grid!==4||!Array.isArray(data.places)||!Array.isArray(data.tiles))throw Error("context index");
    const places=data.places.filter(p=>Object.hasOwn(kinds,p[1])).sort((a,b)=>a[2]-b[2]||priority[a[1]]-priority[b[1]]);
    return {...data,places,tiles:new Set(data.tiles.filter(key=>/^\d{3}-\d{2,3}$/.test(key)))};
  });}
  const placeName=p=>p[6]==="rail"&&!p[3].endsWith("站")?`${p[3]}站`:p[3];
  const radians=n=>n*Math.PI/180;
  function distance([lat,lon],[toLat,toLon]){
    const a=Math.sin(radians(toLat-lat)/2)**2+Math.cos(radians(lat))*Math.cos(radians(toLat))*Math.sin(radians(toLon-lon)/2)**2;
    return 12742*Math.asin(Math.min(1,Math.sqrt(a)));
  }
  function nearby(places,point){
    const found=new Map();
    for(const p of places){
      if(!Object.hasOwn(kinds,p[1])||Math.abs(point[0]-p[4])>.033||Math.abs(point[1]-p[5])>.038)continue;
      const km=distance(point,[p[4],p[5]]);
      if(km<=3&&(!found.has(p[1])||found.get(p[1]).km>km))found.set(p[1],{place:p,km});
    }
    return [...found.values()].sort((a,b)=>a.km-b.km);
  }
  function projectContext(point){
    const box=el("details","","project-context");
    box.append(el("summary","周邊大型地標（3 公里內）"));
    const content=el("div","展開可查看基地周圍的交通與生活設施。"),read=()=>{
      if(!box.open)return;
      box.removeEventListener("toggle",read);
      load().then(({places,date})=>{
        const matches=nearby(places,point),list=el("ul");
        for(const {place:p,km} of matches){
          const row=el("li");row.append(el("span",kinds[p[1]][0],`context-chip context-${p[1]}`),el("strong",placeName(p)),
            el("span",km<.01?"不到 10 公尺":km<1?`約 ${Math.round(km*100)*10} 公尺`:`約 ${km.toFixed(1)} 公里`));list.append(row);
        }
        content.replaceChildren(matches.length?list:el("p","這次圖資在 3 公里內未收錄符合條件的地標。"),
          el("small",`每類列最近一處 · 基地與地標圖上定位的直線距離，不是步行路程。圖資 ${date}。`));
      }).catch(()=>{content.textContent="地標資料暫時無法載入。";});
    };
    box.append(content);box.addEventListener("toggle",read);return box;
  }
  function roadBounds(points){
    let s=Infinity,w=Infinity,n=-Infinity,e=-Infinity;
    for(const [lat,lng] of points){s=Math.min(s,lat);w=Math.min(w,lng);n=Math.max(n,lat);e=Math.max(e,lng);}
    return [s,w,n,e];
  }
  function tileKeys(bounds,keys){
    const result=[];
    for(let x=Math.max(472,Math.floor(bounds.getWest()*4));x<=Math.min(489,Math.floor(bounds.getEast()*4));x++)
      for(let y=Math.max(87,Math.floor(bounds.getSouth()*4));y<=Math.min(106,Math.floor(bounds.getNorth()*4));y++){
        const k=`${x}-${y}`;if(keys.has(k))result.push(k);
      }
    return result;
  }
  function init(map){
    const roads=map.createPane("contextRoads");roads.style.zIndex="310";roads.style.pointerEvents="none";
    const names=map.createPane("contextNames");names.style.zIndex="490";names.style.pointerEvents="none";
    map.createPane("contextPlaces").style.zIndex="630";
    const renderer=L.canvas({pane:"contextRoads",padding:.12});
    const lines=L.layerGroup().addTo(map),labels=L.layerGroup().addTo(map),pins=L.layerGroup().addTo(map);
    const tiles=new Map(),status=$("context-status"),landmarks=$("show-landmarks"),roadsSwitch=$("show-context-roads");
    let main=[],index,mainFailed=false,indexFailed=false,epoch=0,primaryTask;
    const norm=([tier,name,points],id)=>({tier,name,points,id,bounds:roadBounds(points)});
    const primary=()=>primaryTask??=get("primary.json").then(rows=>rows.map(row=>norm(row))).catch(()=>{primaryTask=null;return null;});
    function tile(key){
      if(tiles.has(key))return tiles.get(key);
      const task=get(`roads-${key}.json`).then(rows=>rows.map(([id,...row])=>norm(row,id))).catch(()=>{tiles.delete(key);return null;});
      tiles.set(key,task);
      if(tiles.size>32)tiles.delete(tiles.keys().next().value);
      return task;
    }
    function annotate(pane,point,node,size,interactive){
      const icon=L.divIcon({className:"context-anchor",html:node,iconSize:size,iconAnchor:[size[0]/2,size[1]/2]});
      return L.marker(point,{pane,icon,interactive,keyboard:false,bubblingMouseEvents:false});
    }
    function showPlace(p,position,compact){
      const [label,symbol]=kinds[p[1]],name=placeName(p);
      const button=el("button","",`context-pin context-${p[1]}${compact?" context-pin-compact":""}`);button.type="button";button.title=name;
      button.setAttribute("aria-label",`地標：${name}（${label}）`);
      button.append(el("span",symbol,"context-symbol"));if(!compact)button.append(el("span",name,"context-pin-name"));
      button.addEventListener("click",e=>{
        e.stopPropagation();
        const box=el("div","","context-popup");box.append(el("strong",name),el("p",label),el("small",`圖資 ${index.date} · 不代表即時營運或開發進度`));
        L.popup({autoPan:false}).setLatLng(position).setContent(box).openOn(map);
      });
      return button;
    }
    function draw(details=[]){
      lines.clearLayers();labels.clearLayers();pins.clearLayers();
      const zoom=map.getZoom(),view=map.getBounds(),b=view.pad(.12),size=map.getSize();
      const container=map.getContainer(),{left,top}=container.getBoundingClientRect();
      const used=[...container.querySelectorAll(".project-pin,.atlas-map-label,.place-map-button")].map(n=>n.getBoundingClientRect())
        .filter(r=>r.width&&r.height).map(r=>[r.left-left-3,r.top-top-3,r.right-left+3,r.bottom-top+3]);
      const inView=(lat,lng)=>lat>=b.getSouth()&&lat<=b.getNorth()&&lng>=b.getWest()&&lng<=b.getEast();
      const reserve=(position,w,h)=>{
        const {x,y}=map.latLngToContainerPoint(position),rect=[x-w/2,y-h/2,x+w/2,y+h/2];
        if(rect[0]<8||rect[1]<8||rect[2]>size.x-8||rect[3]>size.y-28||
           (rect[2]>size.x-52&&rect[1]<94)||used.some(r=>r[0]<rect[2]&&r[2]>rect[0]&&r[1]<rect[3]&&r[3]>rect[1]))return false;
        used.push(rect);return true;
      };
      if(landmarks.checked&&index&&zoom>=8){
        const tier=zoom<10?0:zoom<12?1:zoom<14?2:3;
        for(const p of index.places){
          if(p[2]>tier||!Object.hasOwn(kinds,p[1])||!inView(p[4],p[5]))continue;
          const position=[p[4],p[5]],width=Math.min(168,Math.max(52,30+placeName(p).length*11));
          if(reserve(position,width+8,32))annotate("contextPlaces",position,showPlace(p,position,false),[width,26],true).addTo(pins);
          else if(reserve(position,24,24))annotate("contextPlaces",position,showPlace(p,position,true),[22,22],true).addTo(pins);
        }
      }
      if(!roadsSwitch.checked)return;
      const visible=Array.from({length:7},()=>[]),seen=new Set();
      const limit=zoom<8?1:zoom<11.5?2:zoom<12.5?3:zoom<14.75?4:5;
      for(const way of [...main,...details]){
        const [s,w,n,e]=way.bounds;
        if((way.tier!==6&&way.tier>limit)||n<b.getSouth()||s>b.getNorth()||e<b.getWest()||w>b.getEast())continue;
        if(way.id){if(seen.has(way.id))continue;seen.add(way.id);}
        visible[way.tier].push(way);
      }
      for(const tier of [6,5,4,3,2,1,0]){
        if(!visible[tier].length)continue;
        const [color,casing,weight]=styles[tier],paths=visible[tier].map(w=>w.points);
        const opt={renderer,pane:"contextRoads",interactive:false,smoothFactor:.85,weight:zoom<8?weight*.63:weight};
        if(casing&&zoom>=10)L.polyline(paths,{...opt,color:casing,weight:opt.weight+1.25,opacity:.78}).addTo(lines);
        L.polyline(paths,{...opt,color,opacity:.94}).addTo(lines);
      }
      const named=new Set();
      if(zoom>=9)for(const way of visible.flat()){
        const name=way.name;
        if(!name||named.has(name)||way.tier===5&&zoom<15.25)continue;
        const width=Math.min(155,Math.max(32,name.length*11+8)),ps=way.points;
        for(let i=Math.floor(ps.length/2);i<ps.length;i++){
          const a=ps[i-1]||ps[i],b=ps[i],pos=[(a[0]+b[0])/2,(a[1]+b[1])/2];
          if(inView(...pos)&&reserve(pos,width+10,21)){
            const label=el("span",name,`context-road-name context-road-${way.tier}`);label.title=name;
            annotate("contextNames",pos,label,[width,18],false).addTo(labels);named.add(name);break;
          }
        }
      }
    }
    function refresh(){
      const id=++epoch,zoom=map.getZoom(),keys=roadsSwitch.checked&&index&&zoom>=11.5?tileKeys(map.getBounds().pad(.12),index.tiles):[];
      if(!roadsSwitch.checked||zoom<8){draw();note(false);return;}
      if(!primaryTask||keys.some(k=>!tiles.has(k)))draw();
      Promise.all([primary(),...keys.map(tile)]).then(parts=>{
        if(id!==epoch)return;
        draw(parts.filter(Boolean).flat());note(parts.some(part=>!part));
      });
    }
    function note(partial){
      status.textContent=mainFailed||indexFailed?"部分道路或地標圖資未載入，仍可查看地形及建案。":
        partial?"部分街道未載入；移動或縮放後會重新讀取。":"";
    }
    landmarks.addEventListener("change",refresh);roadsSwitch.addEventListener("change",refresh);map.on("moveend",refresh);
    map.attributionControl.addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');
    load().then(data=>{index=data;refresh();}).catch(()=>{indexFailed=true;note(false);});
    get("main.json").then(rows=>{main=rows.map(row=>norm(row));refresh();}).catch(()=>{mainFailed=true;note(false);});
  }
  return {init,projectContext,nearby};
})();
