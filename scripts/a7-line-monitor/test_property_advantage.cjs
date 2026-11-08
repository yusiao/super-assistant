const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const site=path.join(__dirname,'site');
const rail=JSON.parse(fs.readFileSync(path.join(site,'advantage-rail.json'),'utf8'));
assert.equal(rail.schema_version,1);
assert.ok(rail.stations.filter(s=>s.source==='TRA').length>=150);
assert.ok(rail.stations.filter(s=>s.source==='MRT').length>=250);
assert.ok(rail.stations.every(s=>Object.keys(s).sort().join(',')==='lat,lon,name,source'&&rail.sources[s.source]));
const station={name:'核對車站',lat:25.003,lon:121.5};
const service={place:['test','retail',1,'商場'],km:.72},jobs={place:['test2','jobs',1,'園區'],km:1.45};
let nearby=[service],price={kind:'presale',high:48,mean:50,count:20,first:'2026-05-01',last:'2026-06-20',peers:3,label:'預售屋',scope:'測試區行政區'};
const context=vm.createContext({AbortSignal,
  fetch:async file=>{assert.equal(file,'advantage-rail.json');return {ok:true,json:async()=>({schema_version:1,stations:[station]})};},
  TaiwanContext:{load:async()=>({places:[]}),nearby:()=>nearby,distance:(a,b)=>111*Math.hypot(a[0]-b[0],a[1]-b[1])},
  LiveProjects:{location:p=>p.point},NationalMarket:{comparableOffer:p=>p.category==='pending'?null:price}});
vm.runInContext(fs.readFileSync(path.join(site,'property-advantage.js'),'utf8'),context);
const advantage=vm.runInContext('PropertyAdvantage',context);
(async()=>{
  const project={category:'active',point:[25,121.5],layout:'二房(25坪),三房(35坪)'};
  assert.equal(advantage.evaluate(project),null,'No qualification until reference sources load');
  await advantage.load();
  const first=advantage.evaluate(project);
  assert.equal(first.anchor,'核對車站');assert.equal(first.reasons.length,4);
  assert.match(first.reasons[3],/直線距離/);
  for(const updates of [{layout:'一房、四房'},{layout:'12房'},{point:null},{category:'pending'}])assert.equal(advantage.evaluate({...project,...updates}),null);
  const baseline=price;
  for(const updates of [{count:19},{high:50.01},{first:'2026-05-25'},{peers:2},{peers:undefined}]){
    price={...baseline,...updates};assert.equal(advantage.evaluate({...project}),null);
  }
  price={...baseline,kind:'completed',peers:null,label:'新成屋'};
  assert.ok(advantage.evaluate({...project,category:'new_home',layout:'2~3房'}));
  nearby=[];assert.equal(advantage.evaluate({...project}),null,'Rail alone is insufficient');
  nearby=[service];assert.equal(advantage.evaluate({...project,point:[24,120.6]}),null,'A service alone is insufficient');
  nearby=[service,jobs];assert.equal(advantage.evaluate({...project,point:[24,120.6]}).anchor,'園區');
  console.log('PASS: advantage requires a supported price, sample window, room type, and independently anchored location.');
})().catch(e=>{console.error(e);process.exitCode=1;});
