(() => {
'use strict';

/* ---------- constants ---------- */
const STORE = 'kyushu2027-planner-v1';
const VIEWSTORE = 'kyushu2027-planner-view';
const CAT = {
  spot: { n: '景點', hex: '#E8A33D', i: 'fa-camera' },
  food: { n: '餐飲', hex: '#D9534F', i: 'fa-utensils' },
  stay: { n: '住宿', hex: '#4FA3C7', i: 'fa-bed' },
  move: { n: '交通與航班', hex: '#5FB98E', i: 'fa-train' }
};
const MODES = {
  flight: { n: '航班', i: 'fa-plane', c: '#5FB98E' },
  shinkansen: { n: '新幹線', i: 'fa-train', c: '#F0A63A' },
  train: { n: '火車', i: 'fa-train', c: '#5B8DEF' },
  subway: { n: '地鐵', i: 'fa-train-subway', c: '#A77BE0' },
  tram: { n: '市電', i: 'fa-train-tram', c: '#A77BE0' },
  bus: { n: '公車', i: 'fa-bus', c: '#3FBF9A' },
  walk: { n: '步行', i: 'fa-person-walking', c: '#8A96A3' },
  taxi: { n: '計程車', i: 'fa-taxi', c: '#E07A70' },
  car: { n: '自駕', i: 'fa-car-side', c: '#F2D14B' }
};
const UNIT = { person: '每人', car: '每車', group: '全團' };
const PACK_COLORS = ['#E8A33D', '#4FA3C7', '#D9534F', '#5FB98E', '#8E7CC3', '#C98B5B'];
const WD = '日一二三四五六';
const PPM = 0.8, H0 = 6 * 60, H1 = 24 * 60;
const HOLD_MS = 3000;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));

/* ---------- state ---------- */
const valid = d => d && d.trip && Array.isArray(d.days) && Array.isArray(d.items);
function loadState() {
  try { const t = localStorage.getItem(STORE); if (t) { const d = JSON.parse(t); if (valid(d)) return d; } } catch (e) { /* storage unavailable */ }
  return clone(window.TRIP_DEFAULT);
}
let S = loadState();
const save = () => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* ignore */ } };
const undoStack = [];
function commit(fn, msg) {
  undoStack.push(JSON.stringify(S));
  if (undoStack.length > 60) undoStack.shift();
  fn();
  save();
  renderAll();
  if (msg) toast(msg);
}
function undo() {
  if (!undoStack.length) { toast('沒有可以復原的動作'); return; }
  S = JSON.parse(undoStack.pop());
  save(); renderAll(); toast('已復原');
}

let V = { view: innerWidth > 850 ? 'week' : 'day', date: null, showTotal: false };
try { const v = JSON.parse(localStorage.getItem(VIEWSTORE) || 'null'); if (v && v.view) V.view = v.view; } catch (e) { /* ignore */ }
const saveView = () => { try { localStorage.setItem(VIEWSTORE, JSON.stringify({ view: V.view })); } catch (e) { /* ignore */ } };

/* ---------- time helpers ---------- */
const toMin = s => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
const fmt = m => { m = Math.round(m); const h = Math.floor(m / 60), mm = ((m % 60) + 60) % 60; return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };
const durTxt = m => m < 60 ? `${m} 分` : `${Math.floor(m / 60)} 小時${m % 60 ? ' ' + (m % 60) + ' 分' : ''}`;
const endOf = i => toMin(i.start) + Number(i.dur);
const md = d => { const [, m, dd] = d.split('-'); return `${+m}/${+dd}`; };
const wday = d => WD[new Date(d + 'T00:00:00Z').getUTCDay()];
const dayIdx = d => S.days.findIndex(x => x.date === d);
const dayOf = d => S.days.find(x => x.date === d) || { date: d, label: '' };
const findItem = id => S.items.find(i => i.id === id);
const dayItems = d => S.items.filter(i => i.date === d).sort((a, b) => toMin(a.start) - toMin(b.start) || a.dur - b.dur);
function nowJST() {
  const q = new URLSearchParams(location.search).get('now'); // 測試用：?now=2027-02-07T14:00
  const d = q ? new Date(q + '+09:00') : new Date();
  if (isNaN(d)) return { date: '', min: -1 };
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: S.trip.timezone || 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  const g = t => p.find(x => x.type === t).value;
  return { date: `${g('year')}-${g('month')}-${g('day')}`, min: (+g('hour') % 24) * 60 + +g('minute') };
}
function conflicts() {
  const set = new Set();
  for (const d of S.days) {
    const it = dayItems(d.date);
    for (let i = 0; i < it.length; i++) for (let j = i + 1; j < it.length; j++) {
      if (toMin(it[j].start) < endOf(it[i])) { set.add(it[i].id); set.add(it[j].id); } else break;
    }
  }
  return set;
}

/* ---------- money ---------- */
const money = (n, cur) => n == null ? '待填' : (cur === 'TWD' ? 'NT$' : '¥') + Math.round(n).toLocaleString('en-US');
function costOf(i) {
  const c = i.cost; if (!c || c.amt == null || c.amt === '') return null;
  const mult = c.unit === 'person' ? (S.trip.travelers || 1) : 1;
  return { amt: Number(c.amt) * mult, cur: c.cur || 'JPY' };
}
function totals() {
  const rate = Number(S.trip.rate) || 0;
  let jpy = 0, twd = 0, est = 0; const pending = []; const byCat = { spot: 0, food: 0, stay: 0, move: 0 };
  for (const i of S.items) {
    if (!i.cost) continue;
    const v = costOf(i);
    if (!v) { pending.push(i); continue; }
    if (i.cost.est) est++;
    if (v.cur === 'JPY') { jpy += v.amt; byCat[i.cat] += rate ? v.amt * rate : v.amt; }
    else { twd += v.amt; if (rate) byCat[i.cat] += v.amt; }
  }
  return { jpy, twd, rate, all: rate ? Math.round(jpy * rate + twd) : null, pending, est, byCat };
}

/* ---------- toast ---------- */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 4000);
}

/* ---------- header ---------- */
function renderHeader() {
  $('#brand').innerHTML = window.ILLO.brand();
  $('#tripTitle').textContent = S.trip.title;
  const places = new Set(S.items.filter(i => i.cat !== 'move' && i.lat != null).map(i => i.name)).size;
  $('#tripMeta').textContent = `${S.trip.destination}｜${S.days.length} 天｜${places} 個地點`;
  const t = totals();
  $('#totalVal').textContent = V.showTotal ? (t.all != null ? money(t.all, 'TWD') : money(t.jpy, 'JPY') + (t.twd ? ' ＋ ' + money(t.twd, 'TWD') : '')) : '••••••';
  $('#eyeBtn').innerHTML = `<i class="fa-solid ${V.showTotal ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
  $('#eyeBtn').setAttribute('aria-pressed', V.showTotal);
  $('#eyeBtn').setAttribute('aria-label', V.showTotal ? '隱藏總花費' : '顯示總花費');
}

/* ---------- date strip ---------- */
let illoX = null;
function renderStations() {
  $('#stations').innerHTML = S.days.map(d => `<button class="st${d.date === V.date ? ' on' : ''}" data-date="${d.date}" aria-label="${md(d.date)}（${wday(d.date)}）${esc(d.label)}" aria-pressed="${d.date === V.date}">
    <span class="tg">${esc(d.tag || '')}</span><span class="dot">${+d.date.slice(8)}</span><span class="wd">${wday(d.date)}</span></button>`).join('');
  placeIllo(false);
}
function placeIllo(animate) {
  const idx = dayIdx(V.date); const st = $('#stations').children[idx]; if (!st) return;
  const x = st.offsetLeft + st.offsetWidth / 2 + $('#stations').offsetLeft;
  const el = $('#dateIllo');
  const key = window.ILLO.pickIcon(dayOf(V.date), dayItems(V.date));
  el.innerHTML = window.ILLO.svg(key);
  el.setAttribute('aria-label', `${md(V.date)} 插圖：${window.ILLO.label(key)}`);
  if (animate && !reduce && illoX != null && illoX !== x && el.animate) {
    el.animate([
      { transform: `translateX(${illoX}px)` },
      { transform: `translateX(${illoX + (x - illoX) * 0.45}px) translateY(-4px)`, offset: 0.45 },
      { transform: `translateX(${x}px)` }
    ], { duration: 550, easing: 'cubic-bezier(.3,.1,.25,1)' });
  }
  el.style.transform = `translateX(${x}px)`;
  illoX = x;
}
function selectDate(d, opts = {}) {
  if (dayIdx(d) < 0) return;
  const changed = d !== V.date;
  V.date = d;
  $$('#stations .st').forEach(b => { const on = b.dataset.date === d; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  if (changed) {
    placeIllo(true);
    const b = $(`#stations .st[data-date="${d}"]`);
    if (b && !reduce) { b.classList.remove('bounce'); void b.offsetWidth; b.classList.add('bounce'); }
  }
  renderCalendar(opts); renderMap(); renderRoutes();
}

