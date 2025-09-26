import { computePercent } from './progress.js';
import { t, activeLocale } from './i18n.js';

let tooltipEl; // retained but tooltips disabled per latest requirement
const ENABLE_TOOLTIPS = false; // feature flag to easily restore if needed

export function renderCategories(rootEl, items, progress, onToggle, globalTotalWeight){
  // store global total weight for later badge recalculation
  if(globalTotalWeight){
    rootEl.dataset.totalWeight = String(globalTotalWeight);
  } else if(!rootEl.dataset.totalWeight){
    const gtw = items.reduce((s,it)=> s + (typeof it.weight==='number' && it.weight>0 ? it.weight : 1), 0);
    rootEl.dataset.totalWeight = String(gtw);
  }
  const grouped = groupByCategory(items);
  rootEl.innerHTML='';
  const frag = document.createDocumentFragment();
  for(const cat of Object.keys(grouped)){
    const list = grouped[cat];
    const catEl = document.createElement('section');
    catEl.className = 'cat';
    catEl.dataset.category = cat;
    const header = document.createElement('div');
    header.className = 'cat-header';
    const counts = countCompletedWeighted(list, progress);
    header.innerHTML = `<span class="collapse-icon">▶</span><h2>${formatCategory(cat)}</h2><span class="cat-count" data-count>${counts.done}/${counts.total} (${counts.categoryPercentStr}%)</span>`;
    header.onclick = () => { catEl.classList.toggle('collapsed'); };
    const body = document.createElement('div');
    body.className = 'cat-body';
    for(const it of list){
      body.appendChild(renderItem(it, progress, onToggle));
    }
    catEl.appendChild(header); catEl.appendChild(body);
    frag.appendChild(catEl);
  }
  rootEl.appendChild(frag);
  // Bind interactive listeners only once to avoid duplicate toggle (double-click effect after reset)
  if(!rootEl._bound){
    // Unified click handler: intercept zoom button, otherwise toggle item
    rootEl.addEventListener('click', e=> {
      const zb = e.target.closest('.zoom-btn');
      if(zb){
        e.stopPropagation();
        const parent = zb.closest('.map-img');
        const img = parent?.querySelector('img');
        if(img) openImageModal(img.getAttribute('data-fullsrc') || img.src, img.alt || '');
        return;
      }
      itemHandler(e,onToggle);
    });
    rootEl.addEventListener('keydown', e=> { if(e.key==='Enter'||e.key===' '){ itemHandler(e,onToggle); e.preventDefault(); } });
    if(ENABLE_TOOLTIPS){
      ensureTooltip();
      rootEl.addEventListener('pointerenter', handlePointer, true);
      rootEl.addEventListener('pointermove', handlePointerMove, true);
      rootEl.addEventListener('pointerleave', handlePointerLeave, true);
      rootEl.addEventListener('focusin', handleFocus, true);
      rootEl.addEventListener('focusout', handleBlur, true);
    }
    ensureImageModal();
    rootEl._bound = true; // custom flag
  }
}

export function updatePercent(percentEl, fillEl, items, progress){
  const { percent } = computePercent(items, progress);
  percentEl.textContent = percent + '%';
  if(fillEl) fillEl.style.width = percent + '%';
  percentEl.title = t('percent.tooltip') + ' ' + percent + '%';
  // Pass items to the category counter so it doesn't need to query the DOM
  updateCategoryCounts(items, progress);
}

