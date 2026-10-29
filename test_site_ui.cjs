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
const context = vm.createContext({ document: { getElementById: get, createElement: tag => new Element(tag), createElementNS: (ns,tag) => new Element(tag), querySelectorAll: selector => selector === '[data-view]' ? tabs : chips },
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  fetch: async url => ({ ok: true, json: async () => structuredClone(url==='districts.geojson'?boundaries:fixture) }), AbortSignal, URL, Date, console });
const run = source => vm.runInContext(source, context);
const text = node => node.textContent + node.children.map(text).join(' ');
async function main() {
  run(fs.readFileSync(path.join(__dirname, 'site/map.js'), 'utf8').replace('return {init,render,cities,districts}', 'return {init,render,cities,districts,sketchHectares}'));
  run(fs.readFileSync(path.join(__dirname, 'site/app.js'), 'utf8'));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(get('city').children.length,22,'All cities must be selectable');
  assert.equal(get('district-map').children.filter(n=>n.tagName==='path').length,368,'Default opens nationwide');
  const initialBox=get('district-map').attributes.viewBox;
  get('map-zoom-in').click();
  assert.notEqual(get('district-map').attributes.viewBox,initialBox);
  assert.equal(get('map-zoom-level').textContent,'1.5×');
  get('map-zoom-out').click();
  assert.equal(get('map-zoom-level').textContent,'1.0×');
  for(let i=0;i<15;i++)get('map-zoom-in').click();
  assert.equal(get('map-zoom-level').textContent,'32.0×');
  get('map-overview').click();
  assert.equal(get('district-map').attributes.viewBox,initialBox);
  get('map-overview').click();
  assert.equal(get('district-map').children.filter(n=>n.tagName==='path').length,368,'National view must allow all districts');
  const keelung=get('district-map').children.find(n=>n.attributes['aria-label']?.startsWith('基隆市中正區'));
  assert.ok(keelung);
  keelung.click();
  assert.equal(get('city').value,'基隆市');
  assert.equal(get('district').value,'中正區');
  assert.equal(get('district-map').children.filter(n=>n.tagName==='path').length,1,'Selecting a district drills down');
  assert.match(text(get('map-local-note')),/尚未接入/);
  assert.match(text(get('panel')),/還沒接入/);
  get('map-city').click();
  assert.equal(get('district-map').children.filter(n=>n.tagName==='path').length,7);
  get('reset').click();
  assert.equal(get('project-count').textContent, 2, 'Cross-area duplicates must collapse');
  assert.equal(get('pending-count').textContent, 1);
  get('map-district-buttons').children.find(n=>n.textContent==='龜山區').click();
  assert.equal(get('district-map').children.filter(n=>n.tagName==='path').length,1);
  assert.equal(get('map-projects').children.length,2,'Map local projects deduplicate');
  assert.match(text(get('map-projects')),/測試待開乙/);
  assert.equal(get('map-projects').children[0].children[2].href,'https://www.leju.com.tw/community/L1');
  get('map-subareas').children.find(n=>n.textContent==='A7 · 測試乙區').click();
  assert.equal(get('area').value,'area-1');
  assert.equal(get('map-projects').children.length,1,'Subarea filters map projects');
  assert.doesNotMatch(text(get('map-projects')),/測試待開乙/);
  get('map-subareas').children[0].click();
  assert.equal(get('map-projects').children.length,2);
  fixture.areas[0].projects.push({id:'L3',name:'測試新推案',category:'pending',url:'https://www.leju.com.tw/community/L3'});
  await run('load()');
  assert.match(text(get('map-projects')),/測試新推案/,'Refreshed projects appear next to map');
  fixture.areas[0].availability='unavailable';
  await run('load()');
  assert.doesNotMatch(text(get('map-projects')),/測試新推案|測試待開乙/,'Unavailable source never supplies map cards');
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
  fixture.areas[0].name='A7站重劃區-郵政物流';
  fixture.areas[1].name='A7站重劃區-樂善國小';
  await run('load()');
  get('map-district-buttons').children.find(n=>n.textContent==='龜山區').click();
  const anchors=get('district-map').children.filter(n=>n.attributes.class?.startsWith('life-anchor'));
  assert.equal(anchors.length,2,'Known connected life areas have map landmarks');
  const sketches=get('district-map').children.filter(n=>n.tagName==='polygon');
  assert.equal(sketches.length,2,'Connected life areas have estimated polygon outlines');
  assert.ok(sketches.every(n=>n.attributes.points&&!n.attributes.points.includes('NaN')));
  assert.match(text(anchors[0]),/示意框約 \d+ 公頃/);
  assert.equal(run('RegionMap.sketchHectares([[121,25],[121.01,25],[121.01,25.01],[121,25.01]])'),110,'Hectares are computed from polygon, rounded to tens');
  sketches[1].click();
  assert.equal(get('area').value,'area-1','Clicking area outline filters projects');
  assert.match(text(get('map-local-note')),/非生活圈實際面積/);
  anchors[1].click();
  assert.equal(get('area').value,'area-1','Map landmark selects subarea');
  assert.equal(get('map-projects').children.length,1);
  get('map-overview').click();
  assert.equal(get('district-map').children.filter(n=>n.attributes.class?.startsWith('life-anchor')).length,0,'No overcrowded landmarks on national view');
  context.fetch = async () => { throw new Error('offline'); };
  await run('load()');
  assert.equal(get('project-count').textContent, '—');
  assert.match(text(get('panel')), /暫時無法讀取/);
  assert.doesNotMatch(text(get('map-projects')),/測試預售甲|測試待開乙/,'Network failure clears map projects');
  console.log('UI regression checks passed: dedupe, category, favorites, search, reset, transactions, region, reports, network failure.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
