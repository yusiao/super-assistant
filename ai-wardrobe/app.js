const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const categories = ['全部', '上身', '下身', '外套', '鞋履', '配件'];
const occasionProfiles = {
  工作: { formality: 4, styles: ['都會', '極簡'], names: ['沈穩留白', '俐落層次', '柔和專業'] },
  約會: { formality: 3, styles: ['浪漫', '自然'], names: ['溫柔焦點', '不經意浪漫', '傍晚微光'] },
  週末: { formality: 1.5, styles: ['自然', '街頭', '運動'], names: ['舒服出走', '輕鬆有型', '城市散步'] },
  聚會: { formality: 3, styles: ['都會', '浪漫', '街頭'], names: ['恰到好處', '自在主角', '今晚有約'] }
};
const materialWarmth = { 棉麻: 1, 機能: 1, 丹寧: 2.5, 西裝料: 2.5, 皮革: 3.5, 針織: 4 };
const svgPiece = (kind, color, label) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520"><rect width="400" height="520" fill="#e9e4d9"/><circle cx="320" cy="80" r="54" fill="#f4efe5"/><path d="${kind === 'top' ? 'M112 132l57-37h62l57 37 61 65-50 45-43-42v231H144V200l-43 42-50-45z' : kind === 'bottom' ? 'M132 88h136l30 337-77 7-21-214-21 214-77-7z' : kind === 'outer' ? 'M106 125l63-36h62l63 36 44 264-90 16-48-230-48 230-90-16z' : kind === 'shoe' ? 'M56 310c62 0 105-54 133-101l44 19 20 63c36 35 74 39 101 52v67H55z' : 'M126 164c0-47 33-80 74-80s74 33 74 80v49h36v216H90V213h36zm34 49h80v-44c0-30-16-48-40-48s-40 18-40 48z'}" fill="${color}"/><path d="M44 470h312" stroke="#c9c2b4" stroke-width="2"/><text x="200" y="493" text-anchor="middle" font-family="sans-serif" font-size="12" letter-spacing="3" fill="#69726d">${label}</text></svg>`)}`;

const demoItems = [
  { id: 'd1', name: '燕麥針織上衣', category: '上身', color: '#c8ad84', material: '針織', formality: 3, style: '自然', image: svgPiece('top', '#c8ad84', 'OAT KNIT') },
  { id: 'd2', name: '鼠尾草襯衫', category: '上身', color: '#809485', material: '棉麻', formality: 4, style: '極簡', image: svgPiece('top', '#809485', 'SAGE SHIRT') },
  { id: 'd3', name: '深墨直筒褲', category: '下身', color: '#293b39', material: '西裝料', formality: 4, style: '都會', image: svgPiece('bottom', '#293b39', 'INK TROUSERS') },
  { id: 'd4', name: '陶土色長裙', category: '下身', color: '#a75c49', material: '棉麻', formality: 3, style: '浪漫', image: svgPiece('bottom', '#a75c49', 'TERRA SKIRT') },
  { id: 'd5', name: '奶油風衣', category: '外套', color: '#d7c8aa', material: '西裝料', formality: 4, style: '極簡', image: svgPiece('outer', '#d7c8aa', 'CREAM COAT') },
  { id: 'd6', name: '棕色樂福鞋', category: '鞋履', color: '#705443', material: '皮革', formality: 4, style: '都會', image: svgPiece('shoe', '#705443', 'LOAFERS') },
  { id: 'd7', name: '米白休閒鞋', category: '鞋履', color: '#dcd8ca', material: '皮革', formality: 1, style: '自然', image: svgPiece('shoe', '#dcd8ca', 'SNEAKERS') },
  { id: 'd8', name: '琥珀托特包', category: '配件', color: '#ad7a43', material: '皮革', formality: 3, style: '自然', image: svgPiece('accessory', '#ad7a43', 'TOTE BAG') }
];

const normalizeItem = item => ({ material: '棉麻', formality: 3, style: '極簡', color: '#b6a78f', ...item });
let items = demoItems.map(normalizeItem);
let saved = [];
let filter = '全部', pendingImages = [], currentLooks = [], generationRound = 0;