/* ---------- calendar ---------- */
function renderToolbar() {
  $$('#calendar-viewtoggle .vbtn').forEach(b => b.classList.toggle('on', b.dataset.view === V.view));
  const idx = dayIdx(V.date);
  if (V.view === 'week') {
    const w = Math.floor(idx / 7), nw = Math.ceil(S.days.length / 7);
    $('#ym').textContent = `${V.date.slice(0, 4)} 年 ${+V.date.slice(5, 7)} 月｜第 ${w + 1}/${nw} 週`;
    $('#weekPrev').disabled = w === 0; $('#weekNext').disabled = w >= nw - 1;
    $('#weekPrev').setAttribute('aria-label', '上一週'); $('#weekNext').setAttribute('aria-label', '下一週');
  } else {
    $('#ym').textContent = `${V.date.slice(0, 4)} 年 ${+V.date.slice(5, 7)} 月｜第 ${idx + 1}/${S.days.length} 天`;
    $('#weekPrev').disabled = idx === 0; $('#weekNext').disabled = idx >= S.days.length - 1;
    $('#weekPrev').setAttribute('aria-label', '前一天'); $('#weekNext').setAttribute('aria-label', '後一天');
  }
  $('#undoBtn').disabled = !undoStack.length;
}
function renderCalendar(opts = {}) {
  renderToolbar();
  if (V.view === 'week') renderWeek(); else renderDay(opts);
  renderNow();
}

function layoutLanes(items) {
  const out = []; let cluster = [], lanes = [], cEnd = -1;
  const flush = () => { cluster.forEach(o => { o.n = lanes.length; }); out.push(...cluster); cluster = []; lanes = []; cEnd = -1; };
  for (const it of items) {
    const s = toMin(it.start), e = endOf(it);
    if (cluster.length && s >= cEnd) flush();
    let lane = lanes.findIndex(x => x <= s);
    if (lane < 0) { lane = lanes.length; lanes.push(e); } else lanes[lane] = e;
    cluster.push({ it, lane }); cEnd = Math.max(cEnd, e);
  }
  flush(); return out;
}
function evClasses(i, cf) {
  return [i.locked ? 'locked' : '', cf.has(i.id) ? 'warn' : '', i.status === 'optional' ? 'optional' : ''].join(' ');
}
function renderWeek() {
  const idx = dayIdx(V.date), w = Math.floor(idx / 7);
  const cols = []; for (let k = 0; k < 7; k++) cols.push(S.days[w * 7 + k] || null);
  const cf = conflicts();
  const H = (H1 - H0) * PPM;
  let html = `<div class="wk" style="--hour:${60 * PPM}px"><div class="wk-h"></div>`;
  cols.forEach(d => {
    html += d ? `<div class="wk-h${d.date === V.date ? ' sel' : ''}"><button data-date="${d.date}" aria-label="切換到 ${md(d.date)}"><b>${md(d.date)}</b>${wday(d.date)}${d.tag ? '・' + esc(d.tag) : ''}</button></div>` : '<div class="wk-h out"><b>—</b></div>';
  });
  html += `<div class="wk-axis" style="height:${H}px">`;
  for (let h = H0 / 60 + 1; h < H1 / 60; h++) html += `<span style="top:${(h * 60 - H0) * PPM}px">${String(h).padStart(2, '0')}</span>`;
  html += '</div>';
  cols.forEach(d => {
    if (!d) { html += `<div class="wk-col out" style="height:${H}px"></div>`; return; }
    html += `<div class="wk-col" data-date="${d.date}" style="height:${H}px">`;
    for (const { it, lane, n } of layoutLanes(dayItems(d.date))) {
      const s = Math.max(toMin(it.start), H0);
      const top = (s - H0) * PPM, h = Math.max(it.dur * PPM, 20);
      const c = it.cat === 'move' ? (MODES[it.mode] || MODES.walk).c : CAT[it.cat].hex;
      html += `<div class="ev ${evClasses(it, cf)}" data-id="${it.id}" tabindex="0" role="button" aria-label="${esc(it.name)} ${it.start}" style="--c:${c};top:${top}px;height:${h}px;left:calc(${(lane / n) * 100}% + 2px);width:calc(${100 / n}% - 4px)">
        <span class="tm">${it.start}</span> <span class="nm">${esc(it.name)}</span><span class="rz" aria-hidden="true"></span></div>`;
    }
    html += '</div>';
  });
  html += '</div>';
  const cal = $('#calendar'); const keep = cal.dataset.v === 'week' ? cal.scrollTop : null;
  cal.innerHTML = html; cal.dataset.v = 'week';
  if (keep != null) cal.scrollTop = keep;
  else { const first = Math.min(...dayItems(V.date).map(i => toMin(i.start)), 8 * 60); cal.scrollTop = Math.max(0, (first - H0 - 30) * PPM); }
}

