"use strict";
const RegionMap = (() => {
  const $=id=>document.getElementById(id),text=(tag,value)=>{const n=document.createElement(tag);n.textContent=value;return n;};
  let data=null,map=null,districtLayer=null,lifeLayer=null,callback=()=>{},city='',district='',areas=[],selectedArea='',frame='',overview=true,verified=[];
  function cities(){return data?.cities||[];}
  function districts(c){return (data?.features||[]).filter(f=>f.properties.city===c).map(f=>f.properties.district);}
  function mainGeometry(f){return {...f,geometry:{type:'MultiPolygon',coordinates:f.geometry.coordinates.filter(p=>p[0].some(([x,y])=>x>=118&&x<=123.5&&y>=21.8&&y<=26.5))}};}
  function validLife(f){
    const p=f?.properties,g=f?.geometry;if(p?.verification!=='verified'||!p.city||!p.district||!p.name||!p.checked_at)return false;
    try{if(new URL(p.source_url).protocol!=='https:')return false;}catch{return false;}
    if(!['Polygon','MultiPolygon'].includes(g?.type))return false;
    const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;
    return Array.isArray(polys)&&polys.length>0&&polys.every(poly=>Array.isArray(poly)&&poly.length>0&&poly.every(r=>Array.isArray(r)&&r.length>=4&&r.every(v=>Array.isArray(v)&&v.length>=2&&Number.isFinite(v[0])&&Number.isFinite(v[1])&&v[0]>=118&&v[0]<=124&&v[1]>=21&&v[1]<=27)&&r[0][0]===r[r.length-1][0]&&r[0][1]===r[r.length-1][1]));
  }
  let drill='district';
  let placeLayer=null,placeLevel='area',selectedPlace=null,placeType='all';
  const catalog=typeof RedevelopmentAreas==='undefined'?[]:RedevelopmentAreas;
  const typeLabels={development:'重劃／開發區',established:'既有生活圈／次分區',planned:'開發計畫'};
  function matchesDistrict(p,c,d){return p.city===c&&(p.districts.includes(d)||(p.relatedDistricts||[]).includes(d));}
  function placeName(p){return p.name+(p.districts.includes(district)?'':'（鄰近關聯）');}
  function localPlaces(filtered=false){return catalog.filter(p=>matchesDistrict(p,city,district)&&(!filtered||placeType==='all'||p.type===placeType));}
  function openPlace(p){overview=false;selectedPlace=p;paintPlaces();map.fitBounds([[p.lat-.008,p.lon-.010],[p.lat+.008,p.lon+.010]],{padding:[40,40],animate:false});drillPanel();$('road-map').scrollIntoView?.({block:'center'});}
  function coverage(){
    const list=$('catalog-places');list.replaceChildren();
    const entries=localPlaces(),shown=localPlaces(true);
    $('catalog-coverage').textContent=district?`${city}${district}：已收錄 ${entries.length+(city==='桃園市'&&district==='龜山區'?1:0)} 處導航入口，非完整名錄。${entries.length?'各類型可能重疊，不能相加成土地面積。':'未收錄不代表不存在。'}`:'請點選行政區；可分別查看重劃區、既有生活圈與開發計畫。';
    for(const [type,label] of Object.entries(typeLabels)){
      const items=shown.filter(p=>p.type===type);if(!items.length)continue;
      list.append(text('strong',`${label} · ${items.length} 處`));
      for(const p of items){const b=text('button',placeName(p));b.type='button';b.addEventListener('click',()=>openPlace(p));list.append(b);}
    }
    const audit=$('catalog-audit');audit.replaceChildren();
    for(const c of ['臺北市','新北市','基隆市','桃園市']){
      const ds=districts(c);audit.append(text('h4',c));
      for(const d of ds){const n=catalog.filter(p=>matchesDistrict(p,c,d)).length+(c==='桃園市'&&d==='龜山區'?1:0);audit.append(text('p',`${d}：${n?`已收錄 ${n} 處（含鄰近關聯），仍待補齊`:'待盤點，不能視為沒有生活圈或重劃區'}`));}
    }
  }
  const a7Places=[
    ['郵政物流',25.051146,121.3919453,'right'],
    ['樂善國小',25.05271,121.38258,'left'],
    ['文青國小',25.0444124,121.3910433,'right'],
    ['中心商業區',25.0411111,121.3852781,'left'],
    ['體育大學',25.0411111,121.3852781,'right']
  ];
  function paintPlaces(){
    if(!map||!placeLayer)return;placeLayer.clearLayers();
    if(overview||!district)return;
    const marker=(lat,lon,label,side,fn,type='development')=>{
      const b=text('button',label);b.type='button';b.className=`place-map-button ${side} place-${type}`;b.title=typeLabels[type];
      b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();fn();});
      const icon=L.divIcon({html:b,className:'place-map-icon',iconSize:[0,0],iconAnchor:[0,0]});
      L.marker([lat,lon],{icon,keyboard:false,bubblingMouseEvents:false}).addTo(placeLayer);
    };
    if(city!=='桃園市'||district!=='龜山區'){
      localPlaces(true).forEach((p,i)=>marker(p.lat,p.lon,`${placeName(p)}｜點開`,i%2?'left':'right',()=>openPlace(p),p.type));return;
    }
    if(placeType!=='all'&&placeType!=='development')return;
    if(placeLevel==='area')marker(25.0411111,121.3852781,'A7 重劃區｜點開','right',()=>{
      placeLevel='life';drill='subareas';map.fitBounds([[25.037,121.377],[25.057,121.400]],{padding:[50,50],animate:false});paintPlaces();drillPanel();
    });
    else for(const [name,lat,lon,side] of a7Places){
      const area=areas.find(a=>a.city===city&&a.district===district&&a.name===`A7站重劃區-${name}`);
      if(area)marker(lat,lon,name,side,()=>{drill='subareas';choose(city,district,area.id);});
    }
  }
  function choose(c,d,a=''){overview=false;callback(c,d,a);}
  function pickDistrict(c,d){
    if(c!==city||d!==district)placeLevel='area';
    drill=!overview&&c===city&&d===district?'subareas':'district';
    choose(c,d);
  }
  function drillPanel(){
    const panel=$('map-drill');panel.replaceChildren();panel.hidden=overview||!district||(!selectedPlace&&!selectedArea&&(localPlaces().length>0||(city==='桃園市'&&district==='龜山區')));if(panel.hidden)return;
    panel.append(text('strong',`${city} › ${district}`));
    const action=(label,fn)=>{const b=text('button',label);b.type='button';b.addEventListener('click',e=>{e.stopPropagation?.();fn();});panel.append(b);};
    if(selectedPlace){
      const p=selectedPlace;panel.append(text('h4',placeName(p)),text('p',`${typeLabels[p.type]} · ${p.kind}`),text('p',`名稱／分類查核 ${p.checkedAt}；不是來源發布日期或最新工程進度。`));if(p.note)panel.append(text('p',p.note));
      panel.append(text('p','標籤為概略導航位置，不代表法定範圍、中心點或新推案。此區建案資料尚未接入，不代表沒有建案。'));
      const link=text('a','查看區域分類來源');link.href=p.source;link.target='_blank';link.rel='noopener noreferrer';panel.append(link);
      action('返回行政區地圖',()=>{selectedPlace=null;frame='';choose(city,district);});return;
    }
    if(drill==='district'){
      panel.append(text('p','已選取行政區。再點此區，或按下方按鈕查看重劃區／既有市區。'));
      action('查看區內分區',()=>{drill='subareas';drillPanel();});return;
    }
    action('返回行政區地圖',()=>{drill='district';placeLevel='area';frame='';choose(city,district);});
    const scopes=areas.filter(a=>a.city===city&&a.district===district);
    const groups=[['重劃區',a=>a.name.startsWith('A7站重劃區-')||a.urban_type==='redevelopment'],['既有市區／舊區',a=>a.urban_type==='established'],['其他生活圈（類型待核對）',a=>!a.name.startsWith('A7站重劃區-')&&!['redevelopment','established'].includes(a.urban_type)]];
    for(const [label,test] of groups){
      const items=scopes.filter(test);if(!items.length&&label.startsWith('其他'))continue;
      panel.append(text('h4',label));
      if(!items.length){panel.append(text('p','分區資料尚未建置，不代表這個行政區沒有此類區域。'));continue;}
      for(const a of items){const b=text('button',a.name.replace('A7站重劃區-','A7 · '));b.type='button';b.setAttribute('aria-pressed',String(selectedArea===a.id));b.addEventListener('click',e=>{e.stopPropagation?.();choose(city,district,a.id);});panel.append(b);}
    }
    panel.append(text('p','以上是已接入的分區清單；尚無核對過的範圍，不在地圖上猜畫邊界。'));
    if(selectedArea){const a=scopes.find(a=>a.id===selectedArea);if(a){panel.append(text('strong',`目前查看：${a.name}`));
      const projects=a.availability==='unavailable'?[]:(a.projects||[]).filter(p=>['pending','active'].includes(p.category));
      panel.append(text('p',projects.length?projects.map(p=>p.name).join('、'):'本次無可展示建案資料，不代表沒有建案。'));
    }}
  }
  function containsPoint(ring,x,y){
    let inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const [xi,yi]=ring[i],[xj,yj]=ring[j];
      if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
    }
    return inside;
  }
  function districtAt(lng,lat){return data?.features.find(f=>f.geometry.coordinates.some(poly=>containsPoint(poly[0],lng,lat)&&!poly.slice(1).some(hole=>containsPoint(hole,lng,lat))));}
  function fit(){
    if(!map||!data)return;if(overview){map.fitBounds([[21.8,118.2],[26.4,122.1]],{padding:[18,18],animate:false});return;}
    const features=data.features.filter(f=>f.properties.city===city&&(!district||f.properties.district===district)).map(mainGeometry);
    if(features.length){const bounds=L.geoJSON(features).getBounds();if(bounds.isValid())map.fitBounds(bounds,{padding:[24,24],maxZoom:14,animate:false});}
  }
  function paint(){
    districtLayer?.setStyle(f=>{const selected=f.properties.city===city&&f.properties.district===district;return {color:selected?'#b66e24':'#436c60',weight:selected?3:1,fillOpacity:selected?.06:.015};});
    lifeLayer?.clearLayers();if(lifeLayer&&$('life-toggle').checked)lifeLayer.addData(verified.filter(f=>f.properties.city===city&&(!district||f.properties.district===district)));
  }
  function details(status){
    const scopes=areas.filter(a=>a.city===city&&a.district===district),list=$('map-subareas'),cards=$('map-projects');list.replaceChildren();cards.replaceChildren();
    if(!district){$('map-local-note').textContent='點行政區即可放大到真實道路底圖。生活圈與行政區界線不同，未核對不畫框。';return;}
    const button=(name,id)=>{const b=text('button',name);b.type='button';b.setAttribute('aria-pressed',String(selectedArea===id));b.addEventListener('click',()=>choose(city,district,id));list.append(b);};
    if(scopes.length){button('全行政區','');for(const a of scopes)button(a.name.replace('A7站重劃區-','A7 · '),a.id);}
    const chosen=scopes.filter(a=>!selectedArea||a.id===selectedArea);$('map-local-note').textContent=`${city}${district}：${status}。${scopes.length?'下列子區是來源分類，不表示已有地理邊界。':'尚未接入建案資料，不代表沒有建案。'}`;
    const projects=new Map();for(const a of chosen){if(a.availability==='unavailable')continue;for(const p of a.projects||[])if(['pending','active'].includes(p.category)&&!projects.has(p.id))projects.set(p.id,p);}
    for(const p of projects.values()){
      const card=document.createElement('article');card.append(text('strong',p.name),text('p',(p.category==='pending'?'未開賣預售':'銷售中預售')+(p.status?' · '+p.status:'')));
      try{const u=new URL(p.url);if(u.protocol==='https:'&&['www.leju.com.tw','leju.com.tw'].includes(u.hostname)&&!u.username&&!u.password&&/^\/community\/[A-Za-z0-9]+\/?$/.test(u.pathname)){const a=text('a','查看建案');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}}catch{/* Invalid links stay hidden. */}cards.append(card);
    }
    if(!projects.size&&chosen.length)cards.append(text('p','本次沒有可展示的預售資料，不代表零供給；不以舊建案補數。'));
  }
  function render(c,d,connectedAreas,areaId=''){
    if(frame&&(c!==city||d!==district)){overview=false;drill='district';placeLevel='area';selectedPlace=null;placeType='all';$('place-type').value='all';}city=c;district=d;areas=connectedAreas||[];selectedArea=areaId;
    const next=overview?'all':`${city}/${district}`;if(next!==frame){frame=next;fit();}
    const boundaries=verified.filter(f=>f.properties.city===city&&(!district||f.properties.district===district)),status=boundaries.length?`已核對 ${boundaries.length} 個生活圈範圍`:'生活圈範圍待核對';
    $('life-toggle').disabled=!boundaries.length;$('boundary-status').textContent=status+'；地圖標籤是概略定位入口，不是範圍或建案座標。';
    $('map-selection').textContent=city+(district?' · '+district:'');$('map-status').textContent='全臺道路可瀏覽；行政區界線非生活圈界線。可用滾輪、雙指或＋／−繼續放大到街道。';
    const list=$('map-district-buttons');list.replaceChildren();for(const name of districts(city)){const b=text('button',name);b.type='button';b.setAttribute('aria-pressed',String(name===district));b.addEventListener('click',()=>pickDistrict(city,name));list.append(b);}paint();details(status);coverage();paintPlaces();drillPanel();
  }
  async function init(onSelect){
    $('place-type').addEventListener('change',()=>{placeType=$('place-type').value;selectedPlace=null;paintPlaces();coverage();drillPanel();});
    callback=onSelect;$('map-overview').addEventListener('click',()=>{overview=true;frame='';render(city,district,areas,selectedArea);});$('map-city').addEventListener('click',()=>{frame='';choose(city,'');});
    try{const r=await fetch('districts.geojson',{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('boundary');data=await r.json();if(!Array.isArray(data.features)||!Array.isArray(data.cities))throw Error('schema');}catch{$('tile-status').textContent='行政區界線載入失敗，仍可使用下方選單。';return false;}
    if(typeof L==='undefined'){$('tile-status').textContent='地圖程式未載入，仍可使用行政區選單。';return true;}
    map=L.map('road-map',{minZoom:6,maxZoom:19,zoomControl:true,scrollWheelZoom:true,zoomAnimation:false,markerZoomAnimation:false});map.zoomControl.setPosition('topright');
    placeLayer=L.layerGroup().addTo(map);
    const panel=document.createElement('section');panel.id='map-drill';panel.className='map-drill';panel.hidden=true;panel.setAttribute('aria-label','行政區內分區導覽');panel.setAttribute('aria-live','polite');$('road-map').append(panel);
    L.DomEvent.disableClickPropagation(panel);L.DomEvent.disableScrollPropagation(panel);
    // Picking stays available even when the visual boundary layer is hidden.
    map.on('click',e=>{const f=districtAt(e.latlng.lng,e.latlng.lat);if(f)pickDistrict(f.properties.city,f.properties.district);});
    $('enable-roads').addEventListener('click',()=>{
      if($('enable-roads').disabled)return;
      $('enable-roads').disabled=true;$('enable-roads').textContent='道路底圖已啟用';
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{referrerPolicy:'origin',maxZoom:19,keepBuffer:1,updateWhenIdle:true,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).on('tileerror',()=>{$('tile-status').textContent='部分道路圖磚未載入；空白不代表沒有道路。請檢查網路後重新整理。';}).addTo(map);
    });
    districtLayer=L.geoJSON(data.features.map(mainGeometry),{bubblingMouseEvents:false,onEachFeature:(f,layer)=>{layer.bindTooltip(text('span',f.properties.city+f.properties.district));layer.on('click',()=>pickDistrict(f.properties.city,f.properties.district));}}).addTo(map);
    lifeLayer=L.geoJSON([],{style:{color:'#a56822',weight:3,fillOpacity:.12},onEachFeature:(f,layer)=>{
      const p=f.properties,box=document.createElement('div'),a=text('a','邊界來源');a.href=p.source_url;a.target='_blank';a.rel='noopener noreferrer';box.append(text('strong',p.name),text('p',`核對日期：${p.checked_at}`),a);layer.bindPopup(box);layer.on('click',()=>{const area=areas.find(a=>a.city===p.city&&a.district===p.district&&a.name===p.name);choose(p.city,p.district,area?.id||'');});
    }}).addTo(map);
    $('district-toggle').addEventListener('change',()=>{$('district-toggle').checked?districtLayer.addTo(map):map.removeLayer(districtLayer);});$('life-toggle').addEventListener('change',paint);fit();
    try{const r=await fetch('life-boundaries.geojson',{signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('life');const body=await r.json();if(body.type!=='FeatureCollection'||!Array.isArray(body.features))throw Error('schema');verified=body.features.filter(validLife);}catch{$('tile-status').textContent='生活圈圖層未載入；道路與行政區仍可使用。';}return true;
  }
  return {init,render,cities,districts};
})();