const DB_NAME = 'jarvis-wardrobe';
const DB_STORE = 'app-state';
let databasePromise;
function openDatabase() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB unavailable'));
  if (!databasePromise) databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return databasePromise;
}
async function readDatabase() {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get('wardrobe');
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}
function compactState() {
  return {
    items,
    saved: saved.map(look => ({ ...look, parts: undefined, partIds: (look.parts || []).map(part => part.id) }))
  };
}
async function writeDatabase(state) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).put(state, 'wardrobe');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
async function persist() {
  const state = compactState();
  try {
    await writeDatabase(state);
    localStorage.removeItem('mori-items'); localStorage.removeItem('mori-saved');
  } catch (error) {
    try { localStorage.setItem('mori-items', JSON.stringify(items)); localStorage.setItem('mori-saved', JSON.stringify(state.saved)); }
    catch { throw new Error('手機儲存空間不足，請刪除部分照片後重試。'); }
  }
}
function hydrateSaved(looks = []) {
  return looks.map(look => {
    const ids = look.partIds || (look.parts || []).map(part => part.id);
    return { ...look, parts: ids.map(id => items.find(item => item.id === id)).filter(Boolean) };
  }).filter(look => look.parts.length);
}
async function loadState() {
  let state = null;
  try { state = await readDatabase(); } catch {}
  if (!state) {
    try {
      const oldItems = JSON.parse(localStorage.getItem('mori-items') || 'null');
      const oldSaved = JSON.parse(localStorage.getItem('mori-saved') || '[]');
      state = { items: oldItems || demoItems, saved: oldSaved };
    } catch { state = { items: demoItems, saved: [] }; }
  }
  items = (state.items || demoItems).map(normalizeItem);
  saved = hydrateSaved(state.saved || []);
  try { await persist(); } catch {}
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
function toast(message, duration = 1800) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), duration); }
function combinations() {
  const tops = items.filter(x => x.category === '上身').length;
  const bottoms = items.filter(x => x.category === '下身').length;
  const shoes = items.filter(x => x.category === '鞋履').length;
  return tops * bottoms * shoes;
}
function updateStats() { $('#itemCount').textContent = items.length; $('#lookCount').textContent = combinations(); $('#savedCount').textContent = saved.length; }
function renderFilters() { $('#categoryFilters').innerHTML = categories.map(c => `<button class="filter-chip ${c === filter ? 'active' : ''}" data-filter="${c}">${c}</button>`).join(''); }
function renderItems() {
  const list = filter === '全部' ? items : items.filter(x => x.category === filter);
  $('#clothesGrid').innerHTML = list.map(i => `<article class="clothing-card"><img src="${i.image}" alt="${escapeHtml(i.name)}"><button class="delete-item" data-delete="${i.id}" aria-label="刪除 ${escapeHtml(i.name)}">×</button><div class="card-label"><span>${escapeHtml(i.name)}</span><small>${i.category}</small></div></article>`).join('') || '<div class="empty-state"><strong>這一格還空著</strong>拍一件衣服放進來吧。</div>';
  updateStats();
}
function renderSaved() { $('#savedGrid').innerHTML = saved.length ? saved.map((look, index) => lookCard(look, true, index)).join('') : '<div class="empty-state"><strong>還沒有收藏</strong>生成穿搭後，點一下愛心就會留在這裡。</div>'; }
async function init() { await loadState(); renderFilters(); renderItems(); renderSaved(); updateWeather(); }

$('#categoryFilters').addEventListener('click', e => { if (!e.target.dataset.filter) return; filter = e.target.dataset.filter; renderFilters(); renderItems(); });
$('#clothesGrid').addEventListener('click', async e => { const id = e.target.dataset.delete; if (!id) return; items = items.filter(x => x.id !== id); saved = saved.filter(look => !(look.parts || []).some(part => part.id === id)); await persist(); renderItems(); renderSaved(); toast('已移出衣櫃'); });
$('#uploadTrigger').addEventListener('click', () => $('#fileInput').click());
$('#mobileUpload').addEventListener('click', () => $('#fileInput').click());
$('#fileInput').addEventListener('change', e => { pendingImages = [...e.target.files]; if (pendingImages.length) { toast('正在處理照片…', 5000); openNextUpload(); } });

function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
}
async function compressPhoto(file) {
  if (!file.type.startsWith('image/')) throw new Error('請選擇照片檔案。');
  if (file.size > 30 * 1024 * 1024) throw new Error('照片超過 30MB，請換一張較小的照片。');
  const source = await readAsDataUrl(file);
  const image = new Image();
  await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error('無法讀取這張照片，請改用 JPG、PNG 或 WEBP。')); image.src = source; });
  const maxSide = 1280, scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d'); context.fillStyle = '#f3efe5'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', .78);
}

