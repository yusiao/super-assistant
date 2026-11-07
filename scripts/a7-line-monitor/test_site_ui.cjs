// DOM-independent interaction regression tests; no live browser or network.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
class Element {
  constructor(tag = 'div') { this.tagName = tag; this.children = []; this.dataset = {}; this.attributes = {}; this.events = {}; this.value = ''; this.textContent = ''; this.checked = false; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(key, fn) { this.events[key] = fn; }
  click() { this.events.click?.({}); }
  focus() {}
}
const ids = new Map();
const get = id => { if (!ids.has(id)) ids.set(id, new Element()); return ids.get(id); };
const tabs = ['projects', 'transactions', 'reports'].map(view => { const e = new Element('button'); e.dataset.view = view; return e; });
const chips = ['all', 'active', 'pending', 'sold_out', 'completed'].map(category => { const e = new Element('button'); e.dataset.category = category; return e; });
const storage = new Map();
const fixture = { schema_version: 1, generated_at: '2026-10-25T01:00:00+08:00', areas: [
  { id: 'area-0', city: '桃園市', district: '龜山區', name: 'A7站重劃區-測試甲區', availability: 'partial', projects: [
    { id: 'L1', name: '測試預售甲', url: 'https://www.leju.com.tw/community/L1', category: 'active', status: '預售屋' },
    { id: 'L2', name: '測試待開乙', url: 'https://www.leju.com.tw/community/L2', category: 'pending', status: '待定 預售屋' }
  ], transactions: [{ project_name: '測試預售甲', unit: 'A08-8F', total_price: '1200萬', url: 'https://www.leju.com.tw/community/L1' }] },
  { id: 'area-1', city: '桃園市', district: '龜山區', name: 'A7站重劃區-測試乙區', availability: 'observed', projects: [
    { id: 'L1', name: '測試預售甲', url: 'https://www.leju.com.tw/community/L1', category: 'active', status: '預售屋' }
  ], transactions: [] }
] };
const boundaries = JSON.parse(fs.readFileSync(path.join(__dirname, 'site/districts.geojson'), 'utf8'));
let chooseRegion;
const RegionMap={init:async cb=>{chooseRegion=cb;return true;},
  cities:()=>[...new Set(boundaries.features.map(f=>f.properties.city))],
  districts:city=>boundaries.features.filter(f=>f.properties.city===city).map(f=>f.properties.district),render:()=>{}};
const context = vm.createContext({ document: { getElementById: get, createElement: tag => new Element(tag), createElementNS: (ns,tag) => new Element(tag), querySelectorAll: selector => selector === '[data-view]' ? tabs : chips },
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  fetch: async () => ({ ok: true, json: async () => structuredClone(fixture) }), RegionMap, AbortSignal, URL, Date, console });
const run = source => vm.runInContext(source, context);
const text = node => node.textContent + node.children.map(text).join(' ');
async function main() {
  run(fs.readFileSync(path.join(__dirname, 'site/app.js'), 'utf8'));
  assert.equal(run('link("https://newhouse.housefun.com.tw/building/123?secret=1", "test").href'),'https://newhouse.housefun.com.tw/building/123');
  assert.equal(run('link("https://nbm.jsl.com.tw/", "test").href'),'https://nbm.jsl.com.tw/');
  assert.equal(run('link("https://secret@nbm.jsl.com.tw/", "test").tagName'),'span');
  assert.equal(run('link("https://www.jsl.com.tw/admin", "test").tagName'),'span');
  assert.match(text(run('projectCard({id:"new",name:"test",category:"active",url:"https://nbm.jsl.com.tw/",source:"愛山林官方",areaNames:[]})')),/愛山林官方/);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(get('city').children.length,22,'All cities must be selectable');
  chooseRegion('基隆市','中正區');
  assert.equal(get('city').value,'基隆市');
  assert.equal(get('district').value,'中正區');
  assert.match(text(get('panel')),/還沒接入/);
  get('reset').click();
  assert.equal(get('project-count').textContent, 2, 'Cross-area duplicates must collapse');
  assert.equal(get('pending-count').textContent, 1);
  chooseRegion('桃園市','龜山區','area-1');
  assert.equal(get('area').value,'area-1');
  assert.equal(get('project-count').textContent,1,'Subarea filters report projects');
  assert.doesNotMatch(text(get('panel')),/測試待開乙/);
  chooseRegion('桃園市','龜山區');
  fixture.areas[0].projects.push({id:'L3',name:'測試新推案',category:'pending',url:'https://www.leju.com.tw/community/L3'});
  await run('load()');
  assert.match(text(get('panel')),/測試新推案/,'Refreshed projects appear in the report');
  fixture.areas[0].availability='unavailable';
  await run('load()');
  assert.doesNotMatch(text(get('panel')),/測試新推案|測試待開乙/,'Unavailable source never supplies report cards');
  fixture.areas[0].availability='partial';fixture.areas[0].projects.pop();
  await run('load()');
  chips.find(c => c.dataset.category === 'pending').click();
  assert.match(text(get('panel')), /測試待開乙/);
  assert.doesNotMatch(text(get('panel')), /測試預售甲/);
  const star = get('panel').children[0].children[0].children[0].children[1];
  star.click();
  assert.ok([...storage.values()][0].includes('L2'), 'Favorite must persist locally');
  chips[0].click(); get('favorites').checked = true; get('favorites').events.change();
  assert.doesNotMatch(text(get('panel')), /測試預售甲/);
  get('reset').click(); get('search').value = '不存在'; get('search').events.input();
  assert.match(text(get('panel')), /目前篩選下沒有/);
  get('reset').click(); tabs[1].click();
  assert.match(text(get('panel')), /A08-8F/);
  assert.match(text(get('panel')), /1200萬/);
  get('city').value = '新北市'; get('city').events.change();
  assert.equal(get('project-count').textContent, '—');
  assert.match(text(get('panel')), /還沒接入/);
  get('reset').click(); tabs[2].click();
  assert.match(text(get('panel')), /不提供修改 LINE/);
  context.fetch = async () => { throw new Error('offline'); };
  await run('load()');
  assert.equal(get('project-count').textContent, '—');
  assert.match(text(get('panel')), /暫時無法讀取/);
  assert.doesNotMatch(text(get('panel')),/測試預售甲|測試待開乙/,'Network failure clears report projects');
  console.log('UI regression checks passed: dedupe, category, favorites, search, reset, transactions, region, reports, network failure.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