let dayRange = { s: 0, e: 1 };
function cardHTML(it, cf) {
  const badges = [];
  if (it.locked) badges.push('<span class="badge lock"><i class="fa-solid fa-lock"></i> 已預約</span>');
  if (cf.has(it.id)) badges.push('<span class="badge warn"><i class="fa-solid fa-triangle-exclamation"></i> 時間重疊／可能遲到</span>');
  if (it.status === 'confirm') badges.push('<span class="badge cf">待確認</span>');
  if (it.status === 'optional') badges.push('<span class="badge op">可取消</span>');
  if (it.cost && it.cost.est) badges.push('<span class="badge cf">估算</span>');
  const range = `${it.start}–${fmt(endOf(it))}`;
  if (it.cat === 'move') {
    const segs = it.segs && it.segs.length ? it.segs : [[it.mode || 'walk', it.dur]];
    const walkOnly = segs.every(s => s[0] === 'walk');
    const m = MODES[it.mode] || MODES.walk;
    const segHTML = walkOnly ? `<span class="seg"><i class="fa-solid fa-person-walking"></i>步行 ${durTxt(segs.reduce((a, s) => a + Number(s[1]), 0))}</span>`
      : segs.map(s => `<span class="seg" style="color:${(MODES[s[0]] || MODES.walk).c}"><i class="fa-solid ${(MODES[s[0]] || MODES.walk).i}"></i>${s[1]} 分</span>`).join('<span class="seg" aria-hidden="true">›</span>');
    const cost = costOf(it);
    return `<div class="timeline-card move${walkOnly ? ' walk' : ''}" tabindex="0" role="button" data-id="${it.id}" style="--c:${walkOnly ? 'rgba(232,163,61,.4)' : m.c}">
      <div class="row1"><i class="fa-solid ${m.i}" style="color:${m.c}"></i><span class="nm">${esc(it.from && it.to ? it.from + ' → ' + it.to : it.name)}</span><span class="du">${durTxt(it.dur)}</span></div>
      <div class="meta segs">${segHTML}${cost ? ` ・ ${money(cost.amt, cost.cur)}` : ''}</div>
      ${badges.length ? `<div class="meta">${badges.join('')}</div>` : ''}</div>`;
  }
  const cost = costOf(it);
  const meta = [range, it.addr ? esc(it.addr) : '', cost ? money(cost.amt, cost.cur) + (it.cost.unit === 'person' ? `（${UNIT.person} ${money(it.cost.amt, it.cost.cur)}）` : '') : ''].filter(Boolean).join(' ・ ');
  return `<div class="timeline-card" tabindex="0" role="button" data-id="${it.id}" style="--c:${CAT[it.cat].hex}">
    <div class="row1"><i class="fa-solid ${CAT[it.cat].i}" style="color:${CAT[it.cat].hex}"></i><span class="nm">${esc(it.name)}</span><span class="du">${durTxt(it.dur)}</span></div>
    <div class="meta">${meta}</div>
    ${it.note ? `<div class="meta">${esc(it.note)}</div>` : ''}
    ${badges.length ? `<div class="meta">${badges.join('')}</div>` : ''}</div>`;
}
function renderDay(opts = {}) {
  const d = dayOf(V.date), it = dayItems(V.date), cf = conflicts();
  dayRange = it.length ? { s: Math.min(...it.map(i => toMin(i.start))), e: Math.max(...it.map(endOf)) } : { s: 9 * 60, e: 18 * 60 };
  if (dayRange.e - dayRange.s < 60) dayRange.e = dayRange.s + 60;
  const span = dayRange.e - dayRange.s;
  let ticks = '';
  for (let h = Math.ceil(dayRange.s / 60); h * 60 <= dayRange.e; h++) ticks += `<span class="tick" style="top:${((h * 60 - dayRange.s) / span) * 100}%"></span>`;
  const html = `<div class="timeline-intro"><h3>${md(d.date)}（${wday(d.date)}）${d.tag ? esc(d.tag) + '｜' : ''}${esc(d.label)}</h3>
    <p>${it.length} 個行程｜${fmt(dayRange.s)}–${fmt(dayRange.e)}</p>${d.note ? `<p class="dnote"><i class="fa-solid fa-circle-info"></i> ${esc(d.note)}</p>` : ''}</div>
    <div class="timeline-list">
      <div class="day-time-scale" aria-hidden="true"><span class="rail"></span>${ticks}<span class="end s">${fmt(dayRange.s)}</span><span class="end e">${fmt(dayRange.e)}</span><span class="knob" id="knob"></span></div>
      <div class="timeline-cards">${it.length ? it.map(i => `<div class="timeline-time-row" data-id="${i.id}" data-min="${toMin(i.start)}"><span class="tt">${i.start}</span>${cardHTML(i, cf)}</div>`).join('') : '<p class="empty">這天還沒有行程，按右上「＋」新增。</p>'}</div>
    </div>`;
  const cal = $('#calendar'); cal.innerHTML = html; cal.dataset.v = 'day';
  if (opts.focus) focusRow(opts.focus, false);
  else {
    const n = nowJST();
    if (n.date === V.date && n.min >= dayRange.s && n.min <= dayRange.e) {
      const row = [...cal.querySelectorAll('.timeline-time-row')].reverse().find(r => +r.dataset.min <= n.min);
      if (row) focusRow(row.dataset.id, false); else cal.scrollTop = 0;
    } else cal.scrollTop = 0;
  }
  onDayScroll();
}
function focusRow(id, smooth = true) {
  const cal = $('#calendar'); const row = cal.querySelector(`.timeline-time-row[data-id="${id}"]`); if (!row) return;
  const top = row.offsetTop - cal.clientHeight / 2 + row.offsetHeight / 2;
  cal.scrollTo({ top, behavior: smooth && !reduce ? 'smooth' : 'auto' });
}
function onDayScroll() {
  if (V.view !== 'day') return;
  const cal = $('#calendar'); const rows = [...cal.querySelectorAll('.timeline-time-row')]; const knob = $('#knob');
  if (!rows.length || !knob) return;
  const cr = cal.getBoundingClientRect(); const center = cr.top + cr.height / 2;
  const centers = rows.map(r => { const b = r.getBoundingClientRect(); return b.top + b.height / 2; });
  const atTop = cal.scrollTop <= 2, atBot = cal.scrollTop + cal.clientHeight >= cal.scrollHeight - 2;
  let bi = 0, bd = Infinity;
  centers.forEach((c, i) => { const dd = Math.abs(c - center); if (dd < bd) { bd = dd; bi = i; } });
  if (atTop) bi = 0; if (atBot) bi = rows.length - 1;
  const fc = centers[bi], spanPx = cr.height * 0.55;
  rows.forEach((r, i) => {
    r.classList.toggle('timeline-current', i === bi); r.classList.toggle('below', i > bi);
    const card = r.querySelector('.timeline-card');
    const k = i === bi ? 0 : Math.min(1, Math.abs(centers[i] - fc) / spanPx);
    card.style.setProperty('--k', k.toFixed(3)); card.style.setProperty('--b0', i === bi ? '0px' : '0.15px');
  });
  let m;
  if (atTop) m = dayRange.s;
  else if (atBot) m = dayRange.e;
  else if (center <= centers[0]) m = +rows[0].dataset.min;
  else if (center >= centers[centers.length - 1]) m = +rows[rows.length - 1].dataset.min;
  else {
    let i = 0; while (i < centers.length - 1 && centers[i + 1] < center) i++;
    const t = (center - centers[i]) / ((centers[i + 1] - centers[i]) || 1);
    m = +rows[i].dataset.min + t * (+rows[i + 1].dataset.min - +rows[i].dataset.min);
  }
  m = Math.max(dayRange.s, Math.min(dayRange.e, m));
  knob.style.top = ((m - dayRange.s) / (dayRange.e - dayRange.s)) * 100 + '%';
}
function renderNow() {
  $$('#calendar .nowline').forEach(n => n.remove());
  const n = nowJST(); if (n.min < 0) return;
  const lbl = fmt(n.min);
  if (V.view === 'week') {
    const col = $(`#calendar .wk-col[data-date="${n.date}"]`);
    if (col && n.min >= H0 && n.min <= H1) col.insertAdjacentHTML('beforeend', `<div class="nowline" style="top:${(n.min - H0) * PPM}px"><span>${lbl}</span></div>`);
  } else if (n.date === V.date && n.min >= dayRange.s && n.min <= dayRange.e) {
    const sc = $('#calendar .day-time-scale');
    if (sc) sc.insertAdjacentHTML('beforeend', `<div class="nowline" style="top:${((n.min - dayRange.s) / (dayRange.e - dayRange.s)) * 100}%"><span>${lbl}</span></div>`);
  }
}