function renderItem(it, progress, onToggle){
  const el = document.createElement('div');
  el.className='item';
  el.setAttribute('role','checkbox');
  el.setAttribute('tabindex','0');
  el.dataset.id = it.id;
  if(it.effect) el.dataset.effect = it.effect;
  if(it.requirements) el.dataset.req = it.requirements;
  if(progress[it.id]) el.setAttribute('aria-checked','true'); else el.setAttribute('aria-checked','false');
  const lang = activeLocale();
  const label = escapeHtml(it.name?.[lang] || it.name?.en || it.id);

  // Correctly get translated description or location text
  const locationString = it.location_text?.[lang] || it.location_text?.en || (typeof it.location_text === 'string' ? it.location_text : '');
  const descSource = (it.description?.[lang] || it.description?.en) || locationString || '';
  const desc = descSource ? escapeHtml(descSource) : '';

  // Provide raw location text as tooltip data if no explicit description
  if(locationString && !it.description) el.dataset.loc = locationString;
  // image fallbacks: explicit UI alias -> icon -> placeholder
  let imgSrc = it.image || it.icon || 'assets/images/placeholder-item.png';
  // Heuristic: try to request a higher resolution if external gamerant URL with h=22&w=22
  if(/gamerantimages\.com/.test(imgSrc) && /[?&]h=22&?/.test(imgSrc)){ // simple pattern
    imgSrc = imgSrc.replace(/h=22/, 'h=96').replace(/w=22/, 'w=96');
  }
  // map image fallbacks: explicit alias -> location_img -> placeholder
  const mapSrc = it.mapImage || it.location_img || 'assets/images/placeholder-map.png';
  if(typeof it.weight === 'number' && it.weight>0 && it.weight !== 1){
    el.setAttribute('data-weight', String(it.weight));
  }
  // Build inner HTML conditionally (omit desc/map blocks if empty)
  let html = `
    <span class="checkmark">✔</span>
    <div class="top">
      <div class="thumb"><img src="${imgSrc}" alt="" loading="lazy" decoding="async"></div>
      <div class="meta"><span class="label">${label}</span></div>
    </div>`;
  if(desc) html += `\n    <div class="desc">${desc}</div>`;
  if(mapSrc && !/placeholder-map\.png$/.test(mapSrc)) html += `\n    <div class="map-img"><img src="${mapSrc}" alt="" loading="lazy" decoding="async"><button type="button" class="zoom-btn" aria-label="Ampliar" title="Ampliar">⤢</button></div>`;
  el.innerHTML = html;  
  // After image loads, if it is obviously tiny (<48 logical px in either dimension), upscale smoothly via canvas
  const imgEl = el.querySelector('.thumb img');
  if(imgEl){
    imgEl.addEventListener('load', () => {
      if(imgEl.naturalWidth && imgEl.naturalHeight && (imgEl.naturalWidth < 48 || imgEl.naturalHeight < 48)){
        try {
          const target = 96; // upscale base size
            const canvas = document.createElement('canvas');
            canvas.width = target; canvas.height = target;
            const ctx = canvas.getContext('2d');
            if(ctx){
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              // center fit
              const scale = Math.min(target/imgEl.naturalWidth, target/imgEl.naturalHeight);
              const dw = imgEl.naturalWidth * scale;
              const dh = imgEl.naturalHeight * scale;
              const dx = (target - dw)/2;
              const dy = (target - dh)/2;
              ctx.drawImage(imgEl, dx, dy, dw, dh);
              const dataUrl = canvas.toDataURL('image/png');
              imgEl.src = dataUrl;
              imgEl.classList.add('hi-upscaled');
            }
        } catch(e){ /* silent */ }
      }
    }, { once:true });
  }
  return el;
}

function itemHandler(e,onToggle){
  const el = e.target.closest('.item');
  if(!el) return;
  const id = el.dataset.id;
  if(onToggle(id)){
    const checked = el.getAttribute('aria-checked')==='true';
    el.setAttribute('aria-checked', checked? 'false':'true');
    el.classList.remove('pulse');
    void el.offsetWidth; // restart animation
    el.classList.add('pulse');
  }
}

function groupByCategory(items){
  const map = {};
  for(const it of items){
    (map[it.category] ||= []).push(it);
  }
  return map;
}

export function updateCategoryCounts(items, progress){
  // New implementation: calculate from data, not DOM
  const grouped = groupByCategory(items);
  
  document.querySelectorAll('.cat').forEach(catEl => {
    const categoryId = catEl.dataset.category;
    if(!categoryId || !grouped[categoryId]) return;

    const categoryItems = grouped[categoryId];
    const counts = countCompletedWeighted(categoryItems, progress);

    const badge = catEl.querySelector('[data-count]');
    if(badge) {
      badge.textContent = `${counts.done}/${counts.total} (${counts.categoryPercentStr}%)`;
    }
  });
}

function countCompleted(list, progress){
  let c=0; for(const it of list) if(progress[it.id]) c++; return c; // legacy (unused for display now)
}

function countCompletedWeighted(list, progress){
  let done=0, total=list.length, doneWeight=0, totalWeight=0;
  for(const it of list){
    const w = typeof it.weight==='number' && it.weight>0 ? it.weight : 1;
    totalWeight += w;
    if(progress[it.id]){ done++; doneWeight += w; }
  }
  const catPercent = totalWeight ? (doneWeight/totalWeight)*100 : 0;
  return { done, total, doneWeight, totalWeight, catPercent, categoryPercentStr: formatPercent(catPercent) };
}

function formatPercent(v){
  const rounded = Math.round(v*100)/100; // 2 decimals
  if(Math.abs(rounded - Math.round(rounded)) < 1e-6) return String(Math.round(rounded));
  return rounded.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
}

function formatCategory(c){
  return c.replace(/_/g,' ').replace(/\b\w/g, m=>m.toUpperCase());
}

function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c]||c)); }

/* Tooltip logic */
function ensureTooltip(){
  if(!ENABLE_TOOLTIPS) return;
  if(!tooltipEl){
    tooltipEl = document.createElement('div');
    tooltipEl.className='tooltip';
    document.body.appendChild(tooltipEl);
  }
}