function estimateColor(imageSrc) {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas'); canvas.width = 24; canvas.height = 24;
    const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(image, 0, 0, 24, 24);
    const data = context.getImageData(0, 0, 24, 24).data; let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 16) {
      const max = Math.max(data[i], data[i + 1], data[i + 2]), min = Math.min(data[i], data[i + 1], data[i + 2]);
      if (data[i + 3] > 200 && max < 245 && min > 18) { r += data[i]; g += data[i + 1]; b += data[i + 2]; count++; }
    }
    if (count) $('#itemColor').value = `#${[r, g, b].map(v => Math.round(v / count).toString(16).padStart(2, '0')).join('')}`;
  };
  image.src = imageSrc;
}
async function openNextUpload() {
  if (!pendingImages.length) { $('#fileInput').value = ''; return; }
  const file = pendingImages.shift();
  try {
    const photo = await compressPhoto(file); $('#uploadPreview').src = photo; $('#itemName').value = file.name.replace(/\.[^.]+$/, ''); estimateColor(photo); $('#itemDialog').showModal(); toast('照片已最佳化');
  } catch (error) { toast(error.message || '照片處理失敗，請再試一次。', 4500); setTimeout(openNextUpload, 300); }
}
$('#itemForm').addEventListener('submit', async e => {
  e.preventDefault(); const name = $('#itemName').value.trim(); if (!name) return;
  const button = $('#saveItemButton'); button.disabled = true; button.textContent = '儲存中…';
  const item = { id: crypto.randomUUID(), name, category: $('#itemCategory').value, color: $('#itemColor').value, material: $('#itemMaterial').value, formality: +$('#itemFormality').value, style: $('#itemStyle').value, image: $('#uploadPreview').src };
  items.unshift(item);
  try { await persist(); $('#itemDialog').close(); renderItems(); toast('已分析並收進衣櫃'); setTimeout(openNextUpload, 200); }
  catch (error) { items = items.filter(entry => entry.id !== item.id); toast(error.message || '儲存失敗，請再試一次。', 5000); }
  finally { button.disabled = false; button.textContent = '收進衣櫃'; }
});
$('#itemDialog').addEventListener('close', () => { if ($('#itemDialog').returnValue === 'cancel') pendingImages = []; });