/* ---------- calendar interactions ---------- */
let clickT = null, hold = null, justDragged = false;
const cal = $('#calendar');

cal.addEventListener('scroll', () => requestAnimationFrame(onDayScroll), { passive: true });
cal.addEventListener('wheel', e => {
  if (V.view !== 'day' || e.ctrlKey) return;
  e.preventDefault();
  const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? cal.clientHeight : 1);
  cal.scrollTop += Math.max(-32, Math.min(32, dy));
}, { passive: false });

cal.addEventListener('click', e => {
  const hb = e.target.closest('.wk-h button'); if (hb) { selectDate(hb.dataset.date); return; }
  const el = e.target.closest('[data-id].ev, .timeline-card'); if (!el) return;
  if (justDragged) { justDragged = false; return; }
  clearTimeout(clickT);
  const id = el.dataset.id;
  clickT = setTimeout(() => { showPopover(id, el); focusMap(id); }, 230);
});
cal.addEventListener('dblclick', e => {
  const el = e.target.closest('[data-id].ev, .timeline-card'); if (!el) return;
  clearTimeout(clickT); hidePopover(); openEditor(el.dataset.id);
});
cal.addEventListener('keydown', e => {
  const el = e.target.closest('[data-id].ev, .timeline-card'); if (!el) return;
  if (e.key === 'Enter') { e.preventDefault(); openEditor(el.dataset.id); }
  else if (e.key === ' ') { e.preventDefault(); showPopover(el.dataset.id, el); }
});

cal.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  const ev = e.target.closest('.ev'); if (!ev) return;
  const it = findItem(ev.dataset.id); if (!it) return;
  if (e.target.classList.contains('rz')) {
    if (it.locked) return;
    e.preventDefault(); e.stopPropagation();
    hold = { mode: 'resize', el: ev, it, y0: e.clientY, d0: Number(it.dur), dur: Number(it.dur), pid: e.pointerId };
    ev.setPointerCapture(e.pointerId);
    return;
  }
  const r = ev.getBoundingClientRect();
  hold = { mode: 'wait', el: ev, it, x0: e.clientX, y0: e.clientY, grab: (e.clientY - r.top) / PPM, pid: e.pointerId };
  hold.t1 = setTimeout(() => hold && hold.mode === 'wait' && ev.classList.add('holding'), 400);
  hold.t = setTimeout(() => {
    if (!hold || hold.mode !== 'wait') return;
    if (it.locked) { ev.classList.remove('holding'); toast('已預約的行程鎖定中，要改請雙擊編輯'); hold = null; return; }
    hold.mode = 'drag'; ev.classList.remove('holding'); ev.classList.add('dragging'); ev.style.pointerEvents = 'none';
    try { ev.setPointerCapture(hold.pid); } catch (err) { /* ignore */ }
    hidePopover(); clearTimeout(clickT);
    toast('拖移到新時間後放開');
  }, HOLD_MS);
});
window.addEventListener('pointermove', e => {
  if (!hold) return;
  if (hold.mode === 'wait') {
    if (Math.hypot(e.clientX - hold.x0, e.clientY - hold.y0) > 6) cancelHold();
    return;
  }
  if (hold.mode === 'resize') {
    const dur = Math.max(5, Math.round((hold.d0 + (e.clientY - hold.y0) / PPM) / 5) * 5);
    hold.dur = dur; hold.el.style.height = Math.max(dur * PPM, 20) + 'px';
    return;
  }
  if (hold.mode === 'drag') {
    const col = document.elementsFromPoint(e.clientX, e.clientY).find(x => x.classList && x.classList.contains('wk-col') && x.dataset.date);
    if (!col) return;
    const r = col.getBoundingClientRect();
    let m = (e.clientY - r.top) / PPM + H0 - hold.grab;
    m = Math.max(H0, Math.min(H1 - 15, Math.round(m / 15) * 15));
    if (hold.el.parentElement !== col) col.appendChild(hold.el);
    hold.el.style.top = (m - H0) * PPM + 'px'; hold.el.style.left = '2px'; hold.el.style.width = 'calc(100% - 4px)';
    hold.target = { date: col.dataset.date, start: fmt(m) };
  }
});
function cancelHold() {
  if (!hold) return;
  clearTimeout(hold.t); clearTimeout(hold.t1); hold.el.classList.remove('holding'); hold = null;
}
function endHold() {
  if (!hold) return;
  const h = hold; clearTimeout(h.t); clearTimeout(h.t1); h.el.classList.remove('holding'); hold = null;
  if (h.mode === 'resize') {
    justDragged = true; setTimeout(() => { justDragged = false; }, 300);
    if (h.dur !== h.d0) commit(() => { findItem(h.it.id).dur = h.dur; }, `時長改為 ${durTxt(h.dur)}${conflictMsg(h.it.id, h.it.date, h.it.start, h.dur)}`);
  } else if (h.mode === 'drag') {
    justDragged = true; setTimeout(() => { justDragged = false; }, 300);
    if (h.target && (h.target.date !== h.it.date || h.target.start !== h.it.start)) moveItem(h.it.id, h.target.date, h.target.start);
    else renderCalendar();
  }
}
window.addEventListener('pointerup', endHold);
window.addEventListener('pointercancel', () => { if (hold && hold.mode === 'wait') cancelHold(); else endHold(); });

function conflictMsg(id, date, start, dur) {
  const s = toMin(start), e = s + Number(dur);
  const hit = S.items.find(x => x.id !== id && x.date === date && toMin(x.start) < e && endOf(x) > s);
  return hit ? `｜⚠ 與「${hit.name}」重疊` : '';
}
// 只更新受影響的相鄰路段：同一天移動時，緊接在前的交通段跟著平移
function applyMove(cur, date, start) {
  const oldDate = cur.date, oldS = toMin(cur.start), delta = toMin(start) - oldS;
  let followed = null;
  if (cur.cat !== 'move' && date === oldDate && delta) {
    const prev = dayItems(oldDate).filter(x => x.cat === 'move' && !x.locked && x.id !== cur.id && Math.abs(endOf(x) - oldS) <= 10).pop();
    if (prev) { prev.start = fmt(toMin(prev.start) + delta); followed = prev; }
  }
  cur.date = date; cur.start = start;
  return followed;
}
function moveItem(id, date, start) {
  let followed = null;
  commit(() => { followed = applyMove(findItem(id), date, start); });
  toast(`已移到 ${md(date)} ${start}${followed ? '，前一段交通一併調整' : ''}${conflictMsg(id, date, start, findItem(id).dur)}`);
}

