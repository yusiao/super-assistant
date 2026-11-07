"use strict";
const TaiwanContext=(()=>{
  const root="taiwan-context/",$=id=>document.getElementById(id);
  const kinds={transport:"交通",medical:"醫療",education:"校園",retail:"大型商業",jobs:"產業園區",leisure:"公園／公共設施"};
  const atlasScopes={w442135827:"a7-post",w1310794583:"a7-school",w364304008:"a9-mall1",w829516898:"a9-mall2"};
  const isAtlasLandmark=id=>Object.values(atlasScopes).includes(id);
  const styles=[
    ["#ec9959","#fff8e4",3.6],["#e8b34e","#fff9df",3.0],["#f4d480","#fdf9df",2.4],
    ["#f9e9b5","#c8ad77",2.2],["#fff9ea","#b6b4a0",1.5],["#fffdf5","#c9c7ba",1.1],["#83bcd3",null,1.5]
  ];
  const el=(tag,text="",cls="")=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
  const get=async file=>{const r=await fetch(root+file,{signal:AbortSignal.timeout(9000)});if(!r.ok)throw Error(file);return r.json();};
  let indexPromise;
  function load(){return indexPromise??=get("index.json").then(data=>{
    if(data.version!==1||data.grid!==4||!Array.isArray(data.places)||!Array.isArray(data.tiles))throw Error("context index");
    const places=data.places.filter(p=>Object.hasOwn(kinds,p[1]));
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
          const row=el("li");row.append(el("span",kinds[p[1]],`context-chip context-${p[1]}`),el("strong",placeName(p)),
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
    map.createPane("contextFootprints").style.zIndex="475";
    const renderer=L.canvas({pane:"contextRoads",padding:.12});
    const lines=L.layerGroup().addTo(map),labels=L.layerGroup().addTo(map);
    const tiles=new Map(),status=$("context-status"),landmarks=$("show-landmarks"),roadsSwitch=$("show-context-roads");
    let main=[],index,mainFailed=false,indexFailed=false,epoch=0,primaryTask,outlines,outlineTask,outlinesFailed=false;
    const footprintRenderer=L.svg({pane:"contextFootprints"});
    const footprints=L.geoJSON(null,{pane:"contextFootprints",renderer:footprintRenderer,bubblingMouseEvents:false,
      style:f=>({className:`context-footprint context-${f.properties.category}`,weight:1.8,opacity:.94,fillOpacity:.27,smoothFactor:.45}),
      onEachFeature:(feature,layer)=>{
        const p=feature.properties,name=p.kind==="rail"&&!p.name.endsWith("站")?`${p.name}站`:p.name;
        const open=position=>{
          const box=el("div","","context-popup"),category=kinds[p.category];
          box.append(el("strong",name),el("p",category),el("small",`地圖輪廓 · ${outlines.date} · 非地籍界線或營運證明`));
          const scope=atlasScopes[feature.id];
          if(scope&&typeof StationAtlas!=="undefined"){
            const button=el("button","查看此範圍建案","atlas-secondary");button.type="button";
            button.addEventListener("click",()=>{map.closePopup();StationAtlas.show(scope);});box.append(button);
          }
          L.popup({autoPan:false}).setLatLng(position).setContent(box).openOn(map);
        };
        layer.on("click",event=>open(event.latlng));
        layer.on("add",()=>{
          const path=layer.getElement();if(!path)return;
          path.setAttribute("tabindex","0");path.setAttribute("role","button");
          path.setAttribute("aria-label",`地標範圍：${name}（${kinds[p.category]}）`);
          path.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open(p.point);}});
        });
      }
    }).addTo(map);
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
    function drawFootprints(){
      footprints.clearLayers();
      const zoom=map.getZoom();
      if(!landmarks.checked||!Number.isFinite(zoom)||zoom<10.5)return;
      if(!outlines){
        outlineTask??=get("landmark-areas.geojson").then(body=>{
          if(body.type!=="FeatureCollection"||!Array.isArray(body.features))throw Error("landmark areas");
          outlines=body;outlinesFailed=false;drawFootprints();note();
        }).catch(()=>{outlineTask=null;outlinesFailed=true;note();});
        return;
      }
      const b=map.getBounds(),minArea=zoom<12?100000:zoom<14?2500:100;
      const selected=outlines.features.filter(f=>{
        const [w,s,e,n]=f.bbox||[];
        return Object.hasOwn(kinds,f.properties?.category)&&f.properties.area_m2>=minArea&&
          e>=b.getWest()&&w<=b.getEast()&&n>=b.getSouth()&&s<=b.getNorth();
      });
      footprints.addData(selected);
    }
    function draw(details=[]){
      lines.clearLayers();labels.clearLayers();
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
    let roadsPartial=false;
    function note(partial=roadsPartial){
      roadsPartial=partial;
      status.textContent=mainFailed||indexFailed?"部分道路或地標圖資未載入，仍可查看地形及建案。":
        landmarks.checked&&outlinesFailed?"大型地標範圍未載入，建案仍可查看。":
        partial?"部分街道未載入；移動或縮放後會重新讀取。":"";
    }
    landmarks.addEventListener("change",()=>{drawFootprints();note();});roadsSwitch.addEventListener("change",refresh);
    map.on("moveend",()=>{refresh();drawFootprints();});drawFootprints();
    map.attributionControl.addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');
    load().then(data=>{index=data;refresh();}).catch(()=>{indexFailed=true;note(false);});
    get("main.json").then(rows=>{main=rows.map(row=>norm(row));refresh();}).catch(()=>{mainFailed=true;note(false);});
  }
  return {init,projectContext,nearby,isAtlasLandmark};
})();