function updateWeather() {
  const t = +$('#temperature').value; $('#tempOutput').textContent = `${t}°C`;
  $('#weatherHint').textContent = t < 18 ? '偏涼，需要保暖層次' : t < 27 ? '舒適，適合輕薄層次' : '炎熱，優先透氣單品';
}
$('#temperature').addEventListener('input', updateWeather);

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2; let h = 0, s = 0;
  if (max !== min) { const d = max - min; s = l > .5 ? d / (2 - max - min) : d / (max + min); h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return { h, s: s * 100, l: l * 100 };
}
function colorPairScore(a, b) {
  const x = hexToHsl(a), y = hexToHsl(b), neutral = x.s < 18 || y.s < 18, distance = Math.min(Math.abs(x.h - y.h), 360 - Math.abs(x.h - y.h));
  if (neutral) return 10; if (distance <= 40) return 9; if (distance >= 145) return 8; if (distance <= 90) return 6; return 4;
}
function desiredWarmth(temp) { return temp <= 15 ? 5 : temp <= 20 ? 4 : temp <= 25 ? 2.5 : 1; }
function scoreOutfit(parts, occasion, temp) {
  const profile = occasionProfiles[occasion], core = parts.filter(p => p.category !== '配件');
  const pairs = []; for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) pairs.push(colorPairScore(parts[i].color, parts[j].color));
  const color = (pairs.reduce((a, b) => a + b, 0) / Math.max(1, pairs.length)) * 3;
  const avgFormality = core.reduce((sum, p) => sum + p.formality, 0) / core.length;
  const formality = Math.max(0, 25 - Math.abs(avgFormality - profile.formality) * 8);
  const baseWarmth = core.filter(p => p.category !== '鞋履').reduce((sum, p) => sum + (materialWarmth[p.material] || 2), 0) / Math.max(1, core.filter(p => p.category !== '鞋履').length);
  const outfitWarmth = baseWarmth + (parts.some(p => p.category === '外套') ? 1.3 : 0);
  const climate = Math.max(0, 25 - Math.abs(outfitWarmth - desiredWarmth(temp)) * 8);
  const styleHits = parts.filter(p => profile.styles.includes(p.style)).length;
  const style = Math.min(10, 4 + styleHits * 3);
  const lights = parts.map(p => hexToHsl(p.color).l), contrast = Math.max(...lights) - Math.min(...lights);
  const balance = contrast >= 18 && contrast <= 70 ? 10 : 7;
  const total = Math.round(Math.min(100, color + formality + climate + style + balance));
  const reasons = [];
  reasons.push(color >= 25 ? '色彩和諧' : '有意識的撞色');
  if (formality >= 20) reasons.push('符合場合');
  if (climate >= 19) reasons.push('體感合適');
  if (style >= 7) reasons.push(`${profile.styles[0]}風格`);
  if (balance === 10) reasons.push('明暗有層次');
  return { total, reasons, detail: `色彩 ${Math.round(color)}/30 · 場合 ${Math.round(formality)}/25 · 氣候 ${Math.round(climate)}/25` };
}
function generateCandidates(occasion, temp) {
  const tops = items.filter(i => i.category === '上身'), bottoms = items.filter(i => i.category === '下身'), shoes = items.filter(i => i.category === '鞋履');
  const extras = temp <= 21 ? items.filter(i => i.category === '外套') : items.filter(i => i.category === '配件');
  if (!tops.length || !bottoms.length || !shoes.length) { toast('專業搭配至少需要上身、下身與鞋履各一件'); return []; }
  const optional = extras.length ? extras : [null], candidates = [];
  for (const top of tops) for (const bottom of bottoms) for (const shoe of shoes) for (const extra of optional) {
    const parts = [top, bottom, shoe, ...(extra ? [extra] : [])], scoring = scoreOutfit(parts, occasion, temp);
    candidates.push({ parts, ...scoring });
  }
  return candidates.sort((a, b) => b.total - a.total);
}
function generateLooks() {
  const occasion = $('input[name="occasion"]:checked').value, temp = +$('#temperature').value, candidates = generateCandidates(occasion, temp); if (!candidates.length) return;
  const pool = candidates.slice(0, Math.min(7, candidates.length)), start = generationRound++ % Math.max(1, pool.length - 2), selected = pool.slice(start, start + 3);
  while (selected.length < 3 && pool.length) selected.push(pool[selected.length % pool.length]);
  currentLooks = selected.map((candidate, index) => ({ id: `${Date.now()}-${index}`, title: occasionProfiles[occasion].names[index], occasion, temp, parts: candidate.parts, score: candidate.total, reasons: candidate.reasons, detail: candidate.detail, note: candidate.total >= 85 ? '比例、場合與色彩都很穩，是今天最不費力的選擇。' : '保留一點對比，讓整套穿搭有焦點但不顯刻意。' }));
  renderLooks(); $('#results').classList.remove('hidden'); $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
$('#generatorForm').addEventListener('submit', e => { e.preventDefault(); generationRound = 0; generateLooks(); });
$('#regenerate').addEventListener('click', generateLooks);
function lookCard(look, isSaved = false, index = 0) {
  const displayParts = look.parts.length > 3 ? [look.parts[0], look.parts[1], look.parts[3]] : look.parts.slice(0, 3);
  const images = displayParts.map(p => `<img src="${p.image}" alt="${escapeHtml(p.name)}">`).join('');
  const reasons = (look.reasons || []).map(reason => `<span>${reason}</span>`).join('');
  return `<article class="look-card"><div class="look-visual">${images}</div><div class="match-score">${look.score || 80}% MATCH</div><div class="look-info"><span>${look.occasion} · ${look.temp}°C</span><h3>${look.title}</h3><p>${look.note}</p><div class="reason-list">${reasons}</div><p class="look-items">${look.parts.map(p => escapeHtml(p.name)).join(' ＋ ')}</p></div><button class="save-look ${isSaved ? 'saved' : ''}" data-look="${isSaved ? 'saved-' : ''}${index}" aria-label="${isSaved ? '移除收藏' : '收藏穿搭'}">${isSaved ? '♥' : '♡'}</button></article>`;
}
function renderLooks() { $('#looksGrid').innerHTML = currentLooks.map((look, index) => lookCard(look, saved.some(x => x.id === look.id), index)).join(''); }
$('#looksGrid').addEventListener('click', async e => { if (!e.target.dataset.look) return; const look = currentLooks[+e.target.dataset.look], exists = saved.findIndex(x => x.id === look.id); if (exists >= 0) { saved.splice(exists, 1); toast('已取消收藏'); } else { saved.unshift(look); toast('已收藏這套穿搭'); } await persist(); renderLooks(); renderSaved(); updateStats(); });
$('#savedGrid').addEventListener('click', async e => { const key = e.target.dataset.look; if (!key?.startsWith('saved-')) return; saved.splice(+key.split('-')[1], 1); await persist(); renderSaved(); updateStats(); toast('已取消收藏'); });
$$('.nav-link, .mobile-tab').forEach(button => button.addEventListener('click', () => { const view = button.dataset.view; $$('.nav-link, .mobile-tab').forEach(x => x.classList.toggle('active', x.dataset.view === view)); $('#wardrobeView').classList.toggle('hidden', view !== 'wardrobe'); $('#looksView').classList.toggle('hidden', view !== 'looks'); if (view === 'looks') renderSaved(); window.scrollTo({ top: 0, behavior: 'smooth' }); }));
$('#resetButton').addEventListener('click', async () => { items = demoItems.map(normalizeItem); saved = []; await persist(); filter = '全部'; renderFilters(); renderItems(); renderSaved(); updateStats(); toast('衣櫃已恢復示範狀態'); });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
init().catch(() => { renderFilters(); renderItems(); renderSaved(); updateWeather(); toast('儲存功能初始化失敗，請重新開啟 App。', 5000); });
