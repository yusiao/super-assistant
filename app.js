"use strict";
const $ = id => document.getElementById(id);
const labels = {active:"銷售中預售",pending:"未開賣預售",sold_out:"完銷預售",completed:"已完工建案"};
const availability = {unavailable:"本次未取得",partial:"部分來源可用",observed:"有可觀察資料，非完整清單"};
const storageKey = "property-observatory-v1";
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { /* Storage is optional. */ }
if (!saved || typeof saved !== "object") saved = {};
const state = {data:null,view:"projects",category:"all",favorites:new Set(Array.isArray(saved.favorites)?saved.favorites:[]),error:""};
function save(){try{localStorage.setItem(storageKey,JSON.stringify({city:$("city").value,district:$("district").value,area:$("area").value,favorites:[...state.favorites]}));}catch{/* Browsing still works without storage. */}}
function el(tag,cls,txt){const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=txt;return node;}
function link(url,title){try{const u=new URL(url);if(u.protocol!=="https:"||!["www.leju.com.tw","leju.com.tw"].includes(u.hostname))return el("span","", "建案連結未取得");}catch{return el("span","","建案連結未取得");}const a=el("a","",title);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;}
function options(select,values,placeholder,preferred){select.replaceChildren();const first=el("option","",placeholder);first.value="";select.append(first);for(const [value,title] of values){const o=el("option","",title);o.value=value;select.append(o);}select.value=values.some(v=>v[0]===preferred)?preferred:"";}
function syncRegions(preferredDistrict="",preferredArea=""){
  const areas=(state.data?.areas||[]).filter(a=>a.city===$("city").value);
  const districts=[...new Set([...(typeof RegionMap!=="undefined"?RegionMap.districts($("city").value):[]),...areas.map(a=>a.district)])];
  options($("district"),districts.map(v=>[v,v]),districts.length?"全部行政區":"尚未接入行政區",preferredDistrict);
  syncAreas(preferredArea);
}
function syncAreas(preferred=""){
  const areas=(state.data?.areas||[]).filter(a=>a.city===$("city").value&&(!$("district").value||a.district===$("district").value));
  options($("area"),areas.map(a=>[a.id,a.name.replace("A7站重劃區-","A7 · ")]),areas.length?"全部已接入子區":"尚未接入子區",preferred);
}
function selectedAreas(){return(state.data?.areas||[]).filter(a=>a.city===$("city").value&&(!$("district").value||a.district===$("district").value)&&(!$("area").value||a.id===$("area").value));}
function projectList(areas){const unique=new Map();for(const area of areas){if(area.availability==="unavailable")continue;for(const p of area.projects||[]){if(!unique.has(p.id))unique.set(p.id,{...p,areaNames:[area.name]});else unique.get(p.id).areaNames.push(area.name);}}return[...unique.values()];}
function empty(title,body){const box=el("div","empty");box.append(el("span","empty-icon","◎"),el("h3","",title),el("p","",body));return box;}
function statusRows(areas){const box=el("div","availability");for(const area of areas){const row=el("div","availability-row");row.append(el("span","",area.name.replace("A7站重劃區-","")),el("span","",availability[area.availability]||"狀態未確認"));box.append(row);}return box;}
function projectCard(p){const card=el("article","card");const top=el("div","card-top");const star=el("button","star",state.favorites.has(p.id)?"★":"☆");star.type="button";star.setAttribute("aria-label",`${state.favorites.has(p.id)?"取消關注":"關注"}${p.name}`);star.setAttribute("aria-pressed",String(state.favorites.has(p.id)));star.addEventListener("click",()=>{if(state.favorites.has(p.id))state.favorites.delete(p.id);else state.favorites.add(p.id);save();render();});top.append(el("span",`badge ${p.category}`,labels[p.category]||"階段待確認"),star);const bottom=el("div","card-bottom");bottom.append(link(p.url,"查看建案 ↗"),el("span","","樂居 · 來源標示"));card.append(top,el("h3","",p.name),el("div","location",p.areaNames.map(a=>a.replace("A7站重劃區-","")).join(" / ")),el("p","status",p.status||"價格／階段未取得"),bottom);return card;}
function render(){
  if(typeof RegionMap!=="undefined")RegionMap.render($("city").value,$("district").value,state.data?.areas||[],$("area").value);
  const areas=selectedAreas(), projects=projectList(areas), usable=areas.some(a=>a.availability!=="unavailable");
  $("region-title").textContent=$("area").value?areas[0]?.name.replace("A7站重劃區-","A7 · ")||"區域觀察":`${$("city").value}${$("district").value}區域觀察`;
  $("project-count").textContent=usable?projects.length:"—";
  $("active-count").textContent=usable?projects.filter(p=>p.category==="active").length:"—";
  $("pending-count").textContent=usable?projects.filter(p=>p.category==="pending").length:"—";
  $("categories").hidden=state.view!=="projects";
  $("panel").setAttribute("aria-labelledby",`tab-${state.view}`);
  const panel=$("panel");panel.replaceChildren();
  const search=$("search").value.trim().toLowerCase();
  const scopeText=areas.length?`本次觀察 ${areas.length} 區，${areas.filter(a=>a.availability!=="unavailable").length} 區有可用來源。數量不是全區供給總量。`:"此縣市尚未接入建案資料，不代表沒有建案。";
  $("result-note").textContent=scopeText;
  if(state.error){panel.append(empty("暫時無法讀取資料",state.error));return;}
  if(state.view==="reports"){
    const box=el("div","report-panel");box.append(el("h3","","把數字放回脈絡裡看"),el("p","","網站顯示本次可取得的建案與成交紀錄。完整市場脈動、重大建設與觀察結論請看週報；PDF 與網站的更新時間請分別核對。"));
    if(state.data?.pdf_available){const a=el("a","report-link","閱讀最新已發布 PDF ↗");a.href="a7-market-report-latest.pdf";a.target="_blank";a.rel="noopener";box.append(a);}else box.append(el("p","","此版本尚未附上 PDF。"));
    box.append(el("p","","分類說明：預售屋指未完工建案；完銷與完工是不同狀態。已完工建案另列，未確認屋齡前不宣稱是五年內新成屋。"),el("p","","成交欄位未取得就留缺，不以開價代替成交價。實價登錄有揭露時間落差，並非即時銷售動態。"),el("p","","網站不提供修改 LINE 或排程的公開介面。星號關注只存在你的瀏覽器；清除瀏覽器資料後會消失。"));panel.append(box,statusRows(areas));return;
  }
  if(!areas.length){panel.append(empty("這個區域還沒接入", "第一版先提供 A7 五個子區。切回桃園市即可查看；你的選擇不會自動新增後端抓取或 LINE 通知。"));return;}
  if(!usable){panel.append(empty("這次資料還不夠，不急著下結論", "來源未成功取得，本次不展示舊建案充數。請稍後重新讀取，或在下一次排程更新後查看。"),statusRows(areas));return;}
  if(state.view==="transactions"){
    const unique=new Map();const favoriteNames=new Set(projects.filter(p=>state.favorites.has(p.id)).map(p=>p.name));
    for(const area of areas){if(area.availability==="unavailable")continue;for(const t of area.transactions||[]){if(search&&!t.project_name.toLowerCase().includes(search))continue;if($("favorites").checked&&!favoriteNames.has(t.project_name))continue;unique.set(JSON.stringify(t),t);}}
    const rows=[...unique.values()];$("result-note").textContent=`本次取得 ${rows.length} 筆紀錄；交易日不等於揭露日，不保證是當日新成交。`;
    if(!rows.length){panel.append(empty("本次沒有可展示的成交紀錄","可能是來源未提供或篩選後沒有資料，不能推論市場沒有成交。"));return;}
    for(const t of rows){const card=el("article","transaction");card.append(el("h3","",t.project_name));const dl=el("dl");for(const [key,title]of[["unit","棟別／戶別"],["floor","樓層"],["area","房屋面積"],["total_price","成交總價"],["unit_price","每坪單價"],["parking_price","車位價"],["deal_date","交易日期"]]){const cell=el("div");cell.append(el("dt","",title),el("dd","",t[key]||"未取得"));dl.append(cell);}card.append(dl,el("p","result-note","是否含車位：未經來源明示，不自行推算。"),link(t.url,"查看建案 ↗"));panel.append(card);}return;
  }
  const visible=projects.filter(p=>(state.category==="all"||p.category===state.category)&&(!search||p.name.toLowerCase().includes(search))&&(!$("favorites").checked||state.favorites.has(p.id)));
  $("result-note").textContent=`顯示 ${visible.length} 案 · ${scopeText}`;
  if(!visible.length)panel.append(empty("目前篩選下沒有可展示建案","試著切換建案階段或清除搜尋。這不等於區域內沒有供給。"));
  else{const cards=el("div","cards");visible.forEach(p=>cards.append(projectCard(p)));panel.append(cards);}
}
async function load(){
  $("refresh").disabled=true;state.error="";
  try{const response=await fetch(`market-data.json?t=${Date.now()}`,{cache:"no-store",signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error("source");const data=await response.json();if(data.schema_version!==1||!Array.isArray(data.areas)||!Number.isFinite(Date.parse(data.generated_at)))throw Error("schema");
    state.data=data;const district=$("district").value||saved.district,area=$("area").value||saved.area;syncRegions(district,area);saved={};
    const stamp=new Date(data.generated_at);$("updated").textContent=data.initializing?"等待首次資料更新 · 非即時行情":`資料產生於 ${stamp.toLocaleString("zh-TW",{timeZone:"Asia/Taipei",hour12:false})}（臺灣時間）`;
    const old=Date.now()-stamp.getTime()>8*86400000;$("notice").textContent=(old?"此版本已超過 8 天未更新，請勿視為即時行情。 ":"")+(data.scope_note||"資料僅代表本次可取得內容。");
  }catch{state.data=null;state.error="資料檔尚未發布、網路中斷或格式不符。請按「重新讀取」；此狀態不會顯示為零建案。";$("notice").textContent="暫時無法取得網站資料，不展示舊資料。";$("updated").textContent="尚未取得有效更新時間";}
  finally{$("refresh").disabled=false;render();}
}
$("city").value=["桃園市","新北市","臺北市","基隆市"].includes(saved.city)?saved.city:"桃園市";
$("city").addEventListener("change",()=>{syncRegions();save();render();});
$("district").addEventListener("change",()=>{syncAreas();save();render();});
$("area").addEventListener("change",()=>{save();render();});
$("search").addEventListener("input",render);$("favorites").addEventListener("change",render);$("refresh").addEventListener("click",load);
$("reset").addEventListener("click",()=>{$("city").value="桃園市";syncRegions();$("search").value="";$("favorites").checked=false;state.category="all";document.querySelectorAll("[data-category]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.category==="all")));save();render();});
const tabs=[...document.querySelectorAll("[data-view]")];
tabs.forEach((button,index)=>{button.addEventListener("click",()=>{state.view=button.dataset.view;tabs.forEach(b=>{b.setAttribute("aria-selected",String(b===button));b.tabIndex=b===button?0:-1;});render();});button.addEventListener("keydown",e=>{if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;e.preventDefault();const next=e.key==="Home"?0:e.key==="End"?tabs.length-1:(index+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click();});});
document.querySelectorAll("[data-category]").forEach(button=>button.addEventListener("click",()=>{state.category=button.dataset.category;document.querySelectorAll("[data-category]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));render();}));
async function initialize(){
  if(typeof RegionMap!=="undefined"){
    const ready=await RegionMap.init((city,district,area)=>{$("city").value=city;syncRegions(district,area);save();render();});
    if(ready){const preferred=saved.city||$("city").value;$("city").replaceChildren();for(const name of RegionMap.cities()){const o=el("option","",name);o.value=name;$("city").append(o);}$("city").value=RegionMap.cities().includes(preferred)?preferred:"桃園市";syncRegions(saved.district,saved.area);}
  }
  await load();
}
initialize();