function handlePointer(e){
  if(!ENABLE_TOOLTIPS) return;
  const item = e.target.closest('.item');
  if(!item) return;
  showTooltipFor(item, e.clientX, e.clientY);
}
function handlePointerMove(e){
  if(!ENABLE_TOOLTIPS) return;
  if(!tooltipEl || tooltipEl.getAttribute('data-show')!=='true') return;
  positionTooltip(e.clientX, e.clientY);
}
function handlePointerLeave(e){
  if(!ENABLE_TOOLTIPS) return;
  const item = e.target.closest('.item');
  if(item) hideTooltip();
}
function handleFocus(e){
  if(!ENABLE_TOOLTIPS) return;
  const item = e.target.closest('.item');
  if(item) {
    const rect = item.getBoundingClientRect();
    showTooltipFor(item, rect.right + 8, rect.top + 8);
  }
}
function handleBlur(e){ if(e.target.classList && e.target.classList.contains('item')) hideTooltip(); }

function showTooltipFor(item, x, y){
  if(!ENABLE_TOOLTIPS) return;
  const name = item.querySelector('.label')?.textContent || '';
  const effect = item.dataset.effect || '';
  const req = item.dataset.req || '';
  tooltipEl.innerHTML = `<h4>${escapeHtml(name)}</h4>`+
    (effect? `<div class='row'>${escapeHtml(effect)}</div>`:'')+
    (req? `<div class='row muted'>${escapeHtml(req)}</div>`:'');
  tooltipEl.setAttribute('data-show','true');
  positionTooltip(x,y);
}
function hideTooltip(){ if(tooltipEl){ tooltipEl.setAttribute('data-show','false'); } }
function positionTooltip(x,y){
  if(!ENABLE_TOOLTIPS) return;
  const pad = 14;
  const tw = tooltipEl.offsetWidth; const th = tooltipEl.offsetHeight;
  let nx = x + 16; let ny = y + 16;
  const vw = window.innerWidth; const vh = window.innerHeight;
  if(nx + tw + pad > vw) nx = vw - tw - pad;
  if(ny + th + pad > vh) ny = vh - th - pad;
  tooltipEl.style.left = nx + 'px';
  tooltipEl.style.top = ny + 'px';
}

/* Image modal (zoom) */
let imageModalEl, imageModalImg, imageModalClose;
function ensureImageModal(){
  if(imageModalEl) return;
  imageModalEl = document.createElement('div');
  imageModalEl.className = 'img-modal hidden';
  imageModalEl.innerHTML = `\n    <div class="img-modal-backdrop" data-dismiss></div>\n    <div class="img-modal-dialog" role="dialog" aria-modal="true">\n      <button class="img-modal-close" aria-label="Cerrar" data-dismiss>×</button>\n      <div class="img-modal-body"><img alt=""></div>\n    </div>`;
  document.body.appendChild(imageModalEl);
  imageModalImg = imageModalEl.querySelector('img');
  imageModalClose = imageModalEl.querySelector('.img-modal-close');
  imageModalEl.addEventListener('click', e=> { if(e.target.hasAttribute('data-dismiss')) closeImageModal(); });
  document.addEventListener('keydown', e=> { if(imageModalEl && !imageModalEl.classList.contains('hidden') && e.key==='Escape') closeImageModal(); });
  // Inject minimal styles once
  const styleId = 'image-modal-styles';
  if(!document.getElementById(styleId)){
    const st = document.createElement('style');
    st.id = styleId;
    st.textContent = `.img-modal{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;font-size:0;}
.img-modal.hidden{display:none;}
.img-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);}
.img-modal-dialog{position:relative;max-width:90vw;max-height:90vh;background:#0f1418;border:1px solid #25313c;border-radius:12px;padding:1.1rem 1.15rem 1.2rem;box-shadow:0 12px 40px -10px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,0.05);display:flex;flex-direction:column;}
.img-modal-body{flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;}
.img-modal-body img{max-width:82vw;max-height:72vh;object-fit:contain;image-rendering:auto;}
.img-modal-close{position:absolute;top:6px;right:6px;background:#202a32;border:1px solid #2d3944;color:#fff;font-size:1rem;line-height:1;height:32px;width:32px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.img-modal-close:hover{border-color:var(--accent);}
.map-img{position:relative;}
.map-img .zoom-btn{position:absolute;bottom:4px;right:4px;background:rgba(20,24,28,.75);border:1px solid #2a353f;color:#d2dee7;font-size:.6rem;padding:.25rem .4rem;border-radius:6px;cursor:pointer;opacity:.85;backdrop-filter:blur(2px);}
.map-img .zoom-btn:hover{border-color:var(--accent);color:#fff;}
`;
    document.head.appendChild(st);
  }
}
function openImageModal(src, alt){
  ensureImageModal();
  imageModalImg.src = src;
  imageModalImg.alt = alt || '';
  imageModalEl.classList.remove('hidden');
  setTimeout(()=>{ imageModalEl.classList.add('visible'); },0);
}
function closeImageModal(){
  if(!imageModalEl) return;
  imageModalEl.classList.add('hidden');
  imageModalImg.src = '';
}
