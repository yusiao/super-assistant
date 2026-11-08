const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
class Element{
  constructor(tag){this.tag=tag;this.children=[];this.events={};this.open=false;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(key,value){this[key]=value;}
  addEventListener(key,fn){this.events[key]=fn;}
  removeEventListener(key,fn){if(this.events[key]===fn)delete this.events[key];}
}
const site=name=>fs.readFileSync(path.join(__dirname,"site",name),"utf8");
const profiles=JSON.parse(site("builder-profiles.json"));
const flat=node=>[node,...node.children.flatMap(flat)];
const text=node=>flat(node).map(n=>n.textContent||"").join(" ");
const project={id:"new",name:"測試建案",city:"臺北市",district:"北投區",address:"台北市北投區東華街一段2號旁"};
const filing={name:project.name,address:"東華街一段12號旁",builder:"示例建設股份有限公司（代表人王小明）",permit:"(115)建字第00009號"};
let reads=0;
const context=vm.createContext({document:{createElement:t=>new Element(t)},URL,AbortSignal,
  NationalMarket:{load:async()=>{},builderFilings:p=>p.id==="new"?[filing]:[]},
  fetch:async name=>{assert.equal(name,"builder-profiles.json");reads++;return {ok:true,json:async()=>profiles};}});
vm.runInContext(site("builder-details.js"),context);
const details=vm.runInContext("BuilderDetails",context);
async function open(p,known){
  const box=details.panel(p,known);
  assert.equal(box.children[0].tag,"summary");
  assert.equal(box.children[1]["aria-live"],"polite");
  box.open=true;box.events.toggle();
  await new Promise(setImmediate);
  assert.ok(flat(box).filter(n=>n.tag==="a").every(a=>a.href.startsWith("https://")&&a.rel==="noopener noreferrer"));
  return text(box);
}
(async()=>{
  assert.equal(details.matchFiling(project,[filing]),filing);
  assert.equal(details.matchFiling(project,[filing,{...filing}]),null);
  assert.equal(details.matchFiling({...project,building_permit:"(115)建字第00010號"},[filing]),null);
  assert.equal(details.matchFiling({...project,address:"",building_permit:"（115）建字第00009號"},[filing]),filing);
  assert.equal(details.matchFiling({...project,address:"東華街二段2號"},[filing]),null);
  assert.equal(details.matchFiling({...project,name:"不同案"},[filing]),null);
  assert.equal(Array.from(details.companyNames("甲乙建設有限公司與丙丁建設股份有限公司、王小明")).join("|"),
    "甲乙建設有限公司|丙丁建設股份有限公司");
  assert.equal(reads,0);
  assert.match(await open(project),/官方備查起造人 示例建設股份有限公司/);
  assert.doesNotMatch(await open(project),/王小明/);
  for(const [id,row] of Object.entries(profiles.projects)){
    const result=await open({...row,id});
    for(const name of row.companies)assert.ok(result.includes(name));
    assert.match(result,row.role==="filed_company"?/備查建設公司/:/投資興建/);
    if(row.name==="登陽釀時光")assert.match(result,/公開品牌.*登陽營建機構.*集團／旗下關係未確認/);
    if(row.name==="境三千")assert.match(result,/公開品牌.*昌禾營建機構/);
  }
  const dengyang=profiles.projects["591-130974"];
  assert.match(await open({...dengyang,id:"591-130974",district:"西屯區"}),/目前沒有能確認/);
  assert.match(await open({...dengyang,id:"130974",url:"https://newhouse.591.com.tw/130974"}),/登陽營建機構/);
  assert.doesNotMatch(await open({...project,id:"other",development_companies:["登仰建設有限公司"]}),/登陽營建機構/);
  const joint=await open({...project,development_companies:["國泰建設股份有限公司","甲乙建設有限公司"]});
  assert.match(joint,/公開集團關係.*霖園集團/);
  assert.match(joint,/關係未確認：甲乙建設有限公司、示例建設股份有限公司/);
  assert.match(await open({...project,development_companies:["三井工程股份有限公司"]}),/已披露母公司 三井工程股份有限公司：國泰建設股份有限公司/);
  assert.match(await open({name:"未知案",id:"unknown"}),/目前沒有能確認/);
  assert.match(await open(filing,filing),/官方備查起造人 示例建設股份有限公司/);
  assert.equal(reads,1,"Builder profiles are fetched once and only on demand");
  console.log("Builder details passed");
})().catch(e=>{console.error(e);process.exitCode=1;});
