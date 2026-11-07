"use strict";
const LiveProjects = (() => {
  const node=(tag,value="")=>{const e=document.createElement(tag);e.textContent=value;return e;};
  const phases={active:"銷售中預售 · 已核對工期",pending:"未開賣預售 · 已核對",sold_out:"完銷預售 · 已核對工期",
    listed_presale:"平台預售索引 · 工期待核對",listed_pending:"平台預推索引 · 開賣狀態待核對",new_home:"在售新成屋 · 五年內交屋"};
  let data,newHomes,failed=false,homesFailed=false,promise;
  const url=value=>{try{const u=new URL(value);return u.protocol==="https:"&&u.hostname==="newhouse.591.com.tw"&&!u.username&&!u.password&&!u.port&&/^\/\d+$/.test(u.pathname)&&!u.search&&!u.hash?u.href:"";}catch{return "";}};
  async function read(file){
    const response=await fetch(file,{signal:AbortSignal.timeout(12000)});
    if(!response.ok)throw Error("source");
    const body=await response.json();
    if(body.schema_version!==1||!Array.isArray(body.projects)||!body.regions||!Number.isFinite(Date.parse(body.observed_at)))throw Error("schema");
    return body;
  }
  function load(){return promise??=Promise.all([
    read("national-listings.json").then(body=>{data=body;}).catch(()=>{failed=true;}),
    read("national-new-homes.json").then(body=>{newHomes=body;}).catch(()=>{homesFailed=true;})
  ]);}
  function inside(point,geometry){
    if(geometry.type==="GeometryCollection")return geometry.geometries.some(g=>inside(point,g));
    const ring=points=>{let yes=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
      const a=points[i],b=points[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;
    }return yes;};
    const polygons=geometry.type==="Polygon"?[geometry.coordinates]:geometry.type==="MultiPolygon"?geometry.coordinates:[];
    return polygons.some(p=>ring(p[0])&&!p.slice(1).some(ring));
  }
  const fresh=(value,days)=>{const age=Date.now()-Date.parse(value);return age>=-86400000&&age<=days*86400000;};
  function matching({city="",district="",geometry}={}){
    const inScope=p=>geometry?p.coordinates&&inside(p.coordinates,geometry):
      (!city||p.city.replaceAll("台","臺")===city.replaceAll("台","臺"))&&(!district||p.district===district);
    const rows=new Map();
    for(const source of [data,newHomes]){
      if(!fresh(source?.observed_at,8))continue;
      for(const p of source.projects){
        if(source===newHomes&&p.category!=="new_home")continue;
        if(Object.hasOwn(phases,p.category)&&url(p.url)&&(["listed_presale","listed_pending"].includes(p.category)?fresh(p.source_updated,365):fresh(p.verified_on,7))&&inScope(p))rows.set(p.id,p);
      }
    }
    return [...rows.values()];
  }
  function count(query){return matching(query).length;}
  function location(p){
    const [lng,lat]=Array.isArray(p.coordinates)?p.coordinates:[];
    return p.verified_on&&lng>=118&&lng<=124&&lat>=21&&lat<=27&&Number.isFinite(lng)&&Number.isFinite(lat)?[lat,lng]:null;
  }
  const asking=p=>p.price&&p.price!=="價格待定"?`${p.price}${p.price_unit||""}`:"待定／未提供";
  const areaLabel=p=>`${p.city} ${p.district}${p.circle?` · ${p.circle}`:""}`;
  const compare=p=>typeof NationalMarket!=="undefined"&&typeof NationalMarket.priceComparison==="function"?NationalMarket.priceComparison(p):null;
  function priceMark(p,details=false){
    const c=compare(p);if(!c)return null;
    const box=node("div"),mark=node("strong",`開價低 ${c.discount.toFixed(1)}%`);mark.className="price-watch-badge";box.className="price-watch";
    box.append(mark,node("small",`${c.scope} · ${c.label}成交`));
    if(details)box.append(node("p",`公開開價上緣 ${c.high} vs. 成交均價 ${c.mean.toFixed(2)} 萬元／坪`),
      node("small",`實登 ${c.count} 筆，${c.first} 至 ${c.last}，成交扣車位。開價不是成交價；車位、樓層及戶別須另核對。`));
    return box;
  }
  function facts(p){
    const list=node("dl");list.className="project-facts";
    for(const [label,value] of [["產品類型",p.property_style],["格局",p.layout],["規劃坪數",p.area],["公開銷售時間",p.opening],["完工／交屋期（來源）",p.completion]]){
      list.append(node("dt",label),node("dd",value||"未提供"));
    }
    return list;
  }
  function inspection(p,benchmark){
    const box=node("article");box.className="project-inspection";
    const overview=node("div");overview.className="project-overview";
    const basics=node("div");basics.className="project-overview-main";
    const stage=node("span",phases[p.category]||"銷售狀態待核對");stage.className="badge";
    basics.append(stage,node("p",areaLabel(p)),node("p",p.address||"基地位置未提供"),node("strong",`建案開價 ${asking(p)}`));
    overview.append(basics);if(benchmark)overview.append(benchmark);
    box.append(overview);
    const mark=priceMark(p,true);if(mark)box.append(mark);
    box.append(node("h3","建案規劃"),facts(p),node("small",`建案來源：${p.source||"未標示"} · 來源更新 ${p.source_updated||"未提供"}`));
    if(p.verified_on)box.append(node("small",`工期與狀態核對：${p.verified_on}`));
    const point=location(p);
    if(point&&typeof TaiwanContext!=="undefined")box.append(TaiwanContext.projectContext(point));
    return box;
  }
  function card(p,{onLocate,onProject}={}){
    const box=node("article");box.className="atlas-project-card national-filing";
    const badge=node("span",phases[p.category]);badge.className="badge";
    box.append(badge,node("h4",p.name),node("p",areaLabel(p)),node("p",p.address||"基地位置未提供"),node("p",`開價 ${asking(p)} · ${p.area||"坪數未提供"}`));
    const mark=priceMark(p);if(mark)box.append(mark);
    const actions=node("div");actions.className="project-card-actions";
    if(onProject){
      const button=node("button","查看建案資料");button.type="button";button.className="atlas-primary";
      button.setAttribute("aria-label",`查看建案資料：${p.name}`);button.addEventListener("click",()=>onProject(p));actions.append(button);
    }else{
      const details=node("details");details.append(node("summary","建案資料"),facts(p));box.append(details);
    }
    if(onLocate&&location(p)){
      const button=node("button","在地圖定位");button.type="button";button.className="atlas-secondary project-locate";
      button.setAttribute("aria-label",`在地圖定位：${p.name}`);button.addEventListener("click",()=>onLocate(p));actions.append(button);
    }
    box.append(actions);return box;
  }
  function selectionPanel(rows,options={}){
    if(rows.length===1)return inspection(rows[0],options.benchmark);
    const box=node("section");box.className="live-projects";
    box.append(node("p","這些建案在目前縮放下彼此靠近，可直接選案查看資料。"));
    for(const p of rows)box.append(card(p,options));
    return box;
  }
  function mountMap(map,open){
    map.createPane("projectPins").style.zIndex="680";
    const layer=L.layerGroup().addTo(map),status=document.getElementById("project-map-status");
    let displayed=[],selected=new Set();
    function highlight(){for(const {button,rows} of displayed)button.setAttribute("aria-pressed",String(rows.some(p=>selected.has(p.id))));}
    function draw(){
      const bounds=map.getBounds().pad(0.04),groups=[];
      for(const p of matching()){
        const position=location(p);if(!position||!bounds.contains(position))continue;
        const xy=map.project(position);
        const group=groups.find(g=>(g.xy.x-xy.x)**2+(g.xy.y-xy.y)**2<34**2);
        if(group){group.rows.push(p);group.positions.push(position);}
        else groups.push({xy,rows:[p],positions:[position]});
      }
      layer.clearLayers();displayed=[];let watches=0;
      for(const {rows,positions} of groups){
        const multiple=rows.length>1,p=rows[0];
        const button=node("button",multiple?String(rows.length):"▥");button.type="button";
        const lowCount=rows.filter(compare).length;watches+=lowCount;
        const label=multiple?`查看附近 ${rows.length} 個建案`:`建案：${p.name}`;
        button.className="project-pin"+(multiple?" project-pin-group":p.category==="new_home"?" project-pin-new-home":p.category.includes("pending")?" project-pin-pending":"")+(lowCount?" project-pin-watch":"");
        const note=lowCount?multiple?` · 其中 ${lowCount} 案開價低於區域成交 20% 以上`:` · 開價低 ${compare(p).discount.toFixed(1)}%`:"";
        button.title=(multiple?`${rows.length} 案 · 點選查看`:`${p.name} · ${phases[p.category]}`)+note;
        button.setAttribute("aria-label",label+note);
        if(lowCount){const flag=node("span","低");flag.className="project-watch-flag";flag.setAttribute("aria-hidden","true");button.append(flag);}
        button.addEventListener("click",e=>{
          e.stopPropagation();open(rows);
          if(multiple&&map.getZoom()<17&&positions.some(v=>v[0]!==positions[0][0]||v[1]!==positions[0][1])){
            map.fitBounds(positions,{padding:[35,35],maxZoom:17,animate:false});
          }
        });
        const icon=L.divIcon({html:button,className:"project-pin-anchor",iconSize:[34,34],iconAnchor:[17,17]});
        L.marker(positions[0],{icon,pane:"projectPins",keyboard:false,bubblingMouseEvents:false}).addTo(layer);
        displayed.push({button,rows});
      }
      highlight();
      const count=groups.reduce((n,g)=>n+g.rows.length,0);
      if(status)status.textContent=count?`畫面內 ${count} 案有定位${watches?` · ${watches} 案符合低價標記`:""} · 數字為多案群組`:
        !data&&!newHomes?(failed?"建案標記讀取失敗":"正在讀取建案標記…"):
        !fresh(data?.observed_at,8)&&!fresh(newHomes?.observed_at,8)?"建案索引已過期，暫不顯示舊標記。":"此畫面沒有可定位的建案；未定位案件仍可查清單。";
    }
    map.on("moveend",draw);load().then(draw);
    return {refresh:draw,select:rows=>{selected=new Set(rows.map(p=>p.id));highlight();}};
  }
  function panel(query={}){
    const box=node("section");box.className="live-projects";box.setAttribute("aria-label","預售與新成屋建案");
    box.append(node("h3",query.geometry?"圖框內｜預售、預推與新成屋":`${query.district||query.city||"全台"}｜預售、預推與新成屋`));
    if(!data&&!newHomes){box.append(node("p",failed?"公開建案資料讀取失敗，不顯示成 0 案。":"正在讀取公開建案…"));return box;}
    if(!fresh(data?.observed_at,8)&&!fresh(newHomes?.observed_at,8)){box.append(node("p","建案索引超過 8 天未更新，暫不列出，避免把舊案當作在售。"));return box;}
    const date=(data||newHomes).observed_at.slice(0,10),rows=matching(query);
    const reports=Object.values(data?.regions||{}).filter(r=>!query.city||r.city.replaceAll("台","臺")===query.city.replaceAll("台","臺"));
    const checked=reports.filter(r=>r.status==="indexed").length;
    box.append(node("p",`${date} 讀取 · ${rows.length} 案 · 預售索引 ${checked}/${reports.length} 縣市完整分頁`),
      node("small","新成屋僅列分批核對的在售案，未核實預售另標示。開價不是成交價，未標低價不代表不便宜。"));
    if(homesFailed||!fresh(newHomes?.observed_at,8))box.append(node("small","新成屋索引未載入或已過期，不代表沒有在售案。"));
    if(!rows.length){box.append(node("p",reports.some(r=>r.status!=="indexed")?"本次來源受限或尚未完成蒐集，不代表零供給。":query.geometry?"本次未取得可定位到此圖框的合格預售案。可改看整個行政區，不代表區內無案。":"本次沒有符合條件的可展示紀錄，不代表沒有預售屋。"));return box;}
    const controls=node("div");controls.className="live-filters";
    const phase=node("select"),search=node("input"),circle=node("select");
    const option=(label,value)=>{const e=node("option",label);e.value=value;return e;};
    phase.setAttribute("aria-label","建案階段");
    phase.append(option("所有建案",""),option("核實銷售中預售","active"),option("未開賣／預推","pending"),option("核實完銷預售","sold_out"),option("在售新成屋","new_home"));
    search.type="search";search.placeholder="搜尋建案或路段";search.setAttribute("aria-label","搜尋建案或路段");
    circle.setAttribute("aria-label","生活圈（來源分類）");circle.append(option("全部生活圈（來源分類）",""));
    for(const c of [...new Set(rows.map(p=>p.circle).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"zh-Hant")))circle.append(option(c,c));
    controls.append(phase,circle,search);if(!query.geometry||rows.length>12)box.append(controls);
    const circleNote=node("p"),result=node("p"),list=node("div"),more=node("button","顯示更多建案");
    circleNote.className="live-circle-note";more.type="button";more.className="atlas-secondary";
    box.append(circleNote,result,list,more);let selected=[],shown=0;
    function add(){
      for(const p of selected.slice(shown,shown+12))list.append(card(p,query));
      shown+=12;more.hidden=shown>=selected.length;
    }
    function render(){
      const q=search.value.trim();
      selected=rows.filter(p=>(!phase.value||(phase.value==="pending"?["pending","listed_pending"].includes(p.category):p.category===phase.value))&&(!circle.value||p.circle===circle.value)&&(!q||(p.name+p.address).includes(q)))
        .sort((a,b)=>Number(!!compare(b))-Number(!!compare(a))||Number(!a.verified_on)-Number(!b.verified_on)||(b.source_updated||"").localeCompare(a.source_updated||""));
      circleNote.textContent=circle.value?`${circle.value} 為來源平台的生活圈分類，並非已核對的地界。新成屋均價：缺少對應範圍／足夠可定位成交樣本，不以行政區均價代替。`:"";
      result.textContent=`符合 ${selected.length} 案`;shown=0;list.replaceChildren();add();
    }
    phase.addEventListener("change",render);circle.addEventListener("change",render);search.addEventListener("input",render);more.addEventListener("click",add);render();return box;
  }
  return {load,panel,count,inside,url,location,mountMap,selectionPanel};
})();