/* ---------- popover ---------- */
function showPopover(id, anchor) {
  const it = findItem(id); if (!it) return;
  const pop = $('#popover');
  const c = it.cat === 'move' ? (MODES[it.mode] || MODES.walk).c : CAT[it.cat].hex;
  const cost = costOf(it);
  pop.style.setProperty('--c', c);
  pop.innerHTML = `<h4>${esc(it.name)}</h4>
    <p class="mono">${md(it.date)} ${it.start}–${fmt(endOf(it))}（${durTxt(it.dur)}）</p>
    <p>${it.cat === 'move' ? (MODES[it.mode] || MODES.walk).n : CAT[it.cat].n}${it.locked ? '・已預約鎖定' : ''}${it.status === 'confirm' ? '・待確認' : it.status === 'optional' ? '・可取消' : ''}</p>
    ${it.addr ? `<p>${esc(it.addr)}</p>` : ''}
    ${it.cost ? `<p>${cost ? money(cost.amt, cost.cur) + (it.cost.unit === 'person' ? `（每人 ${money(it.cost.amt, it.cost.cur)}）` : '') : '金額待填'}${it.cost.est ? '・估算' : ''}${it.cost.paid ? '・已付' : ''}</p>` : ''}
    ${it.note ? `<p>${esc(it.note)}</p>` : ''}
    <div class="acts"><button class="sbtn primary" data-pa="edit"><i class="fa-solid fa-pen"></i> 編輯</button>
    ${it.lat != null ? `<a class="sbtn" target="_blank" rel="noopener" href="${navURL(it)}"><i class="fa-solid fa-diamond-turn-right"></i> 導航</a>` : ''}
    <span class="sp"></span><button class="sbtn" data-pa="close" aria-label="關閉"><i class="fa-solid fa-xmark"></i></button></div>`;
  pop.hidden = false; pop.dataset.id = id;
  const r = anchor.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
  let left = r.right + 8; if (left + pw > innerWidth - 10) left = r.left - pw - 8; if (left < 10) left = Math.max(10, Math.min(innerWidth - pw - 10, r.left));
  let top = r.top; if (left === Math.max(10, Math.min(innerWidth - pw - 10, r.left))) top = r.bottom + 8;
  top = Math.max(10, Math.min(innerHeight - ph - 10, top));
  pop.style.left = left + 'px'; pop.style.top = top + 'px';
  pop.querySelector('[data-pa="edit"]').focus({ preventScroll: true });
}
function hidePopover() { $('#popover').hidden = true; }
$('#popover').addEventListener('click', e => {
  const b = e.target.closest('[data-pa]'); if (!b) return;
  if (b.dataset.pa === 'edit') { const id = $('#popover').dataset.id; hidePopover(); openEditor(id); } else hidePopover();
});
document.addEventListener('pointerdown', e => {
  if (!$('#popover').hidden && !e.target.closest('#popover') && !e.target.closest('.ev, .timeline-card')) hidePopover();
  if (!$('#fabMenu').hidden && !e.target.closest('#fab')) toggleFab(false);
});

