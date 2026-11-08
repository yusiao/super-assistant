"use strict";
const BuilderDetails=(()=>{
  const filingSource={label:"內政部預售屋備查資料",url:"https://data.gov.tw/dataset/176351"};
  const registry={label:"查商工登記",url:"https://findbiz.nat.gov.tw/fts/query/QueryBar/queryInit.do"};
  const node=(tag,value="")=>{const el=document.createElement(tag);el.textContent=value;return el;};
  const key=value=>String(value||"").normalize("NFKC").replace(/\s+/g,"").replaceAll("台","臺");
  const permitKey=value=>{const p=key(value).replace(/[()－-]/g,"");return /[建執]/.test(p)&&/\d/.test(p)?p:"";};
  function companyNames(raw){
    const parts=Array.isArray(raw)?raw:[raw];
    return [...new Set(parts.flatMap(value=>typeof value==="string"?value.split(/[、,，;；/／\n]|(?<=有限公司)[及與]/):[]).flatMap(segment=>{
      const m=segment.trim().replace(/^[^－–—-]*(?:營建機構|建設集團)\s*[－–—-]\s*/,"")
        .match(/^([\p{L}\p{N}．· .（）()\-]{2,72}?(?:股份有限公司|有限公司))(?=$|[\s（(]|等)/u);
      return m?[m[1]]:[];
    }))].slice(0,8);
  }
  function roads(address,project){
    const clean=key(address).replace(/^基地[：:]?/,"").replace(/^地址[：:]?/,"");
    const stripped=(clean.startsWith(key(project.city))?clean.slice(key(project.city).length):clean);
    const local=stripped.startsWith(key(project.district))?stripped.slice(key(project.district).length):stripped;
    return local.match(/[\p{Script=Han}a-zA-Z0-9]{1,22}?(?:大道|路|街)(?:[一二三四五六七八九十\d]+段)?/gu)||[];
  }
  function matchFiling(project,rows){
    if(!key(project.name))return null;
    const matches=rows.filter(p=>key(p.name)===key(project.name));
    const permit=permitKey(project.building_permit);
    const candidates=permit&&matches.some(p=>permitKey(p.permit))?matches.filter(p=>permitKey(p.permit)===permit):
      matches.filter(p=>{
        const a=roads(project.address,project),b=roads(p.address,project);
        return a.some(r=>b.includes(r));
      });
    return candidates.length===1?candidates[0]:null;
  }
  let request;
  function load(){
    return request??=fetch("builder-profiles.json",{signal:AbortSignal.timeout(8000)}).then(async r=>{
      if(!r.ok)throw Error("builder source");const body=await r.json();
      return body.schema_version===1&&body.projects&&body.companies?body:null;
    }).catch(()=>{request=undefined;return null;});
  }
  function sourceLink(source){
    try{
      const u=new URL(source?.url);
      if(u.protocol!=="https:"||u.username||u.password||!source.label)return null;
      const a=node("a",source.label);a.href=u.href;a.target="_blank";a.rel="noopener noreferrer";return a;
    }catch{return null;}
  }
  function addSource(parent,source){const link=sourceLink(source);if(link)parent.append(link);}
  function row(parent,label,value,source){
    const item=node("div");item.className="builder-row";
    item.append(node("strong",label),node("p",value));if(source)addSource(item,source);
    parent.append(item);
  }
  function sameProject(a,b){return a&&key(a.name)===key(b.name)&&key(a.city)===key(b.city)&&key(a.district)===key(b.district);}
  function render(content,project,filing,profiles){
    const sourceId=String(project.url||"").match(/^https:\/\/newhouse\.591\.com\.tw\/(\d+)(?:\/detail)?\/?$/)?.[1];
    const id=sourceId?`591-${sourceId}`:project.id;
    const ref=Object.hasOwn(profiles?.projects||{},id)?profiles.projects[id]:null;
    const reviewed=sameProject(ref,project)?ref:null;
    const captured=companyNames(project.development_companies);
    const handChecked=companyNames(reviewed?.companies);
    const applicants=companyNames(filing?.builder);
    content.replaceChildren();
    if(handChecked.length)row(content,reviewed.role==="filed_company"?"備查建設公司":"投資興建",handChecked.join("、"),reviewed.source);
    if(captured.length&&(!handChecked.length||captured.map(key).sort().join("|")!==handChecked.map(key).sort().join("|")))
      row(content,handChecked.length?"另一來源所列投資興建":"投資興建",captured.join("、"),{label:"公開建案資料",url:project.url});
    if(applicants.length)row(content,"官方備查起造人",applicants.join("、"),filingSource);
    const companies=[...new Map([...handChecked,...captured,...applicants].map(name=>[key(name),name])).values()];
    if(!companies.length){
      content.append(node("p","目前沒有能確認的建商公司資料。未以案名、代銷或營造廠猜測。"));addSource(content,registry);return;
    }
    const unconfirmed=[];
    for(const name of companies){
      const normalized=key(name);
      const profile=Object.hasOwn(profiles?.companies||{},normalized)?profiles.companies[normalized]:null;
      if(/^\d{8}$/.test(profile?.registration||""))row(content,"公司登記",`${name} · 統編 ${profile.registration}`,
        {label:"經濟部公司登記",url:`https://findbiz.nat.gov.tw/fts/company/${profile.registration}`});
      const relation=profile?.relation;
      if(relation&&(!relation.project_id||(reviewed&&relation.project_id===id))&&["brand","group","subsidiary"].includes(relation.kind)&&sourceLink(relation.source)){
        const label={brand:"公開品牌",group:"公開集團關係",subsidiary:"已披露母公司"}[relation.kind];
        row(content,label,`${name}：${relation.name}。${relation.note||""}`,relation.source);
        if(relation.kind==="brand")unconfirmed.push(name);
      }else unconfirmed.push(name);
    }
    if(unconfirmed.length)content.append(node("small",`集團／旗下關係未確認：${unconfirmed.join("、")}。共同品牌、同案合作或名稱相近不等於母子公司。`));
    if(applicants.length)content.append(node("small","起造人是官方備查角色，不一定是實際投資興建公司。"));
    addSource(content,registry);
  }
  function panel(project,knownFiling){
    const box=node("details"),content=node("div","正在讀取公開建商資料…");
    box.className="builder-details";content.className="builder-content";
    content.setAttribute("aria-live","polite");
    box.append(node("summary","建商資料 · 品牌與集團"),content);
    const open=()=>{
      if(!box.open)return;box.removeEventListener("toggle",open);
      const market=typeof NationalMarket!=="undefined"?NationalMarket:null;
      Promise.all([load(),knownFiling?null:market?.load()]).then(([profiles])=>{
        const filing=knownFiling||matchFiling(project,market?.builderFilings(project)||[]);
        render(content,project,filing,profiles);
      }).catch(()=>{content.textContent="建商資料暫時無法讀取。";});
    };
    box.addEventListener("toggle",open);return box;
  }
  return {panel,matchFiling,companyNames};
})();
