"use strict";
const LiveProjects = (() => {
  const node=(tag,value="")=>{const e=document.createElement(tag);e.textContent=value;return e;};
  const phases={active:"銷售中預售 · 已核對工期",pending:"未開賣預售 · 已核對",sold_out:"完銷預售 · 已核對工期",
    listed_presale:"平台預售索引 · 工期待核對",listed_pending:"平台預推索引 · 開賣狀態待核對"};
  let data,failed=false,promise;
  const url=value=>{try{const u=new URL(value);return u.protocol==="https:"&&u.hostname==="newhouse.591.com.tw"&&!u.username&&!u.password&&!u.port&&/^\/\d+$/.test(u.pathname)&&!u.search&&!u.hash?u.href:"";}catch{return "";}};
  function load(){return promise??=(async()=>{try{
    const response=await fetch("national-listings.json",{signal:AbortSignal.timeout(12000)});
    if(!response.ok)throw Error("source");
    const body=await response.json();
    if(body.schema_version!==1||!Array.isArray(body.projects)||!body.regions||!Number.isFinite(Date.parse(body.observed_at)))throw Error("schema");
    data=body;
  }catch{failed=true;}})();}
  function inside(point,geometry){
    if(geometry.type==="GeometryCollection")return geometry.geometries.some(g=>inside(point,g));
    const ring=points=>{let yes=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
      const a=points[i],b=points[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;
    }return yes;};
    const polygons=geometry.type==="Polygon"?[geometry.coordinates]:geometry.type==="MultiPolygon"?geometry.coordinates:[];
    return polygons.some(p=>ring(p[0])&&!p.slice(1).some(ring));
  }
  function matching({city="",district="",geometry}={}){
    if(!data||Date.now()-Date.parse(data.observed_at)>8*86400000)return [];
    const fresh=(value,days)=>{const age=Date.now()-Date.parse(value);return age>=-86400000&&age<=days*86400000;};
    const inScope=p=>geometry?p.coordinates&&inside(p.coordinates,geometry):
      (!city||p.city.replaceAll("台","臺")===city.replaceAll("台","臺"))&&(!district||p.district===district);
    return data.projects.filter(p=>Object.hasOwn(phases,p.category)&&url(p.url)&&(["listed_presale","listed_pending"].includes(p.category)?fresh(p.source_updated,365):fresh(p.verified_on,7))&&inScope(p));
  }
  function count(query){return matching(query).length;}
  function panel(query={}){
    const box=node("section");box.className="live-projects";box.setAttribute("aria-label","全台預售與預推建案");
    box.append(node("h3",query.geometry?"圖框內可定位的預售／預推建案":`${query.district||query.city||"全台"}｜預售與預推建案`));
    if(!data){box.append(node("p",failed?"公開建案資料讀取失敗，不顯示成 0 案。":"正在讀取公開建案…"));return box;}
    const age=Date.now()-Date.parse(data.observed_at);
    if(age>8*86400000){box.append(node("p","建案索引超過 8 天未更新，暫不列出，避免把舊案當作在售。"));return box;}
    const date=data.observed_at.slice(0,10),rows=matching(query);
    const reports=Object.values(data.regions).filter(r=>!query.city||r.city.replaceAll("台","臺")===query.city.replaceAll("台","臺"));
    const checked=reports.filter(r=>r.status==="indexed").length;
    box.append(node("p",`${date} 讀取 · ${rows.length} 案 · 已走訪 ${checked}/${reports.length} 個縣市索引的全部分頁`),
      node("small","非全市場完整供給；平台索引可能含歷史案。已完工案不列入；未核實案獨立標示，不宣稱仍在售。來源開價不是成交價。"));
    if(!rows.length){box.append(node("p",reports.some(r=>r.status!=="indexed")?"本次來源受限或尚未完成蒐集，不代表零供給。":query.geometry?"本次未取得可定位到此圖框的合格預售案。可改看整個行政區，不代表區內無案。":"本次沒有符合條件的可展示紀錄，不代表沒有預售屋。"));return box;}
    const controls=node("div");controls.className="live-filters";
    const phase=node("select"),search=node("input"),circle=node("select");
    const option=(label,value)=>{const e=node("option",label);e.value=value;return e;};
    phase.setAttribute("aria-label","建案階段");
    phase.append(option("全部預售／預推索引",""),option("核實銷售中","active"),option("未開賣／預推","pending"),option("核實完銷預售","sold_out"));
    search.type="search";search.placeholder="搜尋建案或路段";search.setAttribute("aria-label","搜尋建案或路段");
    circle.setAttribute("aria-label","生活圈（來源分類）");circle.append(option("全部生活圈（來源分類）",""));
    for(const c of [...new Set(rows.map(p=>p.circle).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"zh-Hant")))circle.append(option(c,c));
    controls.append(phase,circle,search);if(!query.geometry||rows.length>12)box.append(controls);
    const circleNote=node("p"),result=node("p"),list=node("div"),more=node("button","顯示更多建案");
    circleNote.className="live-circle-note";more.type="button";more.className="atlas-secondary";
    box.append(circleNote,result,list,more);let selected=[],shown=0;
    function add(){
      for(const p of selected.slice(shown,shown+12)){
        const card=node("article");card.className="atlas-project-card national-filing";
        const badge=node("span",phases[p.category]);badge.className="badge";
        const link=node("a","開啟建案頁 ↗");link.href=url(p.url);link.target="_blank";link.rel="noopener noreferrer";link.className="atlas-primary";
        const asking=p.price&&p.price!=="價格待定"?`開價 ${p.price}${p.price_unit||""}`:"開價待定";
        card.append(badge,node("h4",p.name),node("p",`${p.city} ${p.district} · ${p.circle||"生活圈未提供"}`),node("p",p.address||"基地位置未提供"),
          node("p",`${asking} · ${p.area||"坪數未提供"}`),link);
        if(p.verified_on)card.append(node("small",`工期核對 ${p.verified_on} · ${p.completion||"完工期未提供"} · ${p.sales_evidence||p.construction||"狀態待核對"}`));
        else card.append(node("small","僅來源平台分類，尚未核對工期及是否仍銷售；請開啟建案頁確認。"));
        card.append(node("small",`來源：${p.source} · 來源更新 ${p.source_updated||"未提供"}`));list.append(card);
      }
      shown+=12;more.hidden=shown>=selected.length;
    }
    function render(){
      const q=search.value.trim();
      selected=rows.filter(p=>(!phase.value||(phase.value==="pending"?["pending","listed_pending"].includes(p.category):p.category===phase.value))&&(!circle.value||p.circle===circle.value)&&(!q||(p.name+p.address).includes(q)))
        .sort((a,b)=>Number(!a.verified_on)-Number(!b.verified_on)||(b.source_updated||"").localeCompare(a.source_updated||""));
      circleNote.textContent=circle.value?`${circle.value} 為來源平台的生活圈分類，並非已核對的地界。新成屋均價：缺少對應範圍／足夠可定位成交樣本，不以行政區均價代替。`:"";
      result.textContent=`符合 ${selected.length} 案`;shown=0;list.replaceChildren();add();
    }
    phase.addEventListener("change",render);circle.addEventListener("change",render);search.addEventListener("input",render);more.addEventListener("click",add);render();return box;
  }
  return {load,panel,count,inside,url};
})();