/* ---------- editor ---------- */
let editingId = null;
const form = $('#editForm');
function modeOptions(sel) { return Object.entries(MODES).map(([k, m]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${m.n}</option>`).join(''); }
function segRow(mode, min) {
  return `<div class="segrow"><select aria-label="分段交通方式">${modeOptions(mode)}</select><input type="number" min="1" value="${min}" aria-label="分鐘"><span>分</span><button type="button" class="sbtn" data-delseg aria-label="刪除分段"><i class="fa-solid fa-xmark"></i></button></div>`;
}
function openEditor(id) {
  hidePopover();
  const it = id ? findItem(id) : { cat: 'spot', date: V.date, start: '12:00', dur: 60, name: '' };
  editingId = id || null;
  $('#editTitle').textContent = id ? (it.cat === 'move' ? '編輯交通分段' : '編輯行程') : '新增地點';
  $('#dateSelect').innerHTML = S.days.map(d => `<option value="${d.date}">${md(d.date)}（${wday(d.date)}）${esc(d.label)}</option>`).join('');
  const f = form.elements;
  f.name.value = it.name || ''; f.cat.value = it.cat; f.date.value = it.date; f.start.value = it.start; f.dur.value = it.dur;
  f.addr.value = it.addr || ''; f.lat.value = it.lat ?? ''; f.lng.value = it.lng ?? '';
  f.amt.value = it.cost && it.cost.amt != null ? it.cost.amt : ''; f.cur.value = (it.cost && it.cost.cur) || 'JPY'; f.unit.value = (it.cost && it.cost.unit) || 'person';
  f.est.checked = !!(it.cost && it.cost.est); f.paid.checked = !!(it.cost && it.cost.paid); f.locked.checked = !!it.locked;
  f.status.value = it.status || ''; f.note.value = it.note || '';
  form.querySelector('.modeSel').innerHTML = modeOptions(it.mode || 'walk');
  f.from.value = it.from || ''; f.to.value = it.to || '';
  $('#segList').innerHTML = (it.segs || []).map(s => segRow(s[0], s[1])).join('');
  $('#delBtn').hidden = !id;
  syncMoveFields();
  $('#editor').showModal();
}
function syncMoveFields() { $('#moveFields').hidden = form.elements.cat.value !== 'move'; }
form.elements.cat.addEventListener('change', syncMoveFields);
$('#addSeg').addEventListener('click', () => $('#segList').insertAdjacentHTML('beforeend', segRow(form.querySelector('.modeSel').value, 10)));
$('#segList').addEventListener('click', e => { const b = e.target.closest('[data-delseg]'); if (b) b.parentElement.remove(); });
$('#cancelBtn').addEventListener('click', () => $('#editor').close());
$('#delBtn').addEventListener('click', () => {
  const it = findItem(editingId); if (!it) return;
  $('#editor').close();
  commit(() => { S.items = S.items.filter(x => x.id !== editingId); }, `已刪除「${it.name}」，可按復原`);
});
form.addEventListener('submit', e => {
  e.preventDefault();
  const f = form.elements;
  const num = v => v === '' || v == null ? null : Number(v);
  const data = {
    name: f.name.value.trim(), cat: f.cat.value, date: f.date.value, start: f.start.value, dur: Math.max(5, Number(f.dur.value) || 30),
    addr: f.addr.value.trim() || undefined, lat: num(f.lat.value), lng: num(f.lng.value),
    status: f.status.value || undefined, locked: f.locked.checked || undefined, note: f.note.value.trim() || undefined
  };
  if (!data.name || !/^\d{2}:\d{2}$/.test(data.start)) { toast('請填名稱與開始時間'); return; }
  const amt = num(f.amt.value);
  const hadCost = editingId && findItem(editingId).cost;
  if (amt != null || hadCost || data.cat !== 'move') data.cost = { amt, cur: f.cur.value, unit: f.unit.value, est: f.est.checked || undefined, paid: f.paid.checked || undefined };
  if (data.cat === 'move') {
    data.mode = form.querySelector('.modeSel').value; data.from = f.from.value.trim() || undefined; data.to = f.to.value.trim() || undefined;
    data.segs = [...$('#segList').querySelectorAll('.segrow')].map(r => [r.querySelector('select').value, Number(r.querySelector('input').value) || 1]);
    if (!data.segs.length) data.segs = [[data.mode, data.dur]];
  }
  if (data.lat == null || data.lng == null) { delete data.lat; delete data.lng; }
  Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
  $('#editor').close();
  if (editingId) {
    const old = findItem(editingId);
    const moved = old.date !== data.date || old.start !== data.start;
    const { date, start } = data; delete data.date; delete data.start;
    let followed = null;
    commit(() => {
      const cur = findItem(editingId);
      ['addr', 'lat', 'lng', 'status', 'locked', 'note', 'cost', 'mode', 'from', 'to', 'segs'].forEach(k => delete cur[k]);
      Object.assign(cur, data);
      if (moved) followed = applyMove(cur, date, start);
    });
    toast(`已更新「${data.name}」${followed ? '，前一段交通一併調整' : ''}${conflictMsg(editingId, date, start, data.dur)}`);
    data.date = date;
    if (data.date !== V.date) selectDate(data.date);
  } else {
    const id = 'u' + Date.now().toString(36);
    commit(() => { S.items.push({ id, ...data }); }, `已新增「${data.name}」${conflictMsg(id, data.date, data.start, data.dur)}`);
    if (data.date !== V.date) selectDate(data.date, { focus: id });
    else if (V.view === 'day') focusRow(id);
  }
});

/* ---------- map ---------- */
let map = null, mapLayer = null, markers = {}, dayBounds = null, routeLines = [];
const navURL = it => `https://www.google.com/maps/dir/?api=1&destination=${it.lat},${it.lng}&travelmode=${it.cat === 'move' && it.mode === 'car' ? 'driving' : 'transit'}`;
function initMap() {
  if (!window.L) return;
  map = L.map('map', { doubleClickZoom: false, zoomControl: true, attributionControl: true }).setView([33.1, 130.9], 8);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
  mapLayer = L.layerGroup().addTo(map);
}
function geoSequence() {
  const seq = []; let pendingMode = null;
  for (const i of dayItems(V.date)) {
    if (i.cat === 'move') pendingMode = i.mode;
    if (i.lat == null) continue;
    seq.push({ it: i, ll: [i.lat, i.lng], mode: i.cat === 'move' ? i.mode : (pendingMode || 'walk') });
    pendingMode = null;
  }
  return seq;
}
function renderMap() {
  const seq = geoSequence();
  if (!map) { renderMapFallback(seq); return; }
  mapLayer.clearLayers(); markers = {}; routeLines = [];
  const byPos = new Map(); let n = 0;
  seq.forEach(p => {
    const key = p.ll.join(',');
    if (!byPos.has(key)) byPos.set(key, { ll: p.ll, its: [], nums: [] });
    const g = byPos.get(key); g.its.push(p.it); g.nums.push(++n);
  });
  for (let k = 1; k < seq.length; k++) {
    const a = seq[k - 1].ll, b = seq[k].ll; if (a.join() === b.join()) continue;
    const m = MODES[seq[k].mode] || MODES.walk;
    routeLines.push(L.polyline([a, b], { color: m.c, weight: 4, opacity: .9, dashArray: seq[k].mode === 'flight' ? '6 8' : seq[k].mode === 'walk' ? '2 6' : null }).addTo(mapLayer));
  }
  byPos.forEach(g => {
    const first = g.its[0];
    const c = first.cat === 'move' ? CAT.move.hex : CAT[first.cat].hex;
    const label = g.nums.length > 2 ? g.nums[0] + '+' : g.nums.join(',');
    const mk = L.marker(g.ll, { icon: L.divIcon({ className: '', html: `<div class="mk" style="background:${c};width:${label.length > 2 ? 34 : 24}px;border-radius:12px">${label}</div>`, iconSize: [label.length > 2 ? 34 : 24, 24], iconAnchor: [label.length > 2 ? 17 : 12, 12] }), keyboard: true, title: g.its.map(x => x.name).join('／') }).addTo(mapLayer);
    mk.bindPopup(g.its.map(x => `<b>${esc(x.start)} ${esc(x.name)}</b>`).join('<br>') + `<br><a target="_blank" rel="noopener" href="${navURL(first)}">Google Maps 導航</a>`);
    mk.on('click', () => { if (V.view === 'day') focusRow(first.id); });
    mk.on('dblclick', () => window.open(navURL(first), '_blank', 'noopener'));
    g.its.forEach(x => { markers[x.id] = mk; });
  });
  dayBounds = seq.length ? L.latLngBounds(seq.map(p => p.ll)) : null;
  fitDay();
  setTimeout(() => map.invalidateSize(), 0);
}
function fitDay() {
  if (!map || !dayBounds) return;
  map.fitBounds(dayBounds, { padding: [30, 30], maxZoom: 15, animate: !reduce });
}
function previewRoute() {
  if (!map) { toast('地圖載入失敗，改用外部地圖連結'); return; }
  if (!routeLines.length) { toast('這天沒有可預覽的路段'); return; }
  const btn = $('#previewroute'); btn.classList.add('on');
  routeLines.forEach(l => l.setStyle({ opacity: reduce ? .9 : 0 }));
  fitDay();
  if (reduce) { btn.classList.remove('on'); return; }
  routeLines.forEach((l, k) => setTimeout(() => { l.setStyle({ opacity: .9 }); if (k === routeLines.length - 1) btn.classList.remove('on'); }, 300 + k * 350));
}
function focusMap(id) {
  const it = findItem(id); if (!it) return;
  if (map && markers[id]) { map.setView(markers[id].getLatLng(), Math.max(map.getZoom(), 14), { animate: !reduce }); markers[id].openPopup(); }
}
function renderMapFallback(seq) {
  const el = $('#map');
  const first = seq[0];
  el.innerHTML = first ? `<iframe title="地圖" loading="lazy" src="https://maps.google.com/maps?q=${first.ll[0]},${first.ll[1]}&z=11&output=embed"></iframe>` : '<p class="empty">這天沒有地點座標</p>';
  $('.map-note').innerHTML = '地圖元件無法載入，改用嵌入地圖。外部連結：' + seq.filter(p => p.it.cat !== 'move').map(p => `<a target="_blank" rel="noopener" href="${navURL(p.it)}" style="color:var(--brass)">${esc(p.it.name)}</a>`).join('、');
}

/* ---------- route panel ---------- */
function renderRoutes() {
  const mv = dayItems(V.date).filter(i => i.cat === 'move');
  $('#routelist').innerHTML = mv.length ? mv.map(it => {
    const segs = it.segs && it.segs.length ? it.segs : [[it.mode || 'walk', it.dur]];
    const walkOnly = segs.every(s => s[0] === 'walk');
    const m = MODES[it.mode] || MODES.walk; const cost = costOf(it);
    const segHTML = walkOnly ? `<span class="seg"><i class="fa-solid fa-person-walking"></i>步行 ${durTxt(segs.reduce((a, s) => a + Number(s[1]), 0))}</span>`
      : segs.map(s => `<span class="seg" style="color:${(MODES[s[0]] || MODES.walk).c}"><i class="fa-solid ${(MODES[s[0]] || MODES.walk).i}"></i>${(MODES[s[0]] || MODES.walk).n} ${s[1]} 分</span>`).join('');
    return `<div class="rt" data-id="${it.id}" tabindex="0" role="button" aria-label="${esc(it.name)}"><span class="bar" style="background:${m.c}"></span>
      <div><div>${esc(it.from && it.to ? it.from + ' → ' + it.to : it.name)}</div><div class="t mono">${it.start}–${fmt(endOf(it))}・${durTxt(it.dur)}</div><div class="segs">${segHTML}</div></div>
      <div class="c">${it.cost ? (cost ? money(cost.amt, cost.cur) : '待填') : ''}${it.cost && it.cost.est ? '<br>估' : ''}</div></div>`;
  }).join('') : '<p class="empty">這天沒有交通段</p>';
}
$('#routelist').addEventListener('click', e => {
  const r = e.target.closest('.rt'); if (!r) return;
  clearTimeout(clickT);
  clickT = setTimeout(() => { if (V.view === 'day') focusRow(r.dataset.id); focusMap(r.dataset.id); }, 230);
});
$('#routelist').addEventListener('dblclick', e => { const r = e.target.closest('.rt'); if (r) { clearTimeout(clickT); openEditor(r.dataset.id); } });
$('#routelist').addEventListener('keydown', e => { const r = e.target.closest('.rt'); if (r && e.key === 'Enter') openEditor(r.dataset.id); });
$('#routeToggle').addEventListener('click', () => {
  const p = $('#routepanel'); const c = p.hasAttribute('data-collapsed');
  if (c) p.removeAttribute('data-collapsed'); else p.setAttribute('data-collapsed', '');
  $('#routeToggle').setAttribute('aria-expanded', c);
});

/* ---------- expenses ---------- */
function renderExpenses() {
  const t = totals();
  $('#sumJPY').textContent = money(t.jpy, 'JPY');
  $('#sumTWD').textContent = money(t.twd, 'TWD');
  const ri = $('#rateInput'); if (document.activeElement !== ri) ri.value = S.trip.rate ?? '';
  $('#sumAll').textContent = t.all != null ? money(t.all, 'TWD') : '填匯率後顯示';
  $('#pendingHint').innerHTML = `<i class="fa-solid fa-circle-info"></i> ${t.pending.length} 項金額待填、${t.est} 項為估算；先依匯率換算再合計取整。${t.rate ? '' : '<br>未填匯率前，圓餅圖只計日圓項目。'}`;
  const rows = S.items.filter(i => i.cost).sort((a, b) => a.date.localeCompare(b.date) || toMin(a.start) - toMin(b.start));
  $('#expBody').innerHTML = rows.map(i => {
    const v = costOf(i); const c = i.cat === 'move' ? CAT.move.hex : CAT[i.cat].hex;
    const status = i.cost.paid ? '已付' : v ? (i.cost.est ? '估算' : '') : '待填';
    return `<tr class="${v ? '' : 'pending'}" data-id="${i.id}" style="--c:${c}"><td>${md(i.date)}</td><td>${esc(i.name)}${i.cost.est ? '<span class="est">估</span>' : ''}</td>
      <td class="num">${i.cost.amt != null && i.cost.amt !== '' ? money(i.cost.amt, i.cost.cur) : '—'}</td>
      <td>${UNIT[i.cost.unit] || '全團'}${i.cost.unit === 'person' ? ` ×${S.trip.travelers}` : ''}</td>
      <td class="num">${v ? money(v.amt, v.cur) : '待填'}</td><td>${status}</td></tr>`;
  }).join('');
  // pie
  const entries = Object.entries(t.byCat).filter(([, v]) => v > 0);
  const sum = entries.reduce((a, [, v]) => a + v, 0);
  const cur = t.rate ? 'TWD' : 'JPY';
  let a0 = -Math.PI / 2, paths = '';
  if (sum > 0 && entries.length === 1) paths = `<circle cx="100" cy="100" r="88" fill="${CAT[entries[0][0]].hex}" stroke="#15181D" stroke-width="2"/>`;
  else entries.forEach(([k, v]) => {
    const a1 = a0 + (v / sum) * Math.PI * 2;
    const x0 = 100 + 88 * Math.cos(a0), y0 = 100 + 88 * Math.sin(a0), x1 = 100 + 88 * Math.cos(a1), y1 = 100 + 88 * Math.sin(a1);
    paths += `<path d="M100 100 L${x0.toFixed(2)} ${y0.toFixed(2)} A88 88 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z" fill="${CAT[k].hex}" stroke="#15181D" stroke-width="2"/>`;
    a0 = a1;
  });
  $('#pie').innerHTML = sum > 0 ? paths + '<circle cx="100" cy="100" r="44" fill="#1F242B"/>' + `<text x="100" y="96" text-anchor="middle" fill="#9AA4AF" font-size="11">${cur}</text><text x="100" y="114" text-anchor="middle" fill="#E8EAED" font-size="14" font-family="JetBrains Mono, monospace" font-weight="700">${Math.round(sum).toLocaleString('en-US')}</text>` : '<text x="100" y="105" text-anchor="middle" fill="#9AA4AF" font-size="13">尚無金額</text>';
  $('#legend').innerHTML = Object.keys(CAT).map(k => `<li style="--c:${CAT[k].hex}"><i></i><span>${CAT[k].n}</span><span>${t.byCat[k] ? money(t.byCat[k], cur) : '—'}${sum && t.byCat[k] ? `（${Math.round(t.byCat[k] / sum * 100)}%）` : ''}</span></li>`).join('');
  $('#pendingList').innerHTML = t.pending.map(i => `<li>${md(i.date)} ${esc(i.name)}</li>`).join('') || '<li>沒有待填項目</li>';
}
$('#rateInput').addEventListener('change', e => {
  const v = e.target.value === '' ? null : Number(e.target.value);
  commit(() => { S.trip.rate = v; }, v ? `匯率設為 1 JPY ＝ ${v} TWD` : '已清除匯率');
});
$('#expBody').addEventListener('dblclick', e => { const r = e.target.closest('tr[data-id]'); if (r) openEditor(r.dataset.id); });

/* ---------- packing ---------- */
let packFilter = 'all';
function renderPacking() {
  const q = $('#packSearch').value.trim().toLowerCase();
  const all = S.packing.flatMap(c => c.items); const done = all.filter(i => i.done).length;
  const pct = all.length ? Math.round(done / all.length * 100) : 0;
  $('#packBar').style.width = pct + '%'; $('#packPct').textContent = `${done}/${all.length}（${pct}%）`;
  $('#packGrid').innerHTML = S.packing.map((c, ci) => {
    const items = c.items.filter(i => (!q || (i.name + (i.note || '')).toLowerCase().includes(q)) && (packFilter === 'all' || (packFilter === 'done' ? i.done : !i.done)));
    const d = c.items.filter(i => i.done).length;
    return `<section class="pack-card" data-cat="${c.id}" style="--c:${PACK_COLORS[ci % PACK_COLORS.length]}">
      <header><span>${esc(c.name)}</span><span>${d}/${c.items.length}</span></header>
      ${items.map(i => `<div class="pk${i.done ? ' done' : ''}" data-id="${i.id}">
        <input type="checkbox" ${i.done ? 'checked' : ''} aria-label="完成 ${esc(i.name)}">
        <div><span class="nm">${esc(i.name)}</span><input class="nt" value="${esc(i.note || '')}" placeholder="備註" aria-label="${esc(i.name)} 備註" style="width:100%;border:0;background:transparent;padding:0;font-size:12px;color:var(--ink2)"></div>
        <input type="number" min="0" value="${i.qty ?? 1}" aria-label="${esc(i.name)} 數量">
        <button class="del" aria-label="刪除 ${esc(i.name)}"><i class="fa-solid fa-xmark"></i></button></div>`).join('') || '<p class="empty">沒有符合的用品</p>'}
      <form class="pk-add"><input placeholder="新增用品" aria-label="新增用品到${esc(c.name)}"><button class="sbtn">加入</button></form></section>`;
  }).join('');
}
function packFind(el) {
  const cat = S.packing.find(c => c.id === el.closest('.pack-card').dataset.cat);
  const row = el.closest('.pk'); return { cat, item: row ? cat.items.find(i => i.id === row.dataset.id) : null };
}
$('#packGrid').addEventListener('change', e => {
  const { item } = packFind(e.target); if (!item) return;
  const id = item.id, catId = e.target.closest('.pack-card').dataset.cat;
  const get = () => S.packing.find(c => c.id === catId).items.find(i => i.id === id);
  if (e.target.type === 'checkbox') commit(() => { get().done = e.target.checked; });
  else if (e.target.type === 'number') commit(() => { get().qty = Number(e.target.value) || 0; });
  else if (e.target.classList.contains('nt')) commit(() => { get().note = e.target.value; });
});
$('#packGrid').addEventListener('click', e => {
  const b = e.target.closest('.del'); if (!b) return;
  const { cat, item } = packFind(b); const catId = cat.id;
  commit(() => { const c = S.packing.find(x => x.id === catId); c.items = c.items.filter(i => i.id !== item.id); }, `已刪除「${item.name}」，可按復原`);
});
$('#packGrid').addEventListener('submit', e => {
  e.preventDefault(); const inp = e.target.querySelector('input'); const name = inp.value.trim(); if (!name) return;
  const catId = e.target.closest('.pack-card').dataset.cat;
  commit(() => { S.packing.find(c => c.id === catId).items.push({ id: 'pk' + Date.now().toString(36), name, qty: 1, note: '', done: false }); }, `已加入「${name}」`);
});
$('#packSearch').addEventListener('input', renderPacking);
$$('.pack-filter .vbtn').forEach(b => b.addEventListener('click', () => {
  packFilter = b.dataset.f; $$('.pack-filter .vbtn').forEach(x => x.classList.toggle('on', x === b)); renderPacking();
}));

/* ---------- import / export ---------- */
function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function icsText() {
  const enc = new TextEncoder();
  const fold = line => { const out = []; let cur = '', bytes = 0; for (const ch of line) { const b = enc.encode(ch).length; if (bytes + b > 73) { out.push(cur); cur = ' '; bytes = 1; } cur += ch; bytes += b; } out.push(cur); return out.join('\r\n'); };
  const e = s => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const local = (date, min) => { const [y, m, d] = date.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, d) + min * 60000); const p = n => String(n).padStart(2, '0'); return `${t.getUTCFullYear()}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}T${p(t.getUTCHours())}${p(t.getUTCMinutes())}00`; };
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//kyushu2027//planner//ZH-TW', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + e(S.trip.title), 'X-WR-TIMEZONE:Asia/Tokyo',
    'BEGIN:VTIMEZONE', 'TZID:Asia/Tokyo', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0900', 'TZOFFSETTO:+0900', 'TZNAME:JST', 'END:STANDARD', 'END:VTIMEZONE'];
  for (const i of [...S.items].sort((a, b) => a.date.localeCompare(b.date) || toMin(a.start) - toMin(b.start))) {
    const s = toMin(i.start);
    const desc = [i.cat === 'move' ? (MODES[i.mode] || MODES.walk).n : CAT[i.cat].n, i.locked ? '已預約' : '', i.note || ''].filter(Boolean).join('｜');
    L.push('BEGIN:VEVENT', 'UID:' + i.id + '@kyushu2027-planner', 'DTSTAMP:' + stamp, 'DTSTART;TZID=Asia/Tokyo:' + local(i.date, s), 'DTEND;TZID=Asia/Tokyo:' + local(i.date, s + Number(i.dur)), 'SUMMARY:' + e(i.name));
    if (i.addr || i.lat != null) L.push('LOCATION:' + e(i.addr || `${i.lat},${i.lng}`));
    if (i.lat != null) L.push(`GEO:${i.lat};${i.lng}`);
    if (desc) L.push('DESCRIPTION:' + e(desc));
    L.push('END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return L.map(fold).join('\r\n') + '\r\n';
}
function showInfo(html) { $('#infoBody').innerHTML = html; $('#infoDlg').showModal(); }
const ACTS = {
  exportJSON: () => { download('kyushu-2027-trip.json', JSON.stringify(S, null, 2), 'application/json'); toast('已匯出 JSON'); },
  importJSON: () => $('#importFile').click(),
  exportICS: () => { download('kyushu-2027.ics', icsText(), 'text/calendar'); toast('已匯出 ICS，可匯入 iCloud／Google 行事曆'); },
  backup: () => {
    const b = S.backups && S.backups[0];
    showInfo(b ? `<h3><i class="fa-solid fa-snowflake"></i> 備案：${esc(b.name)}</h3><p class="when">${esc(b.when)}</p><ul>${b.days.map(d => `<li><b class="mono">${md(d.date)}</b> ${esc(d.plan)}</li>`).join('')}</ul><p><b>要先準備：</b>${esc(b.prepare)}</p>` : '<p>沒有備案</p>');
  },
  notes: () => showInfo(`<h3>注意事項</h3><ul>${(S.trip.notes || []).map(n => `<li>${esc(n)}</li>`).join('')}</ul><p class="when">時間一律為日本時間；網址加 ?now=2027-02-07T14:00 可測試「現在時間」紅線。</p>`),
  reset: () => commit(() => { S = clone(window.TRIP_DEFAULT); }, '已還原預設資料，可按復原')
};
$('#importFile').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try { const d = JSON.parse(r.result); if (!valid(d)) throw new Error('格式不符'); commit(() => { S = d; if (dayIdx(V.date) < 0) V.date = S.days[0].date; }, '已匯入 JSON'); }
    catch (err) { toast('匯入失敗：' + err.message); }
    e.target.value = '';
  };
  r.readAsText(f);
});

/* ---------- fab ---------- */
function toggleFab(open) {
  const m = $('#fabMenu'), b = $('#fabBtn');
  open = open ?? m.hidden; m.hidden = !open; b.setAttribute('aria-expanded', open);
  if (open) m.querySelector('button').focus();
}
$('#fabBtn').addEventListener('click', () => toggleFab());
$('#fabMenu').addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; toggleFab(false); ACTS[b.dataset.act](); });
$('#fabMenu').addEventListener('keydown', e => {
  const items = [...$('#fabMenu').querySelectorAll('button')]; const i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  if (e.key === 'Escape') { toggleFab(false); $('#fabBtn').focus(); }
});

/* ---------- global ---------- */
$$('.tab').forEach(t => t.addEventListener('click', () => {
  $$('.tab').forEach(x => { x.classList.toggle('active', x === t); x.setAttribute('aria-selected', x === t); });
  $$('.page').forEach(p => p.classList.toggle('active', p.id === t.dataset.page));
  if (t.dataset.page === 'planpage') { if (map) setTimeout(() => { map.invalidateSize(); fitDay(); }, 0); placeIllo(false); if (V.view === 'day') onDayScroll(); }
}));
$('#eyeBtn').addEventListener('click', () => { V.showTotal = !V.showTotal; renderHeader(); });
$$('#calendar-viewtoggle .vbtn').forEach(b => b.addEventListener('click', () => { V.view = b.dataset.view; saveView(); renderCalendar(); }));
$('#stations').addEventListener('click', e => { const b = e.target.closest('.st'); if (b) selectDate(b.dataset.date); });
$('#weekPrev').addEventListener('click', () => step(-1));
$('#weekNext').addEventListener('click', () => step(1));
function step(dir) {
  const idx = dayIdx(V.date);
  const n = V.view === 'week' ? Math.max(0, Math.min(S.days.length - 1, (Math.floor(idx / 7) + dir) * 7)) : Math.max(0, Math.min(S.days.length - 1, idx + dir));
  selectDate(S.days[n].date);
}
$('#undoBtn').addEventListener('click', undo);
$('#addBtn').addEventListener('click', () => openEditor(null));
$('#previewroute').addEventListener('click', previewRoute);
$('#fit').addEventListener('click', () => { if (map) fitDay(); else toast('地圖載入失敗'); });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.target.closest('input, textarea, select')) { e.preventDefault(); undo(); }
  if (e.key === 'Escape') hidePopover();
});
let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { placeIllo(false); onDayScroll(); }, 120); });

function renderAll() {
  if (dayIdx(V.date) < 0) V.date = S.days[0].date;
  renderHeader(); renderStations(); renderCalendar(); renderMap(); renderRoutes(); renderExpenses(); renderPacking();
}

/* ---------- boot ---------- */
const n0 = nowJST();
V.date = dayIdx(n0.date) >= 0 ? n0.date : S.days[0].date;
initMap();
renderAll();
setInterval(renderNow, 15000);
window.__planner = { get state() { return S; }, selectDate, openEditor, moveItem, icsText };
})();
